import { describe, expect, it } from "vitest";
import { Table } from "./Table";

describe("Table a11y", () => {
  it("keeps displayName available to tooling", () => {
    expect((Table as { displayName?: string }).displayName).toBe("Table");
  });
});
