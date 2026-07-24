/**
 * Generates apps/docs/public/llms.txt and llms-full.txt from the docs site's
 * component registry, parsed props API, and code examples.
 *
 * Run from the repository root with `pnpm docs:llms` (or directly with
 * `tsx tooling/scripts/generate-llms.ts`). The output files are committed so
 * the static docs deployment serves them at https://velune.dev/llms.txt.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type {
  ApiPropGroup,
  ApiTypeAlias,
} from "../../apps/docs/src/api-reference-core";
import {
  collectVeluneCatalog,
  DOCS_ORIGIN,
  type CatalogComponent,
  type VeluneCatalog,
} from "./velune-catalog";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const outputDir = join(repoRoot, "apps", "docs", "public");

const setupLines = [
  "Setup essentials:",
  "",
  "- Install: `npm install velune` (requires React 18+ and Tailwind CSS v4).",
  "- Global CSS, loaded in this order — Tailwind first, then Velune tokens and utility registration:",
  "",
  "```css",
  '@import "tailwindcss";',
  '@import "velune/react/theme/tokens.css";',
  '@import "velune/react/theme/base.css";',
  '@import "velune/react/tailwind.css";',
  "```",
  "",
  '- Import components from the aggregate entry point (`import { Button } from "velune/react";`) or from a dedicated subpath (`import { Button } from "velune/react/button";`).',
  "- Optional: wrap the application in `ThemeProvider` from `velune/react` to control light, dark, system, high-contrast, reduced-motion, and brand-derived themes.",
];

const documentationLinks = [
  {
    title: "Getting started",
    url: `${DOCS_ORIGIN}/docs/getting-started`,
    description: "Installation, Tailwind CSS v4 setup, and first components",
  },
  {
    title: "Quick start",
    url: `${DOCS_ORIGIN}/docs/quick-start`,
    description: "Build a first page with Velune components",
  },
  {
    title: "Colors",
    url: `${DOCS_ORIGIN}/docs/colors`,
    description: "Semantic color roles and palettes",
  },
  {
    title: "Theme",
    url: `${DOCS_ORIGIN}/docs/theme`,
    description:
      "Light, dark, high-contrast, reduced-motion, and brand-derived themes",
  },
  {
    title: "Design tokens",
    url: `${DOCS_ORIGIN}/tokens`,
    description: "The full semantic token contract",
  },
  {
    title: "Agent skills",
    url: `${DOCS_ORIGIN}/docs/agent-skills`,
    description: "Agent Skills package, llms.txt, and the Velune MCP server",
  },
  {
    title: "Component list",
    url: `${DOCS_ORIGIN}/components`,
    description: "Interactive documentation for every component",
  },
];

function componentLine(component: CatalogComponent): string {
  return `- [${component.name}](${component.docsUrl}): ${component.description}`;
}

export function buildLlmsTxt(catalog: VeluneCatalog): string {
  const lines: string[] = [
    "# Velune",
    "",
    `> Velune is an accessible React component library: ${catalog.components.length} components, semantic Tailwind CSS v4 utilities, design tokens, and themeable light/dark/high-contrast modes. Everything ships in the single npm package \`velune\`; React components are imported from \`velune/react\`.`,
    "",
    ...setupLines,
    "",
    "## Documentation",
    "",
    ...documentationLinks.map(
      (link) => `- [${link.title}](${link.url}): ${link.description}`,
    ),
    `- [Full component reference for LLMs](${DOCS_ORIGIN}/llms-full.txt): Props tables, imports, and examples for every component`,
  ];

  for (const category of catalog.categories) {
    const members = catalog.components.filter(
      (component) => component.category === category,
    );
    if (members.length === 0) continue;
    lines.push("", `## Components: ${category}`, "");
    lines.push(...members.map(componentLine));
  }

  lines.push("");
  return lines.join("\n");
}

function escapeTableCell(value: string | undefined): string {
  if (!value) return "—";
  return value.replaceAll("|", "\\|").replaceAll("\n", " ");
}

function propsTable(group: ApiPropGroup): string[] {
  const lines: string[] = [];
  const heading = group.inheritance
    ? `**${group.name}** (${group.inheritance})`
    : `**${group.name}**`;
  lines.push(heading, "");
  lines.push("| Prop | Type | Required | Default | Description |");
  lines.push("| --- | --- | --- | --- | --- |");
  for (const prop of group.props) {
    lines.push(
      `| ${escapeTableCell(prop.name)} | \`${escapeTableCell(prop.type)}\` | ${
        prop.required ? "yes" : "no"
      } | ${escapeTableCell(prop.defaultValue)} | ${escapeTableCell(
        prop.description,
      )} |`,
    );
  }
  return lines;
}

function aliasList(aliases: ApiTypeAlias[]): string[] {
  if (aliases.length === 0) return [];
  return [
    "Type aliases:",
    "",
    ...aliases.map((alias) => `- \`${alias.name}\` = \`${alias.value}\``),
  ];
}

function componentSection(component: CatalogComponent): string[] {
  const lines: string[] = [
    `### ${component.name}`,
    "",
    `${component.description} Documentation: ${component.docsUrl}`,
    "",
    "```tsx",
    component.rootImportStatement,
    `// or from the dedicated subpath:`,
    component.importStatement,
    "```",
  ];

  if (component.api.groups.length > 0) {
    lines.push("", "#### Props");
    for (const group of component.api.groups) {
      lines.push("", ...propsTable(group));
    }
  }

  const aliases = aliasList(component.api.aliases);
  if (aliases.length > 0) {
    lines.push("", ...aliases);
  }

  const examples = component.examples;
  if (examples.length > 0) {
    for (const example of examples) {
      lines.push(
        "",
        `#### Example: ${example.title}`,
        "",
        example.description,
        "",
        "```tsx",
        example.code,
        "```",
      );
    }
  }

  return lines;
}

export function buildLlmsFullTxt(catalog: VeluneCatalog): string {
  const lines: string[] = [
    "# Velune — full component reference",
    "",
    `> Complete reference for the Velune React component library (npm package \`velune\`): installation, theming, design tokens, and the import statement, props API, and code examples for each of the ${catalog.components.length} components. Component documentation lives at ${DOCS_ORIGIN}/components/<slug>.`,
    "",
    "## Installation",
    "",
    ...setupLines,
    "",
    "## Theming",
    "",
    "Velune styles every component through a semantic design-token contract:",
    "",
    "- `velune/react/theme/tokens.css` defines the token custom properties (colors, typography, spacing, radius, shadows, motion) for light, dark, and high-contrast modes.",
    "- `velune/react/tailwind.css` registers semantic Tailwind utilities such as `bg-gs-surface`, `text-gs-text`, `text-gs-text-secondary`, `border-gs-border-default`, `rounded-gs-sm`, and `shadow-gs-1`. Prefer these utilities over hard-coded values.",
    "- `ThemeProvider` (imported from `velune/react`) controls theme state at the application root:",
    "",
    "```tsx",
    'import { ThemeProvider } from "velune/react";',
    "",
    "export function App() {",
    "  return (",
    "    <ThemeProvider",
    '      theme="system" // "light" | "dark" | "system"',
    '      brandColor="#96683f"',
    '      mood="porcelain"',
    '      base="porcelain"',
    '      contrastRatio="AA"',
    "      highContrast={false}",
    "      reducedMotion={false}",
    '      customTokens={{ "--radius-sm": "8px" }}',
    "    >",
    "      <Routes />",
    "    </ThemeProvider>",
    "  );",
    "}",
    "```",
    "",
    "- Prefer `ThemeToggle` for light/dark switching (sun/moon icons by default). Use `useThemeToggle` for custom chrome.",
    "- Static applications can consume the CSS tokens without a provider; `data-theme`, `data-high-contrast`, `data-reduced-motion`, and `data-brand` attributes on the document root drive the same contract.",
    "",
    "## Design tokens",
    "",
    "Token groups exposed as CSS custom properties and semantic utilities:",
    "",
    "- Surfaces: `bg-gs-canvas`, `bg-gs-surface`, `bg-gs-surface-raised`, `bg-gs-surface-mist`",
    "- Text: `text-gs-text`, `text-gs-text-secondary`, `text-gs-text-accent`, `text-gs-success`, `text-gs-warning`, `text-gs-error`",
    "- Borders: `border-gs-border-default`, `border-gs-border-strong`, `border-gs-focus`",
    "- Shape and elevation: `rounded-gs-xs`, `rounded-gs-sm`, `rounded-gs-lg`, `rounded-gs-full`, `shadow-gs-0`, `shadow-gs-1`, `shadow-gs-2`, `shadow-gs-3`",
    "- Type and space: `text-gs-sm`, `font-gs-medium`, `leading-gs-normal`, `gap-gs-4`, `p-gs-4`",
    "- Motion: `duration-gs-fast` (via `--transition-duration-gs-fast`), `ease-gs-standard`, `ease-gs-glide`",
    "",
    `Override public semantic variables (for example \`--color-primary\`, \`--color-surface\`, \`--color-text-primary\`) in a scoped root instead of targeting component internals. The full contract is documented at ${DOCS_ORIGIN}/tokens.`,
  ];

  for (const category of catalog.categories) {
    const members = catalog.components.filter(
      (component) => component.category === category,
    );
    if (members.length === 0) continue;
    lines.push("", `## ${category}`);
    for (const component of members) {
      lines.push("", ...componentSection(component));
    }
  }

  lines.push("");
  return lines.join("\n");
}

async function main() {
  const catalog = collectVeluneCatalog();
  await mkdir(outputDir, { recursive: true });
  await writeFile(join(outputDir, "llms.txt"), buildLlmsTxt(catalog), "utf8");
  await writeFile(
    join(outputDir, "llms-full.txt"),
    buildLlmsFullTxt(catalog),
    "utf8",
  );
  console.log(
    `Generated llms.txt and llms-full.txt for ${catalog.components.length} components in ${outputDir}`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
