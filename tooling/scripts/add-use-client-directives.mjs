import { readdir, readFile, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";

// tsup's `treeshake: true` re-emits every chunk through Rollup, which strips
// module-level directives such as the "use client" banner that esbuild adds.
// This script runs after tsup and prepends the directive to every built JS
// entry and shared chunk so the artifacts stay compatible with React Server
// Components. Design tokens (`theme/tokens.*`) are pure data and must remain
// importable from Server Components, so they are intentionally skipped.
const DIRECTIVE = '"use client";';
const SERVER_SAFE_MODULES = new Set([
  "theme/tokens.mjs",
  "theme/tokens.cjs",
  "theme/tokens.tailwind.cjs",
]);

const [distArg = "dist"] = process.argv.slice(2);
const distDir = join(process.cwd(), distArg);

const files = await listJsFiles(distDir);
let updated = 0;

for (const file of files) {
  if (SERVER_SAFE_MODULES.has(relative(distDir, file).replaceAll("\\", "/"))) {
    continue;
  }

  const code = await readFile(file, "utf8");
  if (code.startsWith(DIRECTIVE)) continue;

  await writeFile(file, `${DIRECTIVE}\n${code}`);
  updated += 1;
}

console.log(
  `Added "use client" to ${updated} of ${files.length} built JS files.`,
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
