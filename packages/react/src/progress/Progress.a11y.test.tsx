import { describe, expect, it } from "vitest";
import { Progress } from "./Progress";

describe("Progress a11y", () => {
  it("keeps displayName available to tooling", () => {
    expect(Progress.displayName).toBe("Progress");
  });
});
