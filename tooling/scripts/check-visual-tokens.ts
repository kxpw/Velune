import { readdir, readFile } from "node:fs/promises";
import { join, relative, sep } from "node:path";

const normalizedRoot = new URL("../../", import.meta.url).pathname;
const workspaceRoot =
  process.platform === "win32" ? normalizedRoot.slice(1) : normalizedRoot;
const patterns = [
  { name: "hex color", pattern: /#[0-9a-fA-F]{3,8}\b/g },
  { name: "rgb color", pattern: /\brgba?\(/g },
  { name: "hardcoded px", pattern: /(?<![-\w])\d*\.?\d+px\b/g },
];
const referencePalettePattern = /var\(--color-[a-zA-Z][a-zA-Z0-9-]*-\d+\)/g;
const blurPattern = /\b(?:backdrop-filter\s*:[^;]*|blur\s*\()/g;
const gradientPattern = /\b(?:linear|radial|conic)-gradient\s*\(/g;
const tailwindTokenPatterns = [
  {
    name: "color token arbitrary utility",
    pattern:
      /(?:bg|text|border|outline|ring|fill|stroke)-\[var\(--color-[^)]+\)\]/g,
  },
  {
    name: "radius token arbitrary utility",
    pattern: /rounded(?:-[trbl]{1,2})?-\[var\(--radius-[^)]+\)\]/g,
  },
  {
    name: "shadow token arbitrary utility",
    pattern: /shadow-\[var\(--shadow-[^)]+\)\]/g,
  },
  {
    name: "motion token arbitrary utility",
    pattern: /(?:duration|ease)-\[var\(--(?:duration|easing)-[^)]+\)\]/g,
  },
  {
    name: "font token arbitrary utility",
    pattern: /font-\[var\(--font-family-[^)]+\)\]/g,
  },
  {
    name: "spacing token arbitrary utility",
    pattern:
      /(?:p[trblxy]?|m[trblxy]?|gap|[hw]|min-[hw]|max-[hw])-\[var\(--(?:space|spacing)-[^)]+\)\]/g,
  },
] as const;
const maxShadowOpacity = 0.06;

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});

async function main(): Promise<void> {
  const reactSrcDir = join(workspaceRoot, "packages/react/src");
  const themeSrcDir = join(reactSrcDir, "theme");
  const files = (await findCssFiles(reactSrcDir)).filter(
    (file) => !file.startsWith(`${themeSrcDir}${sep}`),
  );
  const themeCss = await readFile(join(themeSrcDir, "tokens.css"), "utf8");
  const themeTokens = collectDefinedTokens(themeCss);
  const violations: string[] = [];

  validateShadowTokens(themeCss, violations);

  for (const file of files) {
    const contents = stripComments(await readFile(file, "utf8"));
    const relativeFile = relative(workspaceRoot, file);
    const availableTokens = new Set([
      ...themeTokens,
      ...collectDefinedTokens(contents),
    ]);
    for (const { name, pattern } of patterns) {
      for (const match of contents.matchAll(pattern)) {
        const line = contents.slice(0, match.index).split("\n").length;
        violations.push(`${relativeFile}:${line} uses ${name} "${match[0]}"`);
      }
    }

    collectMatches(
      contents,
      referencePalettePattern,
      relativeFile,
      "references a palette token directly",
      violations,
    );
    collectMatches(
      contents,
      blurPattern,
      relativeFile,
      "uses a blur or backdrop filter",
      violations,
    );
    collectMatches(
      contents,
      gradientPattern,
      relativeFile,
      "uses a non-approved gradient",
      violations,
    );

    for (const match of contents.matchAll(/var\(--([a-zA-Z0-9_-]+)/g)) {
      const token = match[1];
      if (!token || token.startsWith("gs-") || availableTokens.has(token)) {
        continue;
      }
      const line = contents.slice(0, match.index).split("\n").length;
      violations.push(
        `${relativeFile}:${line} uses undefined token "--${token}"`,
      );
    }
  }

  const sourceFiles = (
    await Promise.all(
      [join(reactSrcDir), join(workspaceRoot, "apps/docs/src")].map(
        findSourceFiles,
      ),
    )
  ).flat();

  for (const file of sourceFiles) {
    const contents = stripComments(await readFile(file, "utf8"));
    const relativeFile = relative(workspaceRoot, file);

    for (const { name, pattern } of tailwindTokenPatterns) {
      collectMatches(
        contents,
        pattern,
        relativeFile,
        `uses ${name}`,
        violations,
      );
    }
  }

  if (violations.length > 0) {
    console.error(violations.join("\n"));
    process.exit(1);
  }

  console.log(
    `Checked ${files.length} component style files and ${sourceFiles.length} Tailwind source files for token-only visual values.`,
  );
}

function collectMatches(
  contents: string,
  pattern: RegExp,
  file: string,
  message: string,
  violations: string[],
): void {
  for (const match of contents.matchAll(pattern)) {
    const line = contents.slice(0, match.index).split("\n").length;
    violations.push(`${file}:${line} ${message} "${match[0]}"`);
  }
}

function validateShadowTokens(themeCss: string, violations: string[]): void {
  for (const match of themeCss.matchAll(/--(shadow-[\w-]+)\s*:\s*([^;]+);/g)) {
    const [, token = "", value = ""] = match;
    const line = themeCss.slice(0, match.index).split("\n").length;
    const opacities = collectAlphaValues(value);

    if (opacities.some((opacity) => opacity > maxShadowOpacity + 0.0001)) {
      violations.push(
        `packages/react/src/theme/tokens.css:${line} defines "--${token}" above 6% opacity`,
      );
    }

    if (/glow/i.test(token) || /var\(--color-(?!shadow)/.test(value)) {
      violations.push(
        `packages/react/src/theme/tokens.css:${line} defines non-approved glow shadow "--${token}"`,
      );
    }
  }
}

function collectAlphaValues(value: string): number[] {
  const values: number[] = [];

  for (const match of value.matchAll(/\/\s*(\d*\.?\d+)\s*(%)?/g)) {
    const amount = Number(match[1]);
    values.push(match[2] ? amount / 100 : amount);
  }

  for (const match of value.matchAll(
    /rgba\([^,]+,[^,]+,[^,]+,\s*(\d*\.?\d+)\s*\)/g,
  )) {
    values.push(Number(match[1]));
  }

  return values;
}

function stripComments(contents: string): string {
  return contents.replace(/\/\*[\s\S]*?\*\//g, (comment) =>
    comment.replace(/[^\n]/g, " "),
  );
}

function collectDefinedTokens(contents: string): Set<string> {
  return new Set(
    Array.from(contents.matchAll(/--([a-zA-Z0-9_-]+)\s*:/g), (match) =>
      String(match[1]),
    ),
  );
}

async function findCssFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) {
        return findCssFiles(path);
      }
      return entry.isFile() && entry.name.endsWith(".css") ? [path] : [];
    }),
  );

  return files.flat();
}

async function findSourceFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) {
        return findSourceFiles(path);
      }
      return entry.isFile() && /\.(?:ts|tsx)$/.test(entry.name) ? [path] : [];
    }),
  );

  return files.flat();
}
