import { describe, expect, it } from "vitest";
import { List } from "./List";

describe("List a11y", () => {
  it("keeps displayName available to tooling", () => {
    expect(List.displayName).toBe("List");
  });
});
