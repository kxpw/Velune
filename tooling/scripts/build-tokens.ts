import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { format } from "prettier";
import {
  generateColorScale,
  hexToOklch,
} from "../../packages/react/src/theme/color";

type TokenMap = Record<string, string>;

const semanticColorGroups: Record<string, string[]> = {
  "color-primary": [
    "color-primary",
    "color-primary-hover",
    "color-primary-active",
    "color-primary-strong",
    "color-primary-strong-hover",
    "color-primary-strong-active",
    "color-info",
    "color-on-primary",
  ],
  "color-success": ["color-success"],
  "color-warning": ["color-warning"],
  "color-error": ["color-error"],
  "color-surface": [
    "color-canvas",
    "color-surface",
    "color-surface-raised",
    "color-surface-mist",
    "surface-highlight",
    "surface-sheen",
  ],
  "color-text": [
    "color-text-primary",
    "color-text-secondary",
    "color-text-disabled",
    "color-text-accent",
  ],
  "color-border": ["color-border-default", "color-border-strong"],
  "color-action": ["color-action-hover", "color-action-active"],
  "color-focus": ["color-focus-ring", "color-border-focus"],
};

type TokenSource = {
  colorSeeds: Record<string, string>;
  semantic: Record<"light" | "dark" | "highContrast", TokenMap>;
  tokens: Record<string, TokenMap> & {
    componentDark?: TokenMap;
    componentHighContrast?: TokenMap;
  };
};

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "../..");
const reactDir = join(rootDir, "packages/react");
const themeDir = join(reactDir, "src/theme");
const sourceFile = join(reactDir, "tokens.json");
const cssFile = join(themeDir, "tokens.css");
const foundationCssFile = join(themeDir, "foundation.css");
const foundationGroupCssDir = join(themeDir, "foundations");
const componentCssDir = join(themeDir, "components");
const tsFile = join(themeDir, "tokens.ts");
const tailwindFile = join(reactDir, "tokens.tailwind.cjs");

let source: TokenSource;
let referenceColors: TokenMap;
let foundationTokenGroups: Record<string, TokenMap>;
let foundationTokens: TokenMap;
let foundationRootTokens: TokenMap;
let componentTokens: TokenMap;
let componentDarkTokens: TokenMap;
let componentHighContrastTokens: TokenMap;
let lightTokens: TokenMap;
let allTokens: Record<string, unknown>;

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});

async function main(): Promise<void> {
  source = JSON.parse(await readFile(sourceFile, "utf8")) as TokenSource;
  referenceColors = buildReferenceColors(source.colorSeeds);
  const {
    component = {},
    componentDark = {},
    componentHighContrast = {},
    ...foundationGroups
  } = source.tokens;
  foundationTokenGroups = Object.fromEntries(
    Object.entries(foundationGroups).map(([name, tokens]) => [
      name,
      resolveMap(tokens),
    ]),
  );
  foundationTokens = Object.assign({}, ...Object.values(foundationTokenGroups));
  componentTokens = resolveMap(component);
  componentDarkTokens = resolveMap(componentDark);
  componentHighContrastTokens = resolveMap(componentHighContrast);
  lightTokens = resolveMap(source.semantic.light);
  foundationRootTokens = {
    ...referenceColors,
    ...foundationTokens,
    ...lightTokens,
  };
  allTokens = {
    reference: referenceColors,
    semantic: source.semantic,
    ...foundationGroups,
    component,
    componentDark,
    componentHighContrast,
  };

  await rm(componentCssDir, { recursive: true, force: true });
  await rm(foundationGroupCssDir, { recursive: true, force: true });
  validateSemanticColorGroups();
  const componentPrefixes = Array.from(
    new Set(Object.keys(componentTokens).map(tokenPrefix)),
  );
  await Promise.all([
    writeGenerated(cssFile, buildCss()),
    writeGenerated(foundationCssFile, buildFoundationCss()),
    ...Object.entries(semanticColorGroups).map(([name, tokenNames]) =>
      writeGenerated(
        join(foundationGroupCssDir, `${name}.css`),
        buildSemanticColorCss(tokenNames),
      ),
    ),
    ...Object.keys(source.colorSeeds).map((name) =>
      writeGenerated(
        join(foundationGroupCssDir, `color-${name}.css`),
        buildCssDocument(
          filterTokenNamespace(referenceColors, `color-${name}`),
          {},
          {},
        ),
      ),
    ),
    ...Object.entries(foundationTokenGroups).map(([name, tokens]) =>
      writeGenerated(
        join(foundationGroupCssDir, `${normalizeGroupName(name)}.css`),
        buildCssDocument(
          tokens,
          {},
          {},
          {
            fontFace: name === "font",
            motionOverrides: name === "motion",
          },
        ),
      ),
    ),
    ...componentPrefixes.map((prefix) =>
      writeGenerated(
        join(componentCssDir, `${prefix}.css`),
        buildComponentCss(prefix),
      ),
    ),
    writeGenerated(tsFile, buildTs()),
    writeGenerated(tailwindFile, buildTailwindPreset()),
  ]);
}

function buildReferenceColors(seeds: Record<string, string>): TokenMap {
  const colorEntries = Object.entries(seeds).flatMap(([name, seed]) => {
    if (name === "neutral") {
      const neutralScale = generateColorScale(seed);
      // The neutral cast follows the seed hue so the whole ramp shares one
      // Temperature: warm kaolin gray, with no cool or blue cast.
      const seedHue = hexToOklch(seed).h.toFixed(2);
      return [
        ["color-neutral-0", "oklch(100% 0 0deg)"],
        ...Object.entries(neutralScale).map(([stop, value]) => [
          `color-neutral-${stop === "50" ? "100" : stop}`,
          stop === "50" ? `oklch(97% 0.005 ${seedHue}deg)` : desaturate(value),
        ]),
        ["color-neutral-1000", `oklch(9% 0.008 ${seedHue}deg)`],
      ];
    }

    return Object.entries(generateColorScale(seed)).map(([stop, value]) => [
      `color-${name}-${stop}`,
      value,
    ]);
  });

  return Object.fromEntries(colorEntries);
}

function desaturate(value: string): string {
  return value.replace(/oklch\(([^ ]+) [^ ]+ ([^)]+)\)/, "oklch($1 0.012 $2)");
}

function resolveValue(value: string): string {
  return value.replace(/\{([^}]+)\}/g, (_, path: string) => {
    const tokenName = path.replace(/\./g, "-");
    return cssVarReference(tokenName);
  });
}

function resolveMap(map: TokenMap): TokenMap {
  return Object.fromEntries(
    Object.entries(map).map(([key, value]) => [key, resolveValue(value)]),
  );
}

/**
 * CSS custom property names are identifiers — `.` must be escaped or the
 * declaration is dropped by the browser (`--space-1.5` parses as `--space-1`
 * plus a `.5` dimension).
 */
function cssVarName(name: string): string {
  return name.replace(/\./g, "\\.");
}

function cssVarReference(name: string): string {
  return `var(--${cssVarName(name)})`;
}

function cssBlock(selector: string, tokens: TokenMap): string {
  const declarations = Object.entries(tokens)
    .map(([key, value]) => `  --${cssVarName(key)}: ${resolveValue(value)};`)
    .join("\n");
  return `${selector} {\n${declarations}\n}`;
}

function indentBlock(block: string): string {
  return block
    .split("\n")
    .map((line) => `  ${line}`)
    .join("\n");
}

function buildCss(): string {
  const prefixes = Array.from(
    new Set(Object.keys(componentTokens).map(tokenPrefix)),
  ).sort();
  const imports = [
    '@import "./foundation.css";',
    ...prefixes.map((prefix) => `@import "./components/${prefix}.css";`),
  ].join("\n");
  return [
    "/* This file is generated by tooling/scripts/build-tokens.ts. */",
    "/* Aggregates foundation + component sheets; values live in those files only. */",
    imports,
    "",
  ].join("\n");
}

function buildFoundationCss(): string {
  return buildCssDocument(
    foundationRootTokens,
    resolveMap(source.semantic.dark),
    resolveMap(source.semantic.highContrast),
    { fontFace: true, motionOverrides: true },
  );
}

function buildSemanticColorCss(tokenNames: string[]): string {
  return buildCssDocument(
    filterTokenNames(lightTokens, tokenNames),
    filterTokenNames(resolveMap(source.semantic.dark), tokenNames),
    filterTokenNames(resolveMap(source.semantic.highContrast), tokenNames),
  );
}

function validateSemanticColorGroups(): void {
  const groupedNames = Object.values(semanticColorGroups).flat().sort();
  const semanticNames = Object.keys(source.semantic.light).sort();
  if (
    groupedNames.length !== new Set(groupedNames).size ||
    groupedNames.join("\n") !== semanticNames.join("\n")
  ) {
    throw new Error(
      "Semantic color groups must cover every light-mode token once",
    );
  }
}

function buildComponentCss(prefix: string): string {
  return buildCssDocument(
    filterTokenPrefix(componentTokens, prefix),
    filterTokenPrefix(componentDarkTokens, prefix),
    filterTokenPrefix(componentHighContrastTokens, prefix),
  );
}

type CssDocumentOptions = {
  fontFace?: boolean;
  motionOverrides?: boolean;
};

function buildCssDocument(
  root: TokenMap,
  dark: TokenMap,
  highContrast: TokenMap,
  options: CssDocumentOptions = {},
): string {
  const blocks = [
    "/* This file is generated by tooling/scripts/build-tokens.ts. */",
  ];

  if (options.fontFace) {
    blocks.push(
      [
        "@font-face {",
        '  font-family: "Velune Sans Fallback";',
        '  src: local("Arial");',
        "  font-display: swap;",
        "  size-adjust: 100%;",
        "  ascent-override: 92%;",
        "  descent-override: 22%;",
        "  line-gap-override: 0%;",
        "}",
      ].join("\n"),
      [
        "@font-face {",
        '  font-family: "Velune Serif Fallback";',
        '  src: local("Georgia"), local("Times New Roman");',
        "  font-display: swap;",
        "  size-adjust: 100%;",
        "}",
      ].join("\n"),
    );
  }

  blocks.push(
    cssBlock(
      ':root, .gs-theme-root[data-theme="light"], .gs-theme-root[data-theme="system"]',
      root,
    ),
  );
  if (Object.keys(dark).length > 0) {
    blocks.push(
      cssBlock('[data-theme="dark"], .gs-theme-root[data-theme="dark"]', dark),
      [
        "@media (prefers-color-scheme: dark) {",
        indentBlock(
          cssBlock(
            ':root:not([data-theme="light"]), .gs-theme-root[data-theme="system"]',
            dark,
          ),
        ),
        "}",
      ].join("\n"),
    );
  }
  if (Object.keys(highContrast).length > 0) {
    blocks.push(
      cssBlock(
        '[data-high-contrast="true"], .gs-theme-root[data-high-contrast="true"]',
        highContrast,
      ),
    );
  }

  if (options.motionOverrides) {
    const durationResets = Object.keys(source.tokens.motion ?? {})
      .filter((name) => name.startsWith("duration-"))
      .map((name) => `  --${cssVarName(name)}: 0.01ms;`);
    blocks.push(
      [
        "@media (prefers-reduced-motion: reduce) {",
        indentBlock([":root {", ...durationResets, "}"].join("\n")),
        "}",
      ].join("\n"),
      ['[data-reduced-motion="true"] {', ...durationResets, "}"].join("\n"),
    );
  }

  return blocks.join("\n\n");
}

function tokenPrefix(name: string): string {
  return name.split("-", 1)[0] ?? name;
}

function normalizeGroupName(name: string): string {
  return name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

function filterTokenPrefix(tokens: TokenMap, prefix: string): TokenMap {
  return Object.fromEntries(
    Object.entries(tokens).filter(([name]) => tokenPrefix(name) === prefix),
  );
}

function filterTokenNames(tokens: TokenMap, names: string[]): TokenMap {
  const included = new Set(names);
  return Object.fromEntries(
    Object.entries(tokens).filter(([name]) => included.has(name)),
  );
}

function filterTokenNamespace(tokens: TokenMap, namespace: string): TokenMap {
  return Object.fromEntries(
    Object.entries(tokens).filter(
      ([name]) => name === namespace || name.startsWith(`${namespace}-`),
    ),
  );
}

function buildTs(): string {
  return [
    "/* This file is generated by tooling/scripts/build-tokens.ts. */",
    `export const tokens = ${JSON.stringify(allTokens, null, 2)} as const;`,
    "",
    "export type TokenCategory = keyof typeof tokens;",
    "export type ThemeSemanticMode = keyof typeof tokens.semantic;",
    "export type TokenName<TCategory extends TokenCategory> = keyof (typeof tokens)[TCategory];",
    "",
  ].join("\n");
}

function buildTailwindPreset(): string {
  const colorNames = Object.keys(referenceColors)
    .filter((name) => name.startsWith("color-"))
    .map((name) => [name.replace("color-", ""), `var(--${name})`]);

  return [
    "/* This file is generated by tooling/scripts/build-tokens.ts. */",
    "module.exports = {",
    "  theme: {",
    "    extend: {",
    `      colors: ${JSON.stringify(Object.fromEntries(colorNames), null, 8)},`,
    `      spacing: ${JSON.stringify(toTailwindScale(source.tokens.space), null, 8)},`,
    `      borderRadius: ${JSON.stringify(toTailwindScale(source.tokens.radius, "radius-"), null, 8)},`,
    `      boxShadow: ${JSON.stringify(toTailwindScale(source.tokens.shadow, "shadow-"), null, 8)},`,
    "    },",
    "  },",
    "};",
    "",
  ].join("\n");
}

function toTailwindScale(tokens: TokenMap, prefix = ""): TokenMap {
  return Object.fromEntries(
    Object.keys(tokens).map((name) => [
      prefix ? name.replace(prefix, "") : name.replace(/^[^-]+-/, ""),
      cssVarReference(name),
    ]),
  );
}

async function writeGenerated(file: string, contents: string): Promise<void> {
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, await format(contents, { parser: getParser(file) }));
}

function getParser(file: string): "babel" | "css" | "typescript" {
  if (file.endsWith(".css")) {
    return "css";
  }
  if (file.endsWith(".ts")) {
    return "typescript";
  }
  return "babel";
}
