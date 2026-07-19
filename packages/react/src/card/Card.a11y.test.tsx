import { describe, expect, it } from "vitest";
import { Card } from "./Card";

describe("Card a11y", () => {
  it("keeps displayName available to tooling", () => {
    expect(Card.displayName).toBe("Card");
  });
});
