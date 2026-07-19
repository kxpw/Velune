import { describe, expect, it } from "vitest";
import { Divider } from "./Divider";

describe("Divider a11y", () => {
  it("keeps displayName available to tooling", () => {
    expect(Divider.displayName).toBe("Divider");
  });
});
