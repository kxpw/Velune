// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createRef, useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Sidebar, useSidebar } from "./Sidebar";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function mockDesktop() {
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
}

function mockMobile() {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => ({
      matches: String(query).includes("max-width"),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
      onchange: null,
    })),
  );
}

function DemoSidebar({
  open,
  defaultOpen = true,
  onOpenChange,
  collapsible = "icon" as const,
}: {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  collapsible?: "icon" | "offcanvas" | "none";
}) {
  return (
    <Sidebar.Provider
      {...(open !== undefined ? { open } : {})}
      defaultOpen={defaultOpen}
      {...(onOpenChange ? { onOpenChange } : {})}
    >
      <Sidebar collapsible={collapsible}>
        <Sidebar.Header>Brand</Sidebar.Header>
        <Sidebar.Content>
          <Sidebar.Group>
            <Sidebar.GroupLabel>Navigate</Sidebar.GroupLabel>
            <Sidebar.GroupContent>
              <Sidebar.Menu>
                <Sidebar.MenuItem>
                  <Sidebar.MenuButton current>
                    <span>Home</span>
                  </Sidebar.MenuButton>
                </Sidebar.MenuItem>
                <Sidebar.MenuItem>
                  <Sidebar.MenuButton as="a" href="#team">
                    <span>Team</span>
                  </Sidebar.MenuButton>
                  <Sidebar.MenuBadge>8</Sidebar.MenuBadge>
                </Sidebar.MenuItem>
                <Sidebar.MenuItem>
                  <Sidebar.MenuButton>
                    <span>Projects</span>
                  </Sidebar.MenuButton>
                  <Sidebar.MenuSub>
                    <Sidebar.MenuSubItem>
                      <Sidebar.MenuSubButton current>
                        Active
                      </Sidebar.MenuSubButton>
                    </Sidebar.MenuSubItem>
                  </Sidebar.MenuSub>
                </Sidebar.MenuItem>
              </Sidebar.Menu>
            </Sidebar.GroupContent>
          </Sidebar.Group>
        </Sidebar.Content>
        <Sidebar.Footer>Account</Sidebar.Footer>
      </Sidebar>
      <main className="relative flex min-h-full min-w-gs-0 flex-1 flex-col">
        <Sidebar.Trigger />
        <p>Main</p>
      </main>
    </Sidebar.Provider>
  );
}

describe("Sidebar", () => {
  beforeEach(() => {
    mockDesktop();
  });

  it("sets a readable displayName", () => {
    expect(Sidebar.displayName).toBe("Sidebar");
    expect(Sidebar.Provider.displayName).toBe("Sidebar.Provider");
    expect(Sidebar.Trigger.displayName).toBe("Sidebar.Trigger");
  });

  it("forwards refs on the panel and trigger", () => {
    const panelRef = createRef<HTMLDivElement>();
    const triggerRef = createRef<HTMLButtonElement>();
    render(
      <Sidebar.Provider>
        <Sidebar ref={panelRef} collapsible="none">
          <Sidebar.Content>Nav</Sidebar.Content>
        </Sidebar>
        <main className="relative flex min-h-full min-w-gs-0 flex-1 flex-col">
          <Sidebar.Trigger ref={triggerRef} />
        </main>
      </Sidebar.Provider>,
    );
    expect(panelRef.current).toBeInstanceOf(HTMLDivElement);
    expect(triggerRef.current).toBeInstanceOf(HTMLButtonElement);
  });

  it("marks the current menu button", () => {
    render(<DemoSidebar />);
    const home = screen.getByRole("button", { name: "Home" });
    expect(home.getAttribute("aria-current")).toBe("page");
    expect(home.getAttribute("data-current")).toBe("true");
    expect(home.className).toContain("data-[current=true]:bg-gs-surface-mist");
  });

  it('renders menu links with as="a"', () => {
    render(<DemoSidebar />);
    expect(
      screen.getByRole("link", { name: "Team" }).getAttribute("href"),
    ).toBe("#team");
  });

  it("toggles collapsed state from the trigger", () => {
    const onOpenChange = vi.fn();
    function Controlled() {
      const [open, setOpen] = useState(true);
      return (
        <DemoSidebar
          open={open}
          onOpenChange={(next) => {
            onOpenChange(next);
            setOpen(next);
          }}
        />
      );
    }
    render(<Controlled />);
    const trigger = screen.getByRole("button", { name: "Collapse sidebar" });
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    fireEvent.click(trigger);
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(
      screen
        .getByRole("button", { name: "Expand sidebar" })
        .getAttribute("aria-expanded"),
    ).toBe("false");
  });

  it("keeps accessible names when icon-collapsed", () => {
    render(<DemoSidebar defaultOpen={false} collapsible="icon" />);
    const home = screen.getByRole("button", { name: "Home" });
    expect(home.className).toContain("[&>span]:sr-only");
    expect(home.className).toContain("justify-center");
    expect(home.className).toContain("w-gs-10");
    // Badge/Action must not skew icon-rail padding.
    expect(home.className).not.toContain(
      "group-has-[[data-slot=sidebar-menu-badge]]/menu-item:pe-gs-12",
    );
    expect(screen.getByRole("link", { name: "Team" }).className).not.toContain(
      "group-has-[[data-slot=sidebar-menu-badge]]/menu-item:pe-gs-12",
    );
    expect(screen.getByText("8").className).toContain("hidden");
    expect(screen.getByText("Navigate").className).toContain("hidden");
    const panel = document.querySelector('[data-slot="sidebar"]');
    expect(panel?.className).toContain("overflow-hidden");
    const menu = document.querySelector('[data-slot="sidebar-menu"]');
    expect(menu?.className).toContain("items-center");
    const group = document.querySelector('[data-slot="sidebar-group"]');
    expect(group?.className).toContain("p-gs-0");
  });

  it("does not toggle a hidden submenu when icon-collapsed", () => {
    render(<DemoSidebar defaultOpen={false} collapsible="icon" />);
    const projects = screen.getByRole("button", { name: "Projects" });
    expect(projects.getAttribute("aria-expanded")).toBeNull();
    fireEvent.click(projects);
    expect(projects.getAttribute("aria-expanded")).toBeNull();
  });

  it("reserves end padding when MenuBadge or MenuAction is present", () => {
    render(
      <Sidebar.Provider>
        <Sidebar collapsible="none">
          <Sidebar.Content>
            <Sidebar.Menu>
              <Sidebar.MenuItem>
                <Sidebar.MenuButton>Team</Sidebar.MenuButton>
                <Sidebar.MenuAction aria-label="More" showOnHover>
                  …
                </Sidebar.MenuAction>
                <Sidebar.MenuBadge>8</Sidebar.MenuBadge>
              </Sidebar.MenuItem>
              <Sidebar.MenuItem>
                <Sidebar.MenuButton>Pinned</Sidebar.MenuButton>
                <Sidebar.MenuAction aria-label="Pin">★</Sidebar.MenuAction>
                <Sidebar.MenuBadge>2</Sidebar.MenuBadge>
              </Sidebar.MenuItem>
            </Sidebar.Menu>
          </Sidebar.Content>
        </Sidebar>
      </Sidebar.Provider>,
    );
    const team = screen.getByRole("button", { name: "Team" });
    expect(team.className).toContain(
      "group-has-[[data-slot=sidebar-menu-badge]]/menu-item:pe-gs-12",
    );
    expect(
      screen.getByLabelText("More").getAttribute("data-show-on-hover"),
    ).toBe("true");
    // Hover-only actions should not permanently shift the badge.
    expect(screen.getByText("8").className).toContain(
      ":not([data-show-on-hover=true])]/menu-item:end-gs-7",
    );
    expect(
      screen.getByLabelText("Pin").getAttribute("data-show-on-hover"),
    ).toBeNull();
    expect(screen.getByText("2").className).toContain(
      ":not([data-show-on-hover=true])]/menu-item:end-gs-7",
    );
  });

  it("keeps nested MenuSub closed by default", () => {
    render(
      <Sidebar.Provider>
        <Sidebar collapsible="none">
          <Sidebar.Content>
            <Sidebar.Menu>
              <Sidebar.MenuItem>
                <Sidebar.MenuButton>Account</Sidebar.MenuButton>
                <Sidebar.MenuSub>
                  <Sidebar.MenuSubItem>
                    <Sidebar.MenuSubButton>Profile</Sidebar.MenuSubButton>
                  </Sidebar.MenuSubItem>
                </Sidebar.MenuSub>
              </Sidebar.MenuItem>
            </Sidebar.Menu>
          </Sidebar.Content>
        </Sidebar>
      </Sidebar.Provider>,
    );
    const trigger = screen.getByRole("button", { name: "Account" });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(document.querySelector('[data-state="closed"]')).not.toBeNull();
  });

  it("marks offcanvas container inert when collapsed", () => {
    render(<DemoSidebar defaultOpen={false} collapsible="offcanvas" />);
    const container = document.querySelector('[data-slot="sidebar-container"]');
    expect(container?.getAttribute("aria-hidden")).toBe("true");
    expect(container?.hasAttribute("inert")).toBe(true);
    // Width stays full so the slide animation does not squash content.
    expect((container as HTMLElement).style.width).toBe("var(--sidebar-width)");
  });

  it("omits aria-controls on mobile until the drawer is open", () => {
    mockMobile();
    render(<DemoSidebar defaultOpen />);
    const trigger = screen.getByRole("button", { name: "Expand sidebar" });
    expect(trigger.getAttribute("aria-controls")).toBeNull();
    expect(trigger.getAttribute("data-state")).toBe("collapsed");
    fireEvent.click(trigger);
    // Drawer is aria-modal — query the trigger by slot, not by accessible name.
    const openTrigger = document.querySelector(
      '[data-slot="sidebar-trigger"]',
    ) as HTMLButtonElement;
    expect(openTrigger.getAttribute("aria-expanded")).toBe("true");
    expect(openTrigger.getAttribute("aria-controls")).toBeTruthy();
    expect(openTrigger.getAttribute("data-state")).toBe("expanded");
    expect(screen.getByLabelText("Sidebar")).not.toBeNull();
  });

  it("collapses and expands nested MenuSub from the parent button", () => {
    render(
      <Sidebar.Provider>
        <Sidebar collapsible="none">
          <Sidebar.Content>
            <Sidebar.Menu>
              <Sidebar.MenuItem defaultOpen>
                <Sidebar.MenuButton>Account</Sidebar.MenuButton>
                <Sidebar.MenuSub>
                  <Sidebar.MenuSubItem>
                    <Sidebar.MenuSubButton>Profile</Sidebar.MenuSubButton>
                  </Sidebar.MenuSubItem>
                </Sidebar.MenuSub>
              </Sidebar.MenuItem>
            </Sidebar.Menu>
          </Sidebar.Content>
        </Sidebar>
        <main className="relative flex min-h-full min-w-gs-0 flex-1 flex-col">
          <Sidebar.Trigger />
        </main>
      </Sidebar.Provider>,
    );

    const trigger = screen.getByRole("button", { name: "Account" });
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByRole("button", { name: "Profile" })).not.toBeNull();
    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(document.querySelector('[data-state="closed"]')).not.toBeNull();
  });

  it("throws when useSidebar is used outside the provider", () => {
    function Probe() {
      useSidebar();
      return null;
    }
    expect(() => render(<Probe />)).toThrow(
      /must be used within <Sidebar.Provider>/,
    );
  });

  it("opens a mobile drawer from the trigger", () => {
    mockMobile();
    render(<DemoSidebar defaultOpen />);
    expect(screen.queryByText("Brand")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Expand sidebar" }));
    expect(screen.getByText("Brand")).not.toBeNull();
    expect(screen.getByRole("navigation", { name: "Sidebar" })).not.toBeNull();
  });

  it("uses a fixed rail width when collapsible is none", () => {
    render(
      <Sidebar.Provider>
        <Sidebar collapsible="none">
          <Sidebar.Content>Nav</Sidebar.Content>
        </Sidebar>
      </Sidebar.Provider>,
    );
    const panel = document.querySelector('[data-slot="sidebar"]');
    expect(panel?.getAttribute("role")).toBe("navigation");
    expect(panel?.className).toContain("w-[var(--sidebar-width)]");
  });

  it("respects defaultPrevented on the trigger", () => {
    const onOpenChange = vi.fn();
    render(
      <Sidebar.Provider open onOpenChange={onOpenChange}>
        <Sidebar collapsible="icon">
          <Sidebar.Content>Nav</Sidebar.Content>
        </Sidebar>
        <main>
          <Sidebar.Trigger
            onClick={(event) => {
              event.preventDefault();
            }}
          />
        </main>
      </Sidebar.Provider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Collapse sidebar" }));
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("can disable the Ctrl/Cmd+B shortcut", () => {
    const onOpenChange = vi.fn();
    render(
      <Sidebar.Provider
        open
        onOpenChange={onOpenChange}
        enableKeyboardShortcut={false}
      >
        <Sidebar collapsible="icon">
          <Sidebar.Content>Nav</Sidebar.Content>
        </Sidebar>
        <main>
          <Sidebar.Trigger />
        </main>
      </Sidebar.Provider>,
    );
    fireEvent.keyDown(window, { key: "b", ctrlKey: true });
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("moves focus to the trigger when offcanvas collapses under focus", () => {
    render(<DemoSidebar defaultOpen collapsible="offcanvas" />);
    const home = screen.getByRole("button", { name: "Home" });
    home.focus();
    expect(document.activeElement).toBe(home);
    fireEvent.click(screen.getByRole("button", { name: "Collapse sidebar" }));
    expect(document.activeElement?.getAttribute("data-slot")).toBe(
      "sidebar-trigger",
    );
    const container = document.querySelector('[data-slot="sidebar-container"]');
    expect(container?.hasAttribute("inert")).toBe(true);
  });

  it("reflects mobile open state on the panel data-state", () => {
    mockMobile();
    render(<DemoSidebar defaultOpen={false} />);
    fireEvent.click(screen.getByRole("button", { name: "Expand sidebar" }));
    const panel = document.querySelector('[data-slot="sidebar"]');
    expect(panel?.getAttribute("data-state")).toBe("expanded");
    expect(panel?.getAttribute("data-mobile")).toBe("true");
  });

  it("toggles via Ctrl/Cmd+B", () => {
    const onOpenChange = vi.fn();
    function Controlled() {
      const [open, setOpen] = useState(true);
      return (
        <DemoSidebar
          open={open}
          onOpenChange={(next) => {
            onOpenChange(next);
            setOpen(next);
          }}
        />
      );
    }
    render(<Controlled />);
    fireEvent.keyDown(window, { key: "b", ctrlKey: true });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("ignores Ctrl/Cmd+B inside editable fields", () => {
    const onOpenChange = vi.fn();
    render(
      <Sidebar.Provider open onOpenChange={onOpenChange}>
        <Sidebar collapsible="icon">
          <Sidebar.Content>Nav</Sidebar.Content>
        </Sidebar>
        <main>
          <input aria-label="Search" />
          <Sidebar.Trigger />
        </main>
      </Sidebar.Provider>,
    );
    const input = screen.getByRole("textbox", { name: "Search" });
    fireEvent.keyDown(input, { key: "b", ctrlKey: true });
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});
