#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { readReference, resolveContext } from "./_shared.mjs";

const context = resolveContext();
const file =
  context.kind === "repository"
    ? path.join(context.root, "packages/react/src/theme/tokens.css")
    : context.kind === "package"
      ? path.join(context.root, "dist/react/theme/tokens.css")
      : null;

if (file && fs.existsSync(file)) {
  console.log(`/* ${path.relative(process.cwd(), file)} */`);
  console.log(fs.readFileSync(file, "utf8").trim());
} else {
  console.log(readReference("theming.md"));
}
