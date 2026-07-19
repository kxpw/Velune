import { copyFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";

const [source, destination] = process.argv.slice(2);

if (!source || !destination) {
  console.error("Usage: node copy-file.mjs <source> <destination>");
  process.exit(1);
}

await mkdir(dirname(destination), { recursive: true });
await copyFile(source, destination);
