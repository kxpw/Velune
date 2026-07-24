// @vitest-environment jsdom

import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Portal } from "../shared/portal";
import { generateTheme, ThemeProvider } from "./index";

afterEach(() => {
  cleanup();
  document.documentElement.removeAttribute("data-theme");
});

describe("ThemeProvider", () => {
  it("preserves system as an explicit data-theme value", () => {
    document.documentElement.setAttribute("data-theme", "light");
    const { container, unmount } = render(
      <ThemeProvider theme="system">Content</ThemeProvider>,
    );

    expect(document.documentElement.getAttribute("data-theme")).toBe("system");
    expect(container.firstElementChild?.getAttribute("data-theme")).toBe(
      "system",
    );

    unmount();
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  it("passes the selected base palette to generated themes", () => {
    const { container } = render(
      <ThemeProvider theme="light" brandColor="#2463eb" base="slate">
        Content
      </ThemeProvider>,
    );

    expect(
      document.documentElement.style.getPropertyValue("--color-canvas"),
    ).toBe("#F8FAFC");
    expect(container.firstElementChild?.getAttribute("data-brand")).toBe(
      "true",
    );
  });

  it("applies high-contrast tokens when dark mode is also selected", () => {
    const { container } = render(
      <ThemeProvider theme="dark" highContrast brandColor="#2463eb">
        Content
      </ThemeProvider>,
    );

    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(document.documentElement.getAttribute("data-high-contrast")).toBe(
      "true",
    );
    expect(
      document.documentElement.style.getPropertyValue("--color-canvas"),
    ).toBe("#FFFFFF");
    expect(container.firstElementChild?.getAttribute("data-theme")).toBe(
      "dark",
    );
  });

  it("restores the outer portal theme after an inner provider unmounts", () => {
    const outer = generateTheme({ brand: "#96683f" });
    const inner = generateTheme({ brand: "#2463eb" });

    function Providers({ showInner }: { showInner: boolean }) {
      return (
        <ThemeProvider theme="light" brandColor="#96683f">
          {showInner ? (
            <ThemeProvider theme="dark" brandColor="#2463eb">
              Inner
            </ThemeProvider>
          ) : null}
        </ThemeProvider>
      );
    }

    const { rerender } = render(<Providers showInner />);
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(
      document.documentElement.style.getPropertyValue("--color-primary"),
    ).toBe(inner.cssVars.dark["--color-primary"]);

    rerender(<Providers showInner={false} />);
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(
      document.documentElement.style.getPropertyValue("--color-primary"),
    ).toBe(outer.cssVars.light["--color-primary"]);
  });

  it("preserves overlapping custom tokens when a generated theme is removed", () => {
    const customTokens = { "--color-primary": "pink" };
    const { container, rerender } = render(
      <ThemeProvider brandColor="#2463eb" customTokens={customTokens}>
        Content
      </ThemeProvider>,
    );
    const root = container.firstElementChild as HTMLElement;

    rerender(
      <ThemeProvider customTokens={customTokens}>Content</ThemeProvider>,
    );

    expect(root.style.getPropertyValue("--color-primary")).toBe("pink");
  });

  it("keeps a portal on its originating provider theme", () => {
    const outer = generateTheme({ brand: "#96683f" });
    render(
      <ThemeProvider theme="light" brandColor="#96683f">
        <Portal>
          <span data-testid="outer-portal">Outer portal</span>
        </Portal>
        <ThemeProvider theme="dark" brandColor="#2463eb">
          Inner
        </ThemeProvider>
      </ThemeProvider>,
    );

    const portalRoot = document
      .querySelector('[data-testid="outer-portal"]')
      ?.closest(".gs-portal-theme-root") as HTMLElement;
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(portalRoot.getAttribute("data-theme")).toBe("light");
    expect(portalRoot.style.getPropertyValue("--color-primary")).toBe(
      outer.cssVars.light["--color-primary"],
    );
  });
});
