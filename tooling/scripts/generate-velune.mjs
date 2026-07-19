import { access, cp, mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const distDir = join(root, "dist");
const reactDir = join(root, "../react/dist");
const distReactDir = join(distDir, "react");
const requiredReactArtifacts = [
  "index.mjs",
  "index.cjs",
  "index.d.ts",
  "theme/index.css",
  "theme/tokens.css",
  "tailwind.css",
];

const missingReactArtifacts = [];
for (const artifact of requiredReactArtifacts) {
  try {
    await access(join(reactDir, artifact));
  } catch {
    missingReactArtifacts.push(artifact);
  }
}

if (missingReactArtifacts.length > 0) {
  throw new Error(
    [
      "Cannot assemble velune because React build artifacts are missing:",
      ...missingReactArtifacts.map((artifact) => `- ${artifact}`),
      "Run pnpm --filter @velune/react-internal build first.",
    ].join("\n"),
  );
}

await rm(distDir, { recursive: true, force: true });
await mkdir(distDir, { recursive: true });

await Promise.all([
  writeFile(join(distDir, "index.mjs"), "export {};\n"),
  writeFile(join(distDir, "index.cjs"), "module.exports = {};\n"),
  writeFile(join(distDir, "index.d.ts"), "export {};\n"),
  writeFile(join(distDir, "index.d.cts"), "export {};\n"),
  cp(reactDir, distReactDir, { recursive: true }),
]);
