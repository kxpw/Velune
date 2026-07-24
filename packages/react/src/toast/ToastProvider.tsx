import type { ForwardedRef } from "react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { clsx } from "clsx";
import { useComposedRefs } from "../shared/compose-refs";
import { Portal } from "../shared/portal";
import { ToastItem } from "./ToastItem";
import { toastStore } from "./toast-store";
import type { ToastProviderProps, ToastRecord } from "./Toast.types";
import { ToastAction } from "./ToastAction";
import { toastViewportClasses } from "./Toast.classes";

const DEFAULT_HOTKEY = ["F8"];

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

/** Fallback removal delay when the exit animation never fires (reduced motion, jsdom). */
const EXIT_FALLBACK_MS = 400;

/**
 * Keeps toasts that just left the store in the render tree for one exit
 * animation, so dismissal fades out instead of unmounting abruptly.
 */
function useExitingToasts(toasts: ToastRecord[]): {
  exiting: ToastRecord[];
  onExited: (id: string) => void;
} {
  const [exiting, setExiting] = useState<ToastRecord[]>([]);
  const prevRef = useRef<ToastRecord[]>(toasts);
  const timersRef = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const remove = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer != null) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setExiting((current) => current.filter((item) => item.id !== id));
  }, []);

  useEffect(() => {
    const previous = prevRef.current;
    prevRef.current = toasts;
    const removed = previous.filter(
      (item) => !toasts.some((next) => next.id === item.id),
    );
    if (removed.length === 0) {
      return;
    }
    setExiting((current) => [
      ...current.filter(
        (item) =>
          !removed.some((record) => record.id === item.id) &&
          !toasts.some((record) => record.id === item.id),
      ),
      ...removed,
    ]);
    removed.forEach((item) => {
      const timer = timersRef.current.get(item.id);
      if (timer != null) {
        clearTimeout(timer);
      }
      timersRef.current.set(
        item.id,
        setTimeout(() => remove(item.id), EXIT_FALLBACK_MS),
      );
    });
  }, [toasts, remove]);

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  // A re-shown id must drop its stale exiting copy immediately.
  const filtered = useMemo(
    () => exiting.filter((item) => !toasts.some((next) => next.id === item.id)),
    [exiting, toasts],
  );

  return { exiting: filtered, onExited: remove };
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
  const { exiting, onExited } = useExitingToasts(toasts);

  // Newest-first (matching store order) so exiting toasts keep their slot.
  const rendered = useMemo(() => {
    if (exiting.length === 0) {
      return toasts.map((item) => ({ item, exiting: false }));
    }
    return [
      ...toasts.map((item) => ({ item, exiting: false })),
      ...exiting.map((item) => ({ item, exiting: true })),
    ].sort((a, b) => b.item.createdAt - a.item.createdAt);
  }, [toasts, exiting]);

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
          className={clsx(toastViewportClasses({ position }), className)}
          data-position={position}
          role="region"
          aria-label={label.trim() || "Notifications"}
          tabIndex={-1}
        >
          {rendered.map(({ item, exiting: isExiting }) => (
            <ToastItem
              key={item.id}
              toast={item}
              onDismiss={toastStore.dismiss}
              swipeDirection={swipeDirection}
              swipeThreshold={swipeThreshold}
              dismissLabel={dismissLabel}
              enterFromBottom={position.startsWith("bottom")}
              exiting={isExiting}
              onExited={onExited}
            />
          ))}
        </div>
      </Portal>
    </>
  );
}

const ToastProviderRoot = forwardRef(ToastProviderImpl);
ToastProviderRoot.displayName = "ToastProvider";

export const ToastProvider = Object.assign(ToastProviderRoot, {
  Action: ToastAction,
});
