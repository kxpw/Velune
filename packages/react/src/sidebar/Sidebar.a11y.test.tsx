// @vitest-environment jsdom

import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Sidebar } from "./Sidebar";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

beforeEach(() => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
      onchange: null,
    })),
  );
});

describe("Sidebar a11y", () => {
  it("exposes a named navigation landmark and trigger controls", () => {
    const { getByRole } = render(
      <Sidebar.Provider>
        <Sidebar collapsible="icon" aria-label="Main">
          <Sidebar.Content>
            <Sidebar.Menu>
              <Sidebar.MenuItem>
                <Sidebar.MenuButton current>Home</Sidebar.MenuButton>
              </Sidebar.MenuItem>
            </Sidebar.Menu>
          </Sidebar.Content>
        </Sidebar>
        <main className="relative flex min-h-full min-w-gs-0 flex-1 flex-col">
          <Sidebar.Trigger />
        </main>
      </Sidebar.Provider>,
    );

    expect(getByRole("navigation", { name: "Main" })).not.toBeNull();
    const trigger = getByRole("button", { name: "Collapse sidebar" });
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(trigger.getAttribute("aria-controls")).toBeTruthy();
    expect(trigger.getAttribute("data-state")).toBe("expanded");
    expect(
      getByRole("button", { name: "Home" }).getAttribute("aria-current"),
    ).toBe("page");
  });
});
