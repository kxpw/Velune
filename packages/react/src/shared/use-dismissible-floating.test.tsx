// @vitest-environment jsdom

import { describe, expect, it, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { useRef, useState } from "react";
import { useDismissibleFloating } from "./use-dismissible-floating";

function Probe({
  closeOnEscape = false,
  onDismiss,
}: {
  closeOnEscape?: boolean;
  onDismiss: (reason: "outside" | "escape") => void;
}) {
  const [open, setOpen] = useState(true);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const floatingRef = useRef<HTMLDivElement>(null);

  useDismissibleFloating({
    open,
    onDismiss: (reason) => {
      onDismiss(reason);
      setOpen(false);
    },
    refs: [triggerRef, floatingRef],
    closeOnEscape,
  });

  if (!open) {
    return <div data-testid="closed" />;
  }

  return (
    <div>
      <button ref={triggerRef} type="button">
        Trigger
      </button>
      <div ref={floatingRef} data-testid="panel">
        Panel
      </div>
      <button type="button" data-testid="outside">
        Outside
      </button>
    </div>
  );
}

describe("useDismissibleFloating", () => {
  it("dismisses on outside pointerdown", () => {
    const onDismiss = vi.fn();
    const { getByTestId } = render(<Probe onDismiss={onDismiss} />);

    fireEvent.pointerDown(getByTestId("outside"));

    expect(onDismiss).toHaveBeenCalledWith("outside");
    expect(getByTestId("closed")).toBeTruthy();
  });

  it("ignores pointerdown inside trigger or floating", () => {
    const onDismiss = vi.fn();
    const { getByTestId, getByRole } = render(<Probe onDismiss={onDismiss} />);

    fireEvent.pointerDown(getByRole("button", { name: "Trigger" }));
    fireEvent.pointerDown(getByTestId("panel"));

    expect(onDismiss).not.toHaveBeenCalled();
  });

  it("dismisses on Escape when enabled", () => {
    const onDismiss = vi.fn();
    render(<Probe closeOnEscape onDismiss={onDismiss} />);

    fireEvent.keyDown(document, { key: "Escape" });

    expect(onDismiss).toHaveBeenCalledWith("escape");
    expect(onDismiss).not.toHaveBeenCalledWith("outside");
  });
});
