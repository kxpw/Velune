import { describe, expect, it } from "vitest";
import { VirtualTable } from "./VirtualTable";

describe("VirtualTable", () => {
  it("sets a readable displayName", () => {
    expect((VirtualTable as { displayName?: string }).displayName).toBe(
      "VirtualTable",
    );
  });
});
