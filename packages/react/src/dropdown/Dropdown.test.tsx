// @vitest-environment jsdom

import { createRef } from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Button } from "../button";
import { Dropdown } from "./Dropdown";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function mockElementGeometry() {
  // React Aria relies on the browser CSS.escape API when focus enters a
  // collection; jsdom does not currently provide it.
  vi.stubGlobal("CSS", { escape: (value: string) => value });
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
    x: 0,
    y: 0,
    width: 240,
    height: 44,
    top: 0,
    right: 240,
    bottom: 44,
    left: 0,
    toJSON: () => ({}),
  });
}

function BasicDropdown({ onAction = vi.fn() } = {}) {
  return (
    <Dropdown>
      <Dropdown.Trigger>
        <Button variant="secondary">Actions</Button>
      </Dropdown.Trigger>
      <Dropdown.Menu aria-label="Project actions" onAction={onAction}>
        <Dropdown.Item id="edit">Edit</Dropdown.Item>
        <Dropdown.Item id="duplicate">Duplicate</Dropdown.Item>
        <Dropdown.Item id="archive" disabled>
          Archive
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}

function getMenu(name: string) {
  return document.querySelector<HTMLElement>(
    `.gs-dropdown-menu[aria-label="${name}"]`,
  );
}

describe("Dropdown", () => {
  it("sets a readable displayName", () => {
    expect(Dropdown.displayName).toBe("Dropdown");
  });

  it("opens an accessible menu and runs an item action", async () => {
    mockElementGeometry();
    const onAction = vi.fn();
    render(<BasicDropdown onAction={onAction} />);
    const trigger = screen.getByRole("button", { name: "Actions" });

    fireEvent.click(trigger);
    // Generous timeouts: the menu is lazy-loaded and populates its
    // collection asynchronously, which is slow under full-suite load.
    await waitFor(() => expect(getMenu("Project actions")).toBeTruthy(), {
      timeout: 8000,
    });
    await waitFor(() => expect(screen.getByText("Duplicate")).toBeTruthy(), {
      timeout: 8000,
    });
    fireEvent.click(screen.getByText("Duplicate").closest("[role=menuitem]")!);

    expect(onAction).toHaveBeenCalledWith("duplicate");
    expect(screen.queryByRole("menu")).toBeNull();
    await waitFor(() => expect(document.activeElement).toBe(trigger));
  }, 20000);

  it("accepts value as the item key alongside the deprecated id", async () => {
    mockElementGeometry();
    const onAction = vi.fn();
    render(
      <Dropdown defaultOpen>
        <Dropdown.Trigger>
          <Button variant="secondary">Actions</Button>
        </Dropdown.Trigger>
        <Dropdown.Menu aria-label="Item keys" onAction={onAction}>
          <Dropdown.Item value="rename">Rename</Dropdown.Item>
          <Dropdown.Item id="delete">Delete</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>,
    );
    await waitFor(() => expect(getMenu("Item keys")).toBeTruthy(), {
      timeout: 3000,
    });

    fireEvent.click(screen.getByText("Rename").closest("[role=menuitem]")!);
    expect(onAction).toHaveBeenCalledWith("rename");
  });

  it("fills its parent width by default", () => {
    render(<BasicDropdown />);
    const trigger = screen.getByRole("button", { name: "Actions" });

    expect(trigger.parentElement?.classList.contains("w-full")).toBe(true);
    expect(trigger.parentElement?.classList.contains("[&>*]:w-full")).toBe(
      true,
    );
    fireEvent.click(trigger);
    expect(
      document.querySelector<HTMLElement>(".gs-dropdown")?.style.width,
    ).toBe("var(--gs-popover-trigger-width, 100%)");
  });

  it("supports an explicit compact width", () => {
    render(
      <Dropdown fullWidth={false} defaultOpen>
        <Dropdown.Trigger>
          <Button>Compact actions</Button>
        </Dropdown.Trigger>
        <Dropdown.Menu aria-label="Compact actions">
          <Dropdown.Item id="edit">Edit</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>,
    );

    const trigger = screen.getByRole("button", { name: "Compact actions" });
    expect(trigger.parentElement?.classList.contains("w-fit")).toBe(true);
    expect(
      document.querySelector(".gs-dropdown")?.classList.contains("min-w-52"),
    ).toBe(true);
  });

  it("does not activate disabled items", async () => {
    const onAction = vi.fn();
    render(<BasicDropdown onAction={onAction} />);
    fireEvent.click(screen.getByRole("button", { name: "Actions" }));
    expect(getMenu("Project actions")).toBeTruthy();

    const item = screen.getByText("Archive").closest("[role=menuitem]")!;
    expect(item.getAttribute("aria-disabled")).toBe("true");
    fireEvent.click(item);
    expect(onAction).not.toHaveBeenCalled();
  });

  it("opens from the trigger and focuses the first item with ArrowDown", async () => {
    mockElementGeometry();
    render(<BasicDropdown />);
    const trigger = screen.getByRole("button", { name: "Actions" });

    fireEvent.keyDown(trigger, { key: "ArrowDown" });

    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(getMenu("Project actions")).not.toBeNull();
    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByText("Edit").closest("[role=menuitem]"),
      ),
    );
  });

  it("focuses the last enabled item when opened with ArrowUp", async () => {
    mockElementGeometry();
    render(<BasicDropdown />);
    const trigger = screen.getByRole("button", { name: "Actions" });

    fireEvent.keyDown(trigger, { key: "ArrowUp" });

    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByText("Duplicate").closest("[role=menuitem]"),
      ),
    );
  });

  it("exposes and enforces the root disabled state", () => {
    render(
      <Dropdown disabled>
        <Dropdown.Trigger>
          <Button>Actions</Button>
        </Dropdown.Trigger>
        <Dropdown.Menu aria-label="Project actions">
          <Dropdown.Item id="edit">Edit</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>,
    );
    const trigger = screen.getByRole("button", { name: "Actions" });

    expect(trigger.getAttribute("aria-disabled")).toBe("true");
    expect(trigger.hasAttribute("data-disabled")).toBe(true);
    expect((trigger as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(trigger);
    fireEvent.keyDown(trigger, { key: "ArrowDown" });

    expect(getMenu("Project actions")).toBeNull();
  });

  it("disables non-button triggers without leaking activation", () => {
    const onClick = vi.fn();
    const onKeyDown = vi.fn();
    render(
      <Dropdown disabled>
        <Dropdown.Trigger>
          <a href="/settings" onClick={onClick} onKeyDown={onKeyDown}>
            Settings
          </a>
        </Dropdown.Trigger>
        <Dropdown.Menu aria-label="Settings menu">
          <Dropdown.Item id="profile">Profile</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>,
    );
    const trigger = screen.getByRole("link", { name: "Settings" });

    expect(trigger.getAttribute("aria-disabled")).toBe("true");
    expect(trigger.getAttribute("tabindex")).toBe("-1");
    expect(trigger.hasAttribute("disabled")).toBe(false);
    fireEvent.click(trigger);
    fireEvent.keyDown(trigger, { key: "ArrowDown" });

    expect(onClick).not.toHaveBeenCalled();
    expect(onKeyDown).not.toHaveBeenCalled();
    expect(getMenu("Settings menu")).toBeNull();
  });

  it("uses the trigger as the menu label when no label is provided", () => {
    render(
      <Dropdown defaultOpen>
        <Dropdown.Trigger>
          <Button>More actions</Button>
        </Dropdown.Trigger>
        <Dropdown.Menu>
          <Dropdown.Item id="edit">Edit</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>,
    );

    const trigger = screen.getByRole("button", { name: "More actions" });
    const menu = document.querySelector<HTMLElement>(".gs-dropdown-menu")!;
    expect(trigger.id).not.toBe("");
    expect(menu.getAttribute("aria-labelledby")).toBe(trigger.id);
  });

  it("does not reserve an empty leading column for text-only items", () => {
    render(<BasicDropdown />);
    fireEvent.click(screen.getByRole("button", { name: "Actions" }));

    const item = screen.getByText("Edit").closest("[role=menuitem]")!;
    expect(item.querySelector(".gs-dropdown-item-leading")).toBeNull();
    expect(item.classList.contains("grid-cols-[minmax(0,1fr)_auto]")).toBe(
      true,
    );
  });

  it("keeps a multiple-selection menu open and marks selected items", async () => {
    render(
      <Dropdown defaultOpen>
        <Dropdown.Trigger>
          <Button>Columns</Button>
        </Dropdown.Trigger>
        <Dropdown.Menu
          aria-label="Visible columns"
          selectionMode="multiple"
          defaultSelectedKeys={["name"]}
        >
          <Dropdown.Item id="name">Name</Dropdown.Item>
          <Dropdown.Item id="status">Status</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>,
    );

    expect(getMenu("Visible columns")).toBeTruthy();
    const nameItem = screen
      .getByText("Name")
      .closest("[role=menuitemcheckbox]")!;
    const statusItem = screen
      .getByText("Status")
      .closest("[role=menuitemcheckbox]")!;
    expect(nameItem.getAttribute("aria-checked")).toBe("true");
    fireEvent.click(statusItem);
    expect(getMenu("Visible columns")).toBeTruthy();
  });

  it("keeps trailing metadata visible on selected items", () => {
    render(
      <Dropdown defaultOpen>
        <Dropdown.Trigger>
          <Button>Density</Button>
        </Dropdown.Trigger>
        <Dropdown.Menu
          aria-label="Density"
          selectionMode="single"
          defaultSelectedKeys={["compact"]}
        >
          <Dropdown.Item id="compact">
            Compact
            <Dropdown.Item.Trailing>⌘1</Dropdown.Item.Trailing>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>,
    );

    const item = screen.getByText("Compact").closest("[role=menuitemradio]")!;
    expect(item.querySelector(".gs-dropdown-item-trailing")?.textContent).toBe(
      "⌘1",
    );
    expect(item.querySelector(".gs-dropdown-item-indicator")).not.toBeNull();
  });

  it("renders sections, descriptions, metadata, and separators", async () => {
    render(
      <Dropdown defaultOpen>
        <Dropdown.Trigger>
          <Button>Account</Button>
        </Dropdown.Trigger>
        <Dropdown.Menu aria-label="Account menu">
          <Dropdown.Section>
            <Dropdown.SectionTitle>Workspace</Dropdown.SectionTitle>
            <Dropdown.Item id="profile">
              Profile
              <Dropdown.Item.Description>
                Manage your identity
              </Dropdown.Item.Description>
              <Dropdown.Item.Trailing>⌘P</Dropdown.Item.Trailing>
            </Dropdown.Item>
          </Dropdown.Section>
          <Dropdown.Separator />
          <Dropdown.Item id="delete" tone="danger">
            Delete workspace
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>,
    );

    expect(getMenu("Account menu")).toBeTruthy();
    expect(screen.getByText("Workspace")).toBeTruthy();
    expect(screen.getByText("Manage your identity")).toBeTruthy();
    expect(screen.getByText("⌘P")).toBeTruthy();
    expect(document.querySelector(".gs-dropdown-separator")).not.toBeNull();
    expect(
      screen
        .getByText("Delete workspace")
        .closest("[role=menuitem]")
        ?.classList.contains("text-gs-error"),
    ).toBe(true);
  });

  it("forwards its ref to the open menu surface", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Dropdown ref={ref} defaultOpen data-testid="surface">
        <Dropdown.Trigger>
          <Button>Open</Button>
        </Dropdown.Trigger>
        <Dropdown.Menu aria-label="Menu">
          <Dropdown.Item id="one">One</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>,
    );

    expect(ref.current).toBe(screen.getByTestId("surface"));
  });
});
