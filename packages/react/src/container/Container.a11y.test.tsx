import { describe, expect, it } from "vitest";
import { Container } from "./Container";

describe("Container a11y", () => {
  it("keeps displayName available to tooling", () => {
    expect(Container.displayName).toBe("Container");
  });
});
