import { useCallback, useLayoutEffect, useRef } from "react";
import {
  computePosition,
  getFixedContainingBlock,
  toFixedContainingBlockCoords,
  type Placement,
  type PositionCoords,
} from "./position";

/** Base fixed-layer styles; transform/visibility are applied imperatively. */
export const floatingLayerStyle = {
  position: "fixed",
  top: 0,
  left: 0,
} as const;

function applyFloatingPosition(
  floatingEl: HTMLElement,
  next: PositionCoords,
  ready: boolean,
) {
  floatingEl.style.transform = `translate3d(${next.x}px, ${next.y}px, 0)`;
  floatingEl.dataset.placement = next.placement;
  const [side, align = "center"] = next.placement.split("-");
  floatingEl.dataset.side = side!;
  floatingEl.dataset.align = align;
  if (ready) {
    floatingEl.dataset.ready = "true";
  } else {
    delete floatingEl.dataset.ready;
  }
}

/**
 * Positions a floating element relative to a trigger.
 *
 * Transform, placement attributes, and `data-ready` are written imperatively so
 * open/scroll/resize updates do not re-render the floating content tree.
 * Use `onPositioned` for focus / post-measure work that previously depended on
 * React `ready` state.
 *
 * When a transformed ancestor creates a fixed containing block (common with
 * `portal={false}`), viewport coordinates from `computePosition` are converted
 * into that containing block's local space before applying `translate3d`.
 */
export function useFloatingPosition({
  open,
  placement,
  offset = 8,
  flip = true,
  onPositioned,
}: {
  open: boolean;
  placement: Placement;
  offset?: number;
  flip?: boolean;
  onPositioned?: () => void;
}) {
  const triggerRef = useRef<HTMLElement | null>(null);
  const floatingRef = useRef<HTMLElement | null>(null);
  const coordsRef = useRef<PositionCoords>({
    x: 0,
    y: 0,
    placement,
  });
  const readyRef = useRef(false);
  const placementRef = useRef(placement);
  placementRef.current = placement;
  const onPositionedRef = useRef(onPositioned);
  onPositionedRef.current = onPositioned;

  // Stable ref callbacks — never setState here (avoids update-depth loops).
  const setTriggerNode = useCallback((node: HTMLElement | null) => {
    triggerRef.current = node;
  }, []);

  const setFloatingNode = useCallback((node: HTMLElement | null) => {
    floatingRef.current = node;
    if (!node) {
      return;
    }
    // Seed placement attrs immediately so CSS / a11y hooks work before measure
    // (jsdom and first paint may not have floating size yet).
    const nextPlacement = placementRef.current;
    const [side, align = "center"] = nextPlacement.split("-");
    node.dataset.placement = nextPlacement;
    node.dataset.side = side!;
    node.dataset.align = align;
    if (readyRef.current) {
      applyFloatingPosition(node, coordsRef.current, true);
    }
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

    const containingBlock = getFixedContainingBlock(floatingEl);
    const local = containingBlock
      ? toFixedContainingBlockCoords(next, containingBlock)
      : next;
    const applied: PositionCoords = {
      x: local.x,
      y: local.y,
      placement: next.placement,
    };

    coordsRef.current = applied;
    applyFloatingPosition(floatingEl, applied, true);
    const wasReady = readyRef.current;
    readyRef.current = true;
    if (!wasReady) {
      onPositionedRef.current?.();
    }
    return true;
  }, [flip, offset, placement]);

  useLayoutEffect(() => {
    if (!open) {
      readyRef.current = false;
      const floatingEl = floatingRef.current;
      if (floatingEl) {
        delete floatingEl.dataset.ready;
      }
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
    updatePosition,
  };
}
