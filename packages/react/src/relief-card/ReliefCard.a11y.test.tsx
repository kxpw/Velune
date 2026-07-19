import { describe, expect, it } from "vitest";
import { ReliefCard } from "./ReliefCard";

describe("ReliefCard a11y", () => {
  it("keeps displayName available to tooling", () => {
    expect(ReliefCard.displayName).toBe("ReliefCard");
  });
});
