// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { ThemeToggle } from "./ThemeToggle";

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  document.documentElement.classList.remove("light", "dark");
  document.documentElement.removeAttribute("data-theme");
});

describe("ThemeToggle", () => {
  it("switches the document theme and updates its accessible name", () => {
    render(<ThemeToggle defaultTheme="light" persist={false} />);

    const toggle = screen.getByRole("button", { name: "Switch to dark theme" });
    fireEvent.click(toggle);

    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(
      screen.getByRole("button", { name: "Switch to light theme" }),
    ).toBeTruthy();
  });

  it("supports a controlled theme value", () => {
    function ControlledToggle() {
      const [theme, setTheme] = useState<"light" | "dark">("light");
      return (
        <ThemeToggle
          theme={theme}
          onThemeChange={(nextTheme) => {
            if (nextTheme !== "system") setTheme(nextTheme);
          }}
        />
      );
    }

    render(<ControlledToggle />);
    fireEvent.click(
      screen.getByRole("button", { name: "Switch to dark theme" }),
    );

    expect(
      screen.getByRole("button", { name: "Switch to light theme" }),
    ).toBeTruthy();
  });

  it("resolves a controlled system theme independently of storage", () => {
    window.localStorage.setItem("velune-theme", "dark");

    render(<ThemeToggle theme="system" />);

    expect(
      screen.getByRole("button", { name: "Switch to dark theme" }),
    ).toBeTruthy();
  });
});
