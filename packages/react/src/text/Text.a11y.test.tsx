import { describe, expect, it } from "vitest";
import { Text } from "./Text";

describe("Text a11y", () => {
  it("keeps its displayName available to tooling", () => {
    expect(Text.displayName).toBe("Text");
  });
});
