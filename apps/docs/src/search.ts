import { useEffect } from "react";
import { components } from "./component-data";

type StaticSearchPage = {
  title: string;
  description: string;
  keywords: string;
  to:
    | "/"
    | "/components"
    | "/tokens"
    | "/templates"
    | "/templates/sidebar"
    | "/guides"
    | "/theme-playground"
    | "/docs/getting-started"
    | "/docs/quick-start"
    | "/docs/colors"
    | "/docs/theme"
    | "/docs/agent-skills";
};

export type SearchEntry = {
  id: string;
  title: string;
  description: string;
  /** Short trailing hint rendered next to the result. */
  hint: string;
  /** Lowercased text used for query matching. */
  haystack: string;
} & (
  | { kind: "page"; to: StaticSearchPage["to"]; params?: never }
  | { kind: "component"; to: "/components/$slug"; params: { slug: string } }
);

const staticPages: StaticSearchPage[] = [
  {
    title: "Overview",
    description: "Velune interface foundations, highlights, and quick links.",
    keywords: "home landing start velune",
    to: "/",
  },
  {
    title: "Components",
    description: "Browse every component grouped by category.",
    keywords: "library catalog all components",
    to: "/components",
  },
  {
    title: "Design tokens",
    description: "Surface, color, spacing, radius, elevation, and motion.",
    keywords: "tokens css variables foundations",
    to: "/tokens",
  },
  {
    title: "Templates",
    description: "Login flow template composed from Velune components.",
    keywords: "template login authentication",
    to: "/templates",
  },
  {
    title: "Sidebar template",
    description: "Persistent workspace navigation application shell.",
    keywords: "template sidebar shell navigation",
    to: "/templates/sidebar",
  },
  {
    title: "Get started guide",
    description: "Install packages, load the theme, and ship a component.",
    keywords: "guides install setup provider",
    to: "/guides",
  },
  {
    title: "Theme playground",
    description: "Generate a brand theme, preview modes, and export CSS.",
    keywords: "brand color generate theme playground studio preview copy css",
    to: "/theme-playground",
  },
  {
    title: "Getting Started",
    description:
      "Why Velune, composition patterns, and where to go next.",
    keywords: "docs introduction principles composition",
    to: "/docs/getting-started",
  },
  {
    title: "Quick Start",
    description: "Install Velune, import styles, and render a component.",
    keywords: "docs install tailwind setup quick",
    to: "/docs/quick-start",
  },
  {
    title: "Colors",
    description: "Semantic color roles for accent, surfaces, and status.",
    keywords: "docs color roles palette semantic",
    to: "/docs/colors",
  },
  {
    title: "Theme",
    description: "Light, dark, high-contrast, and brand-derived themes.",
    keywords:
      "docs theming provider ThemeToggle useThemeToggle brandColor mood base dark mode high contrast",
    to: "/docs/theme",
  },
  {
    title: "Agent Skills",
    description: "Give coding agents current Velune knowledge.",
    keywords: "docs ai agent skills install",
    to: "/docs/agent-skills",
  },
];

export const searchEntries: SearchEntry[] = [
  ...staticPages.map<SearchEntry>((page) => ({
    kind: "page",
    id: `page:${page.to}`,
    title: page.title,
    description: page.description,
    hint: "Page",
    haystack:
      `${page.title} ${page.description} ${page.keywords}`.toLowerCase(),
    to: page.to,
  })),
  ...components.map<SearchEntry>((component) => ({
    kind: "component",
    id: `component:${component.slug}`,
    title: component.name,
    description: component.description,
    hint: component.category,
    haystack:
      `${component.name} ${component.description} ${component.category}`.toLowerCase(),
    to: "/components/$slug",
    params: { slug: component.slug },
  })),
];

function rank(entry: SearchEntry, query: string, terms: string[]): number {
  const title = entry.title.toLowerCase();
  if (title === query) return -1;
  if (title.startsWith(query)) return 0;
  if (title.includes(query)) return 1;
  if (terms.every((term) => title.includes(term))) return 2;
  if (terms.some((term) => title.includes(term))) return 3;
  if (entry.kind === "component") return 4;
  return 5;
}

/** Filter the search index; an empty query returns every entry. */
export function filterSearchEntries(
  query: string,
  entries: SearchEntry[] = searchEntries,
): SearchEntry[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return entries;
  const terms = normalized.split(/\s+/).filter(Boolean);
  return entries
    .filter((entry) => terms.every((term) => entry.haystack.includes(term)))
    .sort(
      (a, b) =>
        rank(a, normalized, terms) - rank(b, normalized, terms) ||
        a.title.localeCompare(b.title),
    );
}

/** True for the global command palette shortcut (Cmd+K / Ctrl+K). */
export function isCommandPaletteShortcut(event: KeyboardEvent): boolean {
  return (
    (event.metaKey || event.ctrlKey) &&
    !event.altKey &&
    !event.shiftKey &&
    event.key.toLowerCase() === "k"
  );
}

/** Register the global Cmd+K / Ctrl+K listener for the command palette. */
export function useCommandPaletteShortcut(onTrigger: () => void): void {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isCommandPaletteShortcut(event)) {
        event.preventDefault();
        onTrigger();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onTrigger]);
}
