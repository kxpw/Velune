import type {
  FocusEvent,
  ForwardedRef,
  MouseEvent,
  PointerEvent as ReactPointerEvent,
  ReactElement,
  ReactNode,
} from "react";
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
import {
  isTopEscapeLayer,
  popEscapeLayer,
  pushEscapeLayer,
} from "../shared/overlay-stack";
import { Portal } from "../shared/portal";
import { Slot } from "../shared/slot";
import type { Placement } from "../shared/position";
import { useLatestRef } from "../shared/use-latest-ref";
import {
  floatingLayerStyle,
  useFloatingPosition,
} from "../shared/use-floating-position";
import type {
  TooltipContentProps,
  TooltipDelay,
  TooltipProps,
  TooltipTrigger,
  TooltipTriggerProps,
} from "./Tooltip.types";
import { tooltipClasses, tooltipTriggerClasses } from "./Tooltip.classes";

const TOOLTIP_OPEN_EVENT = "velune.tooltip.open";
const openTooltipIds = new Set<symbol>();
let tooltipWarmUntil = 0;

function getTooltipParts(children: ReactNode): {
  trigger: ReactElement | null;
  content: TooltipContentProps | undefined;
} {
  let trigger: ReactElement | null = null;
  let content: TooltipContentProps | undefined;

  dispatchCompoundSlots(children, {
    "Tooltip.Trigger": (child) => {
      trigger = (child.props as TooltipTriggerProps).children;
    },
    "Tooltip.Content": (child) => {
      content = child.props as TooltipContentProps;
    },
  });

  return { trigger, content };
}

function normalizeTriggers(
  trigger: TooltipTrigger | TooltipTrigger[] | undefined,
): Set<TooltipTrigger> {
  if (!trigger) {
    return new Set(["hover", "focus"]);
  }
  const list = Array.isArray(trigger) ? trigger : [trigger];
  return new Set(list);
}

function resolveDelay(delay: TooltipDelay | undefined): {
  open: number;
  close: number;
} {
  if (typeof delay === "number") {
    return { open: delay, close: delay };
  }
  return {
    open: delay?.open ?? 400,
    close: delay?.close ?? 100,
  };
}

function TooltipImpl(
  {
    children,
    placement = "top",
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    trigger,
    delay,
    skipDelayDuration = 300,
    onEscapeKeyDown,
    disabled = false,
    portal = true,
    offset,
    className,
    id,
    style,
    onMouseEnter,
    onMouseLeave,
    ...props
  }: TooltipProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const { trigger: triggerElement, content } = getTooltipParts(children);
  const {
    className: contentClassName,
    style: contentStyle,
    children: contentChildren,
    ...contentProps
  } = content ?? {};
  const reactId = useId();
  const tooltipId = id ?? `${reactId}-tooltip`;
  const triggers = normalizeTriggers(trigger);
  const delays = resolveDelay(delay);
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

  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPointerDownRef = useRef(false);
  const instanceIdRef = useRef(Symbol("velune-tooltip"));

  const { triggerRef, setTriggerNode, setFloatingNode } = useFloatingPosition({
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
      if (next && !stateOpen) {
        document.dispatchEvent(new CustomEvent(TOOLTIP_OPEN_EVENT));
      }
      setStateOpen(next);
    },
    [disabled, setStateOpen, stateOpen],
  );
  const setOpenRef = useLatestRef(setOpen);
  const onEscapeKeyDownRef = useLatestRef(onEscapeKeyDown);

  useEffect(() => {
    if (!open) {
      return;
    }
    const instanceId = instanceIdRef.current;
    openTooltipIds.add(instanceId);
    tooltipWarmUntil = Number.POSITIVE_INFINITY;
    return () => {
      openTooltipIds.delete(instanceId);
      tooltipWarmUntil =
        openTooltipIds.size > 0
          ? Number.POSITIVE_INFINITY
          : Date.now() + Math.max(0, skipDelayDuration);
    };
  }, [open, skipDelayDuration]);

  const clearTimers = () => {
    if (openTimer.current) {
      clearTimeout(openTimer.current);
      openTimer.current = null;
    }
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const scheduleOpen = () => {
    if (disabled || triggers.has("manual")) {
      return;
    }
    clearTimers();
    const openDelay = Date.now() < tooltipWarmUntil ? 0 : delays.open;
    openTimer.current = setTimeout(() => setOpenRef.current(true), openDelay);
  };

  const scheduleClose = () => {
    if (triggers.has("manual")) {
      return;
    }
    clearTimers();
    closeTimer.current = setTimeout(
      () => setOpenRef.current(false),
      delays.close,
    );
  };

  useEffect(() => () => clearTimers(), []);

  const handlePointerUp = useCallback(() => {
    isPointerDownRef.current = false;
  }, []);

  useEffect(
    () => () => document.removeEventListener("pointerup", handlePointerUp),
    [handlePointerUp],
  );

  useEffect(() => {
    if (!open) {
      return;
    }
    const close = () => {
      clearTimers();
      setOpenRef.current(false);
    };
    const onScroll = (event: Event) => {
      if (
        event.target instanceof Node &&
        triggerRef.current &&
        event.target.contains(triggerRef.current)
      ) {
        close();
      }
    };
    document.addEventListener(TOOLTIP_OPEN_EVENT, close);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener(TOOLTIP_OPEN_EVENT, close);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open, setOpenRef, triggerRef]);

  useEffect(() => {
    if (!open) {
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
        clearTimers();
        setOpenRef.current(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      popEscapeLayer(escapeLayer);
    };
  }, [onEscapeKeyDownRef, open, setOpenRef]);

  const child = triggerElement;
  if (!isValidElement(child)) {
    return null;
  }

  // Wrap trigger so we always own a real DOM node for measurement,
  // even when the child does not forward refs.
  const triggerNode = (
    <span
      ref={setTriggerNode}
      className={tooltipTriggerClasses}
      data-open={open ? "true" : undefined}
    >
      <Slot
        {...(open ? { "aria-describedby": tooltipId } : {})}
        onMouseEnter={(event: MouseEvent<HTMLElement>) => {
          if (!event.defaultPrevented && triggers.has("hover")) {
            scheduleOpen();
          }
        }}
        onMouseLeave={(event: MouseEvent<HTMLElement>) => {
          if (!event.defaultPrevented && triggers.has("hover")) {
            scheduleClose();
          }
        }}
        onFocus={(event: FocusEvent<HTMLElement>) => {
          if (
            !event.defaultPrevented &&
            !isPointerDownRef.current &&
            triggers.has("focus")
          ) {
            clearTimers();
            setOpenRef.current(true);
          }
        }}
        onBlur={(event: FocusEvent<HTMLElement>) => {
          if (!event.defaultPrevented && triggers.has("focus")) {
            clearTimers();
            setOpenRef.current(false);
          }
        }}
        onPointerDown={(event: ReactPointerEvent<HTMLElement>) => {
          if (event.defaultPrevented) {
            return;
          }
          isPointerDownRef.current = true;
          document.addEventListener("pointerup", handlePointerUp, {
            once: true,
          });
          if (!triggers.has("click")) {
            clearTimers();
            setOpenRef.current(false);
          }
        }}
        onClick={(event: MouseEvent<HTMLElement>) => {
          if (event.defaultPrevented) {
            return;
          }
          clearTimers();
          if (triggers.has("click")) {
            setOpenRef.current(!open);
          } else {
            setOpenRef.current(false);
          }
        }}
      >
        {child as ReactElement}
      </Slot>
    </span>
  );
  const floating = open ? (
    <div
      {...props}
      {...contentProps}
      ref={composedFloatingRef}
      id={tooltipId}
      role="tooltip"
      data-gs-overlay-branch=""
      className={clsx(tooltipClasses(), className, contentClassName)}
      style={{
        ...style,
        ...contentStyle,
        ...floatingLayerStyle,
      }}
      onMouseEnter={(event) => {
        onMouseEnter?.(event);
        if (!event.defaultPrevented && triggers.has("hover")) {
          clearTimers();
        }
      }}
      onMouseLeave={(event) => {
        onMouseLeave?.(event);
        if (!event.defaultPrevented && triggers.has("hover")) {
          scheduleClose();
        }
      }}
    >
      {contentChildren}
    </div>
  ) : null;

  return (
    <>
      {triggerNode}
      {floating ? <Portal disabled={!portal}>{floating}</Portal> : null}
    </>
  );
}

const TooltipRoot = forwardRef(TooltipImpl);
TooltipRoot.displayName = "Tooltip";

const TooltipTriggerPart =
  createCompoundSlot<TooltipTriggerProps>("Tooltip.Trigger");

const TooltipContent =
  createCompoundSlot<TooltipContentProps>("Tooltip.Content");

export const Tooltip = Object.assign(TooltipRoot, {
  Trigger: TooltipTriggerPart,
  Content: TooltipContent,
});
