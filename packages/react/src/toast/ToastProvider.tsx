import type { ForwardedRef } from "react";
import { forwardRef, useEffect, useRef, useSyncExternalStore } from "react";
import { clsx } from "clsx";
import { useComposedRefs } from "../shared/compose-refs";
import { Portal } from "../shared/portal";
import { ToastItem } from "./ToastItem";
import { toastStore } from "./toast-store";
import type { ToastPosition, ToastProviderProps } from "./Toast.types";

const DEFAULT_HOTKEY = ["F8"];

const positionClasses: Record<ToastPosition, string> = {
  "top-right": "right-gs-toast-offset top-gs-toast-offset items-end",
  "top-left": "left-gs-toast-offset top-gs-toast-offset items-start",
  "top-center": "left-1/2 top-gs-toast-offset -translate-x-1/2 items-center",
  "bottom-right":
    "right-gs-toast-offset bottom-gs-toast-offset flex-col-reverse items-end",
  "bottom-left":
    "left-gs-toast-offset bottom-gs-toast-offset flex-col-reverse items-start",
  "bottom-center":
    "left-1/2 bottom-gs-toast-offset -translate-x-1/2 flex-col-reverse items-center",
};

function matchesHotkey(event: KeyboardEvent, hotkey: string[]): boolean {
  return (
    hotkey.length > 0 &&
    hotkey.every((key) => {
      const normalized = key.toLowerCase();
      if (normalized === "control" || normalized === "ctrl") {
        return event.ctrlKey;
      }
      if (normalized === "alt") {
        return event.altKey;
      }
      if (normalized === "shift") {
        return event.shiftKey;
      }
      if (
        normalized === "meta" ||
        normalized === "command" ||
        normalized === "cmd"
      ) {
        return event.metaKey;
      }
      return event.code === key || event.key.toLowerCase() === normalized;
    })
  );
}

function ToastProviderImpl(
  {
    children,
    label = "Notifications",
    dismissLabel = "Dismiss",
    hotkey = DEFAULT_HOTKEY,
    swipeDirection = "right",
    swipeThreshold = 50,
    position = "top-right",
    duration = 4000,
    max = 5,
    className,
  }: ToastProviderProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const composedRef = useComposedRefs(viewportRef, ref);
  const toasts = useSyncExternalStore(
    toastStore.subscribe,
    toastStore.getSnapshot,
    toastStore.getSnapshot,
  );

  useEffect(() => {
    toastStore.configure({ duration, max });
  }, [duration, max]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (matchesHotkey(event, hotkey)) {
        viewportRef.current?.focus({ preventScroll: true });
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [hotkey]);

  return (
    <>
      {children}
      <Portal>
        <div
          ref={composedRef}
          className={clsx(
            "gs-toast-viewport pointer-events-none fixed z-gs-toast m-0 flex w-[min(var(--toast-max-width),calc(100vw-(var(--toast-offset)*2)))] max-w-gs-toast-max-width box-border flex-col gap-gs-toast-stack-gap p-0",
            positionClasses[position],
            className,
          )}
          data-position={position}
          role="region"
          aria-label={label.trim() || "Notifications"}
          tabIndex={-1}
        >
          {toasts.map((item) => (
            <ToastItem
              key={item.id}
              toast={item}
              onDismiss={toastStore.dismiss}
              swipeDirection={swipeDirection}
              swipeThreshold={swipeThreshold}
              dismissLabel={dismissLabel}
              enterFromBottom={position.startsWith("bottom")}
            />
          ))}
        </div>
      </Portal>
    </>
  );
}

export const ToastProvider = forwardRef(ToastProviderImpl);
ToastProvider.displayName = "ToastProvider";
