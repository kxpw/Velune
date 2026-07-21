// @vitest-environment jsdom

import { createRef } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Slot, mergeSlotProps } from "./slot";

afterEach(cleanup);

describe("Slot", () => {
  it("renders the child element with merged className", () => {
    render(
      <Slot className="from-slot" data-testid="target">
        <a className="from-child" href="/docs">
          Docs
        </a>
      </Slot>,
    );

    const anchor = screen.getByTestId("target");
    expect(anchor.tagName).toBe("A");
    expect(anchor.className).toBe("from-slot from-child");
  });

  it("composes event handlers child-first", () => {
    const order: string[] = [];
    render(
      <Slot onClick={() => order.push("slot")}>
        <button type="button" onClick={() => order.push("child")}>
          Go
        </button>
      </Slot>,
    );

    fireEvent.click(screen.getByRole("button"));
    expect(order).toEqual(["child", "slot"]);
  });

  it("lets the slot handler observe defaultPrevented from the child", () => {
    const slotHandler = vi.fn((event: { defaultPrevented: boolean }) => {
      expect(event.defaultPrevented).toBe(true);
    });
    render(
      <Slot onClick={slotHandler}>
        <button type="button" onClick={(event) => event.preventDefault()}>
          Go
        </button>
      </Slot>,
    );

    fireEvent.click(screen.getByRole("button"));
    expect(slotHandler).toHaveBeenCalledTimes(1);
  });

  it("composes the forwarded ref with the child's ref", () => {
    const slotRef = createRef<HTMLElement>();
    const childRef = createRef<HTMLButtonElement>();
    render(
      <Slot ref={slotRef}>
        <button ref={childRef} type="button">
          Go
        </button>
      </Slot>,
    );

    expect(slotRef.current).toBeTruthy();
    expect(slotRef.current).toBe(childRef.current);
  });

  it("lets child props win for plain values and merges style", () => {
    const merged = mergeSlotProps(
      { id: "slot-id", style: { color: "red", margin: 1 } },
      { id: "child-id", style: { color: "blue" } },
    );

    expect(merged.id).toBe("child-id");
    expect(merged.style).toEqual({ color: "blue", margin: 1 });
  });
});
