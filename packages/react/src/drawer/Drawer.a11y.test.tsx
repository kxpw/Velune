import { describe, expect, it } from "vitest";
import { Drawer } from "./Drawer";

describe("Drawer a11y", () => {
  it("keeps displayName available to tooling", () => {
    expect(Drawer.displayName).toBe("Drawer");
  });
});
