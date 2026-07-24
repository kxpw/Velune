/**
 * Shared build-time collector for the Velune component catalog.
 *
 * Aggregates the docs site's single sources of truth (component registry,
 * parsed props API, and code examples) into one plain-data structure used by
 * Shared catalog helpers used by documentation generators (for example the
 * llms.txt pipeline).
 */
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  categories,
  componentImport,
  components,
  type ComponentCategory,
} from "../../apps/docs/src/component-data";
import {
  parseComponentApiReference,
  type ComponentApiReference,
} from "../../apps/docs/src/api-reference-core";
import {
  getComponentExamples,
  type ComponentExample,
} from "../../apps/docs/src/component-examples";

export const DOCS_ORIGIN = "https://velune.dev";

export type CatalogComponent = {
  slug: string;
  name: string;
  category: ComponentCategory;
  description: string;
  status?: "New" | "Updated";
  /** Import from the component's dedicated public subpath. */
  importStatement: string;
  /** Import from the aggregate `velune/react` entry point. */
  rootImportStatement: string;
  docsUrl: string;
  api: ComponentApiReference;
  examples: ComponentExample[];
};

export type VeluneCatalog = {
  origin: string;
  categories: ComponentCategory[];
  components: CatalogComponent[];
};

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const reactSourceRoot = join(repoRoot, "packages", "react", "src");

function readTypeSource(slug: string): string | undefined {
  try {
    const file = readdirSync(join(reactSourceRoot, slug)).find((name) =>
      name.endsWith(".types.ts"),
    );
    if (!file) return undefined;
    return readFileSync(join(reactSourceRoot, slug, file), "utf8");
  } catch {
    return undefined;
  }
}

function rootImportStatement(importName: string): string {
  const names = importName.split(",").map((name) => name.trim());
  return `import { ${names.join(", ")} } from "velune/react";`;
}

export function collectVeluneCatalog(): VeluneCatalog {
  return {
    origin: DOCS_ORIGIN,
    categories: [...categories],
    components: components.map((entry) => {
      const importName = entry.importName ?? entry.name.replaceAll(" ", "");
      const component: CatalogComponent = {
        slug: entry.slug,
        name: entry.name,
        category: entry.category,
        description: entry.description,
        importStatement: componentImport(entry),
        rootImportStatement: rootImportStatement(importName),
        docsUrl: `${DOCS_ORIGIN}/components/${entry.slug}`,
        api: parseComponentApiReference(readTypeSource(entry.slug)),
        examples: getComponentExamples(entry),
      };
      if (entry.status) component.status = entry.status;
      return component;
    }),
  };
}
