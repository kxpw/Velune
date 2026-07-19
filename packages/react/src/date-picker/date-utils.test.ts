import { describe, expect, it } from "vitest";
import {
  addMonths,
  addYears,
  endOfWeek,
  startOfWeek,
  toDateValue,
} from "./date-utils";

describe("date utilities", () => {
  it("clamps month changes instead of overflowing into another month", () => {
    const result = addMonths(new Date(2025, 0, 31), 1);

    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth()).toBe(1);
    expect(result.getDate()).toBe(28);
  });

  it("clamps leap days when changing to a non-leap year", () => {
    const result = addYears(new Date(2024, 1, 29), 1);

    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth()).toBe(1);
    expect(result.getDate()).toBe(28);
  });

  it("parses ISO calendar dates in local time and rejects invalid dates", () => {
    const result = toDateValue("2026-07-13");

    expect(result?.getFullYear()).toBe(2026);
    expect(result?.getMonth()).toBe(6);
    expect(result?.getDate()).toBe(13);
    expect(toDateValue("2026-02-29")).toBeNull();
  });

  it("resolves keyboard week boundaries for either supported week start", () => {
    const wednesday = new Date(2026, 6, 15);

    expect(startOfWeek(wednesday, 0).getDate()).toBe(12);
    expect(endOfWeek(wednesday, 0).getDate()).toBe(18);
    expect(startOfWeek(wednesday, 1).getDate()).toBe(13);
    expect(endOfWeek(wednesday, 1).getDate()).toBe(19);
  });
});
