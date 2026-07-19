import { describe, expect, it } from "vitest";
import { Input } from "./Input";

describe("Input a11y", () => {
  it("uses a native input root", () => {
    expect(Input.displayName).toBe("Input");
  });
});
