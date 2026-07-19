import { toastStore } from "./toast-store";
import type { ToastShowInput } from "./Toast.types";

export const toast = {
  /** Show a default toast. */
  show(input: ToastShowInput): string {
    return toastStore.show(input);
  },
  success(input: ToastShowInput): string {
    return toastStore.success(input);
  },
  error(input: ToastShowInput): string {
    return toastStore.error(input);
  },
  warning(input: ToastShowInput): string {
    return toastStore.warning(input);
  },
  info(input: ToastShowInput): string {
    return toastStore.info(input);
  },
  /** Dismiss one toast by id, or all when omitted. */
  dismiss(id?: string): void {
    toastStore.dismiss(id);
  },
};
