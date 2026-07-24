// @vitest-environment jsdom

import { act, StrictMode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { generateTheme, getThemeCss, themeTokens } from "velune/react";
import { ThemePlaygroundPage } from "./ThemePlaygroundPage";

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  (
    globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
  ).IS_REACT_ACT_ENVIRONMENT = true;
  window.history.replaceState(null, "", "/theme-playground");
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => {
    root.unmount();
  });
  container.remove();
  window.history.replaceState(null, "", "/");
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: undefined,
  });
  vi.restoreAllMocks();
});

async function renderPage() {
  await act(async () => {
    root.render(
      <StrictMode>
        <ThemePlaygroundPage />
      </StrictMode>,
    );
  });
}

async function click(element: Element | null | undefined) {
  if (!element) throw new Error("Expected a clickable element");
  await act(async () => {
    element.dispatchEvent(
      new MouseEvent("click", { bubbles: true, cancelable: true }),
    );
  });
}

async function setInputValue(input: HTMLInputElement, value: string) {
  const setValue = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    "value",
  )!.set!;
  await act(async () => {
    setValue.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

function findButton(
  label: string,
  rootNode: ParentNode = container,
): HTMLButtonElement | undefined {
  return Array.from(rootNode.querySelectorAll<HTMLButtonElement>("button")).find(
    (button) => (button.textContent ?? "").trim() === label,
  );
}

function findButtonByLabel(
  label: string,
  rootNode: ParentNode = container,
): HTMLButtonElement | undefined {
  return Array.from(rootNode.querySelectorAll<HTMLButtonElement>("button")).find(
    (button) => button.getAttribute("aria-label") === label,
  );
}

function findOption(label: string): HTMLElement | undefined {
  return Array.from(
    document.querySelectorAll<HTMLElement>('[role="option"]'),
  ).find((option) => {
    const text = (option.textContent ?? "").replace(/\s+/g, " ").trim();
    return (
      text === label ||
      text.startsWith(label) ||
      option.getAttribute("aria-label") === label
    );
  });
}

function fieldValue(label: string): string {
  return findButtonByLabel(label)?.textContent ?? "";
}

async function openField(label: string) {
  await click(findButtonByLabel(label));
}

async function pickOption(
  field: string,
  option: string | (() => Element | undefined),
) {
  await openField(field);
  if (typeof option === "string") {
    await click(findOption(option));
    return;
  }
  await click(option());
}

function getPreview() {
  return container.querySelector<HTMLElement>(
    '[data-testid="theme-playground-preview"]',
  );
}

function getPlayground() {
  return container.querySelector<HTMLElement>(
    '[data-testid="theme-playground"]',
  );
}

function installClipboard() {
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText },
  });
  return writeText;
}

describe("ThemePlaygroundPage", () => {
  it("applies the generated theme and preview-level tokens", async () => {
    await renderPage();

    const colorInput = container.querySelector<HTMLInputElement>(
      'input[type="color"]',
    );
    expect(colorInput?.value).toBe("#96683f");

    const preview = getPreview();
    const playground = getPlayground();
    const expected = generateTheme({ brand: "#96683f" });
    expect(preview?.style.getPropertyValue("--color-primary")).toBe(
      expected.cssVars.light["--color-primary"],
    );
    expect(preview?.style.getPropertyValue("--color-brand-400")).toBe(
      expected.scale["400"],
    );
    expect(preview?.style.getPropertyValue("--color-action-hover")).toBe(
      expected.cssVars.light["--color-action-hover"],
    );
    expect(preview?.style.getPropertyValue("--color-on-primary")).toBe(
      expected.cssVars.light["--color-on-primary"],
    );
    for (const [name, value] of Object.entries(themeTokens.component)) {
      expect(preview?.style.getPropertyValue(`--${name}`)).toBe(value);
    }
    expect(preview?.style.getPropertyValue("--radius-sm")).toBe("10px");
    expect(preview?.style.getPropertyValue("--font-family-sans")).toContain(
      "Inter",
    );
    expect(playground?.style.getPropertyValue("--color-primary")).toBe("");
    expect(playground?.getAttribute("data-theme")).toBeNull();
  });

  it("restores every setting from a reproducible URL", async () => {
    window.history.replaceState(
      null,
      "",
      "/theme-playground?brand=%232463eb&mood=warm&base=slate&contrast=AAA&mode=dark&preview=dashboard&radius=round&font=serif",
    );

    await renderPage();

    const preview = getPreview();
    const expected = generateTheme({
      brand: "#2463eb",
      mood: "warm",
      base: "slate",
      contrastRatio: "AAA",
    });
    expect(preview?.getAttribute("data-theme")).toBe("dark");
    expect(preview?.style.getPropertyValue("--color-primary")).toBe(
      expected.cssVars.dark["--color-primary"],
    );
    expect(preview?.style.getPropertyValue("--radius-sm")).toBe("22px");
    expect(preview?.style.getPropertyValue("--font-family-sans")).toContain(
      "Source Serif",
    );
    expect(container.textContent).toContain("Good morning, Maya");
    expect(fieldValue("Mood")).toContain("Warm");
    expect(fieldValue("Base")).toContain("Slate");
    expect(fieldValue("Radius")).toContain("Round");
    expect(fieldValue("Font")).toContain("Source Serif");
    expect(fieldValue("Contrast")).toContain("WCAG AAA");
  });

  it("updates color, mood, contrast, mode, radius, font, and URL", async () => {
    await renderPage();
    const colorInput = container.querySelector<HTMLInputElement>(
      'input[type="color"]',
    )!;

    await setInputValue(colorInput, "#0055ff");
    await pickOption("Mood", "Futuristic");
    await pickOption("Base", "Use Slate base palette");
    await pickOption("Contrast", "WCAG AAA");
    await click(findButtonByLabel("Dark"));
    await pickOption("Radius", "Soft");
    await pickOption("Font", "Source Serif");

    const expected = generateTheme({
      brand: "#0055ff",
      mood: "futuristic",
      base: "slate",
      contrastRatio: "AAA",
    });
    const preview = getPreview();
    const playground = getPlayground();
    expect(preview?.getAttribute("data-theme")).toBe("dark");
    expect(preview?.style.getPropertyValue("--color-primary")).toBe(
      expected.cssVars.dark["--color-primary"],
    );
    expect(preview?.style.getPropertyValue("--radius-sm")).toBe("16px");
    expect(preview?.style.getPropertyValue("--font-family-sans")).toContain(
      "Source Serif",
    );
    expect(playground?.getAttribute("data-theme")).toBeNull();
    expect(playground?.style.getPropertyValue("--color-primary")).toBe("");

    const params = new URLSearchParams(window.location.search);
    expect(Object.fromEntries(params)).toMatchObject({
      brand: "0055ff",
      mood: "futuristic",
      base: "slate",
      contrast: "AAA",
      mode: "dark",
      radius: "soft",
      font: "serif",
    });

    await click(findButtonByLabel("High contrast"));
    expect(preview?.getAttribute("data-theme")).toBe("light");
    expect(preview?.getAttribute("data-high-contrast")).toBe("true");
    expect(preview?.style.getPropertyValue("--color-primary")).toBe(
      expected.cssVars.highContrast["--color-primary"],
    );
    expect(playground?.getAttribute("data-high-contrast")).toBeNull();
    expect(playground?.style.getPropertyValue("--color-primary")).toBe("");
    for (const [name, value] of Object.entries(
      themeTokens.componentHighContrast,
    )) {
      expect(preview?.style.getPropertyValue(`--${name}`)).toBe(value);
    }

    await click(findButtonByLabel("Light"));
    expect(preview?.getAttribute("data-high-contrast")).toBeNull();
  });

  it("tints only the preview background with the selected brand color", async () => {
    await renderPage();
    const playground = getPlayground();
    const preview = getPreview();

    expect(playground?.style.getPropertyValue("--color-canvas")).toBe("");
    expect(preview?.style.getPropertyValue("--color-canvas")).toBe(
      "color-mix(in oklab, #F7F2E8 94%, var(--color-primary) 6%)",
    );

    await click(findButtonByLabel("Use Jade brand color"));
    expect(preview?.style.getPropertyValue("--color-canvas")).toBe(
      "color-mix(in oklab, #F7F2E8 94%, var(--color-primary) 6%)",
    );
    expect(preview?.style.getPropertyValue("--color-primary")).toBe(
      generateTheme({ brand: "#16805c" }).cssVars.light["--color-primary"],
    );
    expect(playground?.style.getPropertyValue("--color-primary")).toBe("");

    await click(findButtonByLabel("High contrast"));
    expect(preview?.style.getPropertyValue("--color-canvas")).toBe("#FFFFFF");
    expect(playground?.getAttribute("data-high-contrast")).toBeNull();
  });

  it("uses the active theme inside the portalled export dialog", async () => {
    await renderPage();
    await click(findButtonByLabel("Use Cobalt brand color"));
    await click(findButtonByLabel("Dark"));
    await click(findButton("Export"));

    const modal = document.querySelector<HTMLElement>('[role="dialog"]');
    const overlay = modal?.closest<HTMLElement>("[data-gs-overlay-branch]");
    const expected = generateTheme({ brand: "#2463eb" });
    expect(overlay?.getAttribute("data-theme")).toBe("dark");
    expect(overlay?.style.getPropertyValue("--color-primary")).toBe(
      expected.cssVars.dark["--color-primary"],
    );
    expect(overlay?.style.getPropertyValue("--color-on-primary")).toBe(
      expected.cssVars.dark["--color-on-primary"],
    );
  });

  it("supports undo, redo, and reset", async () => {
    await renderPage();
    const hexInput = container.querySelector<HTMLInputElement>(
      'input[aria-label="Brand color hex value"]',
    )!;
    const undo = findButtonByLabel("Undo")!;
    const redo = findButtonByLabel("Redo")!;

    expect(undo.disabled).toBe(true);
    await click(findButtonByLabel("Use Cobalt brand color"));
    await pickOption("Base", "Use Slate base palette");
    await pickOption("Mood", "Futuristic");

    await click(undo);
    expect(fieldValue("Mood")).toContain("Porcelain");
    expect(fieldValue("Base")).toContain("Slate");
    expect(hexInput.value).toBe("#2463eb");

    await click(undo);
    expect(fieldValue("Base")).toContain("Porcelain");
    expect(hexInput.value).toBe("#2463eb");

    await click(undo);
    expect(hexInput.value).toBe("#96683f");

    await click(redo);
    expect(hexInput.value).toBe("#2463eb");

    await click(findButtonByLabel("Reset theme"));
    expect(hexInput.value).toBe("#96683f");
    expect(fieldValue("Base")).toContain("Porcelain");
    expect(fieldValue("Contrast")).toContain("WCAG AA");
  });

  it("switches between component, dashboard, and form previews", async () => {
    await renderPage();

    expect(container.textContent).toContain("Component catalog");
    expect(
      container.querySelector('[data-testid="theme-playground-catalog"]'),
    ).toBeTruthy();
    await click(findButton("Dashboard"));
    expect(container.textContent).toContain("Good morning, Maya");
    expect(container.textContent).not.toContain("Component catalog");

    await click(findButton("Forms"));
    expect(container.textContent).toContain("Create your workspace");
    expect(container.querySelector('[role="tabpanel"]')?.textContent).toContain(
      "Notifications",
    );
    expect(new URLSearchParams(window.location.search).get("preview")).toBe(
      "forms",
    );
  });

  it("shows validation feedback and disables export for an invalid Hex value", async () => {
    await renderPage();
    const hexInput = container.querySelector<HTMLInputElement>(
      'input[aria-label="Brand color hex value"]',
    )!;

    await setInputValue(hexInput, "#12");

    expect(hexInput.getAttribute("aria-invalid")).toBe("true");
    expect(container.textContent).toContain("Use a six-digit Hex color.");
    expect(findButton("Export")?.disabled).toBe(true);
  });

  it("copies the current reproducible URL", async () => {
    const writeText = installClipboard();
    await renderPage();

    const expectedUrl = window.location.href;
    await click(findButtonByLabel("Copy share link"));

    expect(writeText).toHaveBeenCalledWith(expectedUrl);
    expect(findButtonByLabel("Share link copied")).toBeTruthy();
  });

  it("exports generated CSS and React provider configuration", async () => {
    const writeText = installClipboard();
    await renderPage();
    await click(findButton("Export"));

    const dialog = document.querySelector<HTMLElement>('[role="dialog"]');
    expect(dialog?.textContent).toContain("Export theme");

    await click(findButton("Copy CSS", dialog!));
    const copiedCss = writeText.mock.calls[0]?.[0] as string;
    expect(copiedCss).toContain(
      getThemeCss(generateTheme({ brand: "#96683f" })),
    );
    expect(copiedCss).toContain('@import "velune/react/theme/base.css";');
    expect(copiedCss).toContain("--radius-sm: 10px;");

    await click(findButton("React", dialog!));
    await click(findButton("Copy React", dialog!));
    expect(writeText.mock.calls[1]?.[0]).toContain("<ThemeProvider");
    expect(writeText.mock.calls[1]?.[0]).toContain(
      'brandColor="#96683f"',
    );
    expect(writeText.mock.calls[1]?.[0]).toContain('base="porcelain"');
    expect(writeText.mock.calls[1]?.[0]).toContain('theme="light"');
  });

  it("exports the selected UI mode to ThemeProvider", async () => {
    await renderPage();
    await click(findButtonByLabel("Dark"));
    await click(findButton("Export"));

    const dialog = document.querySelector<HTMLElement>('[role="dialog"]');
    await click(findButton("React", dialog!));
    expect(dialog?.textContent).toContain('theme="dark"');

    await click(findButtonByLabel("Close", document));
    await click(findButtonByLabel("High contrast"));
    await click(findButton("Export"));
    const highContrastDialog = document.querySelector<HTMLElement>(
      '[role="dialog"]',
    );
    await click(findButton("React", highContrastDialog!));
    expect(highContrastDialog?.textContent).toMatch(
      /theme="light"\s+highContrast/,
    );
  });
});
