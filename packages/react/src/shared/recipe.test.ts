import { describe, expect, it } from "vitest";
import type { RecipeVariantProps } from "./recipe";
import { createRecipe } from "./recipe";

describe("createRecipe", () => {
  it("returns the base classes when no variants are defined", () => {
    const recipe = createRecipe({ base: "gs-widget inline-flex" });
    expect(recipe()).toBe("gs-widget inline-flex");
    expect(recipe({})).toBe("gs-widget inline-flex");
  });

  it("supports string arrays for base and variant classes", () => {
    const recipe = createRecipe({
      base: ["gs-widget", "inline-flex"],
      variants: {
        tone: { info: ["text-gs-info", "bg-gs-info-subtle"] },
      },
    });
    expect(recipe({ tone: "info" })).toBe(
      "gs-widget inline-flex text-gs-info bg-gs-info-subtle",
    );
  });

  it("appends the classes of the selected variant", () => {
    const recipe = createRecipe({
      base: "gs-widget",
      variants: {
        size: { sm: "text-gs-sm", md: "text-md" },
        tone: { info: "text-gs-info", error: "text-gs-error" },
      },
    });
    expect(recipe({ size: "sm", tone: "error" })).toBe(
      "gs-widget text-gs-sm text-gs-error",
    );
  });

  it("omits variant groups without a selection or default", () => {
    const recipe = createRecipe({
      base: "gs-widget",
      variants: {
        size: { sm: "text-gs-sm", md: "text-md" },
      },
    });
    expect(recipe()).toBe("gs-widget");
    expect(recipe({})).toBe("gs-widget");
  });

  it("applies defaultVariants when a prop is omitted", () => {
    const recipe = createRecipe({
      base: "gs-widget",
      variants: {
        size: { sm: "text-gs-sm", md: "text-md" },
      },
      defaultVariants: { size: "md" },
    });
    expect(recipe()).toBe("gs-widget text-md");
    expect(recipe({ size: "sm" })).toBe("gs-widget text-gs-sm");
  });

  it("falls back to defaultVariants when a prop is explicitly undefined", () => {
    const recipe = createRecipe({
      base: "gs-widget",
      variants: {
        size: { sm: "text-gs-sm", md: "text-md" },
      },
      defaultVariants: { size: "md" },
    });
    expect(recipe({ size: undefined })).toBe("gs-widget text-md");
  });

  it("supports boolean variants via true/false keys", () => {
    const recipe = createRecipe({
      base: "gs-widget",
      variants: {
        fullWidth: { true: "w-full", false: "w-auto" },
        disabled: { true: "opacity-gs-disabled" },
      },
      defaultVariants: { fullWidth: false },
    });
    expect(recipe()).toBe("gs-widget w-auto");
    expect(recipe({ fullWidth: true })).toBe("gs-widget w-full");
    expect(recipe({ disabled: true })).toBe(
      "gs-widget w-auto opacity-gs-disabled",
    );
    expect(recipe({ disabled: false })).toBe("gs-widget w-auto");
  });

  it("appends compoundVariants when every listed value matches", () => {
    const recipe = createRecipe({
      base: "gs-widget",
      variants: {
        variant: { solid: "border", outline: "border-2" },
        tone: { info: "text-gs-info", error: "text-gs-error" },
      },
      compoundVariants: [
        { variant: "solid", tone: "error", className: "bg-gs-error" },
        { variant: "outline", tone: "error", className: "border-gs-error" },
      ],
    });
    expect(recipe({ variant: "solid", tone: "error" })).toBe(
      "gs-widget border text-gs-error bg-gs-error",
    );
    expect(recipe({ variant: "outline", tone: "error" })).toBe(
      "gs-widget border-2 text-gs-error border-gs-error",
    );
    expect(recipe({ variant: "solid", tone: "info" })).toBe(
      "gs-widget border text-gs-info",
    );
  });

  it("matches compoundVariants against defaultVariants and booleans", () => {
    const recipe = createRecipe({
      variants: {
        size: { sm: "text-gs-sm", md: "text-md" },
        iconOnly: { true: "p-gs-0" },
      },
      compoundVariants: [
        { size: "md", iconOnly: true, className: "size-gs-10" },
      ],
      defaultVariants: { size: "md" },
    });
    expect(recipe({ iconOnly: true })).toBe("text-md p-gs-0 size-gs-10");
    expect(recipe({ size: "sm", iconOnly: true })).toBe("text-gs-sm p-gs-0");
  });

  it("ignores props that are not defined as variants", () => {
    const recipe = createRecipe({
      base: "gs-widget",
      variants: {
        size: { sm: "text-gs-sm" },
      },
    });
    const props = { size: "sm", unknown: "value" } as { size: "sm" };
    expect(recipe(props)).toBe("gs-widget text-gs-sm");
  });

  it("infers the props type from the variants definition", () => {
    const recipe = createRecipe({
      variants: {
        size: { sm: "text-gs-sm", md: "text-md" },
        fullWidth: { true: "w-full" },
      },
    });
    type Props = RecipeVariantProps<typeof recipe>;
    const accepted: Props = { size: "sm", fullWidth: true };
    expect(recipe(accepted)).toBe("text-gs-sm w-full");

    // @ts-expect-error unknown variant values are rejected
    recipe({ size: "xl" });
    // @ts-expect-error unknown variant groups are rejected
    void ({ tone: "info" } satisfies Props);
  });
});
