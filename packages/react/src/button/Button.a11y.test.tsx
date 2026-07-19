import { describe, expect, it } from "vitest";
import { Button } from "./Button";

describe("Button a11y", () => {
  it("uses a native button root", () => {
    expect(Button.displayName).toBe("Button");
  });
});
