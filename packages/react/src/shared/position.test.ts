// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import {
  computePosition,
  getFixedContainingBlock,
  toFixedContainingBlockCoords,
} from "./position";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("computePosition", () => {
  it("keeps the preferred side when only the cross axis overflows", () => {
    vi.stubGlobal("window", { innerWidth: 320, innerHeight: 700 });

    const trigger = createRect({
      top: 100,
      right: 316,
      bottom: 136,
      left: 276,
    });
    const result = computePosition({
      trigger,
      floating: { width: 160, height: 120 },
      placement: "bottom-start",
      offset: 8,
    });

    expect(result).toEqual({ x: 152, y: 144, placement: "bottom-start" });
  });

  it("flips when the opposite side has less main-axis overflow", () => {
    vi.stubGlobal("window", { innerWidth: 1280, innerHeight: 700 });

    const trigger = createRect({
      top: 640,
      right: 700,
      bottom: 676,
      left: 580,
    });
    const result = computePosition({
      trigger,
      floating: { width: 300, height: 120 },
      placement: "bottom",
      offset: 8,
    });

    expect(result).toEqual({ x: 490, y: 512, placement: "top" });
  });

  it("chooses the less-overflowing side when neither side fits", () => {
    vi.stubGlobal("window", { innerWidth: 1280, innerHeight: 700 });

    const trigger = createRect({
      top: -100,
      right: 700,
      bottom: -64,
      left: 580,
    });
    const floating = { width: 300, height: 120 };
    const result = computePosition({
      trigger,
      floating,
      placement: "bottom",
      offset: 8,
    });

    expect(result).toEqual({ x: 490, y: -56, placement: "bottom" });
  });

  it("finds a transformed ancestor as the fixed containing block", () => {
    const root = document.createElement("div");
    const transformed = document.createElement("div");
    const child = document.createElement("div");
    root.append(transformed);
    transformed.append(child);
    document.body.append(root);

    vi.spyOn(window, "getComputedStyle").mockImplementation((element) => {
      if (element === transformed) {
        return {
          transform: "matrix(1, 0, 0, 1, 0, 0)",
          perspective: "none",
          filter: "none",
          contain: "none",
          willChange: "auto",
        } as CSSStyleDeclaration;
      }
      return {
        transform: "none",
        perspective: "none",
        filter: "none",
        contain: "none",
        willChange: "auto",
      } as CSSStyleDeclaration;
    });

    expect(getFixedContainingBlock(child)).toBe(transformed);
    root.remove();
  });

  it("converts viewport coords into the containing block padding edge", () => {
    const containingBlock = document.createElement("div");
    Object.defineProperty(containingBlock, "clientLeft", { value: 2 });
    Object.defineProperty(containingBlock, "clientTop", { value: 4 });
    vi.spyOn(containingBlock, "getBoundingClientRect").mockReturnValue(
      createRect({ top: 100, right: 500, bottom: 400, left: 40 }),
    );

    expect(
      toFixedContainingBlockCoords({ x: 120, y: 220 }, containingBlock),
    ).toEqual({ x: 78, y: 116 });
  });
});

function createRect({
  top,
  right,
  bottom,
  left,
}: {
  top: number;
  right: number;
  bottom: number;
  left: number;
}): DOMRect {
  return {
    top,
    right,
    bottom,
    left,
    width: right - left,
    height: bottom - top,
    x: left,
    y: top,
    toJSON: () => ({}),
  } as DOMRect;
}
