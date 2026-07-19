#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {
  findComponent,
  printUnknown,
  readReference,
  resolveContext,
} from "./_shared.mjs";

function referenceSection(component) {
  const reference = readReference("components.md");
  const marker = `## ${component.name}`;
  const start = reference.indexOf(marker);
  if (start < 0) return "";
  const end = reference.indexOf("\n## ", start + marker.length);
  return reference.slice(start, end < 0 ? undefined : end).trim();
}

function repositoryDetails(root, component) {
  const directory = path.join(root, "packages/react/src", component.slug);
  const typesPath = path.join(directory, `${component.name}.types.ts`);
  const indexPath = path.join(directory, "index.ts");
  const blocks = [];
  if (fs.existsSync(indexPath)) {
    blocks.push(
      `### Public exports\n\n\`\`\`ts\n${fs.readFileSync(indexPath, "utf8").trim()}\n\`\`\``,
    );
  }
  if (fs.existsSync(typesPath)) {
    blocks.push(
      `### Current types\n\n\`\`\`ts\n${fs.readFileSync(typesPath, "utf8").trim()}\n\`\`\``,
    );
  }
  return blocks.join("\n\n");
}

function packageDetails(root, component) {
  const typesPath = path.join(root, "dist/react", component.slug, "index.d.ts");
  if (!fs.existsSync(typesPath)) return "";
  return `### Installed package types\n\n\`\`\`ts\n${fs.readFileSync(typesPath, "utf8").trim()}\n\`\`\``;
}

const values = process.argv.slice(2);
if (!values.length) {
  console.error(
    "Usage: node get_component_docs.mjs <Component> [Component...]",
  );
  process.exit(1);
}

const context = resolveContext();
for (const value of values) {
  const component = findComponent(value);
  if (!component) {
    printUnknown(value);
    continue;
  }
  const details =
    context.kind === "repository"
      ? repositoryDetails(context.root, component)
      : context.kind === "package"
        ? packageDetails(context.root, component)
        : "";
  console.log(referenceSection(component));
  if (details) console.log(`\n\n${details}`);
  if (values.length > 1) console.log("\n\n---\n");
}
