import { describe, expect, it } from "vitest";
import { Avatar } from "./Avatar";

describe("Avatar a11y", () => {
  it("keeps displayName available to tooling", () => {
    expect(Avatar.displayName).toBe("Avatar");
  });
});
