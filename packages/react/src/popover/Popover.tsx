import type { ForwardedRef, MouseEvent, ReactElement, ReactNode } from "react";
import {
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
import { Portal } from "../shared/portal";
import { Slot } from "../shared/slot";
import type { Placement } from "../shared/position";
import { useLatestRef } from "../shared/use-latest-ref";
import {
  floatingLayerStyle,
  useFloatingPosition,
} from "../shared/use-floating-position";
import { useDismissibleFloating } from "../shared/use-dismissible-floating";
import type { UseDismissibleFloatingOptions } from "../shared/use-dismissible-floating";
import type {
  PopoverContentProps,
  PopoverProps,
  PopoverTriggerProps,
} from "./Popover.types";
import { popoverClasses, popoverTriggerClasses } from "./Popover.classes";

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

  const skipInitialAutoFocusRef = useRef(open);
  const openAutoFocusFrameRef = useRef(0);
  const onOpenAutoFocusRef = useLatestRef(onOpenAutoFocus);
  const onCloseAutoFocusRef = useLatestRef(onCloseAutoFocus);
  const restoreFocusOnCloseRef = useRef(true);
  const wasOpenRef = useRef(open);
  const { triggerRef, floatingRef, setTriggerNode, setFloatingNode } =
    useFloatingPosition({
      open,
      placement: placement as Placement,
      offset: offset ?? 8,
      flip: true,
      onPositioned: () => {
        if (skipInitialAutoFocusRef.current) {
          skipInitialAutoFocusRef.current = false;
          return;
        }
        cancelAnimationFrame(openAutoFocusFrameRef.current);
        openAutoFocusFrameRef.current = requestAnimationFrame(() => {
          const event = new Event("velune.popover.openAutoFocus", {
            cancelable: true,
          });
          onOpenAutoFocusRef.current?.(event);
          if (!event.defaultPrevented && floatingRef.current) {
            focusFirst(floatingRef.current);
          }
        });
      },
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

  // Move focus into the dialog panel when it opens by interaction; the
  // panel is portaled to the end of <body>, so without this keyboard users
  // would have to tab through the whole page to reach it. Skip the very
  // first render so initially-open popovers do not steal page focus.
  useEffect(() => {
    if (!open) {
      skipInitialAutoFocusRef.current = false;
      cancelAnimationFrame(openAutoFocusFrameRef.current);
    }
  }, [open]);

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

  const dismissFloatingOptions: UseDismissibleFloatingOptions = {
    open,
    closeOnOutsideClick,
    closeOnEscape,
    refs: [triggerRef, floatingRef],
    onDismiss: (reason) => {
      if (reason === "outside") {
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
        return;
      }
      restoreFocusOnCloseRef.current = true;
      setOpenRef.current(false);
    },
  };
  if (onEscapeKeyDown) {
    dismissFloatingOptions.onEscapeKeyDown = onEscapeKeyDown;
  }
  useDismissibleFloating(dismissFloatingOptions);

  const {
    children: child,
    className: triggerClassName,
    style: triggerStyle,
  } = trigger ?? {};
  if (!isValidElement(child)) {
    return null;
  }

  const triggerNode = (
    <span
      ref={setTriggerNode}
      className={clsx(popoverTriggerClasses, triggerClassName)}
      style={triggerStyle}
      data-open={open ? "true" : undefined}
      data-state={open ? "open" : "closed"}
    >
      <Slot
        aria-expanded={open}
        aria-haspopup="dialog"
        {...(open ? { "aria-controls": panelId } : {})}
        onClick={(event: MouseEvent<HTMLElement>) => {
          if (event.defaultPrevented || disabled) {
            return;
          }
          restoreFocusOnCloseRef.current = true;
          setOpen(!open);
        }}
      >
        {child as ReactElement}
      </Slot>
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
      className={clsx(popoverClasses(), className, contentClassName)}
      tabIndex={-1}
      style={{
        ...style,
        ...contentStyle,
        ...floatingLayerStyle,
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
