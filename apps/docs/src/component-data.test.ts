import { describe, expect, it } from "vitest";
import { componentImport, components } from "./component-data";

describe("component data", () => {
  it("generates a dedicated public import for every component", () => {
    for (const component of components) {
      const importName =
        component.importName ?? component.name.replaceAll(" ", "");
      const publicSubpath = component.publicSubpath ?? component.slug;

      expect(componentImport(component)).toBe(
        `import { ${importName} } from "velune/react/${publicSubpath}";`,
      );
    }
  });
});
