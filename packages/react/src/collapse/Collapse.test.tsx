// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Collapse } from "./Collapse";

afterEach(cleanup);

describe("Collapse", () => {
  it("sets readable displayNames", () => {
    expect(Collapse.displayName).toBe("Collapse");
    expect(Collapse.Item.displayName).toBe("Collapse.Item");
    expect(Collapse.Trigger.displayName).toBe("Collapse.Trigger");
    expect(Collapse.Content.displayName).toBe("Collapse.Content");
  });

  it("pre-mounts closed content only when forceMount is enabled", () => {
    const renderCollapse = (forceMount: boolean) =>
      renderToStaticMarkup(
        <Collapse>
          <Collapse.Item value="details">
            <Collapse.Trigger>Details</Collapse.Trigger>
            <Collapse.Content forceMount={forceMount}>
              Hidden details
            </Collapse.Content>
          </Collapse.Item>
        </Collapse>,
      );

    expect(renderCollapse(false)).not.toContain("Hidden details");
    expect(renderCollapse(true)).toContain("Hidden details");
  });

  it("moves focus between enabled triggers with arrow keys", () => {
    render(
      <Collapse>
        <Collapse.Item value="first item">
          <Collapse.Trigger>First</Collapse.Trigger>
          <Collapse.Content>First content</Collapse.Content>
        </Collapse.Item>
        <Collapse.Item value="second" disabled>
          <Collapse.Trigger>Second</Collapse.Trigger>
          <Collapse.Content>Second content</Collapse.Content>
        </Collapse.Item>
        <Collapse.Item value="third">
          <Collapse.Trigger>Third</Collapse.Trigger>
          <Collapse.Content>Third content</Collapse.Content>
        </Collapse.Item>
      </Collapse>,
    );

    const first = screen.getByRole("button", { name: "First" });
    const third = screen.getByRole("button", { name: "Third" });
    first.focus();
    fireEvent.keyDown(first, { key: "ArrowDown" });

    expect(document.activeElement).toBe(third);
    expect(first.id).not.toContain("first item");
  });

  it("follows DOM order after keyed items are rearranged", () => {
    const renderCollapse = (reversed: boolean) => (
      <Collapse>
        {(reversed ? ["second", "first"] : ["first", "second"]).map((value) => (
          <Collapse.Item key={value} value={value}>
            <Collapse.Trigger>
              {value === "first" ? "First" : "Second"}
            </Collapse.Trigger>
            <Collapse.Content>{value} content</Collapse.Content>
          </Collapse.Item>
        ))}
      </Collapse>
    );
    const { rerender } = render(renderCollapse(false));
    rerender(renderCollapse(true));

    const second = screen.getByRole("button", { name: "Second" });
    const first = screen.getByRole("button", { name: "First" });
    second.focus();
    fireEvent.keyDown(second, { key: "ArrowDown" });

    expect(document.activeElement).toBe(first);
  });

  it("follows RTL direction for horizontal keyboard navigation", () => {
    render(
      <Collapse orientation="horizontal" dir="rtl">
        <Collapse.Item value="first">
          <Collapse.Trigger>First</Collapse.Trigger>
        </Collapse.Item>
        <Collapse.Item value="second">
          <Collapse.Trigger>Second</Collapse.Trigger>
        </Collapse.Item>
        <Collapse.Item value="third">
          <Collapse.Trigger>Third</Collapse.Trigger>
        </Collapse.Item>
      </Collapse>,
    );

    const root = document.querySelector(".gs-collapse")!;
    const first = screen.getByRole("button", { name: "First" });
    const second = screen.getByRole("button", { name: "Second" });
    second.focus();
    fireEvent.keyDown(second, { key: "ArrowRight" });

    expect(document.activeElement).toBe(first);
    expect(root.getAttribute("dir")).toBe("rtl");
    expect(root.getAttribute("data-orientation")).toBe("horizontal");
    expect(root.classList.contains("flex-row")).toBe(true);
    expect(
      first
        .closest(".gs-collapse-item")
        ?.classList.contains("flex-[1_1_12rem]"),
    ).toBe(true);

    fireEvent.keyDown(first, { key: "ArrowDown" });
    expect(document.activeElement).toBe(first);
  });

  it("disables every item from the root without emitting changes", () => {
    const onValueChange = vi.fn();
    render(
      <Collapse disabled onValueChange={onValueChange}>
        <Collapse.Item value="first">
          <Collapse.Trigger>First</Collapse.Trigger>
          <Collapse.Content>First content</Collapse.Content>
        </Collapse.Item>
        <Collapse.Item value="second">
          <Collapse.Trigger>Second</Collapse.Trigger>
          <Collapse.Content>Second content</Collapse.Content>
        </Collapse.Item>
      </Collapse>,
    );

    const triggers = screen.getAllByRole("button") as HTMLButtonElement[];
    expect(triggers.every((trigger) => trigger.disabled)).toBe(true);
    expect(
      document.querySelectorAll('.gs-collapse-item[data-disabled="true"]'),
    ).toHaveLength(2);

    fireEvent.click(triggers[0]!);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("lets consumers cancel root keyboard navigation", () => {
    render(
      <Collapse onKeyDown={(event) => event.preventDefault()}>
        <Collapse.Item value="first">
          <Collapse.Trigger>First</Collapse.Trigger>
        </Collapse.Item>
        <Collapse.Item value="second">
          <Collapse.Trigger>Second</Collapse.Trigger>
        </Collapse.Item>
      </Collapse>,
    );

    const first = screen.getByRole("button", { name: "First" });
    first.focus();
    fireEvent.keyDown(first, { key: "ArrowDown" });

    expect(document.activeElement).toBe(first);
  });

  it("keeps closed force-mounted content hidden and inert", () => {
    render(
      <Collapse>
        <Collapse.Item value="details">
          <Collapse.Trigger>Details</Collapse.Trigger>
          <Collapse.Content forceMount aria-hidden={false}>
            Hidden details
          </Collapse.Content>
        </Collapse.Item>
      </Collapse>,
    );

    const content = document.querySelector<HTMLElement>(
      ".gs-collapse-content",
    )!;
    expect(content.getAttribute("aria-hidden")).toBe("true");
    expect(content.hasAttribute("inert")).toBe(true);
  });

  it("keeps a mounted content ref stable across open and prop updates", () => {
    const ref = vi.fn();
    const renderCollapse = (value: string, className: string) => (
      <Collapse value={value} onValueChange={() => {}}>
        <Collapse.Item value="details">
          <Collapse.Trigger>Details</Collapse.Trigger>
          <Collapse.Content ref={ref} forceMount className={className}>
            Hidden details
          </Collapse.Content>
        </Collapse.Item>
      </Collapse>
    );
    const { rerender } = render(renderCollapse("other", "initial"));
    const content = document.querySelector(".gs-collapse-content");

    rerender(renderCollapse("details", "updated"));

    expect(ref).toHaveBeenCalledOnce();
    expect(ref).toHaveBeenLastCalledWith(content);
    expect(content?.hasAttribute("inert")).toBe(false);
    expect(content?.classList.contains("grid-rows-[1fr]")).toBe(true);
    expect(content?.classList.contains("transition-[grid-template-rows]")).toBe(
      true,
    );
  });

  it("normalizes uncontrolled values when type changes to single", () => {
    const renderCollapse = (type: "single" | "multiple") => {
      const modeProps =
        type === "multiple"
          ? { type: "multiple" as const, defaultValue: ["first", "second"] }
          : { type: "single" as const, defaultValue: "first" };
      return (
        <Collapse {...modeProps}>
          <Collapse.Item value="first">
            <Collapse.Trigger>First</Collapse.Trigger>
            <Collapse.Content forceMount>First content</Collapse.Content>
          </Collapse.Item>
          <Collapse.Item value="second">
            <Collapse.Trigger>Second</Collapse.Trigger>
            <Collapse.Content forceMount>Second content</Collapse.Content>
          </Collapse.Item>
        </Collapse>
      );
    };
    const { rerender } = render(renderCollapse("multiple"));

    expect(
      screen
        .getByRole("button", { name: "First" })
        .getAttribute("aria-expanded"),
    ).toBe("true");
    expect(
      screen
        .getByRole("button", { name: "Second" })
        .getAttribute("aria-expanded"),
    ).toBe("true");
    rerender(renderCollapse("single"));

    expect(
      screen
        .getByRole("button", { name: "First" })
        .getAttribute("aria-expanded"),
    ).toBe("true");
    expect(
      screen
        .getByRole("button", { name: "Second" })
        .getAttribute("aria-expanded"),
    ).toBe("false");
  });
});
