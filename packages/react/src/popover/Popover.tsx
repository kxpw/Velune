import type {
  FocusEvent,
  ForwardedRef,
  KeyboardEvent,
  MouseEvent,
  ReactElement,
  ReactNode,
  Ref,
} from "react";
import {
  cloneElement,
  forwardRef,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useRef,
} from "react";
import { useControllableState } from "@velune/hooks";
import { clsx } from "clsx";
import { useComposedRefs } from "../shared/compose-refs";
import {
  createCompoundSlot,
  dispatchCompoundSlots,
} from "../shared/compound-slot";
import { focusFirst } from "../shared/focus-trap";
import {
  isTopEscapeLayer,
  popEscapeLayer,
  pushEscapeLayer,
} from "../shared/overlay-stack";
import { Portal } from "../shared/portal";
import type { Placement } from "../shared/position";
import { useLatestRef } from "../shared/use-latest-ref";
import { useFloatingPosition } from "../shared/use-floating-position";
import type {
  PopoverContentProps,
  PopoverProps,
  PopoverTriggerProps,
} from "./Popover.types";

function getPopoverParts(children: ReactNode): {
  trigger: PopoverTriggerProps | undefined;
  content: PopoverContentProps | undefined;
} {
  let trigger: PopoverTriggerProps | undefined;
  let content: PopoverContentProps | undefined;

  dispatchCompoundSlots(children, {
    "Popover.Trigger": (child) => {
      trigger = child.props as PopoverTriggerProps;
    },
    "Popover.Content": (child) => {
      content = child.props as PopoverContentProps;
    },
  });

  return { trigger, content };
}

function PopoverImpl(
  {
    children,
    placement = "bottom",
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    portal = true,
    closeOnOutsideClick = true,
    closeOnEscape = true,
    onOpenAutoFocus,
    onCloseAutoFocus,
    onEscapeKeyDown,
    offset,
    disabled = false,
    className,
    id,
    style,
    ...props
  }: PopoverProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const { trigger, content } = getPopoverParts(children);
  const {
    className: contentClassName,
    style: contentStyle,
    role: contentRole,
    children: contentChildren,
    ...contentProps
  } = content ?? {};
  const reactId = useId();
  const panelId = id ?? `${reactId}-popover`;
  const [stateOpen, setStateOpen] = useControllableState({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const open = disabled ? false : stateOpen;

  useEffect(() => {
    if (disabled && stateOpen) {
      setStateOpen(false);
    }
  }, [disabled, setStateOpen, stateOpen]);

  const {
    triggerRef,
    floatingRef,
    setTriggerNode,
    setFloatingNode,
    coords,
    ready,
  } = useFloatingPosition({
    open,
    placement: placement as Placement,
    offset: offset ?? 8,
    flip: true,
  });
  const composedFloatingRef = useComposedRefs(setFloatingNode, ref);

  const setOpen = useCallback(
    (next: boolean) => {
      if (disabled) {
        return;
      }
      setStateOpen(next);
    },
    [disabled, setStateOpen],
  );
  const setOpenRef = useLatestRef(setOpen);
  const onOpenAutoFocusRef = useLatestRef(onOpenAutoFocus);
  const onCloseAutoFocusRef = useLatestRef(onCloseAutoFocus);
  const onEscapeKeyDownRef = useLatestRef(onEscapeKeyDown);
  const restoreFocusOnCloseRef = useRef(true);
  const wasOpenRef = useRef(open);

  // Move focus into the dialog panel when it opens by interaction; the
  // panel is portaled to the end of <body>, so without this keyboard users
  // would have to tab through the whole page to reach it. Skip the very
  // first render so initially-open popovers do not steal page focus.
  const skipInitialAutoFocusRef = useRef(open);
  useEffect(() => {
    if (!open) {
      skipInitialAutoFocusRef.current = false;
      return;
    }
    if (!ready) {
      return;
    }
    if (skipInitialAutoFocusRef.current) {
      skipInitialAutoFocusRef.current = false;
      return;
    }
    const frame = requestAnimationFrame(() => {
      const event = new Event("velune.popover.openAutoFocus", {
        cancelable: true,
      });
      onOpenAutoFocusRef.current?.(event);
      if (!event.defaultPrevented && floatingRef.current) {
        focusFirst(floatingRef.current);
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [open, floatingRef, onOpenAutoFocusRef, ready]);

  useEffect(() => {
    const wasOpen = wasOpenRef.current;
    wasOpenRef.current = open;
    if (!wasOpen || open) {
      return;
    }
    const event = new Event("velune.popover.closeAutoFocus", {
      cancelable: true,
    });
    onCloseAutoFocusRef.current?.(event);
    const shouldRestore = restoreFocusOnCloseRef.current;
    restoreFocusOnCloseRef.current = true;
    if (event.defaultPrevented || !shouldRestore) {
      return;
    }
    const frame = requestAnimationFrame(() => {
      const focusable = triggerRef.current?.querySelector<HTMLElement>(
        "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])",
      );
      focusable?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [open, onCloseAutoFocusRef, triggerRef]);

  useEffect(() => {
    if (!open || !closeOnOutsideClick) {
      return;
    }
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) {
        return;
      }
      if (
        triggerRef.current?.contains(target) ||
        floatingRef.current?.contains(target)
      ) {
        return;
      }
      restoreFocusOnCloseRef.current = false;
      const panelAtRequest = floatingRef.current;
      setOpenRef.current(false);
      queueMicrotask(() => {
        // A controlled owner may reject the close request. Do not leave the
        // outside-pointer reason attached to a later programmatic close.
        if (panelAtRequest?.isConnected) {
          restoreFocusOnCloseRef.current = true;
        }
      });
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    return () =>
      document.removeEventListener("pointerdown", onPointerDown, true);
  }, [open, closeOnOutsideClick, setOpenRef, floatingRef, triggerRef]);

  useEffect(() => {
    if (!open || !closeOnEscape) {
      return;
    }
    const escapeLayer = pushEscapeLayer();
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape" && isTopEscapeLayer(escapeLayer)) {
        if (event.defaultPrevented) {
          return;
        }
        onEscapeKeyDownRef.current?.(event);
        if (event.defaultPrevented) {
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        restoreFocusOnCloseRef.current = true;
        setOpenRef.current(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      popEscapeLayer(escapeLayer);
    };
  }, [open, closeOnEscape, onEscapeKeyDownRef, setOpenRef]);

  const {
    children: child,
    className: triggerClassName,
    style: triggerStyle,
  } = trigger ?? {};
  if (!isValidElement(child)) {
    return null;
  }

  const childProps = child.props as {
    onClick?: (event: MouseEvent) => void;
    onKeyDown?: (event: KeyboardEvent) => void;
    onBlur?: (event: FocusEvent) => void;
    "aria-expanded"?: boolean | "true" | "false";
    "aria-haspopup"?:
      | boolean
      | "dialog"
      | "menu"
      | "listbox"
      | "tree"
      | "grid"
      | "true"
      | "false";
    "aria-controls"?: string;
    ref?: Ref<HTMLElement>;
  };

  const triggerNode = (
    <span
      ref={setTriggerNode}
      className={clsx(
        "gs-popover-trigger inline-flex max-w-full align-middle",
        triggerClassName,
      )}
      style={triggerStyle}
      data-open={open ? "true" : undefined}
      data-state={open ? "open" : "closed"}
    >
      {cloneElement(child as ReactElement, {
        ref: childProps.ref,
        "aria-expanded": open,
        "aria-haspopup": childProps["aria-haspopup"] ?? "dialog",
        "aria-controls": open ? panelId : undefined,
        onClick: (event: MouseEvent) => {
          childProps.onClick?.(event);
          if (event.defaultPrevented || disabled) {
            return;
          }
          restoreFocusOnCloseRef.current = true;
          setOpen(!open);
        },
      })}
    </span>
  );
  const panel = open ? (
    <div
      {...props}
      {...contentProps}
      ref={composedFloatingRef}
      id={panelId}
      role={contentRole ?? "dialog"}
      data-gs-overlay-branch=""
      data-state="open"
      data-side={coords.placement.split("-")[0]}
      data-align={coords.placement.split("-")[1] ?? "center"}
      className={clsx(
        "gs-popover z-gs-popover box-border w-max max-w-gs-popover-max-width wrap-anywhere rounded-gs-popover-radius border border-gs-popover-border bg-gs-popover-bg bg-gs-surface-highlight p-gs-popover-padding font-inherit text-sm leading-gs-body text-gs-popover-color opacity-0 shadow-gs-popover-shadow outline-none transition-opacity duration-200 ease-gs-decelerate data-[ready=true]:opacity-100 focus-visible:outline-none focus-visible:shadow-gs-popover-focus motion-reduce:transition-none",
        className,
        contentClassName,
      )}
      data-placement={coords.placement}
      data-ready={ready ? "true" : undefined}
      tabIndex={-1}
      style={{
        ...style,
        ...contentStyle,
        position: "fixed",
        top: 0,
        left: 0,
        transform: `translate3d(${coords.x}px, ${coords.y}px, 0)`,
        visibility: ready ? "visible" : "hidden",
      }}
    >
      {contentChildren}
    </div>
  ) : null;

  return (
    <>
      {triggerNode}
      {panel ? <Portal disabled={!portal}>{panel}</Portal> : null}
    </>
  );
}

const PopoverRoot = forwardRef(PopoverImpl);
PopoverRoot.displayName = "Popover";

const PopoverTrigger =
  createCompoundSlot<PopoverTriggerProps>("Popover.Trigger");

const PopoverContent =
  createCompoundSlot<PopoverContentProps>("Popover.Content");

export const Popover = Object.assign(PopoverRoot, {
  Trigger: PopoverTrigger,
  Content: PopoverContent,
});
