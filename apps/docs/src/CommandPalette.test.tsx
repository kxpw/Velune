// @vitest-environment jsdom

import { act, useCallback, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CommandPalette } from "./CommandPalette";
import {
  filterSearchEntries,
  searchEntries,
  useCommandPaletteShortcut,
  type SearchEntry,
} from "./search";

function Harness({
  onNavigate,
}: {
  onNavigate: (entry: SearchEntry) => void;
}) {
  const [open, setOpen] = useState(false);
  useCommandPaletteShortcut(useCallback(() => setOpen((value) => !value), []));
  return (
    <CommandPalette
      open={open}
      onOpenChange={setOpen}
      onNavigate={onNavigate}
    />
  );
}

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  (
    globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
  ).IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => {
    root.unmount();
  });
  container.remove();
});

async function render(ui: React.ReactElement) {
  await act(async () => {
    root.render(ui);
  });
}

async function nextFrame() {
  await act(async () => {
    await new Promise((resolve) => {
      requestAnimationFrame(() => resolve(null));
    });
  });
}

async function pressKey(target: EventTarget, init: KeyboardEventInit) {
  await act(async () => {
    target.dispatchEvent(
      new KeyboardEvent("keydown", { bubbles: true, cancelable: true, ...init }),
    );
  });
}

async function typeQuery(input: HTMLInputElement, value: string) {
  const setValue = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    "value",
  )!.set!;
  await act(async () => {
    setValue.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

const getDialog = () => document.querySelector('[role="dialog"]');
const getInput = () =>
  document.querySelector('input[role="combobox"]') as HTMLInputElement;
const getOptions = () =>
  Array.from(document.querySelectorAll<HTMLElement>('[role="option"]'));
const getActiveOption = () =>
  document.querySelector<HTMLElement>('[role="option"][aria-selected="true"]');

describe("search index", () => {
  it("indexes component pages and static pages", () => {
    const ids = searchEntries.map((entry) => entry.id);
    expect(ids).toContain("component:button");
    expect(ids).toContain("page:/tokens");
    expect(ids).toContain("page:/docs/getting-started");
    expect(ids).toContain("page:/theme-playground");
  });

  it("filters by name, description, and category", () => {
    const byName = filterSearchEntries("checkbox");
    expect(byName.some((entry) => entry.title === "Checkbox")).toBe(true);

    const byCategory = filterSearchEntries("overlays");
    expect(byCategory.length).toBeGreaterThan(0);
    expect(byCategory.every((entry) => entry.haystack.includes("overlays"))).toBe(
      true,
    );

    expect(filterSearchEntries("zzz-no-match")).toHaveLength(0);
    expect(filterSearchEntries("")).toHaveLength(searchEntries.length);
  });

  it("ranks title matches before description matches", () => {
    const results = filterSearchEntries("table");
    expect(results[0]?.title).toBe("Table");
  });

  it("matches multi-word queries regardless of word order", () => {
    const results = filterSearchEntries("dark theme");
    expect(results.some((entry) => entry.to === "/docs/theme")).toBe(true);
  });
});

describe("CommandPalette", () => {
  it("opens with Ctrl+K, focuses the input, and closes with Escape", async () => {
    await render(<Harness onNavigate={() => undefined} />);
    expect(getDialog()).toBeNull();

    await pressKey(window, { key: "k", ctrlKey: true });
    const dialog = getDialog();
    expect(dialog).not.toBeNull();
    expect(dialog?.getAttribute("aria-modal")).toBe("true");

    await nextFrame();
    expect(document.activeElement).toBe(getInput());

    await pressKey(document, { key: "Escape" });
    expect(getDialog()).toBeNull();
  });

  it("toggles when the shortcut is pressed again", async () => {
    await render(<Harness onNavigate={() => undefined} />);
    await pressKey(window, { key: "k", metaKey: true });
    expect(getDialog()).not.toBeNull();
    await pressKey(window, { key: "k", metaKey: true });
    expect(getDialog()).toBeNull();
  });

  it("filters results as the query changes", async () => {
    await render(<Harness onNavigate={() => undefined} />);
    await pressKey(window, { key: "k", ctrlKey: true });
    expect(getOptions().length).toBe(searchEntries.length);

    await typeQuery(getInput(), "design tokens");
    const titles = getOptions().map((option) => option.textContent);
    expect(titles.some((title) => title?.includes("Design tokens"))).toBe(true);
    expect(getOptions().length).toBeLessThan(searchEntries.length);

    await typeQuery(getInput(), "zzz-no-match");
    expect(getOptions()).toHaveLength(0);
    expect(document.querySelector('[role="status"]')?.textContent).toContain(
      "No results",
    );
  });

  it("moves the selection with arrow keys and keeps aria in sync", async () => {
    await render(<Harness onNavigate={() => undefined} />);
    await pressKey(window, { key: "k", ctrlKey: true });
    const input = getInput();

    const first = getOptions()[0]!;
    expect(getActiveOption()).toBe(first);
    expect(input.getAttribute("aria-activedescendant")).toBe(first.id);

    await pressKey(input, { key: "ArrowDown" });
    const second = getOptions()[1]!;
    expect(getActiveOption()).toBe(second);
    expect(input.getAttribute("aria-activedescendant")).toBe(second.id);

    await pressKey(input, { key: "ArrowUp" });
    expect(getActiveOption()).toBe(getOptions()[0]);
  });

  it("navigates to the selected entry on Enter and closes", async () => {
    const onNavigate = vi.fn();
    await render(<Harness onNavigate={onNavigate} />);
    await pressKey(window, { key: "k", ctrlKey: true });

    await typeQuery(getInput(), "button");
    const expected = filterSearchEntries("button")[0]!;

    await pressKey(getInput(), { key: "Enter" });
    expect(onNavigate).toHaveBeenCalledTimes(1);
    expect(onNavigate).toHaveBeenCalledWith(
      expect.objectContaining({ id: expected.id }),
    );
    expect(getDialog()).toBeNull();
  });

  it("navigates when a result is clicked", async () => {
    const onNavigate = vi.fn();
    await render(<Harness onNavigate={onNavigate} />);
    await pressKey(window, { key: "k", ctrlKey: true });

    await typeQuery(getInput(), "quick start");
    const option = getOptions()[0]!;
    await act(async () => {
      option.dispatchEvent(
        new MouseEvent("click", { bubbles: true, cancelable: true }),
      );
    });

    expect(onNavigate).toHaveBeenCalledWith(
      expect.objectContaining({ kind: "page", to: "/docs/quick-start" }),
    );
    expect(getDialog()).toBeNull();
  });
});
