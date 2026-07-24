// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useLayoutEffect } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  useControllableState,
  useEventCallback,
  useThemeToggle,
} from "./index";

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  document.documentElement.classList.remove("light", "dark");
  document.documentElement.removeAttribute("data-theme");
  vi.unstubAllGlobals();
});

function Harness({
  value,
  defaultValue = "initial",
  onChange,
}: {
  value?: string;
  defaultValue?: string;
  onChange?: (next: string) => void;
}) {
  const [current, setCurrent] = useControllableState({
    value,
    defaultValue,
    onChange,
  });
  return (
    <>
      <output>{current}</output>
      <button onClick={() => setCurrent("next")}>Set next</button>
      <button onClick={() => setCurrent((previous) => `${previous}!`)}>
        Update
      </button>
    </>
  );
}

describe("useControllableState", () => {
  it("updates uncontrolled state and supports functional setters", () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Update" }));
    expect(screen.getByText("initial!")).not.toBeNull();
    expect(onChange).toHaveBeenCalledWith("initial!");
  });

  it("does not notify when the resolved value is unchanged", () => {
    const onChange = vi.fn();
    render(<Harness value="next" onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Set next" }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("preserves the last controlled value when changing modes", () => {
    const { rerender } = render(<Harness value="controlled" />);
    rerender(<Harness />);

    expect(screen.getByText("controlled")).not.toBeNull();
  });
});

describe("useEventCallback", () => {
  it("uses the latest callback during layout effects", () => {
    const calls: string[] = [];
    function LayoutInvoker({ value }: { value: string }) {
      const invoke = useEventCallback(() => calls.push(value));
      useLayoutEffect(() => {
        invoke();
      }, [invoke, value]);
      return null;
    }

    const { rerender } = render(<LayoutInvoker value="first" />);
    rerender(<LayoutInvoker value="second" />);

    expect(calls).toEqual(["first", "second"]);
  });
});

function ThemeHarness({
  storageKey = "test-theme",
  persist = true,
}: {
  storageKey?: string;
  persist?: boolean;
}) {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useThemeToggle({
    storageKey,
    persist,
  });
  return (
    <>
      <output data-testid="theme">{theme}</output>
      <output data-testid="resolved-theme">{resolvedTheme}</output>
      <button onClick={toggleTheme}>Toggle theme</button>
      <button onClick={() => setTheme("light")}>Use light</button>
    </>
  );
}

describe("useThemeToggle", () => {
  it("resolves the system color preference by default", () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockReturnValue({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    );

    render(<ThemeHarness persist={false} />);
    expect(screen.getByTestId("theme").textContent).toBe("system");
    expect(screen.getByTestId("resolved-theme").textContent).toBe("dark");
  });

  it("loads and persists a theme preference", () => {
    window.localStorage.setItem("test-theme", "dark");
    render(<ThemeHarness />);

    expect(screen.getByTestId("theme").textContent).toBe("dark");
    fireEvent.click(screen.getByRole("button", { name: "Toggle theme" }));
    expect(screen.getByTestId("theme").textContent).toBe("light");
    expect(window.localStorage.getItem("test-theme")).toBe("light");
  });

  it("keeps server markup independent of stored browser preferences", () => {
    window.localStorage.setItem("test-theme", "dark");
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    try {
      const markup = renderToString(<ThemeHarness />);
      expect(markup).toContain('data-testid="theme">system');
    } finally {
      consoleError.mockRestore();
    }
  });

  it("applies the resolved theme to the document root", () => {
    render(<ThemeHarness persist={false} />);

    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(document.documentElement.classList.contains("light")).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: "Toggle theme" }));
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.classList.contains("light")).toBe(false);
  });

  it("can update without writing to storage", () => {
    render(<ThemeHarness persist={false} />);

    fireEvent.click(screen.getByRole("button", { name: "Toggle theme" }));
    expect(screen.getByTestId("theme").textContent).toBe("dark");
    expect(window.localStorage.getItem("test-theme")).toBeNull();
  });

  it("synchronizes valid theme changes from another tab", () => {
    render(<ThemeHarness />);

    fireEvent(
      window,
      new StorageEvent("storage", {
        key: "test-theme",
        newValue: "dark",
        storageArea: window.localStorage,
      }),
    );
    expect(screen.getByTestId("theme").textContent).toBe("dark");
  });

  it("restores the previous document writer when a newer writer unmounts", () => {
    function Writer({ theme }: { theme: "light" | "dark" }) {
      useThemeToggle({ defaultTheme: theme, persist: false });
      return null;
    }

    const { rerender, unmount } = render(
      <>
        <Writer theme="light" />
        <Writer theme="dark" />
      </>,
    );
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");

    rerender(<Writer theme="light" />);
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");

    unmount();
    expect(document.documentElement.hasAttribute("data-theme")).toBe(false);
  });
});
