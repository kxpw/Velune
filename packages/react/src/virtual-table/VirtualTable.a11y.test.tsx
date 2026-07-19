import { describe, expect, it } from "vitest";
import { VirtualTable } from "./VirtualTable";

describe("VirtualTable a11y", () => {
  it("keeps displayName available to tooling", () => {
    expect((VirtualTable as { displayName?: string }).displayName).toBe(
      "VirtualTable",
    );
  });
});
