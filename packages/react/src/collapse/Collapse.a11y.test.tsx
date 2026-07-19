import { describe, expect, it } from "vitest";
import { Collapse } from "./Collapse";

describe("Collapse a11y", () => {
  it("keeps displayName available to tooling", () => {
    expect(Collapse.displayName).toBe("Collapse");
  });
});
