import type { HTMLAttributes, ReactNode } from "react";

export type ToastTone = "default" | "success" | "error" | "warning" | "info";

export type ToastPosition =
  | "top-right"
  | "top-left"
  | "top-center"
  | "bottom-right"
  | "bottom-left"
  | "bottom-center";

export type ToastSwipeDirection = "up" | "down" | "left" | "right";

export type ToastAction = {
  label: string;
  /** Complete action instruction announced to assistive technology. */
  altText: string;
  onClick: () => void;
};

export type ToastOptions = {
  id?: string;
  title?: ReactNode;
  description?: ReactNode;
  tone?: ToastTone;
  /** Auto-dismiss duration in ms. Default `4000`. Pass `0` or `Infinity` to disable. */
  duration?: number;
  /**
   * Optional action button for the imperative `toast()` API.
   * For custom toast UIs, render `ToastProvider.Action` instead.
   */
  action?: ToastAction;
  /** Use assertive live region (errors). Default depends on tone. */
  assertive?: boolean;
};

export type ToastRecord = {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  tone: ToastTone;
  duration: number;
  action?: ToastAction;
  assertive: boolean;
  createdAt: number;
};

export type ToastShowInput =
  | ReactNode
  | (ToastOptions & {
      title?: ReactNode;
    });

export type ToastPromiseMessages<TData> = {
  /** Persistent toast shown while the promise is pending. */
  loading: ToastShowInput;
  /** Replaces the loading toast on resolve. */
  success: ToastShowInput | ((data: TData) => ToastShowInput);
  /** Replaces the loading toast on reject. */
  error: ToastShowInput | ((error: unknown) => ToastShowInput);
};

export interface ToastProviderProps {
  children?: ReactNode;
  /** Accessible viewport label. Default: `Notifications`. */
  label?: string;
  /** Accessible label for each dismiss button. Default: `Dismiss`. */
  dismissLabel?: string;
  /** Keys that focus the notification viewport. Default: `["F8"]`. */
  hotkey?: string[];
  /** Direction that dismisses a toast by pointer swipe. Default: `right`. */
  swipeDirection?: ToastSwipeDirection;
  /** Swipe distance required to dismiss in px. Default: `50`. */
  swipeThreshold?: number;
  /** Stack placement. Default: `top-right`. */
  position?: ToastPosition;
  /** Default auto-dismiss duration in ms. Default: `4000`. */
  duration?: number;
  /** Max visible toasts. Older ones are dropped. Default: `5`. */
  max?: number;
  className?: string;
}

export interface ToastItemProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "onPause" | "onResume"
> {
  toast: ToastRecord;
  onDismiss: (id: string) => void;
  onPause?: (id: string) => void;
  onResume?: (id: string) => void;
  swipeDirection?: ToastSwipeDirection;
  swipeThreshold?: number;
  dismissLabel?: string;
  /** @internal Enter from below when rendered in a bottom viewport. */
  enterFromBottom?: boolean;
  /** @internal Play the exit animation; the toast is already dismissed. */
  exiting?: boolean;
  /** @internal Called once the exit animation has finished. */
  onExited?: (id: string) => void;
}
