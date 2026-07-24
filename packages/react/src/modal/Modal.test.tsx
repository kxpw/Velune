// @vitest-environment jsdom

import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Modal } from "./Modal";
import { Select } from "../select/Select";

afterEach(cleanup);

describe("Modal", () => {
  it("sets readable displayNames", () => {
    expect(Modal.displayName).toBe("Modal");
    expect(Modal.Content.displayName).toBe("Modal.Content");
    expect(Modal.Header.displayName).toBe("Modal.Header");
    expect(Modal.Title.displayName).toBe("Modal.Title");
    expect(Modal.Description.displayName).toBe("Modal.Description");
    expect(Modal.Body.displayName).toBe("Modal.Body");
    expect(Modal.Footer.displayName).toBe("Modal.Footer");
    expect(Modal.Close.displayName).toBe("Modal.Close");
  });

  it("protects overlay and focus-scope markers from DOM prop overrides", async () => {
    render(
      <Modal
        open
        size="lg"
        data-gs-overlay-branch="forged"
        data-gs-focus-scope="forged"
        data-size="forged"
      >
        <Modal.Content>Dialog</Modal.Content>
      </Modal>,
    );

    await waitFor(() => {
      const root = document.querySelector<HTMLElement>(".gs-modal")!;
      expect(root.getAttribute("data-gs-overlay-branch")).toBe("");
      expect(root.getAttribute("data-gs-focus-scope")).toBe("");
      expect(root.dataset.size).toBe("lg");
    });
  });

  it("links composed title and description to the dialog", async () => {
    render(
      <Modal open>
        <Modal.Content>
          <Modal.Header>
            <Modal.Title>Project settings</Modal.Title>
            <Modal.Description>Manage this workspace.</Modal.Description>
          </Modal.Header>
        </Modal.Content>
      </Modal>,
    );

    await waitFor(() => {
      const content = document.querySelector(".gs-modal-content")!;
      const title = document.querySelector(".gs-modal-title")!;
      const description = document.querySelector(".gs-modal-description")!;
      expect(content.getAttribute("aria-labelledby")).toBe(title.id);
      expect(content.getAttribute("aria-describedby")).toBe(description.id);
    });
  });

  it("hides content outside a modal from assistive technology", async () => {
    const { rerender } = render(
      <>
        <main data-testid="outside">Outside</main>
        <Modal open>
          <Modal.Content>Dialog</Modal.Content>
        </Modal>
      </>,
    );

    const outside = document.querySelector("[data-testid='outside']")!;
    const appRoot = outside.parentElement!;
    await waitFor(() =>
      expect(appRoot.getAttribute("aria-hidden")).toBe("true"),
    );
    expect(appRoot.hasAttribute("inert")).toBe(true);

    rerender(
      <>
        <main data-testid="outside">Outside</main>
        <Modal open={false}>
          <Modal.Content>Dialog</Modal.Content>
        </Modal>
      </>,
    );

    await waitFor(() =>
      expect(appRoot.hasAttribute("aria-hidden")).toBe(false),
    );
    expect(appRoot.hasAttribute("inert")).toBe(false);
  });

  it("does not isolate portaled controls opened inside the modal", async () => {
    render(
      <Modal open>
        <Modal.Content aria-label="Settings">
          <Select aria-label="Status" searchable>
            <Select.Trigger />
            <Select.Content>
              <Select.Item value="ready">Ready</Select.Item>
            </Select.Content>
          </Select>
        </Modal.Content>
      </Modal>,
    );

    const trigger = document.querySelector<HTMLElement>(".gs-select-trigger")!;
    fireEvent.click(trigger);
    await waitFor(() => {
      const panel = document.querySelector(".gs-select-panel");
      expect(panel).not.toBeNull();
      expect(panel?.hasAttribute("aria-hidden")).toBe(false);
      expect(panel?.hasAttribute("inert")).toBe(false);
    });
  });

  it("restores programmatic focus that escapes the dialog", async () => {
    render(
      <>
        <button>Outside</button>
        <Modal open>
          <Modal.Content aria-label="Settings">
            <button>Inside</button>
          </Modal.Content>
        </Modal>
      </>,
    );

    const content = document.querySelector<HTMLElement>(".gs-modal-content")!;
    await waitFor(() =>
      expect(content.contains(document.activeElement)).toBe(true),
    );

    const outside = document.querySelector<HTMLElement>("button")!;
    outside.focus();

    expect(content.contains(document.activeElement)).toBe(true);
  });

  it("preserves consumer styles without losing its overlay layer", async () => {
    render(
      <Modal open style={{ backgroundColor: "red", zIndex: 1 }}>
        <Modal.Content>Dialog</Modal.Content>
      </Modal>,
    );

    await waitFor(() => {
      const root = document.querySelector<HTMLElement>(".gs-modal")!;
      expect(root.style.backgroundColor).toBe("red");
      expect(root.style.zIndex).toContain("var(--z-modal)");
      expect(root.classList.contains("fixed")).toBe(true);
      expect(
        root
          .querySelector(".gs-modal-overlay")
          ?.classList.contains("animate-gs-modal-overlay-in"),
      ).toBe(true);
    });
  });

  it("maps fullscreen content to Tailwind ancestor variants", async () => {
    render(
      <Modal open size="fullscreen">
        <Modal.Content>Dialog</Modal.Content>
      </Modal>,
    );

    await waitFor(() => {
      const content = document.querySelector(".gs-modal-content")!;
      expect(
        content.classList.contains("[[data-size=fullscreen]_&]:size-full"),
      ).toBe(true);
      expect(content.classList.contains("animate-gs-modal-content-in")).toBe(
        true,
      );
    });
  });

  it("keeps dialog regions stable across responsive layouts", async () => {
    render(
      <Modal open>
        <Modal.Content>
          <Modal.Header>
            <Modal.Title>Settings</Modal.Title>
            <Modal.Description>Update your workspace.</Modal.Description>
          </Modal.Header>
          <Modal.Body>Content</Modal.Body>
          <Modal.Footer>Actions</Modal.Footer>
        </Modal.Content>
      </Modal>,
    );

    await waitFor(() => {
      const overlay = document.querySelector(".gs-modal-overlay")!;
      const content = document.querySelector(".gs-modal-content")!;
      const body = document.querySelector(".gs-modal-body")!;
      const footer = document.querySelector(".gs-modal-footer")!;
      const close = document.querySelector(".gs-modal-close")!;

      expect(overlay.classList.contains("items-end")).toBe(true);
      expect(overlay.classList.contains("sm:items-center")).toBe(true);
      expect(content.classList.contains("relative")).toBe(true);
      expect(content.classList.contains("overflow-hidden")).toBe(true);
      expect(content.classList.contains("p-gs-6")).toBe(true);
      expect(body.classList.contains("overflow-y-auto")).toBe(true);
      expect(footer.classList.contains("mt-gs-5")).toBe(true);
      expect(close.classList.contains("absolute")).toBe(true);
      expect(close.classList.contains("active:scale-95")).toBe(true);
      expect(close.classList.contains("motion-reduce:transition-none")).toBe(
        true,
      );
    });
  });

  it("does not focus a disconnected restoration target", async () => {
    const target = document.createElement("button");
    const focus = vi.spyOn(target, "focus");
    const finalFocusRef = { current: target };
    const { rerender } = render(
      <Modal open finalFocusRef={finalFocusRef}>
        <Modal.Content>Dialog</Modal.Content>
      </Modal>,
    );
    await waitFor(() =>
      expect(document.querySelector(".gs-modal")).not.toBeNull(),
    );

    rerender(
      <Modal open={false} finalFocusRef={finalFocusRef}>
        <Modal.Content>Dialog</Modal.Content>
      </Modal>,
    );

    expect(focus).not.toHaveBeenCalled();
  });

  it("does not tear down an open layer when callbacks change", async () => {
    const outside = document.createElement("button");
    document.body.append(outside);
    outside.focus();
    const focus = vi.spyOn(outside, "focus");
    const { rerender } = render(
      <Modal open onOpenChange={() => {}}>
        <Modal.Content>Dialog</Modal.Content>
      </Modal>,
    );
    await waitFor(() =>
      expect(document.querySelector(".gs-modal")).not.toBeNull(),
    );
    focus.mockClear();

    rerender(
      <Modal open onOpenChange={() => {}}>
        <Modal.Content>Dialog</Modal.Content>
      </Modal>,
    );

    expect(focus).not.toHaveBeenCalled();
    outside.remove();
  });

  it("transfers its root node when the ref prop changes", async () => {
    const firstRef = vi.fn();
    const secondRef = vi.fn();
    const { rerender } = render(
      <Modal ref={firstRef} open>
        <Modal.Content>Dialog</Modal.Content>
      </Modal>,
    );
    await waitFor(() => expect(firstRef).toHaveBeenCalledOnce());
    const root = document.querySelector(".gs-modal");

    rerender(
      <Modal ref={secondRef} open>
        <Modal.Content>Dialog</Modal.Content>
      </Modal>,
    );

    expect(firstRef).toHaveBeenLastCalledWith(null);
    expect(secondRef).toHaveBeenCalledOnce();
    expect(secondRef).toHaveBeenLastCalledWith(root);
  });

  it("composes content click handlers", async () => {
    const onClick = vi.fn();
    render(
      <Modal open>
        <Modal.Content onClick={onClick}>Dialog</Modal.Content>
      </Modal>,
    );
    await waitFor(() =>
      expect(document.querySelector(".gs-modal-content")).not.toBeNull(),
    );

    fireEvent.click(document.querySelector(".gs-modal-content")!);

    expect(onClick).toHaveBeenCalledOnce();
    expect(document.querySelector(".gs-modal")).not.toBeNull();
  });

  it("keeps its content ref stable while open props update", async () => {
    const ref = vi.fn();
    const renderModal = (className: string) => (
      <Modal open>
        <Modal.Content ref={ref} className={className}>
          Dialog
        </Modal.Content>
      </Modal>
    );
    const { rerender } = render(renderModal("initial"));
    await waitFor(() => expect(ref).toHaveBeenCalledOnce());
    const content = document.querySelector(".gs-modal-content");

    rerender(renderModal("updated"));

    expect(ref).toHaveBeenCalledOnce();
    expect(ref).toHaveBeenLastCalledWith(content);
  });

  it("does not reference empty header labels", async () => {
    render(
      <Modal open>
        <Modal.Content aria-label="Fallback">
          <Modal.Header />
        </Modal.Content>
      </Modal>,
    );

    await waitFor(() => {
      const content = document.querySelector(".gs-modal-content")!;
      expect(content.getAttribute("aria-labelledby")).toBeNull();
      expect(content.getAttribute("aria-describedby")).toBeNull();
    });
  });

  it("lets consumers cancel Escape and overlay dismissal", async () => {
    const onEscapeKeyDown = vi.fn((event: KeyboardEvent) =>
      event.preventDefault(),
    );
    const onOverlayClick = vi.fn((event: React.MouseEvent) =>
      event.preventDefault(),
    );
    render(
      <Modal
        open
        onEscapeKeyDown={onEscapeKeyDown}
        onOverlayClick={onOverlayClick}
      >
        <Modal.Content>Dialog</Modal.Content>
      </Modal>,
    );
    await waitFor(() =>
      expect(document.querySelector(".gs-modal-overlay")).not.toBeNull(),
    );

    fireEvent.keyDown(document, { key: "Escape" });
    fireEvent.click(document.querySelector(".gs-modal-overlay")!);

    expect(onEscapeKeyDown).toHaveBeenCalledOnce();
    expect(onOverlayClick).toHaveBeenCalledOnce();
    expect(document.querySelector(".gs-modal")).not.toBeNull();
  });

  it("runs autofocus lifecycle callbacks without rebuilding the layer", async () => {
    const initialFocusRef = createRef<HTMLInputElement>();
    const onOpenAutoFocus = vi.fn();
    const onCloseAutoFocus = vi.fn();
    const renderModal = (open: boolean) => (
      <>
        <button data-testid="outside">Outside</button>
        <Modal
          open={open}
          initialFocusRef={initialFocusRef}
          onOpenAutoFocus={onOpenAutoFocus}
          onCloseAutoFocus={onCloseAutoFocus}
        >
          <Modal.Content>
            <input ref={initialFocusRef} aria-label="Initial" />
          </Modal.Content>
        </Modal>
      </>
    );
    const { rerender } = render(renderModal(false));
    const outside = document.querySelector<HTMLElement>(
      '[data-testid="outside"]',
    )!;
    outside.focus();
    rerender(renderModal(true));

    await waitFor(() =>
      expect(document.activeElement).toBe(initialFocusRef.current),
    );
    expect(onOpenAutoFocus).toHaveBeenCalledOnce();

    rerender(renderModal(false));
    await waitFor(() => expect(document.activeElement).toBe(outside));
    expect(onCloseAutoFocus).toHaveBeenCalledOnce();
  });
});
