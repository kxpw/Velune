import { describe, expect, it } from "vitest";
import { getComponentApiReference } from "./api-reference";

describe("getComponentApiReference", () => {
  it("keeps adjacent Text aliases separate from generic object types", () => {
    const reference = getComponentApiReference("text");

    expect(reference.aliases).toEqual(
      expect.arrayContaining([
        {
          name: "TextSize",
          value:
            '"2xs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "display"',
        },
        {
          name: "TextWeight",
          value: '"light" | "regular" | "medium" | "semibold" | "bold"',
        },
        {
          name: "TextTone",
          value:
            '"default" | "muted" | "primary" | "success" | "warning" | "error"',
        },
      ]),
    );
    expect(reference.groups.map((group) => group.name)).toContain("TextProps");
    expect(reference.groups.map((group) => group.name)).not.toContain(
      "TextOwnProps",
    );
    expect(reference.groups.map((group) => group.name)).not.toContain(
      "TextSize",
    );
  });
});
