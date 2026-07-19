import { spawn } from "node:child_process";
import { join } from "node:path";
import process from "node:process";

const root = process.cwd();
const host = "127.0.0.1";
const port = 4173;
const docsDir = join(root, "apps/docs");
const e2eDir = join(root, "apps/e2e");
const binaryName = (name) =>
  process.platform === "win32" ? `${name}.cmd` : name;

const server = spawn(
  join(docsDir, "node_modules/.bin", binaryName("vite")),
  ["preview", "--host", host, "--port", String(port), "--strictPort"],
  {
    cwd: docsDir,
    detached: process.platform !== "win32",
    env: process.env,
    stdio: "inherit",
  },
);

try {
  await waitForServer(`http://${host}:${port}`);
  const exitCode = await runPlaywright(process.argv.slice(2));
  if (exitCode !== 0) process.exitCode = exitCode;
} finally {
  await stopServer(server);
}

function runPlaywright(args) {
  const child = spawn(
    join(e2eDir, "node_modules/.bin", binaryName("playwright")),
    ["test", ...args],
    {
      cwd: e2eDir,
      env: process.env,
      stdio: "inherit",
    },
  );

  return new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (signal) {
        reject(new Error(`Playwright exited with signal ${signal}`));
      } else {
        resolve(code ?? 1);
      }
    });
  });
}

async function waitForServer(url) {
  const timeoutAt = Date.now() + 60_000;

  while (Date.now() < timeoutAt) {
    if (server.exitCode !== null) {
      throw new Error(`Docs preview exited with code ${server.exitCode}`);
    }

    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // The preview server is still starting.
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error("Timed out waiting for Docs preview");
}

async function stopServer(child) {
  if (child.exitCode !== null || child.signalCode !== null) return;

  signalServer(child, "SIGTERM");
  if (await waitForExit(child, 5_000)) return;

  signalServer(child, "SIGKILL");
  await waitForExit(child, 5_000);
}

function signalServer(child, signal) {
  try {
    if (process.platform !== "win32" && child.pid) {
      process.kill(-child.pid, signal);
    } else {
      child.kill(signal);
    }
  } catch (error) {
    if (error?.code !== "ESRCH") throw error;
  }
}

function waitForExit(child, timeout) {
  if (child.exitCode !== null || child.signalCode !== null) {
    return Promise.resolve(true);
  }

  return new Promise((resolve) => {
    const onExit = () => {
      clearTimeout(timer);
      resolve(true);
    };
    const timer = setTimeout(() => {
      child.off("exit", onExit);
      resolve(false);
    }, timeout);
    child.once("exit", onExit);
  });
}
