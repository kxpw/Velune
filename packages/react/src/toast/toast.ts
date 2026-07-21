import type { ReactNode } from "react";
import { toastStore } from "./toast-store";
import type {
  ToastOptions,
  ToastPromiseMessages,
  ToastShowInput,
} from "./Toast.types";

function isOptionsInput(input: ToastShowInput): input is ToastOptions & {
  title?: ReactNode;
} {
  return (
    input != null &&
    typeof input === "object" &&
    !Array.isArray(input) &&
    ("title" in input ||
      "description" in input ||
      "duration" in input ||
      "tone" in input ||
      "action" in input ||
      "assertive" in input ||
      "id" in input)
  );
}

function withOverrides(
  input: ToastShowInput,
  overrides: ToastOptions,
): ToastShowInput {
  if (isOptionsInput(input)) {
    return { ...input, ...overrides };
  }
  return { title: input as ReactNode, ...overrides };
}

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
  /**
   * Track a promise with a persistent loading toast that resolves into a
   * success or error toast in place. Returns the same promise for chaining.
   */
  promise<TData>(
    input: Promise<TData> | (() => Promise<TData>),
    messages: ToastPromiseMessages<TData>,
  ): Promise<TData> {
    const promise = typeof input === "function" ? input() : input;
    const id = toastStore.show(
      withOverrides(messages.loading, { duration: 0 }),
    );
    promise.then(
      (data) => {
        const message =
          typeof messages.success === "function"
            ? messages.success(data)
            : messages.success;
        toastStore.success(withOverrides(message, { id }));
      },
      (error: unknown) => {
        const message =
          typeof messages.error === "function"
            ? messages.error(error)
            : messages.error;
        toastStore.error(withOverrides(message, { id }));
      },
    );
    return promise;
  },
  /** Dismiss one toast by id, or all when omitted. */
  dismiss(id?: string): void {
    toastStore.dismiss(id);
  },
};
