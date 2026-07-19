// @vitest-environment jsdom

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ToastItem } from "./ToastItem";
import { ToastProvider } from "./ToastProvider";
import { toast } from "./toast";
import { toastStore } from "./toast-store";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  toast.dismiss();
  toastStore.configure({ duration: 4000, max: 5 });
});

describe("Toast", () => {
  it("sets a readable displayName on the provider", () => {
    expect(ToastProvider.displayName).toBe("ToastProvider");
  });

  it("exposes an imperative API", () => {
    expect(typeof toast.success).toBe("function");
    expect(typeof toast.error).toBe("function");
    expect(typeof toast.dismiss).toBe("function");
  });

  it("announces complete action text while keeping the visual label short", () => {
    const onAction = vi.fn();
    render(
      <ToastItem
        toast={{
          id: "deleted",
          title: "File deleted",
          tone: "default",
          duration: 0,
          assertive: false,
          createdAt: Date.now(),
          action: {
            label: "Undo",
            altText: "Undo file deletion",
            onClick: onAction,
          },
        }}
        onDismiss={() => {}}
      />,
    );

    const action = screen.getByRole("button", { name: "Undo file deletion" });
    expect(action.querySelector("[aria-hidden='true']")?.textContent).toBe(
      "Undo",
    );
    fireEvent.click(action);
    expect(onAction).toHaveBeenCalledOnce();
  });

  it("uses a neutral responsive layout for rich notifications", () => {
    const { container } = render(
      <ToastItem
        toast={{
          id: "upload",
          title: "Upload failed",
          description: "Check your connection and try again.",
          tone: "error",
          duration: 0,
          assertive: true,
          createdAt: Date.now(),
          action: {
            label: "Retry",
            altText: "Retry upload",
            onClick: () => {},
          },
        }}
        onDismiss={() => {}}
      />,
    );
    const root = container.querySelector<HTMLElement>(".gs-toast")!;
    const action = container.querySelector<HTMLElement>(".gs-toast-action")!;

    expect(root.classList.contains("grid")).toBe(true);
    expect(root.classList.contains("bg-gs-toast-error")).toBe(false);
    expect(root.querySelector(".gs-toast-indicator")).not.toBeNull();
    expect(root.querySelector(".gs-toast-title")?.className).toContain(
      "text-gs-toast-accent",
    );
    expect(root.querySelector(".gs-toast-description")?.className).toContain(
      "text-sm",
    );
    expect(action.parentElement).toBe(root);
    expect(root.querySelector(".gs-toast-close")?.className).toContain(
      "absolute",
    );
  });

  it("falls back to the visual action label when alt text is blank", () => {
    render(
      <ToastItem
        toast={{
          id: "retry",
          title: "Upload failed",
          tone: "error",
          duration: 0,
          assertive: true,
          createdAt: Date.now(),
          action: { label: "Retry", altText: "  ", onClick: () => {} },
        }}
        onDismiss={() => {}}
      />,
    );

    expect(screen.getByRole("button", { name: "Retry" })).toBeTruthy();
  });

  it("uses a custom provider dismiss label", async () => {
    render(
      <ToastProvider duration={Infinity} dismissLabel="Close saved notice" />,
    );
    act(() => {
      toast.show("Saved");
    });

    expect(
      await screen.findByRole("button", { name: "Close saved notice" }),
    ).toBeTruthy();
  });

  it("pauses auto-dismiss while the window is unfocused", () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();
    render(
      <ToastItem
        toast={{
          id: "notice",
          title: "Saved",
          tone: "success",
          duration: 1000,
          assertive: false,
          createdAt: Date.now(),
        }}
        onDismiss={onDismiss}
      />,
    );

    act(() => vi.advanceTimersByTime(400));
    act(() => window.dispatchEvent(new Event("blur")));
    act(() => vi.advanceTimersByTime(1000));
    expect(onDismiss).not.toHaveBeenCalled();

    act(() => window.dispatchEvent(new Event("focus")));
    act(() => vi.advanceTimersByTime(600));
    expect(onDismiss).toHaveBeenCalledWith("notice");
  });

  it("composes pointer pause handlers and respects preventDefault", () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();
    const onPause = vi.fn();
    const onMouseEnter = vi.fn((event: React.MouseEvent) =>
      event.preventDefault(),
    );
    const { container } = render(
      <ToastItem
        toast={{
          id: "notice",
          title: "Saved",
          tone: "success",
          duration: 1000,
          assertive: false,
          createdAt: Date.now(),
        }}
        onDismiss={onDismiss}
        onPause={onPause}
        onMouseEnter={onMouseEnter}
      />,
    );

    fireEvent.mouseEnter(container.querySelector(".gs-toast")!);
    expect(onMouseEnter).toHaveBeenCalledOnce();
    expect(onPause).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(1000));
    expect(onDismiss).toHaveBeenCalledWith("notice");
  });

  it("keeps live-region semantics under consumer prop passthrough", () => {
    const { container } = render(
      <ToastItem
        toast={{
          id: "error",
          title: "Failed",
          tone: "error",
          duration: 0,
          assertive: true,
          createdAt: Date.now(),
        }}
        onDismiss={() => {}}
        role="presentation"
        aria-live="off"
      />,
    );
    const item = container.querySelector(".gs-toast")!;

    expect(item.getAttribute("role")).toBe("alert");
    expect(item.getAttribute("aria-live")).toBe("assertive");
  });

  it("treats an infinite provider duration as persistent", () => {
    toastStore.configure({ duration: Infinity });
    toast.show("Pinned");

    expect(toastStore.getSnapshot()[0]?.duration).toBe(0);
  });

  it("waits for every pause source before resuming", () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();
    const { container } = render(
      <ToastItem
        toast={{
          id: "notice",
          title: "Saved",
          tone: "success",
          duration: 1000,
          assertive: false,
          createdAt: Date.now(),
        }}
        onDismiss={onDismiss}
      />,
    );
    const item = container.querySelector(".gs-toast")!;

    act(() => vi.advanceTimersByTime(400));
    fireEvent.mouseEnter(item);
    act(() => window.dispatchEvent(new Event("blur")));
    fireEvent.mouseLeave(item);
    act(() => vi.advanceTimersByTime(1000));
    expect(onDismiss).not.toHaveBeenCalled();

    act(() => window.dispatchEvent(new Event("focus")));
    act(() => vi.advanceTimersByTime(600));
    expect(onDismiss).toHaveBeenCalledWith("notice");
  });

  it("restarts the lifetime when the same toast id is updated", () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();
    const createToast = (createdAt: number) => ({
      id: "notice",
      title: "Saved",
      tone: "success" as const,
      duration: 1000,
      assertive: false,
      createdAt,
    });
    const { rerender } = render(
      <ToastItem toast={createToast(1)} onDismiss={onDismiss} />,
    );

    act(() => vi.advanceTimersByTime(800));
    rerender(<ToastItem toast={createToast(2)} onDismiss={onDismiss} />);
    act(() => vi.advanceTimersByTime(300));
    expect(onDismiss).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(700));
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it("trims the current queue when the maximum is reduced", () => {
    toast.show("First");
    toast.show("Second");
    toast.show("Third");

    toastStore.configure({ max: 1 });

    expect(toastStore.getSnapshot().map((item) => item.title)).toEqual([
      "Third",
    ]);
  });

  it("moves focus to the viewport before dismissing a focused toast", () => {
    const onDismiss = vi.fn();
    const { container } = render(
      <div className="gs-toast-viewport" tabIndex={-1}>
        <ToastItem
          toast={{
            id: "notice",
            title: "Saved",
            tone: "success",
            duration: 0,
            assertive: false,
            createdAt: Date.now(),
          }}
          onDismiss={onDismiss}
        />
      </div>,
    );
    const viewport =
      container.querySelector<HTMLElement>(".gs-toast-viewport")!;
    const close =
      container.querySelector<HTMLButtonElement>(".gs-toast-close")!;
    close.focus();

    fireEvent.click(close);

    expect(document.activeElement).toBe(viewport);
    expect(onDismiss).toHaveBeenCalledWith("notice");
  });

  it("focuses the labelled viewport with a configured hotkey", async () => {
    render(
      <ToastProvider
        duration={Infinity}
        hotkey={["Control", "KeyN"]}
        label="Updates"
      />,
    );
    act(() => {
      toast.show("Pinned");
    });
    const viewport = await screen.findByRole("region", { name: "Updates" });

    fireEvent.keyDown(document, {
      key: "n",
      code: "KeyN",
      ctrlKey: true,
    });

    expect(document.activeElement).toBe(viewport);
  });

  it("closes a focused toast with Escape after composing key handlers", () => {
    const onDismiss = vi.fn();
    const onKeyDown = vi.fn();
    const { container } = render(
      <div className="gs-toast-viewport" tabIndex={-1}>
        <ToastItem
          toast={{
            id: "notice",
            title: "Saved",
            tone: "success",
            duration: 0,
            assertive: false,
            createdAt: Date.now(),
          }}
          onDismiss={onDismiss}
          onKeyDown={onKeyDown}
        />
      </div>,
    );
    const item = container.querySelector<HTMLElement>(".gs-toast")!;
    container.querySelector<HTMLButtonElement>(".gs-toast-close")!.focus();

    fireEvent.keyDown(item, { key: "Escape" });

    expect(onKeyDown).toHaveBeenCalledOnce();
    expect(onDismiss).toHaveBeenCalledWith("notice");
    expect(document.activeElement).toBe(
      container.querySelector(".gs-toast-viewport"),
    );
  });

  it("lets consumer key handlers cancel Escape dismissal", () => {
    const onDismiss = vi.fn();
    const { container } = render(
      <ToastItem
        toast={{
          id: "notice",
          title: "Saved",
          tone: "success",
          duration: 0,
          assertive: false,
          createdAt: Date.now(),
        }}
        onDismiss={onDismiss}
        onKeyDown={(event) => event.preventDefault()}
      />,
    );

    fireEvent.keyDown(container.querySelector(".gs-toast")!, {
      key: "Escape",
    });

    expect(onDismiss).not.toHaveBeenCalled();
  });

  it("dismisses after a swipe crosses the configured threshold", () => {
    const onDismiss = vi.fn();
    const { container } = render(
      <ToastItem
        toast={{
          id: "notice",
          title: "Saved",
          tone: "success",
          duration: 0,
          assertive: false,
          createdAt: Date.now(),
        }}
        onDismiss={onDismiss}
        swipeThreshold={50}
      />,
    );
    const item = container.querySelector(".gs-toast")!;

    fireEvent.pointerDown(item, {
      button: 0,
      clientX: 0,
      clientY: 0,
      pointerId: 1,
      pointerType: "touch",
    });
    fireEvent.pointerMove(item, {
      clientX: 60,
      clientY: 2,
      pointerId: 1,
      pointerType: "touch",
    });
    fireEvent.pointerUp(item, {
      clientX: 60,
      clientY: 2,
      pointerId: 1,
      pointerType: "touch",
    });

    expect(onDismiss).toHaveBeenCalledWith("notice");
  });

  it("cancels and resets a swipe below the threshold", () => {
    const onDismiss = vi.fn();
    const { container } = render(
      <ToastItem
        toast={{
          id: "notice",
          title: "Saved",
          tone: "success",
          duration: 0,
          assertive: false,
          createdAt: Date.now(),
        }}
        onDismiss={onDismiss}
        swipeThreshold={50}
      />,
    );
    const item = container.querySelector<HTMLElement>(".gs-toast")!;

    fireEvent.pointerDown(item, {
      button: 0,
      clientX: 0,
      clientY: 0,
      pointerId: 1,
      pointerType: "touch",
    });
    fireEvent.pointerMove(item, {
      clientX: 30,
      clientY: 0,
      pointerId: 1,
      pointerType: "touch",
    });
    fireEvent.pointerUp(item, {
      clientX: 30,
      clientY: 0,
      pointerId: 1,
      pointerType: "touch",
    });

    expect(onDismiss).not.toHaveBeenCalled();
    expect(item.dataset.swipe).toBe("cancel");
    expect(item.style.getPropertyValue("--gs-toast-swipe-x")).toBe("");
  });

  it("yields when the pointer moves in the wrong swipe direction", () => {
    const onDismiss = vi.fn();
    const { container } = render(
      <ToastItem
        toast={{
          id: "notice",
          title: "Saved",
          tone: "success",
          duration: 0,
          assertive: false,
          createdAt: Date.now(),
        }}
        onDismiss={onDismiss}
        swipeDirection="right"
      />,
    );
    const item = container.querySelector<HTMLElement>(".gs-toast")!;

    fireEvent.pointerDown(item, {
      button: 0,
      clientX: 50,
      clientY: 0,
      pointerId: 1,
      pointerType: "touch",
    });
    fireEvent.pointerMove(item, {
      clientX: 20,
      clientY: 0,
      pointerId: 1,
      pointerType: "touch",
    });
    fireEvent.pointerUp(item, {
      clientX: 20,
      clientY: 0,
      pointerId: 1,
      pointerType: "touch",
    });

    expect(onDismiss).not.toHaveBeenCalled();
    expect(item.dataset.swipe).toBeUndefined();
  });
});
