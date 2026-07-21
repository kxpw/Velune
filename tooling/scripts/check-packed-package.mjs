import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const packageDir = join(root, "packages/velune");
const reactSourceDir = join(root, "packages/react/src");
const executableExtension = process.platform === "win32" ? ".cmd" : "";
const attwBin = join(root, "node_modules/.bin", `attw${executableExtension}`);
const npmBin = process.platform === "win32" ? "npm.cmd" : "npm";

const componentNames = (await readdir(reactSourceDir, { withFileTypes: true }))
  .filter(
    (entry) =>
      entry.isDirectory() && !new Set(["shared", "theme"]).has(entry.name),
  )
  .map((entry) => entry.name)
  .sort();
const entrypoints = [
  ".",
  "./react",
  "./react/theme",
  "./react/theme/tokens",
  ...componentNames.map((name) => `./react/${name}`),
  // Deprecated alias for ./react/text-area.
  "./react/textarea",
];
const specifiers = entrypoints.map((entrypoint) =>
  entrypoint === "." ? "velune" : `velune${entrypoint.slice(1)}`,
);

run(attwBin, [
  "--pack",
  packageDir,
  "--profile",
  "node16",
  "--entrypoints",
  ...entrypoints,
]);

const temporaryDirectory = await mkdtemp(join(tmpdir(), "velune-package-"));
try {
  const packOutput = run(
    npmBin,
    ["pack", "--json", "--pack-destination", temporaryDirectory],
    { cwd: packageDir, capture: true },
  );
  const [packMetadata] = JSON.parse(packOutput);
  if (!packMetadata?.filename || !Array.isArray(packMetadata.files)) {
    throw new Error("npm pack did not return package metadata");
  }

  const packedPaths = new Set(packMetadata.files.map((file) => file.path));
  for (const requiredPath of [
    "LICENSE",
    "README.md",
    "package.json",
    "dist/index.mjs",
    "dist/index.cjs",
    "dist/index.d.ts",
    "dist/index.d.cts",
  ]) {
    if (!packedPaths.has(requiredPath)) {
      throw new Error(`Packed package is missing ${requiredPath}`);
    }
  }

  const leakedSources = [...packedPaths].filter(
    (path) =>
      path.startsWith("src/") ||
      /\.(?:a11y\.)?test\.[cm]?[jt]sx?$/.test(path) ||
      /\.stories\.[cm]?[jt]sx?$/.test(path),
  );
  if (leakedSources.length > 0) {
    throw new Error(
      `Packed package contains development sources:\n${leakedSources.join("\n")}`,
    );
  }

  const consumerDir = join(temporaryDirectory, "consumer");
  await mkdir(consumerDir);
  await writeFile(
    join(consumerDir, "package.json"),
    `${JSON.stringify({ name: "velune-package-smoke", private: true }, null, 2)}\n`,
  );

  const tarballPath = join(temporaryDirectory, packMetadata.filename);
  run(
    npmBin,
    [
      "install",
      "--ignore-scripts",
      "--no-audit",
      "--no-fund",
      "--package-lock=false",
      "--loglevel=error",
      tarballPath,
      "react@18.3.1",
      "react-dom@18.3.1",
      "tailwindcss@4",
    ],
    { cwd: consumerDir, capture: true },
  );

  const serializedSpecifiers = JSON.stringify(specifiers);
  run(
    process.execPath,
    [
      "--input-type=module",
      "--eval",
      `for (const specifier of ${serializedSpecifiers}) await import(specifier);`,
    ],
    { cwd: consumerDir, capture: true },
  );
  run(
    process.execPath,
    [
      "--eval",
      `for (const specifier of ${serializedSpecifiers}) require(specifier);`,
    ],
    { cwd: consumerDir, capture: true },
  );

  const assetSpecifiers = [
    "velune/react/tailwind.css",
    "velune/react/theme.css",
    "velune/react/theme/tokens.css",
    "velune/react/theme/tokens.json",
    "velune/react/theme/tokens.tailwind.cjs",
    "velune/react/theme/foundations/color-primary.css",
    "velune/react/theme/components/input.css",
  ];
  run(
    process.execPath,
    [
      "--eval",
      `for (const specifier of ${JSON.stringify(assetSpecifiers)}) require.resolve(specifier);`,
    ],
    { cwd: consumerDir, capture: true },
  );

  console.log(
    `Packed velune and resolved ${entrypoints.length} JavaScript entrypoints through ESM and CJS.`,
  );
} finally {
  await rm(temporaryDirectory, { recursive: true, force: true });
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? root,
    encoding: "utf8",
    env: process.env,
    stdio: options.capture ? "pipe" : "inherit",
  });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error(
      [
        `${command} exited with status ${result.status}`,
        result.stdout,
        result.stderr,
      ]
        .filter(Boolean)
        .join("\n"),
    );
  }
  return result.stdout ?? "";
}
