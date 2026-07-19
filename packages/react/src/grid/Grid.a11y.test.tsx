import { describe, expect, it } from "vitest";
import { Grid } from "./Grid";

describe("Grid a11y", () => {
  it("keeps displayName available to tooling", () => {
    expect(Grid.displayName).toBe("Grid");
  });
});
