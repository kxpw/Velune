import { useEffect, type RefObject } from "react";
import {
  isTopEscapeLayer,
  popEscapeLayer,
  pushEscapeLayer,
} from "./overlay-stack";
import { useLatestRef } from "./use-latest-ref";

export type DismissReason = "outside" | "escape";

export type UseDismissibleFloatingOptions = {
  open: boolean;
  onDismiss: (reason: DismissReason) => void;
  /** Elements that should not count as an outside click. */
  refs?: ReadonlyArray<RefObject<Element | null>>;
  /** Dynamic contain nodes when refs are unavailable (e.g. id lookups). */
  getContainNodes?: () => ReadonlyArray<Element | null | undefined>;
  closeOnOutsideClick?: boolean;
  /**
   * Document-level Escape dismissal. Select/Combobox handle Escape on their
   * own controls and should leave this false while still registering a layer.
   */
  closeOnEscape?: boolean;
  /** Register an escape layer while open so nested overlays dismiss correctly. */
  registerEscapeLayer?: boolean;
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
};

function containsTarget(
  nodes: ReadonlyArray<Element | null | undefined>,
  target: Node,
): boolean {
  return nodes.some((node) => node?.contains(target));
}

/**
 * Outside-click and optional Escape dismissal for floating overlays.
 * Always optionally registers an escape layer so a parent Modal/Drawer does
 * not also close on the same Escape press.
 */
export function useDismissibleFloating({
  open,
  onDismiss,
  refs,
  getContainNodes,
  closeOnOutsideClick = true,
  closeOnEscape = false,
  registerEscapeLayer = true,
  onEscapeKeyDown,
}: UseDismissibleFloatingOptions): void {
  const onDismissRef = useLatestRef(onDismiss);
  const getContainNodesRef = useLatestRef(getContainNodes);
  const onEscapeKeyDownRef = useLatestRef(onEscapeKeyDown);
  const refsRef = useLatestRef(refs);

  useEffect(() => {
    if (!open) {
      return;
    }

    const escapeLayer = registerEscapeLayer ? pushEscapeLayer() : null;

    const resolveContainNodes = () => {
      const fromRefs =
        refsRef.current?.map((ref) => ref.current) ??
        ([] as Array<Element | null>);
      const fromGetter = getContainNodesRef.current?.() ?? [];
      return [...fromRefs, ...fromGetter];
    };

    const onPointerDown = (event: PointerEvent) => {
      if (!closeOnOutsideClick) {
        return;
      }
      const target = event.target as Node | null;
      if (!target || containsTarget(resolveContainNodes(), target)) {
        return;
      }
      onDismissRef.current("outside");
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (
        !closeOnEscape ||
        event.key !== "Escape" ||
        (escapeLayer !== null && !isTopEscapeLayer(escapeLayer))
      ) {
        return;
      }
      if (event.defaultPrevented) {
        return;
      }
      onEscapeKeyDownRef.current?.(event);
      if (event.defaultPrevented) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      onDismissRef.current("escape");
    };

    document.addEventListener("pointerdown", onPointerDown, true);
    if (closeOnEscape) {
      document.addEventListener("keydown", onKeyDown);
    }

    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      if (closeOnEscape) {
        document.removeEventListener("keydown", onKeyDown);
      }
      if (escapeLayer !== null) {
        popEscapeLayer(escapeLayer);
      }
    };
  }, [
    closeOnEscape,
    closeOnOutsideClick,
    getContainNodesRef,
    onDismissRef,
    onEscapeKeyDownRef,
    open,
    refsRef,
    registerEscapeLayer,
  ]);
}
