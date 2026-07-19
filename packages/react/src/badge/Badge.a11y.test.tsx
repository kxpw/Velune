import { describe, expect, it } from "vitest";
import { Badge } from "./Badge";

describe("Badge a11y", () => {
  it("keeps displayName available to tooling", () => {
    expect(Badge.displayName).toBe("Badge");
  });
});
