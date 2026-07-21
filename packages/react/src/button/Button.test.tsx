// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Button } from "./Button";

afterEach(cleanup);

describe("Button", () => {
  it("sets a readable displayName", () => {
    expect(Button.displayName).toBe("Button");
  });

  it("is a forwardRef component", () => {
    expect(typeof Button).toBe("object");
    expect("$$typeof" in Button || typeof Button === "function").toBe(true);
    expect(Button.displayName).toBe("Button");
  });

  it("keeps its label and icons in the layout while loading", () => {
    const markup = renderToStaticMarkup(
      <Button loading>
        <Button.Leading>
          <svg data-testid="leading-icon" />
        </Button.Leading>
        Saving
      </Button>,
    );

    expect(markup).toContain('data-loading="true"');
    expect(markup).toContain('data-testid="leading-icon"');
    expect(markup).toContain('class="gs-button-spinner ');
    expect(markup).toContain("animate-gs-button-spinner");
    expect(markup).toContain("gs-button-label inline-flex");
    expect(markup).toContain("opacity-0");
  });

  it("marks loading icon-only buttons for square sizing", () => {
    const markup = renderToStaticMarkup(
      <Button loading aria-label="Loading action" />,
    );

    expect(markup).toContain('data-icon-only="true"');
    expect(markup).toContain('aria-busy="true"');
  });

  it("does not let DOM props hide the loading state", () => {
    const markup = renderToStaticMarkup(
      <Button loading aria-busy={false}>
        Saving
      </Button>,
    );

    expect(markup).toContain('aria-busy="true"');
    expect(markup).toContain('disabled=""');
  });

  it("keeps href anchors as links", () => {
    const onClick = vi.fn();
    render(
      <Button as="a" href="/settings" onClick={onClick}>
        Settings
      </Button>,
    );

    const link = screen.getByRole("link", { name: "Settings" });
    fireEvent.keyDown(link, { key: " " });
    expect(onClick).not.toHaveBeenCalled();
  });

  it("gives href-less anchors button keyboard behavior", () => {
    const onClick = vi.fn();
    render(
      <Button as="a" onClick={onClick}>
        Open
      </Button>,
    );

    fireEvent.keyDown(screen.getByRole("button", { name: "Open" }), {
      key: " ",
    });
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("forwards keyboard events from native buttons", () => {
    const onKeyDown = vi.fn();
    render(<Button onKeyDown={onKeyDown}>Actions</Button>);

    fireEvent.keyDown(screen.getByRole("button", { name: "Actions" }), {
      key: "ArrowDown",
    });

    expect(onKeyDown).toHaveBeenCalledOnce();
  });

  it("maps variants, size, and icon-only state to Tailwind utilities", () => {
    render(
      <Button variant="danger" size="lg" aria-label="Delete">
        <Button.Leading>
          <svg />
        </Button.Leading>
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Delete" });

    expect(
      button.classList.contains(
        "min-h-[max(var(--button-height-lg),var(--control-hit-target))]",
      ),
    ).toBe(true);
    expect(
      button.classList.contains(
        "w-[max(var(--button-height-lg),var(--control-hit-target))]",
      ),
    ).toBe(true);
    expect(button.classList.contains("border-gs-button-color-danger")).toBe(
      true,
    );
  });

  it("stretches with fullWidth", () => {
    const { rerender } = render(<Button fullWidth>Save</Button>);
    const button = screen.getByRole("button", { name: "Save" });
    expect(button.classList.contains("w-full")).toBe(true);
    expect(button.getAttribute("data-full-width")).toBe("true");

    rerender(<Button fullWidth={false}>Save</Button>);
    expect(button.classList.contains("w-full")).toBe(false);
  });

  it("treats the deprecated danger variant as primary + danger tone", () => {
    render(
      <Button variant="danger" aria-label="Delete legacy">
        Delete
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Delete legacy" });

    expect(button.getAttribute("data-variant")).toBe("primary");
    expect(button.getAttribute("data-tone")).toBe("danger");
  });

  it("applies the danger tone to non-primary variants", () => {
    render(
      <Button variant="ghost" tone="danger">
        Remove
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Remove" });

    expect(button.getAttribute("data-variant")).toBe("ghost");
    expect(button.getAttribute("data-tone")).toBe("danger");
    expect(button.classList.contains("text-gs-error")).toBe(true);
  });

  it("renders onto the child element with asChild", () => {
    const onClick = vi.fn();
    render(
      <Button asChild variant="secondary" onClick={onClick}>
        <a href="/docs" data-testid="link">
          Docs
        </a>
      </Button>,
    );

    const link = screen.getByTestId("link");
    expect(link.tagName).toBe("A");
    expect(link.getAttribute("data-variant")).toBe("secondary");
    expect(link.classList.contains("gs-button")).toBe(true);
    fireEvent.click(link);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("blocks interaction on disabled asChild buttons", () => {
    const onClick = vi.fn();
    render(
      <Button asChild disabled onClick={onClick}>
        <a href="/docs">Docs</a>
      </Button>,
    );

    const link = screen.getByRole("link", { name: "Docs" });
    expect(link.getAttribute("aria-disabled")).toBe("true");
    fireEvent.click(link);
    expect(onClick).not.toHaveBeenCalled();
  });
});
