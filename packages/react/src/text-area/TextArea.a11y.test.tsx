import { describe, expect, it } from "vitest";
import { TextArea } from "./TextArea";

describe("TextArea a11y", () => {
  it("keeps displayName available to tooling", () => {
    expect(TextArea.displayName).toBe("TextArea");
  });
});
