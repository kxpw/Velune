import type { ReactNode } from "react";
import type {
  ToastOptions,
  ToastRecord,
  ToastShowInput,
  ToastTone,
} from "./Toast.types";

type Listener = (toasts: ToastRecord[]) => void;

let counter = 0;
const listeners = new Set<Listener>();
let toasts: ToastRecord[] = [];
let defaultDuration = 4000;
let maxVisible = 5;

function emit(): void {
  const snapshot = toasts;
  listeners.forEach((listener) => listener(snapshot));
}

function nextId(): string {
  counter += 1;
  return `gs-toast-${counter}`;
}

function isToastOptions(input: ToastShowInput): input is ToastOptions & {
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

function normalizeInput(
  input: ToastShowInput,
  tone: ToastTone,
): Omit<ToastRecord, "id" | "createdAt"> {
  if (isToastOptions(input)) {
    const resolvedTone = input.tone ?? tone;
    return {
      title: input.title ?? input.description ?? "",
      ...(input.title != null && input.description !== undefined
        ? { description: input.description }
        : {}),
      tone: resolvedTone,
      duration:
        input.duration === Infinity ? 0 : (input.duration ?? defaultDuration),
      ...(input.action ? { action: input.action } : {}),
      assertive:
        input.assertive ??
        (resolvedTone === "error" || resolvedTone === "warning"),
    };
  }

  return {
    title: input as ReactNode,
    tone,
    duration: defaultDuration,
    assertive: tone === "error" || tone === "warning",
  };
}

function push(record: ToastRecord): string {
  toasts = [record, ...toasts].slice(0, maxVisible);
  emit();
  return record.id;
}

function show(input: ToastShowInput, tone: ToastTone = "default"): string {
  const normalized = normalizeInput(input, tone);
  const id =
    typeof input === "object" &&
    input != null &&
    !Array.isArray(input) &&
    "id" in input &&
    typeof (input as ToastOptions).id === "string"
      ? ((input as ToastOptions).id as string)
      : nextId();

  // Replace existing id if provided.
  toasts = toasts.filter((item) => item.id !== id);

  return push({
    id,
    createdAt: Date.now(),
    ...normalized,
  });
}

export const toastStore = {
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    listener(toasts);
    return () => {
      listeners.delete(listener);
    };
  },
  getSnapshot(): ToastRecord[] {
    return toasts;
  },
  configure(options: { duration?: number; max?: number }): void {
    if (options.duration != null) {
      defaultDuration = options.duration === Infinity ? 0 : options.duration;
    }
    if (options.max != null) {
      maxVisible =
        options.max === Infinity
          ? Infinity
          : Math.max(0, Math.floor(options.max));
      const nextToasts = toasts.slice(0, maxVisible);
      if (nextToasts.length !== toasts.length) {
        toasts = nextToasts;
        emit();
      }
    }
  },
  show(input: ToastShowInput): string {
    return show(input, "default");
  },
  success(input: ToastShowInput): string {
    return show(input, "success");
  },
  error(input: ToastShowInput): string {
    return show(input, "error");
  },
  warning(input: ToastShowInput): string {
    return show(input, "warning");
  },
  info(input: ToastShowInput): string {
    return show(input, "info");
  },
  dismiss(id?: string): void {
    if (!id) {
      if (toasts.length === 0) {
        return;
      }
      toasts = [];
      emit();
      return;
    }
    const nextToasts = toasts.filter((item) => item.id !== id);
    if (nextToasts.length === toasts.length) {
      return;
    }
    toasts = nextToasts;
    emit();
  },
};
