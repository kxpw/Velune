import { describe, expect, it } from "vitest";
import { Box } from "./Box";

describe("Box a11y", () => {
  it("keeps displayName available to tooling", () => {
    expect(Box.displayName).toBe("Box");
  });
});
