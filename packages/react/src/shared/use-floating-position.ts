import { useCallback, useLayoutEffect, useRef, useState } from "react";
import {
  computePosition,
  type Placement,
  type PositionCoords,
} from "./position";

function coordsEqual(a: PositionCoords, b: PositionCoords): boolean {
  return a.x === b.x && a.y === b.y && a.placement === b.placement;
}

export function useFloatingPosition({
  open,
  placement,
  offset = 8,
  flip = true,
}: {
  open: boolean;
  placement: Placement;
  offset?: number;
  flip?: boolean;
}) {
  const triggerRef = useRef<HTMLElement | null>(null);
  const floatingRef = useRef<HTMLElement | null>(null);
  const [coords, setCoords] = useState<PositionCoords>({
    x: 0,
    y: 0,
    placement,
  });
  const [ready, setReady] = useState(false);

  // Stable ref callbacks — never setState here (avoids update-depth loops).
  const setTriggerNode = useCallback((node: HTMLElement | null) => {
    triggerRef.current = node;
  }, []);

  const setFloatingNode = useCallback((node: HTMLElement | null) => {
    floatingRef.current = node;
  }, []);

  const updatePosition = useCallback(() => {
    const triggerEl = triggerRef.current;
    const floatingEl = floatingRef.current;
    if (!triggerEl || !floatingEl) {
      return false;
    }

    const triggerRect = triggerEl.getBoundingClientRect();
    floatingEl.style.setProperty(
      "--gs-popover-trigger-width",
      `${triggerRect.width}px`,
    );
    floatingEl.style.setProperty(
      "--gs-popover-trigger-height",
      `${triggerRect.height}px`,
    );
    const width =
      floatingEl.offsetWidth || floatingEl.getBoundingClientRect().width;
    const height =
      floatingEl.offsetHeight || floatingEl.getBoundingClientRect().height;

    if (width === 0 && height === 0) {
      return false;
    }

    const next = computePosition({
      trigger: triggerRect,
      floating: { width, height },
      placement,
      offset,
      flip,
    });

    setCoords((prev) => (coordsEqual(prev, next) ? prev : next));
    setReady((prev) => (prev ? prev : true));
    return true;
  }, [flip, offset, placement]);

  useLayoutEffect(() => {
    if (!open) {
      setReady((prev) => (prev ? false : prev));
      return;
    }

    // Refs are attached before layout effects; measure immediately.
    let raf1 = 0;
    let raf2 = 0;
    let updateFrame = 0;

    const run = () => {
      if (!updatePosition()) {
        // Floating node may need one frame after portal mount.
        raf1 = requestAnimationFrame(() => {
          if (!updatePosition()) {
            raf2 = requestAnimationFrame(() => {
              updatePosition();
            });
          }
        });
      }
    };

    run();

    const scheduleUpdate = () => {
      if (updateFrame) {
        return;
      }
      updateFrame = requestAnimationFrame(() => {
        updateFrame = 0;
        updatePosition();
      });
    };
    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(scheduleUpdate);
    if (triggerRef.current) {
      resizeObserver?.observe(triggerRef.current);
    }
    if (floatingRef.current) {
      resizeObserver?.observe(floatingRef.current);
    }
    window.addEventListener("scroll", scheduleUpdate, true);
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      cancelAnimationFrame(updateFrame);
      resizeObserver?.disconnect();
      window.removeEventListener("scroll", scheduleUpdate, true);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [open, updatePosition]);

  return {
    triggerRef,
    floatingRef,
    setTriggerNode,
    setFloatingNode,
    coords,
    ready,
    updatePosition,
  };
}
