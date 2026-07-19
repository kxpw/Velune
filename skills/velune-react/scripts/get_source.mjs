#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { findComponent, printUnknown, resolveContext } from "./_shared.mjs";

const values = process.argv.slice(2);
if (!values.length) {
  console.error("Usage: node get_source.mjs <Component> [Component...]");
  process.exit(1);
}

const context = resolveContext();
for (const value of values) {
  const component = findComponent(value);
  if (!component) {
    printUnknown(value);
    continue;
  }
  const directory =
    context.kind === "repository"
      ? path.join(context.root, "packages/react/src", component.slug)
      : context.kind === "package"
        ? path.join(context.root, "dist/react", component.slug)
        : null;
  const preferred = directory
    ? path.join(
        directory,
        context.kind === "repository" ? `${component.name}.tsx` : "index.mjs",
      )
    : null;
  let files =
    preferred && fs.existsSync(preferred)
      ? [preferred]
      : directory && fs.existsSync(directory)
        ? fs
            .readdirSync(directory)
            .filter((name) =>
              context.kind === "repository"
                ? name.endsWith(".tsx") &&
                  !name.includes(".test.") &&
                  !name.includes(".stories.")
                : name.endsWith(".mjs"),
            )
            .map((name) => path.join(directory, name))
        : [];
  if (context.kind === "package" && files.length === 1) {
    const entrySource = fs.readFileSync(files[0], "utf8");
    const linkedFiles = Array.from(
      entrySource.matchAll(/from\s+["'](\.\.?\/[^"']+\.mjs)["']/g),
      (match) => path.resolve(path.dirname(files[0]), match[1]),
    ).filter((file) => fs.existsSync(file));
    files = Array.from(new Set([...files, ...linkedFiles]));
  }
  if (!files.length) {
    console.error(
      `Source for ${component.name} requires a Velune repository or an installed velune package.`,
    );
    process.exitCode = 1;
    continue;
  }
  for (const file of files) {
    console.log(`// ${path.relative(process.cwd(), file)}`);
    console.log(fs.readFileSync(file, "utf8").trim());
  }
}
