// @vitest-environment jsdom

import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Drawer } from "./Drawer";

afterEach(cleanup);

describe("Drawer", () => {
  it("sets readable displayNames", () => {
    expect(Drawer.displayName).toBe("Drawer");
    expect(Drawer.Content.displayName).toBe("Drawer.Content");
    expect(Drawer.Header.displayName).toBe("Drawer.Header");
    expect(Drawer.Title.displayName).toBe("Drawer.Title");
    expect(Drawer.Description.displayName).toBe("Drawer.Description");
    expect(Drawer.Body.displayName).toBe("Drawer.Body");
    expect(Drawer.Footer.displayName).toBe("Drawer.Footer");
    expect(Drawer.Close.displayName).toBe("Drawer.Close");
  });

  it("protects overlay and focus-scope markers from DOM prop overrides", async () => {
    render(
      <Drawer
        open
        placement="left"
        size="lg"
        data-gs-overlay-branch="forged"
        data-gs-focus-scope="forged"
        data-placement="forged"
        data-size="forged"
      >
        <Drawer.Content>Drawer</Drawer.Content>
      </Drawer>,
    );

    await waitFor(() => {
      const root = document.querySelector<HTMLElement>(".gs-drawer")!;
      expect(root.getAttribute("data-gs-overlay-branch")).toBe("");
      expect(root.getAttribute("data-gs-focus-scope")).toBe("");
      expect(root.dataset.placement).toBe("left");
      expect(root.dataset.size).toBe("lg");
    });
  });

  it("links composed title and description to the drawer", async () => {
    render(
      <Drawer open>
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>Filters</Drawer.Title>
            <Drawer.Description>Refine the current view.</Drawer.Description>
          </Drawer.Header>
        </Drawer.Content>
      </Drawer>,
    );

    await waitFor(() => {
      const content = document.querySelector(".gs-drawer-content")!;
      const title = document.querySelector(".gs-drawer-title")!;
      const description = document.querySelector(".gs-drawer-description")!;
      expect(content.getAttribute("aria-labelledby")).toBe(title.id);
      expect(content.getAttribute("aria-describedby")).toBe(description.id);
    });
  });

  it("preserves consumer styles without losing its overlay layer", async () => {
    render(
      <Drawer open style={{ backgroundColor: "red", zIndex: 1 }}>
        <Drawer.Content>Drawer</Drawer.Content>
      </Drawer>,
    );

    await waitFor(() => {
      const root = document.querySelector<HTMLElement>(".gs-drawer")!;
      expect(root.style.backgroundColor).toBe("red");
      expect(root.style.zIndex).toContain("var(--drawer-z-index)");
      expect(root.classList.contains("fixed")).toBe(true);
    });
  });

  it("maps placement and size to Tailwind utilities", async () => {
    render(
      <Drawer open placement="left" size="sm">
        <Drawer.Content>
          <Drawer.Close />
          Drawer
        </Drawer.Content>
      </Drawer>,
    );

    await waitFor(() => {
      const overlay = document.querySelector(".gs-drawer-overlay")!;
      const content = document.querySelector(".gs-drawer-content")!;
      expect(overlay.classList.contains("justify-start")).toBe(true);
      expect(content.classList.contains("animate-gs-drawer-slide-left")).toBe(
        true,
      );
      const close = document.querySelector(".gs-drawer-close");
      expect(close?.classList.contains("active:scale-95")).toBe(true);
      expect(close?.classList.contains("motion-reduce:transition-none")).toBe(
        true,
      );
      expect(
        content.classList.contains(
          "[[data-size=sm]_&]:[--gs-drawer-size:var(--drawer-size-sm)]",
        ),
      ).toBe(true);
    });
  });

  it("composes content click handlers", async () => {
    const onClick = vi.fn();
    render(
      <Drawer open>
        <Drawer.Content onClick={onClick}>Drawer</Drawer.Content>
      </Drawer>,
    );
    await waitFor(() =>
      expect(document.querySelector(".gs-drawer-content")).not.toBeNull(),
    );

    fireEvent.click(document.querySelector(".gs-drawer-content")!);

    expect(onClick).toHaveBeenCalledOnce();
    expect(document.querySelector(".gs-drawer")).not.toBeNull();
  });

  it("keeps its content ref stable while open props update", async () => {
    const ref = vi.fn();
    const renderDrawer = (className: string) => (
      <Drawer open>
        <Drawer.Content ref={ref} className={className}>
          Drawer
        </Drawer.Content>
      </Drawer>
    );
    const { rerender } = render(renderDrawer("initial"));
    await waitFor(() => expect(ref).toHaveBeenCalledOnce());
    const content = document.querySelector(".gs-drawer-content");

    rerender(renderDrawer("updated"));

    expect(ref).toHaveBeenCalledOnce();
    expect(ref).toHaveBeenLastCalledWith(content);
  });

  it("transfers its root node when the ref prop changes", async () => {
    const firstRef = vi.fn();
    const secondRef = vi.fn();
    const { rerender } = render(
      <Drawer ref={firstRef} open>
        <Drawer.Content>Drawer</Drawer.Content>
      </Drawer>,
    );
    await waitFor(() => expect(firstRef).toHaveBeenCalledOnce());
    const root = document.querySelector(".gs-drawer");

    rerender(
      <Drawer ref={secondRef} open>
        <Drawer.Content>Drawer</Drawer.Content>
      </Drawer>,
    );

    expect(firstRef).toHaveBeenLastCalledWith(null);
    expect(secondRef).toHaveBeenCalledOnce();
    expect(secondRef).toHaveBeenLastCalledWith(root);
  });

  it("lets consumers cancel Escape and overlay dismissal", async () => {
    const onEscapeKeyDown = vi.fn((event: KeyboardEvent) =>
      event.preventDefault(),
    );
    const onOverlayClick = vi.fn((event: React.MouseEvent) =>
      event.preventDefault(),
    );
    render(
      <Drawer
        open
        onEscapeKeyDown={onEscapeKeyDown}
        onOverlayClick={onOverlayClick}
      >
        <Drawer.Content>Drawer</Drawer.Content>
      </Drawer>,
    );
    await waitFor(() =>
      expect(document.querySelector(".gs-drawer-overlay")).not.toBeNull(),
    );

    fireEvent.keyDown(document, { key: "Escape" });
    fireEvent.click(document.querySelector(".gs-drawer-overlay")!);

    expect(onEscapeKeyDown).toHaveBeenCalledOnce();
    expect(onOverlayClick).toHaveBeenCalledOnce();
    expect(document.querySelector(".gs-drawer")).not.toBeNull();
  });

  it("runs autofocus lifecycle callbacks and restores the opener", async () => {
    const initialFocusRef = createRef<HTMLInputElement>();
    const onOpenAutoFocus = vi.fn();
    const onCloseAutoFocus = vi.fn();
    const renderDrawer = (open: boolean) => (
      <>
        <button data-testid="outside">Outside</button>
        <Drawer
          open={open}
          initialFocusRef={initialFocusRef}
          onOpenAutoFocus={onOpenAutoFocus}
          onCloseAutoFocus={onCloseAutoFocus}
        >
          <Drawer.Content>
            <input ref={initialFocusRef} aria-label="Initial" />
          </Drawer.Content>
        </Drawer>
      </>
    );
    const { rerender } = render(renderDrawer(false));
    const outside = document.querySelector<HTMLElement>(
      '[data-testid="outside"]',
    )!;
    outside.focus();
    rerender(renderDrawer(true));

    await waitFor(() =>
      expect(document.activeElement).toBe(initialFocusRef.current),
    );
    expect(onOpenAutoFocus).toHaveBeenCalledOnce();

    rerender(renderDrawer(false));
    await waitFor(() => expect(document.activeElement).toBe(outside));
    expect(onCloseAutoFocus).toHaveBeenCalledOnce();
  });
});
