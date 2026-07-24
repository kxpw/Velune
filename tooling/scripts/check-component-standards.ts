import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { components as componentRegistry } from "../../apps/docs/src/component-data";

const reactSrcDir = join(process.cwd(), "packages/react/src");
const ignoredDirectories = new Set(["shared", "theme"]);

const componentOverrides: Record<
  string,
  { implementation: string; exportName: string; propsName: string }
> = {
  toast: {
    implementation: "ToastProvider.tsx",
    exportName: "ToastProvider",
    propsName: "ToastProviderProps",
  },
  sidebar: {
    implementation: "SidebarPanel.tsx",
    exportName: "Sidebar",
    propsName: "SidebarProps",
  },
};

const requiredFiles = (name: string, implementation: string) => [
  implementation,
  `${name}.types.ts`,
  `${name}.classes.ts`,
  `${name}.test.tsx`,
  `${name}.a11y.test.tsx`,
  `${name}.stories.tsx`,
  "index.ts",
];

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});

async function main(): Promise<void> {
  const entries = await readdir(reactSrcDir, { withFileTypes: true });
  const componentDirs = entries
    .filter(
      (entry) => entry.isDirectory() && !ignoredDirectories.has(entry.name),
    )
    .map((entry) => entry.name)
    .sort();
  const componentDirSet = new Set(componentDirs);
  const packageManifest = JSON.parse(
    await readFile(join(process.cwd(), "packages/react/package.json"), "utf8"),
  ) as { exports?: Record<string, unknown> };
  const aggregateManifest = JSON.parse(
    await readFile(join(process.cwd(), "packages/velune/package.json"), "utf8"),
  ) as { exports?: Record<string, unknown> };
  const rootIndexSource = await readFile(join(reactSrcDir, "index.ts"), "utf8");
  const buildConfigSource = await readFile(
    join(process.cwd(), "packages/react/tsup.config.ts"),
    "utf8",
  );
  const readmeSource = await readFile(join(process.cwd(), "README.md"), "utf8");
  const registeredSlugs = componentRegistry.map((entry) => entry.slug);
  const registeredSlugSet = new Set(registeredSlugs);
  const registeredSubpaths = componentRegistry.map(
    (entry) => entry.publicSubpath ?? entry.slug,
  );
  const failures: string[] = [];

  if (registeredSlugs.length !== registeredSlugSet.size) {
    failures.push("apps/docs/src/component-data.ts contains duplicate slugs");
  }

  if (registeredSubpaths.length !== new Set(registeredSubpaths).size) {
    failures.push(
      "apps/docs/src/component-data.ts contains duplicate public subpaths",
    );
  }

  const readmeCount = readmeSource.match(
    /- (\d+) [^\n]*React components\b/,
  )?.[1];
  if (Number(readmeCount) !== componentDirs.length) {
    failures.push(
      `README component count must be ${componentDirs.length}, received ${readmeCount ?? "missing"}`,
    );
  }

  for (const dir of componentDirs) {
    const componentName = toPascalCase(dir);
    const override = componentOverrides[dir];
    const implementation = override?.implementation ?? `${componentName}.tsx`;
    const exportName = override?.exportName ?? componentName;
    const propsName = override?.propsName ?? `${componentName}Props`;
    const componentDir = join(reactSrcDir, dir);
    const files = new Set(await readdir(componentDir));

    for (const file of requiredFiles(componentName, implementation)) {
      if (!files.has(file)) {
        failures.push(`${dir}: missing ${file}`);
      }
    }

    if (!files.has(implementation)) {
      continue;
    }

    const componentSource = await readFile(
      join(componentDir, implementation),
      "utf8",
    );
    const indexSource = files.has("index.ts")
      ? await readFile(join(componentDir, "index.ts"), "utf8")
      : "";
    if (!componentSource.includes("forwardRef(")) {
      failures.push(`${dir}: component must use forwardRef`);
    }

    if (!componentSource.includes(`from "./${componentName}.classes"`)) {
      failures.push(
        `${dir}: ${implementation} must import its styling recipe from ./${componentName}.classes`,
      );
    }

    if (!componentSource.includes(`.displayName = "${exportName}"`)) {
      failures.push(`${dir}: component must set displayName`);
    }

    if (!indexSource.includes(`export { ${exportName} }`)) {
      failures.push(`${dir}: index.ts must export ${componentName}`);
    }

    if (
      !indexSource.includes(`export type {`) ||
      !indexSource.includes(propsName)
    ) {
      failures.push(`${dir}: index.ts must export ${componentName}Props`);
    }

    if (!rootIndexSource.includes(`from "./${dir}"`)) {
      failures.push(`${dir}: missing packages/react/src/index.ts export`);
    }

    if (!buildConfigSource.includes(`"src/${dir}/index.ts"`)) {
      failures.push(`${dir}: missing packages/react/tsup.config.ts entry`);
    }

    const registryEntry = componentRegistry.find((entry) => entry.slug === dir);
    const publicSubpath = registryEntry?.publicSubpath ?? dir;
    if (
      !(
        packageManifest.exports &&
        `./${publicSubpath}` in packageManifest.exports
      )
    ) {
      failures.push(`${dir}: missing package export ./${publicSubpath}`);
    }

    if (
      publicSubpath !== dir &&
      !(
        aggregateManifest.exports &&
        `./react/${publicSubpath}` in aggregateManifest.exports
      )
    ) {
      failures.push(
        `${dir}: missing aggregate package export ./react/${publicSubpath}`,
      );
    }

    if (!registeredSlugSet.has(dir)) {
      failures.push(`${dir}: missing shared component registration`);
    }
  }

  for (const slug of registeredSlugSet) {
    if (!componentDirSet.has(slug)) {
      failures.push(
        `${slug}: component registration has no React component directory`,
      );
    }
  }

  if (failures.length > 0) {
    throw new Error(`Component standards failed:\n${failures.join("\n")}`);
  }

  console.log(`Checked ${componentDirs.length} React component directories.`);
}

function toPascalCase(value: string): string {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => part[0]!.toUpperCase() + part.slice(1))
    .join("");
}
