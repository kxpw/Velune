// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Tag } from "./Tag";

afterEach(cleanup);

describe("Tag", () => {
  it("sets a readable displayName", () => {
    expect(Tag.displayName).toBe("Tag");
  });

  it("composes keyboard handlers and protects button semantics", () => {
    const onClick = vi.fn();
    const onKeyDown = vi.fn();
    render(
      <Tag onClick={onClick} onKeyDown={onKeyDown} role="note">
        Filter
      </Tag>,
    );

    const tag = screen.getByRole("note");
    fireEvent.keyDown(tag, { key: " " });

    expect(onKeyDown).toHaveBeenCalledOnce();
    expect(onClick).toHaveBeenCalledOnce();
    expect(onClick.mock.calls[0]![0].nativeEvent).toBeInstanceOf(MouseEvent);
    expect(tag.classList.contains("transition-colors")).toBe(true);
    expect(tag.classList.contains("hover:bg-gs-action-hover")).toBe(true);
  });

  it("maps size, tone, icon, and close control to Tailwind utilities", () => {
    render(
      <Tag size="sm" tone="warning" closable>
        <Tag.Icon>
          <svg />
        </Tag.Icon>
        Draft
      </Tag>,
    );
    const tag = screen.getByText("Draft").parentElement!;
    const close = screen.getByRole("button", { name: "Remove Draft" });

    expect(tag.classList.contains("min-h-gs-5")).toBe(true);
    expect(tag.classList.contains("bg-gs-warning-subtle")).toBe(true);
    expect(
      tag.querySelector(".gs-tag-icon")?.classList.contains("size-gs-3"),
    ).toBe(true);
    expect(close.classList.contains("size-gs-11")).toBe(true);
    expect(close.classList.contains("hover:bg-gs-current-subtle")).toBe(true);
    expect(close.classList.contains("motion-reduce:transition-none")).toBe(
      true,
    );
  });

  it("does not activate when the consumer prevents the key event", () => {
    const onClick = vi.fn();
    render(
      <Tag onClick={onClick} onKeyDown={(event) => event.preventDefault()}>
        Filter
      </Tag>,
    );

    fireEvent.keyDown(screen.getByRole("button", { name: "Filter" }), {
      key: "Enter",
    });
    expect(onClick).not.toHaveBeenCalled();
  });

  it("does not activate the tag when its close control receives a key", () => {
    const onClick = vi.fn();
    render(
      <Tag closable onClick={onClick}>
        Filter
      </Tag>,
    );

    fireEvent.keyDown(screen.getByRole("button", { name: "Remove Filter" }), {
      key: "Enter",
    });
    expect(onClick).not.toHaveBeenCalled();
  });

  it("uses a custom close control label", () => {
    render(
      <Tag
        closable
        getRemoveLabel={(label) => `Discard${label ? ` ${label}` : ""}`}
      >
        Draft
      </Tag>,
    );

    expect(screen.getByRole("button", { name: "Discard Draft" })).toBeTruthy();
  });
});
