import { describe, expect, it } from "vitest";
import { Tooltip } from "./Tooltip";

describe("Tooltip a11y", () => {
  it("keeps displayName available to tooling", () => {
    expect(Tooltip.displayName).toBe("Tooltip");
  });
});
