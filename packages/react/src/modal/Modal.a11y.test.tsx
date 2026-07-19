import { describe, expect, it } from "vitest";
import { Modal } from "./Modal";

describe("Modal a11y", () => {
  it("keeps displayName available to tooling", () => {
    expect(Modal.displayName).toBe("Modal");
  });
});
