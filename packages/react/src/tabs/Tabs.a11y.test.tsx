import { describe, expect, it } from "vitest";
import { Tabs } from "./Tabs";

describe("Tabs a11y", () => {
  it("keeps displayName available to tooling", () => {
    expect(Tabs.displayName).toBe("Tabs");
  });
});
