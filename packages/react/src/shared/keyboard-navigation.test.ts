import { describe, expect, it } from "vitest";
import {
  findEnabledIndex,
  getLinearNavigationIndex,
  resolveLinearNavigation,
} from "./keyboard-navigation";

describe("linear keyboard navigation", () => {
  it("maps orientation and writing direction to navigation intent", () => {
    expect(resolveLinearNavigation("ArrowRight", "horizontal", "ltr")).toBe(
      "next",
    );
    expect(resolveLinearNavigation("ArrowRight", "horizontal", "rtl")).toBe(
      "previous",
    );
    expect(resolveLinearNavigation("ArrowDown", "vertical", "rtl")).toBe(
      "next",
    );
    expect(resolveLinearNavigation("Home", "horizontal")).toBe("first");
    expect(resolveLinearNavigation("Enter", "horizontal")).toBeNull();
  });

  it("wraps linear indexes when looping", () => {
    expect(getLinearNavigationIndex(2, 3, "next")).toBe(0);
    expect(getLinearNavigationIndex(0, 3, "previous")).toBe(2);
    expect(getLinearNavigationIndex(1, 3, "first")).toBe(0);
  });

  it("skips disabled entries in either direction", () => {
    const items = [false, true, true, false];
    expect(findEnabledIndex(items, 0, "next", Boolean)).toBe(3);
    expect(findEnabledIndex(items, 3, "next", Boolean)).toBe(0);
    expect(findEnabledIndex(items, 3, "previous", Boolean)).toBe(0);
    expect(findEnabledIndex(items, 0, "last", Boolean)).toBe(3);
  });
});
