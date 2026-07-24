import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";

// Guards React Server Components compatibility: every built JS module in
// packages/react/dist (entries and shared chunks) must start with the
// "use client" directive, except the design-token modules which are pure
// data and must stay importable from Server Components.
const DIRECTIVE = '"use client";';
const SERVER_SAFE_MODULES = new Set([
  "theme/tokens.mjs",
  "theme/tokens.cjs",
  "theme/tokens.tailwind.cjs",
]);

const root = process.cwd();
const distDir = join(root, "packages/react/dist");

let files;
try {
  files = await listJsFiles(distDir);
} catch {
  throw new Error(
    "packages/react/dist does not exist. Run pnpm --filter @velune/react-internal build first.",
  );
}

if (files.length === 0) {
  throw new Error("packages/react/dist contains no built JS files.");
}

const failures = [];
let checked = 0;

for (const file of files) {
  const modulePath = relative(distDir, file).replaceAll("\\", "/");
  const code = await readFile(file, "utf8");
  const hasDirective = code.startsWith(DIRECTIVE);

  if (SERVER_SAFE_MODULES.has(modulePath)) {
    if (hasDirective) {
      failures.push(
        `${modulePath} is a server-safe data module but starts with "use client"`,
      );
    }
    continue;
  }

  checked += 1;
  if (!hasDirective) {
    failures.push(`${modulePath} does not start with "use client"`);
  }
}

if (failures.length > 0) {
  throw new Error(
    `"use client" directive checks failed:\n${failures.map((failure) => `- ${failure}`).join("\n")}`,
  );
}

console.log(
  `All ${checked} built client modules start with "use client" (${SERVER_SAFE_MODULES.size} server-safe token modules excluded).`,
);

async function listJsFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) return listJsFiles(path);
      return /\.(mjs|cjs)$/.test(entry.name) ? [path] : [];
    }),
  );
  return files.flat();
}
