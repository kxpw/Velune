import { describe, expect, it } from "vitest";
import { resolveDatePickerKeyboardCommand } from "./date-picker-keyboard";

const current = new Date(2026, 6, 15);

function resolve(
  key: string,
  options: Partial<{
    direction: "ltr" | "rtl";
    shiftKey: boolean;
    weekStartsOn: 0 | 1;
  }> = {},
) {
  return resolveDatePickerKeyboardCommand(current, key, {
    direction: "ltr",
    shiftKey: false,
    weekStartsOn: 0,
    ...options,
  });
}

describe("date picker keyboard commands", () => {
  it("moves horizontally according to writing direction", () => {
    expect(resolve("ArrowLeft")).toMatchObject({
      type: "focus",
      target: new Date(2026, 6, 14),
    });
    expect(resolve("ArrowLeft", { direction: "rtl" })).toMatchObject({
      type: "focus",
      target: new Date(2026, 6, 16),
    });
  });

  it("supports week, month, and year navigation", () => {
    expect(resolve("ArrowDown")).toMatchObject({
      target: new Date(2026, 6, 22),
    });
    expect(resolve("Home", { weekStartsOn: 1 })).toMatchObject({
      target: new Date(2026, 6, 13),
    });
    expect(resolve("PageUp", { shiftKey: true })).toMatchObject({
      target: new Date(2025, 6, 15),
    });
  });

  it("distinguishes selection from unrelated keys", () => {
    expect(resolve("Enter")).toEqual({ type: "select" });
    expect(resolve(" ")).toEqual({ type: "select" });
    expect(resolve("Escape")).toBeNull();
  });
});
