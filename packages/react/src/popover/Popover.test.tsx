// @vitest-environment jsdom

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { forwardRef, type ReactElement, type ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Popover } from "./Popover";
import type { PopoverProps } from "./Popover.types";

type TestPopoverProps = Omit<PopoverProps, "children"> & {
  content: ReactNode;
  children: ReactElement;
};

const TestPopover = forwardRef<HTMLDivElement, TestPopoverProps>(
  ({ content, children, ...props }, ref) => (
    <Popover {...props} ref={ref}>
      <Popover.Trigger>{children}</Popover.Trigger>
      <Popover.Content>{content}</Popover.Content>
    </Popover>
  ),
);

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("Popover", () => {
  it("sets a readable displayName", () => {
    expect(Popover.displayName).toBe("Popover");
    expect(Popover.Trigger.displayName).toBe("Popover.Trigger");
    expect(Popover.Content.displayName).toBe("Popover.Content");
  });

  it("uses ready-state and focus Tailwind utilities", () => {
    render(
      <TestPopover content="Panel" defaultOpen>
        <button>Trigger</button>
      </TestPopover>,
    );
    const panel = document.querySelector(".gs-popover")!;

    expect(panel.classList.contains("opacity-0")).toBe(true);
    expect(panel.classList.contains("data-[ready=true]:opacity-100")).toBe(
      true,
    );
    expect(panel.classList.contains("transition-opacity")).toBe(true);
    expect(panel.classList.contains("focus-visible:outline-none")).toBe(true);
    expect(panel.getAttribute("data-state")).toBe("open");
    expect(panel.getAttribute("data-side")).toBe("bottom");
    expect(panel.getAttribute("data-align")).toBe("center");
  });

  it("closes when an outside target stops pointerdown propagation", () => {
    render(
      <>
        <TestPopover content="Panel" defaultOpen>
          <button>Trigger</button>
        </TestPopover>
        <button onPointerDown={(event) => event.stopPropagation()}>
          Outside
        </button>
      </>,
    );

    expect(document.querySelector(".gs-popover")).not.toBeNull();
    fireEvent.pointerDown(screen.getByRole("button", { name: "Outside" }));
    expect(document.querySelector(".gs-popover")).toBeNull();
  });

  it("keeps the newest nested layer on top when callbacks change", () => {
    const outerChange = vi.fn();
    const innerChange = vi.fn();
    const renderPopovers = (outerCallback: (open: boolean) => void) => (
      <TestPopover
        content={
          <TestPopover
            content="Inner panel"
            defaultOpen
            onOpenChange={innerChange}
          >
            <button>Inner trigger</button>
          </TestPopover>
        }
        defaultOpen
        onOpenChange={outerCallback}
      >
        <button>Outer trigger</button>
      </TestPopover>
    );
    const { rerender } = render(renderPopovers(outerChange));
    rerender(renderPopovers(() => outerChange(false)));

    fireEvent.keyDown(document, { key: "Escape" });

    expect(innerChange).toHaveBeenCalledWith(false);
    expect(outerChange).not.toHaveBeenCalled();
  });

  it("stays closed after being disabled and re-enabled", () => {
    const renderPopover = (disabled: boolean) => (
      <TestPopover content="Panel" defaultOpen disabled={disabled}>
        <button>Trigger</button>
      </TestPopover>
    );
    const { rerender } = render(renderPopover(false));
    expect(document.querySelector(".gs-popover")).not.toBeNull();

    rerender(renderPopover(true));
    expect(document.querySelector(".gs-popover")).toBeNull();
    rerender(renderPopover(false));
    expect(document.querySelector(".gs-popover")).toBeNull();
  });

  it("keeps its panel ref stable while open props update", () => {
    const ref = vi.fn();
    const renderPopover = (className: string) => (
      <TestPopover ref={ref} content="Panel" defaultOpen className={className}>
        <button>Trigger</button>
      </TestPopover>
    );
    const { rerender } = render(renderPopover("initial"));
    const panel = document.querySelector(".gs-popover");

    rerender(renderPopover("updated"));

    expect(ref).toHaveBeenCalledOnce();
    expect(ref).toHaveBeenLastCalledWith(panel);
  });

  it("lets consumers cancel Escape dismissal", () => {
    const onEscapeKeyDown = vi.fn((event: KeyboardEvent) =>
      event.preventDefault(),
    );
    render(
      <TestPopover
        content="Panel"
        defaultOpen
        onEscapeKeyDown={onEscapeKeyDown}
      >
        <button>Trigger</button>
      </TestPopover>,
    );

    fireEvent.keyDown(document, { key: "Escape" });

    expect(onEscapeKeyDown).toHaveBeenCalledOnce();
    expect(document.querySelector(".gs-popover")).not.toBeNull();
  });

  it("composes cancellable open and close autofocus callbacks", () => {
    vi.useFakeTimers();
    const onOpenAutoFocus = vi.fn();
    const onCloseAutoFocus = vi.fn();
    render(
      <TestPopover
        content={<input aria-label="Panel input" />}
        onOpenAutoFocus={onOpenAutoFocus}
        onCloseAutoFocus={onCloseAutoFocus}
      >
        <button>Trigger</button>
      </TestPopover>,
    );
    const trigger = screen.getByRole("button", { name: "Trigger" });

    fireEvent.click(trigger);
    const panelInput = document.querySelector<HTMLInputElement>(
      'input[aria-label="Panel input"]',
    )!;
    const panel = document.querySelector<HTMLElement>(".gs-popover")!;
    panel.style.visibility = "visible";
    Object.defineProperty(panel, "offsetWidth", { value: 200 });
    Object.defineProperty(panel, "offsetHeight", { value: 100 });
    Object.defineProperty(panelInput, "offsetWidth", { value: 1 });
    act(() => vi.runAllTimers());
    act(() => vi.runAllTimers());
    expect(document.activeElement).toBe(panelInput);
    expect(onOpenAutoFocus).toHaveBeenCalledOnce();

    fireEvent.keyDown(document, { key: "Escape" });
    act(() => vi.runAllTimers());
    expect(onCloseAutoFocus).toHaveBeenCalledOnce();
    expect(document.activeElement).toBe(trigger);
  });

  it("does not restore trigger focus after an outside pointer dismissal", () => {
    vi.useFakeTimers();
    render(
      <>
        <TestPopover content={<input aria-label="Panel input" />}>
          <button>Trigger</button>
        </TestPopover>
        <button>Outside</button>
      </>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Trigger" }));
    act(() => vi.runAllTimers());
    const outside = screen.getByRole("button", { name: "Outside" });

    fireEvent.pointerDown(outside);
    outside.focus();
    act(() => vi.runAllTimers());

    expect(document.querySelector(".gs-popover")).toBeNull();
    expect(document.activeElement).toBe(outside);
  });
});
