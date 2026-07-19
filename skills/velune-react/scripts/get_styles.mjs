#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { findComponent, printUnknown, resolveContext } from "./_shared.mjs";

const styleNames = {
  "relief-card": "relief",
  "date-picker": "datepicker",
  "date-range-picker": "datepicker",
};
const values = process.argv.slice(2);
if (!values.length) {
  console.error("Usage: node get_styles.mjs <Component> [Component...]");
  process.exit(1);
}

const context = resolveContext();
for (const value of values) {
  const component = findComponent(value);
  if (!component) {
    printUnknown(value);
    continue;
  }
  const styleName = styleNames[component.slug] ?? component.slug;
  const file =
    context.kind === "repository"
      ? path.join(
          context.root,
          "packages/react/src/theme/components",
          `${styleName}.css`,
        )
      : context.kind === "package"
        ? path.join(
            context.root,
            "dist/react/theme/components",
            `${styleName}.css`,
          )
        : null;
  if (!file || !fs.existsSync(file)) {
    console.error(
      `${component.name} has no dedicated theme file; inspect its Tailwind utilities with get_source.mjs.`,
    );
    continue;
  }
  console.log(`/* ${path.relative(process.cwd(), file)} */`);
  console.log(fs.readFileSync(file, "utf8").trim());
}
