import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { components as componentRegistry } from "../../apps/docs/src/component-data";
import {
  registerBuildEntry,
  registerPackageExport,
  registerRootExport,
} from "./component-generator-utils";

const rawName = process.argv[2];

if (!rawName) {
  console.error("Usage: pnpm create:component <Name>");
  process.exit(1);
}

if (!/^[A-Za-z][A-Za-z0-9_-]*$/.test(rawName)) {
  console.error(
    "Component names must start with a letter and contain only letters, numbers, hyphens, or underscores.",
  );
  process.exit(1);
}

const pascalName = rawName
  .split(/[-_]/)
  .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
  .join("");
const kebabName = rawName
  .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
  .replace(/_/g, "-")
  .toLowerCase();
const camelName = pascalName.charAt(0).toLowerCase() + pascalName.slice(1);

const baseDir = join("packages", "react", "src", kebabName);
const registryEntry = componentRegistry.find(
  (entry) => entry.slug === kebabName,
);

if (!registryEntry) {
  console.error(
    `Register ${kebabName} in apps/docs/src/component-data.ts before generating source files.`,
  );
  process.exit(1);
}

const registryComponentName = (
  registryEntry.importName ?? registryEntry.name.replaceAll(" ", "")
)
  .split(",")[0]!
  .trim();

if (registryComponentName !== pascalName) {
  console.error(
    `Registry export ${registryComponentName} does not match generated component name ${pascalName}.`,
  );
  process.exit(1);
}

async function main() {
  try {
    await mkdir(baseDir);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "EEXIST") {
      console.error(`Component directory already exists: ${baseDir}`);
      process.exit(1);
    }
    throw error;
  }

  await writeFile(
    join(baseDir, "index.ts"),
    `export { ${pascalName} } from "./${pascalName}";
export type { ${pascalName}Props } from "./${pascalName}.types";
`,
  );

  await writeFile(
    join(baseDir, `${pascalName}.types.ts`),
    `import type { HTMLAttributes, ReactNode } from "react";

export interface ${pascalName}Props extends HTMLAttributes<HTMLDivElement> {
  /**
   * Optional child content.
   *
   * @example
   * <${pascalName}>Content</${pascalName}>
   */
  children?: ReactNode;
}
`,
  );

  await writeFile(
    join(baseDir, `${pascalName}.classes.ts`),
    `import { createRecipe } from "../shared/recipe";

/** Style recipe for the ${pascalName} component. */
export const ${camelName}Classes = createRecipe({
  base: "gs-${kebabName} text-gs-text",
});
`,
  );

  await writeFile(
    join(baseDir, `${pascalName}.tsx`),
    `import type { ForwardedRef } from "react";
import { forwardRef } from "react";
import { clsx } from "clsx";
import { ${camelName}Classes } from "./${pascalName}.classes";
import type { ${pascalName}Props } from "./${pascalName}.types";

function ${pascalName}Impl(
  { className, children, ...props }: ${pascalName}Props,
  ref: ForwardedRef<HTMLDivElement>,
) {
  return (
    <div ref={ref} className={clsx(${camelName}Classes(), className)} {...props}>
      {children}
    </div>
  );
}

export const ${pascalName} = forwardRef(${pascalName}Impl);
${pascalName}.displayName = "${pascalName}";
`,
  );

  await writeFile(
    join(baseDir, `${pascalName}.test.tsx`),
    `// @vitest-environment jsdom

import { createRef } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, it, expect } from "vitest";
import { ${pascalName} } from "./${pascalName}";

afterEach(cleanup);

describe("${pascalName}", () => {
  it("sets a readable displayName", () => {
    expect(${pascalName}.displayName).toBe("${pascalName}");
  });

  it("forwards its ref and DOM props", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <${pascalName} ref={ref} data-testid="${kebabName}" data-state="ready">
        Content
      </${pascalName}>,
    );

    const element = screen.getByTestId("${kebabName}");
    expect(ref.current).toBe(element);
    expect(element.getAttribute("data-state")).toBe("ready");
  });
});
`,
  );

  await writeFile(
    join(baseDir, `${pascalName}.a11y.test.tsx`),
    `// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, it, expect } from "vitest";
import { ${pascalName} } from "./${pascalName}";

afterEach(cleanup);

describe("${pascalName} a11y", () => {
  it("preserves an explicit accessible name", () => {
    render(
      <${pascalName} role="region" aria-label="${pascalName} example">
        Content
      </${pascalName}>,
    );

    expect(screen.getByRole("region").getAttribute("aria-label")).toBe(
      "${pascalName} example",
    );
  });
});
`,
  );

  await writeFile(
    join(baseDir, `${pascalName}.stories.tsx`),
    `import { ${pascalName} } from "./${pascalName}";

const meta = {
  title: "React/${pascalName}",
  component: ${pascalName},
};

export default meta;

export const Default = {
  render: () => <${pascalName}>${pascalName}</${pascalName}>,
};
`,
  );

  const registration = {
    slug: kebabName,
    componentName: pascalName,
    publicSubpath: registryEntry.publicSubpath ?? kebabName,
  };
  const rootIndexPath = join("packages", "react", "src", "index.ts");
  const buildConfigPath = join("packages", "react", "tsup.config.ts");
  const reactManifestPath = join("packages", "react", "package.json");
  const aggregateManifestPath = join("packages", "velune", "package.json");
  const [rootIndex, buildConfig, reactManifestSource] = await Promise.all([
    readFile(rootIndexPath, "utf8"),
    readFile(buildConfigPath, "utf8"),
    readFile(reactManifestPath, "utf8"),
  ]);
  const reactManifest = JSON.parse(reactManifestSource) as Record<
    string,
    unknown
  >;

  await Promise.all([
    writeFile(rootIndexPath, registerRootExport(rootIndex, registration)),
    writeFile(buildConfigPath, registerBuildEntry(buildConfig, registration)),
    writeFile(
      reactManifestPath,
      `${JSON.stringify(
        registerPackageExport(
          reactManifest,
          `./${registration.publicSubpath}`,
          `dist/${registration.slug}`,
          "./tailwind.css",
        ),
        null,
        2,
      )}\n`,
    ),
  ]);

  if (registration.publicSubpath !== registration.slug) {
    const aggregateManifest = JSON.parse(
      await readFile(aggregateManifestPath, "utf8"),
    ) as Record<string, unknown>;
    await writeFile(
      aggregateManifestPath,
      `${JSON.stringify(
        registerPackageExport(
          aggregateManifest,
          `./react/${registration.publicSubpath}`,
          `dist/react/${registration.slug}`,
          "./react/*",
        ),
        null,
        2,
      )}\n`,
    );
  }

  console.log(`Created and registered ${baseDir}`);
  console.log("Run pnpm lint:components, then add examples and API guidance.");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
