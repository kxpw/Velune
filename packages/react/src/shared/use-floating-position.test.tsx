// @vitest-environment jsdom

import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useFloatingPosition } from "./use-floating-position";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("useFloatingPosition", () => {
  it("coalesces scroll and resize measurements into one animation frame", () => {
    const frames = new Map<number, FrameRequestCallback>();
    let frameId = 0;
    const requestFrame = vi.fn((callback: FrameRequestCallback) => {
      frameId += 1;
      frames.set(frameId, callback);
      return frameId;
    });
    vi.stubGlobal("requestAnimationFrame", requestFrame);
    vi.stubGlobal(
      "cancelAnimationFrame",
      vi.fn((id: number) => frames.delete(id)),
    );
    vi.stubGlobal("ResizeObserver", undefined);

    const triggerMeasurements = vi.fn(() =>
      createRect({ top: 80, right: 140, bottom: 112, left: 100 }),
    );
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
      function getBoundingClientRect(this: HTMLElement) {
        return this.dataset.floating === "true"
          ? createRect({ top: 0, right: 120, bottom: 80, left: 0 })
          : triggerMeasurements();
      },
    );
    vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockImplementation(
      function offsetWidth(this: HTMLElement) {
        return this.dataset.floating === "true" ? 120 : 40;
      },
    );
    vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockImplementation(
      function offsetHeight(this: HTMLElement) {
        return this.dataset.floating === "true" ? 80 : 32;
      },
    );

    render(<PositionedPair />);
    expect(triggerMeasurements).toHaveBeenCalledTimes(1);

    act(() => {
      window.dispatchEvent(new Event("scroll"));
      window.dispatchEvent(new Event("scroll"));
      window.dispatchEvent(new Event("resize"));
    });

    expect(requestFrame).toHaveBeenCalledTimes(1);
    expect(triggerMeasurements).toHaveBeenCalledTimes(1);

    act(() => {
      const callback = frames.get(1);
      frames.delete(1);
      callback?.(0);
    });

    expect(triggerMeasurements).toHaveBeenCalledTimes(2);
  });

  it("applies transform and ready state imperatively without React state", () => {
    vi.stubGlobal("ResizeObserver", undefined);
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
      function getBoundingClientRect(this: HTMLElement) {
        return this.dataset.floating === "true"
          ? createRect({ top: 0, right: 120, bottom: 80, left: 0 })
          : createRect({ top: 80, right: 140, bottom: 112, left: 100 });
      },
    );
    vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockImplementation(
      function offsetWidth(this: HTMLElement) {
        return this.dataset.floating === "true" ? 120 : 40;
      },
    );
    vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockImplementation(
      function offsetHeight(this: HTMLElement) {
        return this.dataset.floating === "true" ? 80 : 32;
      },
    );

    const onPositioned = vi.fn();
    render(<PositionedPair onPositioned={onPositioned} />);

    const floating = screen.getByTestId("floating");
    expect(floating.dataset.ready).toBe("true");
    expect(floating.dataset.placement).toBe("bottom");
    expect(floating.style.transform).toBe("translate3d(60px, 120px, 0)");
    expect(onPositioned).toHaveBeenCalledTimes(1);
  });

  it("offsets fixed coordinates into a transformed containing block", () => {
    vi.stubGlobal("ResizeObserver", undefined);
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
      function getBoundingClientRect(this: HTMLElement) {
        if (this.dataset.containing === "true") {
          return createRect({ top: 200, right: 800, bottom: 600, left: 50 });
        }
        return this.dataset.floating === "true"
          ? createRect({ top: 0, right: 120, bottom: 80, left: 0 })
          : createRect({ top: 80, right: 140, bottom: 112, left: 100 });
      },
    );
    vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockImplementation(
      function offsetWidth(this: HTMLElement) {
        return this.dataset.floating === "true" ? 120 : 40;
      },
    );
    vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockImplementation(
      function offsetHeight(this: HTMLElement) {
        return this.dataset.floating === "true" ? 80 : 32;
      },
    );
    vi.spyOn(window, "getComputedStyle").mockImplementation((element) => {
      const el = element as HTMLElement;
      if (el.dataset?.containing === "true") {
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

    render(
      <div data-containing="true">
        <PositionedPair />
      </div>,
    );

    // Viewport placement is (60, 120); containing block origin is (50, 200).
    expect(screen.getByTestId("floating").style.transform).toBe(
      "translate3d(10px, -80px, 0)",
    );
  });
});

function PositionedPair({ onPositioned }: { onPositioned?: () => void }) {
  const { setTriggerNode, setFloatingNode } = useFloatingPosition({
    open: true,
    placement: "bottom",
    ...(onPositioned ? { onPositioned } : {}),
  });

  return (
    <>
      <button ref={setTriggerNode}>Anchor</button>
      <div ref={setFloatingNode} data-floating="true" data-testid="floating">
        Content
      </div>
    </>
  );
}

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
