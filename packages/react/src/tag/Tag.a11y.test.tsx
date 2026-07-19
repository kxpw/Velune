import { describe, expect, it } from "vitest";
import { Tag } from "./Tag";

describe("Tag a11y", () => {
  it("keeps displayName available to tooling", () => {
    expect(Tag.displayName).toBe("Tag");
  });
});
