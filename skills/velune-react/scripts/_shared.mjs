import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

export const skillRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

export const components = [
  ["ReliefCard", "relief-card"],
  ["Avatar", "avatar"],
  ["Badge", "badge"],
  ["Box", "box"],
  ["Button", "button"],
  ["Card", "card"],
  ["Checkbox", "checkbox"],
  ["Collapse", "collapse"],
  ["Container", "container"],
  ["DatePicker", "date-picker"],
  ["DateRangePicker", "date-range-picker"],
  ["Divider", "divider"],
  ["Drawer", "drawer"],
  ["Dropdown", "dropdown"],
  ["Flex", "flex"],
  ["Form", "form"],
  ["Grid", "grid"],
  ["Input", "input"],
  ["List", "list"],
  ["Modal", "modal"],
  ["Pagination", "pagination"],
  ["Popover", "popover"],
  ["Progress", "progress"],
  ["Radio", "radio"],
  ["Select", "select"],
  ["Skeleton", "skeleton"],
  ["Spinner", "spinner"],
  ["Stack", "stack"],
  ["Switch", "switch"],
  ["Table", "table"],
  ["Tabs", "tabs"],
  ["Tag", "tag"],
  ["Text", "text"],
  ["TextArea", "text-area"],
  ["Toast", "toast"],
  ["Tooltip", "tooltip"],
  ["VirtualTable", "virtual-table"],
  ["Wizard", "wizard"],
].map(([name, slug]) => ({ name, slug }));

export function findComponent(value) {
  const normalized = value.toLowerCase().replace(/[^a-z0-9]/g, "");
  return components.find(
    ({ name, slug }) =>
      name.toLowerCase() === normalized ||
      slug.replaceAll("-", "") === normalized,
  );
}

export function findRepoRoot(start = process.cwd()) {
  let current = path.resolve(start);
  while (true) {
    if (
      fs.existsSync(path.join(current, "packages/react/src/index.ts")) &&
      fs.existsSync(path.join(current, "packages/velune/package.json"))
    ) {
      return current;
    }
    const parent = path.dirname(current);
    if (parent === current) return null;
    current = parent;
  }
}

export function findPackageRoot() {
  try {
    const require = createRequire(path.join(process.cwd(), "velune-skill.cjs"));
    return path.dirname(require.resolve("velune/package.json"));
  } catch {
    return null;
  }
}

export function resolveContext() {
  const repoRoot = findRepoRoot();
  if (repoRoot) return { kind: "repository", root: repoRoot };
  const packageRoot = findPackageRoot();
  if (packageRoot) return { kind: "package", root: packageRoot };
  return { kind: "reference", root: skillRoot };
}

export function readReference(name) {
  return fs.readFileSync(path.join(skillRoot, "references", name), "utf8");
}

export function printUnknown(value) {
  console.error(`Unknown Velune component: ${value}`);
  console.error(`Available: ${components.map(({ name }) => name).join(", ")}`);
  process.exitCode = 1;
}
