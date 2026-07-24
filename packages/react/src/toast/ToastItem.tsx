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
import { FeedbackCloseIcon, feedbackToneIcons } from "../shared/feedback-icons";
import type {
  ToastItemProps,
  ToastSwipeDirection,
  ToastTone,
} from "./Toast.types";
import {
  toastCloseClasses,
  toastDescriptionClasses,
  toastIndicatorClasses,
  toastRootClasses,
  toastTitleClasses,
  toastToneClasses,
} from "./Toast.classes";
import { ToastAction } from "./ToastAction";

type PauseReason = "focus" | "pointer" | "swipe" | "visibility" | "window";

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
    <span className={toastIndicatorClasses()} aria-hidden="true">
      {feedbackToneIcons[tone]}
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
    exiting = false,
    onExited,
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
    if (exiting) {
      clearTimer();
      return clearTimer;
    }
    remainingRef.current = toast.duration;
    if (pauseReasonsRef.current.size === 0) {
      startTimer();
    } else {
      clearTimer();
    }
    return clearTimer;
    // Restart only when the toast identity / duration changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast.id, toast.duration, toast.createdAt, exiting]);

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
        toastRootClasses,
        toastToneClasses[toast.tone],
        !exiting &&
          (enterFromBottom
            ? "animate-gs-toast-enter-up"
            : "animate-gs-toast-enter"),
        exiting && "pointer-events-none animate-gs-toast-exit",
        className,
      )}
      data-tone={toast.tone}
      data-exiting={exiting ? "true" : undefined}
      aria-hidden={exiting ? "true" : undefined}
      data-swipe-direction={swipeDirection}
      onAnimationEnd={(event) => {
        props.onAnimationEnd?.(event);
        if (exiting && event.animationName === "gs-toast-exit") {
          onExited?.(toast.id);
        }
      }}
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
      <div className="gs-toast-main flex min-w-gs-0 items-start gap-gs-3">
        <ToneIcon tone={toast.tone} />
        <div className="gs-toast-body grid min-w-gs-0 flex-auto gap-gs-0.5">
          {hasTitle ? (
            <div className={toastTitleClasses}>{toast.title}</div>
          ) : null}
          {hasDescription ? (
            <div className={toastDescriptionClasses}>{toast.description}</div>
          ) : null}
        </div>
      </div>
      {toast.action ? (
        <ToastAction
          onClick={() => {
            toast.action?.onClick();
            dismissToast();
          }}
        >
          <span aria-hidden="true">{toast.action.label}</span>
          <span className="gs-toast-sr-only absolute size-px overflow-hidden whitespace-nowrap border-0 p-gs-0 [clip:rect(0,0,0,0)] [clip-path:inset(50%)]">
            {toast.action.altText.trim() || toast.action.label}
          </span>
        </ToastAction>
      ) : null}
      <button
        type="button"
        className={toastCloseClasses}
        aria-label={dismissLabel.trim() || "Dismiss"}
        onClick={dismissToast}
      >
        <FeedbackCloseIcon />
      </button>
    </div>
  );
}

export const ToastItem = forwardRef(ToastItemImpl);
ToastItem.displayName = "ToastItem";
