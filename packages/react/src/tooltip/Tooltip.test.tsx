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
import { Tooltip } from "./Tooltip";
import type { TooltipProps } from "./Tooltip.types";

type TestTooltipProps = Omit<TooltipProps, "children"> & {
  content: ReactNode;
  children: ReactElement;
};

const TestTooltip = forwardRef<HTMLDivElement, TestTooltipProps>(
  ({ content, children, ...props }, ref) => (
    <Tooltip {...props} ref={ref}>
      <Tooltip.Trigger>{children}</Tooltip.Trigger>
      <Tooltip.Content>{content}</Tooltip.Content>
    </Tooltip>
  ),
);

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("Tooltip", () => {
  it("sets a readable displayName", () => {
    expect(Tooltip.displayName).toBe("Tooltip");
    expect(Tooltip.Trigger.displayName).toBe("Tooltip.Trigger");
    expect(Tooltip.Content.displayName).toBe("Tooltip.Content");
  });

  it("uses ready-state Tailwind animation utilities", () => {
    render(
      <TestTooltip content="Details" defaultOpen>
        <button>Trigger</button>
      </TestTooltip>,
    );
    const panel = document.querySelector(".gs-tooltip")!;

    expect(
      panel.classList.contains("data-[ready=true]:animate-gs-float-in"),
    ).toBe(true);
    expect(panel.classList.contains("motion-reduce:animate-none")).toBe(true);
  });

  it("composes panel hover handlers and respects preventDefault", () => {
    vi.useFakeTimers();
    const onMouseEnter = vi.fn();
    const onMouseLeave = vi.fn((event: React.MouseEvent) =>
      event.preventDefault(),
    );
    render(
      <TestTooltip
        content="Details"
        defaultOpen
        delay={0}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <button>Trigger</button>
      </TestTooltip>,
    );
    const panel = document.querySelector(".gs-tooltip")!;

    fireEvent.mouseEnter(panel);
    fireEvent.mouseLeave(panel);
    act(() => vi.runAllTimers());

    expect(onMouseEnter).toHaveBeenCalledOnce();
    expect(onMouseLeave).toHaveBeenCalledOnce();
    expect(document.querySelector(".gs-tooltip")).not.toBeNull();
  });

  it("uses the latest disabled state when a delayed open fires", () => {
    vi.useFakeTimers();
    const onOpenChange = vi.fn();
    const renderTooltip = (disabled: boolean) => (
      <TestTooltip
        content="Details"
        delay={100}
        disabled={disabled}
        onOpenChange={onOpenChange}
      >
        <button>Trigger</button>
      </TestTooltip>
    );
    const { rerender } = render(renderTooltip(false));

    fireEvent.mouseEnter(document.querySelector("button")!);
    rerender(renderTooltip(true));
    act(() => vi.advanceTimersByTime(100));

    expect(onOpenChange).not.toHaveBeenCalled();
    expect(document.querySelector(".gs-tooltip")).toBeNull();
  });

  it("stays closed after being disabled and re-enabled", () => {
    const renderTooltip = (disabled: boolean) => (
      <TestTooltip content="Tip" defaultOpen disabled={disabled}>
        <button>Trigger</button>
      </TestTooltip>
    );
    const { rerender } = render(renderTooltip(false));
    expect(document.querySelector(".gs-tooltip")).not.toBeNull();

    rerender(renderTooltip(true));
    expect(document.querySelector(".gs-tooltip")).toBeNull();
    rerender(renderTooltip(false));
    expect(document.querySelector(".gs-tooltip")).toBeNull();
  });

  it("keeps its panel ref stable while open props update", () => {
    const ref = vi.fn();
    const renderTooltip = (className: string) => (
      <TestTooltip ref={ref} content="Tip" defaultOpen className={className}>
        <button>Trigger</button>
      </TestTooltip>
    );
    const { rerender } = render(renderTooltip("initial"));
    const panel = document.querySelector(".gs-tooltip");

    rerender(renderTooltip("updated"));

    expect(ref).toHaveBeenCalledOnce();
    expect(ref).toHaveBeenLastCalledWith(panel);
  });

  it("opens immediately for keyboard focus without applying hover delay", () => {
    vi.useFakeTimers();
    const onOpenChange = vi.fn();
    render(
      <TestTooltip
        content="Keyboard details"
        delay={1000}
        onOpenChange={onOpenChange}
      >
        <button>Trigger</button>
      </TestTooltip>,
    );

    fireEvent.focus(screen.getByRole("button"));

    expect(screen.getByRole("tooltip", { hidden: true }).textContent).toBe(
      "Keyboard details",
    );
    expect(onOpenChange).toHaveBeenCalledOnce();
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it("does not reopen a default tooltip from pointer-induced focus", () => {
    vi.useFakeTimers();
    render(
      <TestTooltip content="Details" defaultOpen>
        <button>Trigger</button>
      </TestTooltip>,
    );
    const trigger = screen.getByRole("button");

    fireEvent.pointerDown(trigger);
    fireEvent.focus(trigger);
    fireEvent.click(trigger);
    act(() => vi.runAllTimers());

    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  it("closes an existing tooltip when another tooltip opens", () => {
    vi.useFakeTimers();
    render(
      <>
        <TestTooltip content="First" delay={0}>
          <button>First trigger</button>
        </TestTooltip>
        <TestTooltip content="Second" delay={0}>
          <button>Second trigger</button>
        </TestTooltip>
      </>,
    );

    fireEvent.mouseEnter(screen.getByRole("button", { name: "First trigger" }));
    act(() => vi.runAllTimers());
    expect(screen.getByRole("tooltip", { hidden: true }).textContent).toBe(
      "First",
    );

    fireEvent.mouseEnter(
      screen.getByRole("button", { name: "Second trigger" }),
    );
    act(() => vi.runAllTimers());

    expect(screen.getByRole("tooltip", { hidden: true }).textContent).toBe(
      "Second",
    );
    expect(screen.queryByText("First")).toBeNull();
  });

  it("closes when an ancestor of its trigger scrolls", () => {
    const { container } = render(
      <div data-scroll-container="true">
        <TestTooltip content="Details" defaultOpen>
          <button>Trigger</button>
        </TestTooltip>
      </div>,
    );

    fireEvent.scroll(
      container.querySelector<HTMLElement>("[data-scroll-container]")!,
    );

    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  it("opens tooltip handoffs immediately during the skip-delay window", () => {
    vi.useFakeTimers();
    act(() => vi.advanceTimersByTime(301));
    render(
      <>
        <TestTooltip
          content="First"
          delay={{ open: 1000, close: 0 }}
          skipDelayDuration={300}
        >
          <button>First trigger</button>
        </TestTooltip>
        <TestTooltip
          content="Second"
          delay={{ open: 1000, close: 0 }}
          skipDelayDuration={300}
        >
          <button>Second trigger</button>
        </TestTooltip>
      </>,
    );
    const first = screen.getByRole("button", { name: "First trigger" });
    const second = screen.getByRole("button", { name: "Second trigger" });

    fireEvent.mouseEnter(first);
    act(() => vi.advanceTimersByTime(999));
    expect(screen.queryByRole("tooltip")).toBeNull();
    act(() => vi.advanceTimersByTime(1));
    expect(screen.getByRole("tooltip", { hidden: true }).textContent).toBe(
      "First",
    );

    fireEvent.mouseEnter(second);
    act(() => vi.runOnlyPendingTimers());
    expect(screen.getByRole("tooltip", { hidden: true }).textContent).toBe(
      "Second",
    );

    fireEvent.mouseLeave(second);
    act(() => vi.runOnlyPendingTimers());
    act(() => vi.advanceTimersByTime(301));
    fireEvent.mouseEnter(first);
    act(() => vi.advanceTimersByTime(999));
    expect(screen.queryByRole("tooltip")).toBeNull();
    act(() => vi.advanceTimersByTime(1));
    expect(screen.getByRole("tooltip", { hidden: true }).textContent).toBe(
      "First",
    );
  });

  it("lets consumers cancel Escape dismissal", () => {
    const onEscapeKeyDown = vi.fn((event: KeyboardEvent) =>
      event.preventDefault(),
    );
    render(
      <TestTooltip
        content="Details"
        defaultOpen
        onEscapeKeyDown={onEscapeKeyDown}
      >
        <button>Trigger</button>
      </TestTooltip>,
    );

    fireEvent.keyDown(document, { key: "Escape" });

    expect(onEscapeKeyDown).toHaveBeenCalledOnce();
    expect(screen.getByRole("tooltip", { hidden: true })).not.toBeNull();
  });
});
