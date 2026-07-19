import { describe, expect, it } from "vitest";
import { Spinner } from "./Spinner";

describe("Spinner a11y", () => {
  it("keeps displayName available to tooling", () => {
    expect(Spinner.displayName).toBe("Spinner");
  });
});
