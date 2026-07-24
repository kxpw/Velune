import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { components } from "./component-data";

const publicDir = path.resolve(import.meta.dirname, "..", "public");

function readPublicFile(name: string): string {
  try {
    return readFileSync(path.join(publicDir, name), "utf8");
  } catch {
    throw new Error(
      `${name} is missing. Run \`pnpm docs:llms\` from the repository root and commit the regenerated files.`,
    );
  }
}

describe("llms.txt artifacts", () => {
  it("llms.txt links every registered component", () => {
    const llmsTxt = readPublicFile("llms.txt");
    const missing = components.filter(
      (component) =>
        !llmsTxt.includes(`(https://velune.dev/components/${component.slug})`),
    );

    expect(
      missing.map((component) => component.slug),
      "Stale llms.txt. Run `pnpm docs:llms` and commit the regenerated files.",
    ).toEqual([]);
  });

  it("llms-full.txt documents every registered component", () => {
    const llmsFullTxt = readPublicFile("llms-full.txt");
    const missing = components.filter(
      (component) => !llmsFullTxt.includes(`### ${component.name}\n`),
    );

    expect(
      missing.map((component) => component.name),
      "Stale llms-full.txt. Run `pnpm docs:llms` and commit the regenerated files.",
    ).toEqual([]);
  });
});
