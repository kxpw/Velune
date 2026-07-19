// @vitest-environment jsdom

import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useLatestRef } from "./use-latest-ref";

describe("useLatestRef", () => {
  it("keeps the ref stable while exposing the latest committed value", () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => useLatestRef(value),
      { initialProps: { value: "first" } },
    );
    const ref = result.current;

    rerender({ value: "second" });

    expect(result.current).toBe(ref);
    expect(result.current.current).toBe("second");
  });
});
