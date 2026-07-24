import { describe, expect, it } from "vitest";
import { getComponentApiReference } from "./api-reference";
import { parseComponentApiReference } from "./api-reference-core";

describe("getComponentApiReference", () => {
  it("keeps adjacent Text aliases separate from generic object types", () => {
    const reference = getComponentApiReference("text");

    expect(reference.aliases).toEqual(
      expect.arrayContaining([
        {
          name: "TextSize",
          value:
            '"2xs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl"',
        },
        {
          name: "TextWeight",
          value: '"light" | "regular" | "medium"',
        },
        {
          name: "TextTone",
          value:
            '"default" | "muted" | "accent" | "success" | "warning" | "error"',
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

  it("parses Switch props even when JSDoc contains apostrophes", () => {
    const reference = getComponentApiReference("switch");
    const props = reference.groups.find(
      (group) => group.name === "SwitchProps",
    )?.props;
    const names = props?.map((prop) => prop.name) ?? [];

    expect(names).toEqual(
      expect.arrayContaining([
        "checked",
        "defaultChecked",
        "onCheckedChange",
        "loading",
        "size",
        "required",
      ]),
    );
    expect(
      props?.find((prop) => prop.name === "required")?.description,
    ).toMatch(/switch/i);
  });

  it("parses DatePicker props even when JSDoc contains apostrophes", () => {
    const reference = getComponentApiReference("date-picker");
    const names =
      reference.groups
        .find((group) => group.name === "DatePickerProps")
        ?.props.map((prop) => prop.name) ?? [];

    expect(names.length).toBeGreaterThan(0);
    expect(names).toEqual(
      expect.arrayContaining(["value", "defaultValue", "onValueChange"]),
    );
  });

  it("surfaces Button polymorphism props from the discriminated union", () => {
    const reference = getComponentApiReference("button");
    const buttonProps = reference.groups.find(
      (group) => group.name === "ButtonProps",
    );
    const commonProps = reference.groups.find(
      (group) => group.name === "ButtonCommonProps",
    );
    const names = [
      ...(buttonProps?.props.map((prop) => prop.name) ?? []),
      ...(commonProps?.props.map((prop) => prop.name) ?? []),
    ];

    expect(names).toEqual(
      expect.arrayContaining(["asChild", "as", "loading", "variant", "tone"]),
    );
    expect(buttonProps?.props.some((prop) => prop.name === "asChild")).toBe(
      true,
    );
  });

  it("includes shared Select base props once they are exported", () => {
    const reference = getComponentApiReference("select");
    const names = reference.groups.flatMap((group) =>
      group.props.map((prop) => prop.name),
    );

    expect(names).toEqual(
      expect.arrayContaining([
        "searchable",
        "size",
        "invalid",
        "fullWidth",
        "portal",
      ]),
    );
  });
});

describe("parseComponentApiReference", () => {
  it("ignores quotes inside block comments while scanning braces", () => {
    const reference = parseComponentApiReference(`
      export interface DemoProps {
        /** Require the widget's value. */
        required?: boolean;
        /** Keep the control's label visible. */
        label?: string;
      }
    `);

    expect(
      reference.groups
        .find((group) => group.name === "DemoProps")
        ?.props.map((prop) => prop.name),
    ).toEqual(["required", "label"]);
  });
});
