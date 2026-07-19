// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createPortal } from "react-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Tabs } from "./Tabs";

afterEach(cleanup);

describe("Tabs", () => {
  it("sets readable displayNames", () => {
    expect(Tabs.displayName).toBe("Tabs");
    expect(Tabs.List.displayName).toBe("Tabs.List");
    expect(Tabs.Trigger.displayName).toBe("Tabs.Trigger");
    expect(Tabs.Panel.displayName).toBe("Tabs.Panel");
  });

  it("spaces trigger icons and text inside the label", () => {
    render(
      <Tabs defaultValue="preview">
        <Tabs.List>
          <Tabs.Trigger value="preview">
            <span aria-hidden="true">icon</span>
            Preview
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Panel value="preview">Preview panel</Tabs.Panel>
      </Tabs>,
    );

    const trigger = screen.getByRole("tab", { name: "Preview" });
    const label = trigger.querySelector(".gs-tabs-trigger-label");
    expect(label?.classList.contains("gap-2")).toBe(true);
    expect(trigger.classList.contains("gap-2")).toBe(false);
  });

  it("follows RTL direction for horizontal arrow navigation", () => {
    render(
      <Tabs defaultValue="first" dir="rtl">
        <Tabs.List>
          <Tabs.Trigger value="first">First</Tabs.Trigger>
          <Tabs.Trigger value="second">Second</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Panel value="first">First panel</Tabs.Panel>
        <Tabs.Panel value="second">Second panel</Tabs.Panel>
      </Tabs>,
    );

    const first = screen.getByRole("tab", { name: "First" });
    const second = screen.getByRole("tab", { name: "Second" });
    first.focus();
    fireEvent.keyDown(first, { key: "ArrowLeft" });

    expect(document.activeElement).toBe(second);
    expect(second.getAttribute("aria-selected")).toBe("true");
    expect(
      second
        .querySelector(".gs-tabs-trigger-label")
        ?.classList.contains("after:scale-x-100"),
    ).toBe(true);
  });

  it("follows DOM order after keyed triggers are rearranged", () => {
    const renderTabs = (reversed: boolean) => (
      <Tabs defaultValue="first">
        <Tabs.List>
          {(reversed ? ["second", "first"] : ["first", "second"]).map(
            (value) => (
              <Tabs.Trigger key={value} value={value}>
                {value === "first" ? "First" : "Second"}
              </Tabs.Trigger>
            ),
          )}
        </Tabs.List>
        <Tabs.Panel value="first">First panel</Tabs.Panel>
        <Tabs.Panel value="second">Second panel</Tabs.Panel>
      </Tabs>
    );
    const { rerender } = render(renderTabs(false));
    rerender(renderTabs(true));

    const second = screen.getByRole("tab", { name: "Second" });
    const first = screen.getByRole("tab", { name: "First" });
    second.focus();
    fireEvent.keyDown(second, { key: "ArrowRight" });

    expect(document.activeElement).toBe(first);
  });

  it("keeps an inactive force-mounted panel hidden", () => {
    render(
      <Tabs defaultValue="first">
        <Tabs.List>
          <Tabs.Trigger value="first">First</Tabs.Trigger>
          <Tabs.Trigger value="second">Second</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Panel value="first">First panel</Tabs.Panel>
        <Tabs.Panel value="second" forceMount hidden={false}>
          Second panel
        </Tabs.Panel>
      </Tabs>,
    );

    const panel = document.querySelector<HTMLElement>(
      "[data-state='inactive'][role='tabpanel']",
    )!;
    expect(panel.hidden).toBe(true);
  });

  it("maps block, vertical, and full-width variants to Tailwind utilities", () => {
    render(
      <Tabs defaultValue="first" variant="block" orientation="vertical">
        <Tabs.List fullWidth>
          <Tabs.Trigger value="first">First</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Panel value="first">Panel</Tabs.Panel>
      </Tabs>,
    );

    const list = screen.getByRole("tablist");
    const trigger = screen.getByRole("tab");
    const panel = screen.getByRole("tabpanel");
    expect(list.classList.contains("bg-gs-tabs-block-list-bg")).toBe(true);
    expect(list.classList.contains("bg-gs-tabs-list-bg")).toBe(false);
    expect(list.classList.contains("p-gs-tabs-list-padding")).toBe(false);
    expect(
      trigger.classList.contains("[[data-full-width=true]_&]:flex-[1_0_auto]"),
    ).toBe(true);
    expect(list.classList.contains("items-stretch")).toBe(true);
    expect(trigger.classList.contains("whitespace-nowrap")).toBe(true);
    expect(
      trigger.classList.contains("bg-gs-tabs-block-trigger-bg-active"),
    ).toBe(true);
    expect(trigger.classList.contains("bg-gs-tabs-trigger-bg")).toBe(false);
    expect(panel.classList.contains("ps-4")).toBe(true);
  });

  it("protects list semantics and does not emit an unchanged value", () => {
    const onValueChange = vi.fn();
    render(
      <Tabs defaultValue="first" onValueChange={onValueChange}>
        <Tabs.List role="group" aria-orientation="vertical">
          <Tabs.Trigger value="first">First</Tabs.Trigger>
          <Tabs.Trigger value="second">Second</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Panel value="first">First panel</Tabs.Panel>
        <Tabs.Panel value="second">Second panel</Tabs.Panel>
      </Tabs>,
    );

    const list = screen.getByRole("tablist");
    expect(list.getAttribute("aria-orientation")).toBe("horizontal");
    fireEvent.click(screen.getByRole("tab", { name: "First" }));
    expect(onValueChange).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("tab", { name: "Second" }));
    expect(onValueChange).toHaveBeenCalledOnce();
    expect(onValueChange).toHaveBeenCalledWith("second");
  });

  it("keeps the focused tab as the tab stop in manual activation mode", () => {
    render(
      <Tabs defaultValue="first" activationMode="manual">
        <Tabs.List>
          <Tabs.Trigger value="first">First</Tabs.Trigger>
          <Tabs.Trigger value="second">Second</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Panel value="first">First panel</Tabs.Panel>
        <Tabs.Panel value="second">Second panel</Tabs.Panel>
      </Tabs>,
    );
    const first = screen.getByRole("tab", { name: "First" });
    const second = screen.getByRole("tab", { name: "Second" });
    first.focus();

    fireEvent.keyDown(first, { key: "ArrowRight" });

    expect(document.activeElement).toBe(second);
    expect(second.getAttribute("aria-selected")).toBe("false");
    expect(second.tabIndex).toBe(0);
    expect(first.tabIndex).toBe(-1);
  });

  it("automatically activates an inactive tab when it receives focus", () => {
    render(
      <Tabs defaultValue="first">
        <Tabs.List>
          <Tabs.Trigger value="first">First</Tabs.Trigger>
          <Tabs.Trigger value="second">Second</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Panel value="first">First panel</Tabs.Panel>
        <Tabs.Panel value="second">Second panel</Tabs.Panel>
      </Tabs>,
    );

    fireEvent.focus(screen.getByRole("tab", { name: "Second" }));

    expect(
      screen.getByRole("tab", { name: "Second" }).getAttribute("aria-selected"),
    ).toBe("true");
  });

  it("keeps an enabled tab reachable when the selected trigger disappears", () => {
    const renderTabs = (showFirst: boolean) => (
      <Tabs defaultValue="first">
        <Tabs.List>
          {showFirst ? <Tabs.Trigger value="first">First</Tabs.Trigger> : null}
          <Tabs.Trigger value="second">Second</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Panel value="first">First panel</Tabs.Panel>
        <Tabs.Panel value="second">Second panel</Tabs.Panel>
      </Tabs>
    );
    const { rerender } = render(renderTabs(true));

    rerender(renderTabs(false));

    expect(screen.getByRole("tab", { name: "Second" }).tabIndex).toBe(0);
  });

  it("keeps an enabled tab reachable when the selected trigger is disabled", () => {
    const renderTabs = (disableFirst: boolean) => (
      <Tabs defaultValue="first">
        <Tabs.List>
          <Tabs.Trigger value="first" disabled={disableFirst}>
            First
          </Tabs.Trigger>
          <Tabs.Trigger value="second">Second</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Panel value="first">First panel</Tabs.Panel>
        <Tabs.Panel value="second">Second panel</Tabs.Panel>
      </Tabs>
    );
    const { rerender } = render(renderTabs(false));

    rerender(renderTabs(true));

    expect(screen.getByRole("tab", { name: "Second" }).tabIndex).toBe(0);
    expect(screen.getByRole("tab", { name: "First" }).tabIndex).toBe(-1);
  });

  it("ignores keyboard and click events from a portaled trigger child", () => {
    const onValueChange = vi.fn();
    render(
      <Tabs defaultValue="first" onValueChange={onValueChange}>
        <Tabs.List>
          <Tabs.Trigger value="first">First</Tabs.Trigger>
          <Tabs.Trigger value="second">
            Second
            {createPortal(<button>Portal action</button>, document.body)}
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Panel value="first">First panel</Tabs.Panel>
        <Tabs.Panel value="second">Second panel</Tabs.Panel>
      </Tabs>,
    );

    const portalAction = screen.getByRole("button", { name: "Portal action" });
    portalAction.focus();
    fireEvent.keyDown(portalAction, { key: "ArrowRight" });
    fireEvent.click(portalAction);

    expect(document.activeElement).toBe(portalAction);
    expect(onValueChange).not.toHaveBeenCalled();
    expect(
      screen.getByRole("tab", { name: "First" }).getAttribute("aria-selected"),
    ).toBe("true");
  });
});
