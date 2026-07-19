import { describe, expect, it } from "vitest";
import { ToastProvider } from "./ToastProvider";

describe("Toast a11y", () => {
  it("keeps provider displayName available to tooling", () => {
    expect(ToastProvider.displayName).toBe("ToastProvider");
  });
});
