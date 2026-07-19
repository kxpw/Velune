import { describe, expect, it } from "vitest";
import { Flex } from "./Flex";

describe("Flex a11y", () => {
  it("keeps displayName available to tooling", () => {
    expect(Flex.displayName).toBe("Flex");
  });
});
