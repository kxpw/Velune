import type {
  FocusEvent,
  ForwardedRef,
  KeyboardEvent,
  MouseEvent,
  PointerEvent,
} from "react";
import { forwardRef, useEffect, useRef } from "react";
import { clsx } from "clsx";
import { useComposedRefs } from "../shared/compose-refs";
import { useLatestRef } from "../shared/use-latest-ref";
import type {
  ToastItemProps,
  ToastSwipeDirection,
  ToastTone,
} from "./Toast.types";

type PauseReason = "focus" | "pointer" | "swipe" | "visibility" | "window";

const toneClasses: Record<ToastTone, string> = {
  default: "[--gs-toast-accent:var(--color-text)]",
  success: "[--gs-toast-accent:var(--color-success)]",
  error: "[--gs-toast-accent:var(--color-error)]",
  warning: "[--gs-toast-accent:var(--color-warning)]",
  info: "[--gs-toast-accent:var(--color-info)]",
};

const toastActionClasses =
  "gs-toast-action mt-2 inline-flex min-h-8 min-w-0 cursor-pointer items-center justify-center justify-self-start rounded-gs-sm border border-gs-default bg-gs-surface px-3 py-1.5 font-inherit text-xs font-medium leading-none text-gs-text shadow-gs-surface-sheen hover:border-gs-strong hover:bg-gs-action-hover focus-visible:outline-none focus-visible:shadow-gs-button-focus-border sm:mt-0 sm:self-center";

const toastCloseClasses =
  "gs-toast-close absolute right-0 top-0 m-0 inline-flex size-gs-control-hit-target cursor-pointer items-center justify-center rounded-gs-sm border-0 bg-transparent p-0 text-gs-text-secondary opacity-60 transition-[background-color,color,opacity] duration-150 ease-gs-standard hover:bg-gs-action-hover hover:text-gs-text hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:shadow-gs-button-focus-border sm:pointer-events-none sm:opacity-0 sm:group-hover/toast:pointer-events-auto sm:group-hover/toast:opacity-100 sm:focus-visible:pointer-events-auto [&_svg]:block [&_svg]:size-3.5";

const toneIconPaths: Record<ToastTone, string> = {
  default: "M8 2.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11M8 7.25V11M8 5.25h.01",
  info: "M8 2.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11M8 7.25V11M8 5.25h.01",
  success: "M3.25 8.25 6.5 11.4 12.75 4.6",
  warning: "M8 3.5 13.5 12.5H2.5L8 3.5ZM8 7v2.5M8 11.25h.01",
  error: "m4.5 4.5 7 7m0-7-7 7",
};

function getSwipeDelta(
  x: number,
  y: number,
  direction: ToastSwipeDirection,
): { x: number; y: number } {
  if (direction === "right") {
    return { x: Math.max(0, x), y: 0 };
  }
  if (direction === "left") {
    return { x: Math.min(0, x), y: 0 };
  }
  if (direction === "down") {
    return { x: 0, y: Math.max(0, y) };
  }
  return { x: 0, y: Math.min(0, y) };
}

function getSwipeDistance(
  delta: { x: number; y: number },
  direction: ToastSwipeDirection,
): number {
  if (direction === "right") return delta.x;
  if (direction === "left") return -delta.x;
  if (direction === "down") return delta.y;
  return -delta.y;
}

function ToneIcon({ tone }: { tone: ToastTone }) {
  return (
    <span
      className="gs-toast-indicator mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--gs-toast-accent)_12%,transparent)] text-gs-toast-accent"
      aria-hidden="true"
    >
      <svg
        className="gs-toast-icon block size-gs-toast-icon-size"
        viewBox="0 0 16 16"
        fill="none"
        focusable="false"
      >
        <path
          d={toneIconPaths[tone]}
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function ToastItemImpl(
  {
    toast,
    onDismiss,
    onPause,
    onResume,
    className,
    onMouseEnter,
    onMouseLeave,
    onFocus,
    onBlur,
    onKeyDown,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    swipeDirection = "right",
    swipeThreshold = 50,
    dismissLabel = "Dismiss",
    enterFromBottom = false,
    ...props
  }: ToastItemProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const remainingRef = useRef(toast.duration);
  const startedAtRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pauseReasonsRef = useRef(new Set<PauseReason>());
  const rootRef = useRef<HTMLDivElement | null>(null);
  const composedRef = useComposedRefs(rootRef, ref);
  const onDismissRef = useLatestRef(onDismiss);
  const pointerStartRef = useRef<{
    x: number;
    y: number;
    id: number;
  } | null>(null);
  const swipeDeltaRef = useRef<{ x: number; y: number } | null>(null);

  const dismissToast = () => {
    if (rootRef.current?.contains(document.activeElement)) {
      rootRef.current
        .closest<HTMLElement>(".gs-toast-viewport")
        ?.focus({ preventScroll: true });
    }
    onDismissRef.current(toast.id);
  };

  const clearTimer = () => {
    if (timerRef.current != null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const startTimer = () => {
    clearTimer();
    if (!Number.isFinite(remainingRef.current) || remainingRef.current <= 0) {
      return;
    }
    startedAtRef.current = Date.now();
    timerRef.current = setTimeout(dismissToast, remainingRef.current);
  };

  useEffect(() => {
    remainingRef.current = toast.duration;
    if (pauseReasonsRef.current.size === 0) {
      startTimer();
    } else {
      clearTimer();
    }
    return clearTimer;
    // Restart only when the toast identity / duration changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast.id, toast.duration, toast.createdAt]);

  const pauseTimer = (reason: PauseReason) => {
    if (!Number.isFinite(remainingRef.current) || remainingRef.current <= 0) {
      return;
    }
    if (pauseReasonsRef.current.has(reason)) {
      return;
    }
    pauseReasonsRef.current.add(reason);
    if (pauseReasonsRef.current.size > 1) {
      return;
    }
    if (startedAtRef.current != null) {
      const elapsed = Date.now() - startedAtRef.current;
      remainingRef.current = Math.max(0, remainingRef.current - elapsed);
      startedAtRef.current = null;
    }
    clearTimer();
    onPause?.(toast.id);
  };

  const resumeTimer = (reason: PauseReason) => {
    if (!pauseReasonsRef.current.delete(reason)) {
      return;
    }
    if (pauseReasonsRef.current.size > 0) {
      return;
    }
    startTimer();
    onResume?.(toast.id);
  };

  const handleMouseEnter = (event: MouseEvent<HTMLDivElement>) => {
    onMouseEnter?.(event);
    if (!event.defaultPrevented) {
      pauseTimer("pointer");
    }
  };

  const handleMouseLeave = (event: MouseEvent<HTMLDivElement>) => {
    onMouseLeave?.(event);
    if (!event.defaultPrevented) {
      resumeTimer("pointer");
    }
  };

  // Keyboard parity for the hover pause: the toast contains focusable
  // action/dismiss buttons and must not disappear mid-interaction
  // (WCAG 2.2.1). Ignore focus moves within the toast itself.
  const handleFocus = (event: FocusEvent<HTMLDivElement>) => {
    onFocus?.(event);
    if (event.defaultPrevented) {
      return;
    }
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) {
      return;
    }
    pauseTimer("focus");
  };

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    onBlur?.(event);
    if (event.defaultPrevented) {
      return;
    }
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) {
      return;
    }
    resumeTimer("focus");
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || event.key !== "Escape") {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    dismissToast();
  };

  const resetSwipe = (node: HTMLDivElement, cancelled: boolean) => {
    pointerStartRef.current = null;
    swipeDeltaRef.current = null;
    node.style.removeProperty("--gs-toast-swipe-x");
    node.style.removeProperty("--gs-toast-swipe-y");
    if (cancelled) {
      node.dataset.swipe = "cancel";
    } else {
      delete node.dataset.swipe;
    }
    resumeTimer("swipe");
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    onPointerDown?.(event);
    if (event.defaultPrevented || event.button !== 0) {
      return;
    }
    pointerStartRef.current = {
      x: event.clientX,
      y: event.clientY,
      id: event.pointerId,
    };
    swipeDeltaRef.current = null;
    pauseTimer("swipe");
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    onPointerMove?.(event);
    const start = pointerStartRef.current;
    if (event.defaultPrevented || !start || event.pointerId !== start.id) {
      return;
    }
    const x = event.clientX - start.x;
    const y = event.clientY - start.y;
    const delta = getSwipeDelta(x, y, swipeDirection);
    const buffer = event.pointerType === "touch" ? 10 : 2;
    const distance = getSwipeDistance(delta, swipeDirection);

    if (!swipeDeltaRef.current && distance <= buffer) {
      if (Math.abs(x) > buffer || Math.abs(y) > buffer) {
        resetSwipe(event.currentTarget, false);
      }
      return;
    }

    if (!swipeDeltaRef.current) {
      event.currentTarget.setPointerCapture?.(event.pointerId);
      event.currentTarget.dataset.swipe = "start";
    } else {
      event.currentTarget.dataset.swipe = "move";
    }
    swipeDeltaRef.current = delta;
    event.currentTarget.style.setProperty("--gs-toast-swipe-x", `${delta.x}px`);
    event.currentTarget.style.setProperty("--gs-toast-swipe-y", `${delta.y}px`);
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    onPointerUp?.(event);
    const start = pointerStartRef.current;
    if (!start || event.pointerId !== start.id) {
      return;
    }
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture?.(event.pointerId);
    }
    const delta = swipeDeltaRef.current;
    if (
      !event.defaultPrevented &&
      delta &&
      getSwipeDistance(delta, swipeDirection) >= Math.max(0, swipeThreshold)
    ) {
      event.currentTarget.dataset.swipe = "end";
      event.currentTarget.addEventListener(
        "click",
        (clickEvent) => clickEvent.preventDefault(),
        { once: true },
      );
      pointerStartRef.current = null;
      swipeDeltaRef.current = null;
      dismissToast();
      return;
    }
    resetSwipe(event.currentTarget, Boolean(delta));
  };

  const handlePointerCancel = (event: PointerEvent<HTMLDivElement>) => {
    onPointerCancel?.(event);
    const start = pointerStartRef.current;
    if (!start || event.pointerId !== start.id) {
      return;
    }
    resetSwipe(event.currentTarget, Boolean(swipeDeltaRef.current));
  };

  useEffect(() => {
    const pauseWindow = () => pauseTimer("window");
    const resumeWindow = () => resumeTimer("window");
    const handleVisibilityChange = () => {
      if (document.hidden) {
        pauseTimer("visibility");
      } else {
        resumeTimer("visibility");
      }
    };

    window.addEventListener("blur", pauseWindow);
    window.addEventListener("focus", resumeWindow);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener("blur", pauseWindow);
      window.removeEventListener("focus", resumeWindow);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  });

  const hasDescription =
    toast.description != null && toast.description !== false;
  const hasTitle =
    toast.title != null && toast.title !== false && toast.title !== "";

  return (
    <div
      {...props}
      ref={composedRef}
      role={toast.assertive ? "alert" : "status"}
      aria-live={toast.assertive ? "assertive" : "polite"}
      aria-atomic="true"
      className={clsx(
        "gs-toast group/toast pointer-events-auto relative grid min-w-[min(var(--toast-min-width),100%)] max-w-full grid-cols-1 select-none items-start gap-x-gs-toast-gap box-border rounded-gs-toast-radius border border-gs-default bg-gs-toast-bg bg-gs-surface-highlight px-gs-toast-padding-x py-gs-toast-padding-y pe-12 font-inherit text-gs-toast-font-size leading-gs-normal text-gs-toast-color shadow-gs-toast-shadow touch-pan-y animate-gs-toast-enter sm:grid-cols-[minmax(0,1fr)_auto] data-[swipe-direction=down]:touch-pan-x data-[swipe-direction=up]:touch-pan-x data-[swipe=start]:[transform:translate3d(var(--gs-toast-swipe-x,0),var(--gs-toast-swipe-y,0),0)] data-[swipe=move]:[transform:translate3d(var(--gs-toast-swipe-x,0),var(--gs-toast-swipe-y,0),0)] data-[swipe=start]:animate-none data-[swipe=move]:animate-none data-[swipe=cancel]:translate-none data-[swipe=cancel]:animate-none data-[swipe=cancel]:transition-transform data-[swipe=cancel]:duration-200 data-[swipe=cancel]:ease-gs-decelerate motion-reduce:animate-none motion-reduce:transition-none [[data-reduced-motion=true]_&]:animate-none [[data-reduced-motion=true]_&]:transition-none",
        toneClasses[toast.tone],
        enterFromBottom && "animate-gs-toast-enter-up",
        className,
      )}
      data-tone={toast.tone}
      data-swipe-direction={swipeDirection}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
    >
      <div className="gs-toast-main flex min-w-0 items-start gap-gs-toast-gap">
        <ToneIcon tone={toast.tone} />
        <div className="gs-toast-body grid min-w-0 flex-auto gap-0.5">
          {hasTitle ? (
            <div className="gs-toast-title wrap-anywhere text-sm font-medium leading-5 text-gs-toast-accent">
              {toast.title}
            </div>
          ) : null}
          {hasDescription ? (
            <div className="gs-toast-description wrap-anywhere text-sm font-normal leading-5 text-gs-text-secondary">
              {toast.description}
            </div>
          ) : null}
        </div>
      </div>
      {toast.action ? (
        <button
          type="button"
          className={toastActionClasses}
          onClick={() => {
            toast.action?.onClick();
            dismissToast();
          }}
        >
          <span aria-hidden="true">{toast.action.label}</span>
          <span className="gs-toast-sr-only absolute size-px overflow-hidden whitespace-nowrap border-0 p-0 [clip:rect(0,0,0,0)] [clip-path:inset(50%)]">
            {toast.action.altText.trim() || toast.action.label}
          </span>
        </button>
      ) : null}
      <button
        type="button"
        className={toastCloseClasses}
        aria-label={dismissLabel.trim() || "Dismiss"}
        onClick={dismissToast}
      >
        <svg
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M4 4L12 12M12 4L4 12"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}

export const ToastItem = forwardRef(ToastItemImpl);
ToastItem.displayName = "ToastItem";
