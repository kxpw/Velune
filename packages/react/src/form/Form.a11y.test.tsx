import { describe, expect, it } from "vitest";
import { Form } from "./Form";

describe("Form a11y", () => {
  it("keeps displayName available to tooling", () => {
    expect(Form.displayName).toBe("Form");
  });
});
