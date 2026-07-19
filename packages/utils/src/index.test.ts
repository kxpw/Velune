import { describe, expect, it } from "vitest";
import { clamp, createId, isDefined } from "./index";

describe("utils", () => {
  it("clamps a value", () => {
    expect(clamp(12, 0, 10)).toBe(10);
  });

  it("filters nullish values", () => {
    expect([1, null, 2].filter(isDefined)).toEqual([1, 2]);
  });

  it("creates Velune-prefixed ids by default", () => {
    expect(createId()).toMatch(/^gs-[a-z0-9]+$/);
    expect(createId("field")).toMatch(/^field-[a-z0-9]+$/);
  });
});
