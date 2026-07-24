import type { MouseEvent, MutableRefObject, RefObject } from "react";
import {
  createContext,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { useControllableState } from "@velune/hooks";
import {
  createFocusTrap,
  focusFirst,
  isFocusWithinTrapBoundary,
} from "./focus-trap";
import { CloseIcon } from "./icons";
import { isolateOthers } from "./isolate-others";
import {
  acquireOverlayLayer,
  isTopEscapeLayer,
  popEscapeLayer,
  pushEscapeLayer,
  releaseOverlayLayer,
} from "./overlay-stack";
import { useScrollLock } from "./use-scroll-lock";

/**
 * Shared behavior for modal dialog surfaces (Modal, Drawer): controllable
 * open state, focus trap and restore, Escape/overlay dismissal layered
 * against other overlays, scroll lock, and title/description wiring.
 */

export type DialogContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  titleId: string;
  descriptionId: string;
  contentRef: MutableRefObject<HTMLDivElement | null>;
  hasTitle: boolean;
  hasDescription: boolean;
  setHasTitle: (value: boolean) => void;
  setHasDescription: (value: boolean) => void;
};

export function createDialogScope<TContext extends DialogContextValue>(
  rootName: string,
) {
  const Context = createContext<TContext | null>(null);

  function useDialogScope(component: string): TContext {
    const ctx = useContext(Context);
    if (!ctx) {
      throw new Error(`${component} must be used within <${rootName}>`);
    }
    return ctx;
  }

  return { Provider: Context.Provider, useDialogScope };
}

export type DialogControllerOptions = {
  open?: boolean | undefined;
  defaultOpen?: boolean;
  onOpenChange?: ((open: boolean) => void) | undefined;
  /** Close on Escape. Default: `true`. */
  closeOnEsc?: boolean;
  /** Lock body scroll while open. Default: `true`. */
  lockScroll?: boolean;
  finalFocusRef?: RefObject<HTMLElement | null> | undefined;
  initialFocusRef?: RefObject<HTMLElement | null> | undefined;
  onOpenAutoFocus?: ((event: Event) => void) | undefined;
  onCloseAutoFocus?: ((event: Event) => void) | undefined;
  onEscapeKeyDown?: ((event: KeyboardEvent) => void) | undefined;
  /** Prefix for the cancelable auto-focus events, e.g. `velune.modal`. */
  eventPrefix: string;
};

export type DialogController = {
  /** Memoized context value shared with the compound sub-components. */
  context: DialogContextValue;
  /** Offset added to the surface z-index so later overlays stack on top. */
  layer: number;
  /** Compose into the root element ref so the lifecycle can observe it. */
  rootRef: (node: HTMLDivElement | null) => void;
};

export function useDialogController({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  closeOnEsc = true,
  lockScroll = true,
  finalFocusRef,
  initialFocusRef,
  onOpenAutoFocus,
  onCloseAutoFocus,
  onEscapeKeyDown,
  eventPrefix,
}: DialogControllerOptions): DialogController {
  const [open, setOpen] = useControllableState({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const baseId = useId();
  const titleId = `${baseId}-title`;
  const descriptionId = `${baseId}-description`;
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [rootNode, setRootNode] = useState<HTMLDivElement | null>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const [layer, setLayer] = useState(0);
  const [hasTitle, setHasTitle] = useState(false);
  const [hasDescription, setHasDescription] = useState(false);

  const setOpenRef = useRef(setOpen);
  const closeOnEscRef = useRef(closeOnEsc);
  const finalFocusRefRef = useRef(finalFocusRef);
  const initialFocusRefRef = useRef(initialFocusRef);
  const onOpenAutoFocusRef = useRef(onOpenAutoFocus);
  const onCloseAutoFocusRef = useRef(onCloseAutoFocus);
  const onEscapeKeyDownRef = useRef(onEscapeKeyDown);
  setOpenRef.current = setOpen;
  closeOnEscRef.current = closeOnEsc;
  finalFocusRefRef.current = finalFocusRef;
  initialFocusRefRef.current = initialFocusRef;
  onOpenAutoFocusRef.current = onOpenAutoFocus;
  onCloseAutoFocusRef.current = onCloseAutoFocus;
  onEscapeKeyDownRef.current = onEscapeKeyDown;

  useScrollLock(lockScroll && open);

  useEffect(() => {
    if (!open || !rootNode) {
      return;
    }
    restoreFocusRef.current =
      (document.activeElement as HTMLElement | null) ?? null;
    const overlayLayer = acquireOverlayLayer();
    setLayer(overlayLayer);
    const escapeLayer = pushEscapeLayer();
    const restoreIsolation = isolateOthers(rootNode);

    let trapRelease: () => void = () => {};
    const finalFocusNode = finalFocusRefRef.current?.current ?? null;
    const restoreTarget = finalFocusNode ?? restoreFocusRef.current;
    const frame = requestAnimationFrame(() => {
      if (contentRef.current) {
        trapRelease = createFocusTrap(contentRef.current);
      }
      const event = new Event(`${eventPrefix}.openAutoFocus`, {
        cancelable: true,
      });
      onOpenAutoFocusRef.current?.(event);
      if (event.defaultPrevented) {
        return;
      }
      if (initialFocusRefRef.current?.current) {
        initialFocusRefRef.current.current.focus({ preventScroll: true });
      } else if (
        contentRef.current &&
        !isFocusWithinTrapBoundary(contentRef.current)
      ) {
        focusFirst(contentRef.current);
      }
    });

    const onKeyDown = (event: KeyboardEvent) => {
      // Only the top overlay may close; document-level listeners of the
      // overlays below still receive the same event.
      if (
        closeOnEscRef.current &&
        event.key === "Escape" &&
        isTopEscapeLayer(escapeLayer)
      ) {
        if (event.defaultPrevented) {
          return;
        }
        onEscapeKeyDownRef.current?.(event);
        if (event.defaultPrevented) {
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        setOpenRef.current(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      cancelAnimationFrame(frame);
      trapRelease();
      document.removeEventListener("keydown", onKeyDown);
      popEscapeLayer(escapeLayer);
      releaseOverlayLayer(overlayLayer);
      restoreIsolation();
      const event = new Event(`${eventPrefix}.closeAutoFocus`, {
        cancelable: true,
      });
      onCloseAutoFocusRef.current?.(event);
      if (!event.defaultPrevented && restoreTarget?.isConnected) {
        restoreTarget.focus({ preventScroll: true });
      }
    };
  }, [open, rootNode, eventPrefix]);

  const context = useMemo<DialogContextValue>(
    () => ({
      open,
      setOpen,
      titleId,
      descriptionId,
      contentRef,
      hasTitle,
      hasDescription,
      setHasTitle,
      setHasDescription,
    }),
    [descriptionId, hasDescription, hasTitle, open, setOpen, titleId],
  );

  return { context, layer, rootRef: setRootNode };
}

export function handleDialogOverlayClick(
  event: MouseEvent<HTMLDivElement>,
  options: {
    closeOnOverlayClick: boolean;
    onOverlayClick: ((event: MouseEvent<HTMLDivElement>) => void) | undefined;
    setOpen: (open: boolean) => void;
  },
): void {
  if (event.target !== event.currentTarget) {
    return;
  }
  options.onOverlayClick?.(event);
  if (event.defaultPrevented || !options.closeOnOverlayClick) {
    return;
  }
  options.setOpen(false);
}

/** Registers a title/description slot for the lifetime of the component. */
export function useDialogSlotFlag(setFlag: (value: boolean) => void): void {
  useEffect(() => {
    setFlag(true);
    return () => setFlag(false);
  }, [setFlag]);
}

export function DialogCloseIcon() {
  return <CloseIcon />;
}
