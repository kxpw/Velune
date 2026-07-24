import { parseComponentApiReference } from "./api-reference-core";

export type {
  ApiProp,
  ApiPropGroup,
  ApiTypeAlias,
  ComponentApiReference,
} from "./api-reference-core";

const typeSources = import.meta.glob(
  "../../../packages/react/src/*/*.types.ts",
  {
    query: "?raw",
    import: "default",
    eager: true,
  },
) as Record<string, unknown>;

function asSourceText(value: unknown): string | undefined {
  if (typeof value === "string" && value.length > 0) return value;
  if (value && typeof value === "object" && "default" in value) {
    const nested = (value as { default: unknown }).default;
    if (typeof nested === "string" && nested.length > 0) return nested;
  }
  return undefined;
}

function slugToPascalName(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

function getSourceBySlug(slug: string): string | undefined {
  const normalizedSlug = slug.toLowerCase();
  const needle = `/src/${normalizedSlug}/`;
  const fileName = `${slugToPascalName(normalizedSlug)}.types.ts`;

  for (const [path, value] of Object.entries(typeSources)) {
    const normalizedPath = path.replace(/\\/g, "/");
    if (
      normalizedPath.includes(needle) &&
      normalizedPath.endsWith(fileName)
    ) {
      const text = asSourceText(value);
      if (text) return text;
    }
  }

  // Fallback: match directory only (covers atypical filenames).
  for (const [path, value] of Object.entries(typeSources)) {
    const normalizedPath = path.replace(/\\/g, "/");
    if (normalizedPath.includes(needle) && normalizedPath.endsWith(".types.ts")) {
      const text = asSourceText(value);
      if (text) return text;
    }
  }

  return undefined;
}

export function getComponentApiReference(slug: string) {
  return parseComponentApiReference(getSourceBySlug(slug));
}

/** Test helper: how many type modules the docs glob resolved. */
export function getApiTypeSourceCount(): number {
  return Object.keys(typeSources).length;
}
