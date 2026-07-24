// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { createPortal } from "react-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Radio } from "./Radio";

afterEach(cleanup);

describe("Radio", () => {
  it("sets a readable displayName", () => {
    expect(Radio.displayName).toBe("Radio");
    expect(Radio.Group.displayName).toBe("Radio.Group");
  });

  it("forwards group DOM props and composes keyboard handlers", () => {
    const ref = createRef<HTMLDivElement>();
    const onKeyDown = vi.fn((event: React.KeyboardEvent<HTMLDivElement>) => {
      event.preventDefault();
    });
    render(
      <Radio.Group
        ref={ref}
        aria-label="Plans"
        orientation="horizontal"
        data-testid="plans"
        data-orientation="forged"
        role="group"
        className="custom-group"
        defaultValue="free"
        onKeyDown={onKeyDown}
      >
        <Radio value="free">Free</Radio>
        <Radio value="pro">Pro</Radio>
      </Radio.Group>,
    );

    const group = screen.getByRole("radiogroup", { name: "Plans" });
    const free = screen.getByRole("radio", { name: "Free" });
    free.focus();
    fireEvent.keyDown(free, { key: "ArrowRight" });

    expect(ref.current).toBe(group);
    expect(screen.getByTestId("plans")).toBe(group);
    expect(group.dataset.orientation).toBe("horizontal");
    expect(group.classList.contains("custom-group")).toBe(true);
    expect(onKeyDown).toHaveBeenCalledOnce();
    expect(document.activeElement).toBe(free);
  });

  it("skips disabled radios during arrow-key navigation", () => {
    render(
      <Radio.Group defaultValue="first" orientation="horizontal">
        <Radio value="first">First</Radio>
        <Radio value="second" disabled>
          Second
        </Radio>
        <Radio value="third">Third</Radio>
      </Radio.Group>,
    );

    const first = screen.getByRole("radio", { name: "First" });
    const third = screen.getByRole("radio", { name: "Third" });
    first.focus();
    fireEvent.keyDown(first, { key: "ArrowRight" });

    expect(document.activeElement).toBe(third);
    expect((third as HTMLInputElement).checked).toBe(true);
  });

  it("follows RTL direction and can stop navigation at the group edge", () => {
    const onChange = vi.fn();
    render(
      <Radio.Group
        defaultValue="second"
        orientation="horizontal"
        dir="rtl"
        loop={false}
        onValueChange={onChange}
      >
        <Radio value="first">First</Radio>
        <Radio value="second">Second</Radio>
        <Radio value="third">Third</Radio>
      </Radio.Group>,
    );

    const first = screen.getByRole("radio", { name: "First" });
    const second = screen.getByRole("radio", { name: "Second" });
    second.focus();
    fireEvent.keyDown(second, { key: "ArrowRight" });
    expect(document.activeElement).toBe(first);
    expect((first as HTMLInputElement).checked).toBe(true);

    onChange.mockClear();
    fireEvent.keyDown(first, { key: "ArrowRight" });
    expect(document.activeElement).toBe(first);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("respects orientation and ignores modified arrow keys", () => {
    render(
      <Radio.Group defaultValue="first" orientation="vertical">
        <Radio value="first">First</Radio>
        <Radio value="second">Second</Radio>
      </Radio.Group>,
    );

    const first = screen.getByRole("radio", { name: "First" });
    first.focus();

    const crossAxis = new KeyboardEvent("keydown", {
      key: "ArrowRight",
      bubbles: true,
      cancelable: true,
    });
    first.dispatchEvent(crossAxis);
    expect(crossAxis.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(first);

    fireEvent.keyDown(first, { key: "ArrowDown", shiftKey: true });
    expect(document.activeElement).toBe(first);
  });

  it("ignores navigation events from portaled descendants", () => {
    const portalRoot = document.createElement("div");
    document.body.append(portalRoot);
    render(
      <Radio.Group defaultValue="first" orientation="horizontal">
        <Radio value="first">First</Radio>
        <Radio value="second">Second</Radio>
        {createPortal(<button type="button">Portal action</button>, portalRoot)}
      </Radio.Group>,
    );

    const first = screen.getByRole("radio", { name: "First" });
    first.focus();
    fireEvent.keyDown(screen.getByRole("button", { name: "Portal action" }), {
      key: "ArrowRight",
    });

    expect(document.activeElement).toBe(first);
    expect((first as HTMLInputElement).checked).toBe(true);
    portalRoot.remove();
  });

  it("supports page keys for first and last option navigation", () => {
    render(
      <Radio.Group defaultValue="second" orientation="vertical">
        <Radio value="first">First</Radio>
        <Radio value="second">Second</Radio>
        <Radio value="third">Third</Radio>
      </Radio.Group>,
    );

    const second = screen.getByRole("radio", { name: "Second" });
    const third = screen.getByRole("radio", { name: "Third" });
    second.focus();
    fireEvent.keyDown(second, { key: "PageDown" });

    expect(document.activeElement).toBe(third);
    expect((third as HTMLInputElement).checked).toBe(true);
  });

  it("applies native required validation to grouped radios", () => {
    const { container } = render(
      <form>
        <Radio.Group name="plan" required>
          <Radio value="free">Free</Radio>
          <Radio value="pro">Pro</Radio>
        </Radio.Group>
      </form>,
    );

    const radios = screen.getAllByRole("radio") as HTMLInputElement[];
    expect(radios.every((radio) => radio.required)).toBe(true);
    expect(container.querySelector("form")!.checkValidity()).toBe(false);
  });

  it("supports external forms and restores the initial value on reset", () => {
    const { container, rerender } = render(
      <>
        <form id="preferences" />
        <Radio.Group name="plan" form="preferences" defaultValue="free">
          <Radio value="free">Free</Radio>
          <Radio value="pro">Pro</Radio>
        </Radio.Group>
      </>,
    );
    rerender(
      <>
        <form id="preferences" />
        <Radio.Group name="plan" form="preferences" defaultValue="pro">
          <Radio value="free">Free</Radio>
          <Radio value="pro">Pro</Radio>
        </Radio.Group>
      </>,
    );

    fireEvent.click(screen.getByRole("radio", { name: "Pro" }));
    fireEvent.reset(container.querySelector("form")!);

    expect(
      (screen.getByRole("radio", { name: "Free" }) as HTMLInputElement).checked,
    ).toBe(true);
    expect(new FormData(container.querySelector("form")!).get("plan")).toBe(
      "free",
    );
  });

  it("updates field subscriptions when a controlled group value changes", () => {
    const onValueChange = vi.fn();
    const options = (
      <>
        <Radio value="free">Free</Radio>
        <Radio value="pro">Pro</Radio>
      </>
    );
    const { rerender } = render(
      <Radio.Group value="free" onValueChange={onValueChange}>
        {options}
      </Radio.Group>,
    );
    const free = screen.getByRole("radio", {
      name: "Free",
    }) as HTMLInputElement;
    const pro = screen.getByRole("radio", {
      name: "Pro",
    }) as HTMLInputElement;

    rerender(
      <Radio.Group value="pro" onValueChange={onValueChange}>
        {options}
      </Radio.Group>,
    );

    expect(free.checked).toBe(false);
    expect(pro.checked).toBe(true);
  });

  it("preserves the last controlled group value when changing modes", () => {
    const renderGroup = (controlled: boolean) => (
      <form>
        <Radio.Group
          name="plan"
          defaultValue="free"
          {...(controlled ? { value: "pro" } : {})}
        >
          <Radio value="free">Free</Radio>
          <Radio value="pro">Pro</Radio>
        </Radio.Group>
      </form>
    );
    const { container, rerender } = render(renderGroup(true));

    rerender(renderGroup(false));

    const form = container.querySelector("form")!;
    expect(new FormData(form).get("plan")).toBe("pro");
    fireEvent.click(screen.getByRole("radio", { name: "Free" }));
    expect(new FormData(form).get("plan")).toBe("free");
  });

  it("keeps label typography stable across selection changes", () => {
    render(
      <Radio.Group defaultValue="free">
        <Radio value="free">Free</Radio>
        <Radio value="pro">Pro</Radio>
      </Radio.Group>,
    );
    const labels = document.querySelectorAll<HTMLElement>(".gs-radio-label");
    const initialClasses = Array.from(labels, (label) => label.className);

    fireEvent.click(screen.getByRole("radio", { name: "Pro" }));

    expect(Array.from(labels, (label) => label.className)).toEqual(
      initialClasses,
    );
    expect(
      Array.from(labels).every((label) =>
        label.classList.contains("font-gs-regular"),
      ),
    ).toBe(true);
  });

  it("protects native radio semantics from conflicting ARIA props", () => {
    render(
      <Radio defaultChecked aria-checked={false} data-testid="radio">
        Plan
      </Radio>,
    );

    const input = screen.getByTestId("radio") as HTMLInputElement;
    expect(input.type).toBe("radio");
    expect(input.checked).toBe(true);
    expect(input.getAttribute("aria-checked")).toBeNull();
  });

  it("links composed group metadata and forwards option description props", () => {
    render(
      <Radio.Group defaultValue="email">
        <Radio.Group.Label>Channel</Radio.Group.Label>
        <Radio.Group.Description>Choose one option.</Radio.Group.Description>
        <Radio value="email">
          Email
          <Radio.Description
            id="summary-hint"
            data-testid="option-description"
            className="custom-description"
          >
            Weekly summary
          </Radio.Description>
        </Radio>
      </Radio.Group>,
    );

    const group = screen.getByRole("radiogroup", { name: "Channel" });
    const descriptionId = screen
      .getByText("Choose one option.")
      .getAttribute("id");

    expect(group.getAttribute("aria-describedby")).toBe(descriptionId);
    const option = screen.getByRole("radio", { name: "Email" });
    const optionDescription = screen.getByTestId("option-description");
    expect(optionDescription.className).toContain("gs-radio-description");
    expect(optionDescription.classList.contains("custom-description")).toBe(
      true,
    );
    expect(option.getAttribute("aria-describedby")).toBe("summary-hint");
  });
});
