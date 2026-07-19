import { describe, expect, it } from "vitest";
import { Stack } from "./Stack";

describe("Stack a11y", () => {
  it("keeps displayName available to tooling", () => {
    expect(Stack.displayName).toBe("Stack");
  });
});
