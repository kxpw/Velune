// @vitest-environment jsdom

import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ThemeProvider } from "./index";

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
});
