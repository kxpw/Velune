import { rm } from "node:fs/promises";

const [target] = process.argv.slice(2);

if (!target) {
  console.error("Usage: node clean-directory.mjs <directory>");
  process.exit(1);
}

await rm(target, { recursive: true, force: true });
