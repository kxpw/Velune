import { describe, expect, it } from "vitest";
import { Popover } from "./Popover";

describe("Popover a11y", () => {
  it("keeps displayName available to tooling", () => {
    expect(Popover.displayName).toBe("Popover");
  });
});
