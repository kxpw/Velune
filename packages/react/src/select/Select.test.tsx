// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { forwardRef, type ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Select } from "./Select";
import type { SelectOptionItem } from "./Select.options";
import type { SelectMultipleProps, SelectSingleProps } from "./Select.types";

type TestSelectProps = (
  | Omit<SelectSingleProps, "children">
  | Omit<SelectMultipleProps, "children">
) & {
  options: SelectOptionItem[];
  label?: ReactNode;
  description?: ReactNode;
  errorMessage?: ReactNode;
  placeholder?: ReactNode;
  empty?: ReactNode;
  noMatches?: ReactNode;
};

const TestSelect = forwardRef<HTMLDivElement, TestSelectProps>(
  function TestSelect(
    {
      options,
      label,
      description,
      errorMessage,
      placeholder,
      empty,
      noMatches,
      ...props
    },
    ref,
  ) {
    return (
      <Select {...props} ref={ref}>
        {label ? <Select.Label>{label}</Select.Label> : null}
        {description ? (
          <Select.Description>{description}</Select.Description>
        ) : null}
        {errorMessage ? (
          <Select.ErrorMessage>{errorMessage}</Select.ErrorMessage>
        ) : null}
        <Select.Trigger placeholder={placeholder} />
        {empty ? <Select.Empty>{empty}</Select.Empty> : null}
        {noMatches ? <Select.NoMatches>{noMatches}</Select.NoMatches> : null}
        <Select.Content>
          {options.map((item, index) =>
            "options" in item ? (
              <Select.Group key={index} textValue={item.searchText}>
                <Select.GroupLabel>{item.label}</Select.GroupLabel>
                {item.options.map((option) => (
                  <Select.Item
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                    textValue={option.searchText}
                  >
                    {option.label}
                  </Select.Item>
                ))}
              </Select.Group>
            ) : (
              <Select.Item
                key={item.value}
                value={item.value}
                disabled={item.disabled}
                textValue={item.searchText}
              >
                {item.label}
              </Select.Item>
            ),
          )}
        </Select.Content>
      </Select>
    );
  },
);

afterEach(cleanup);

describe("Select", () => {
  it("sets a readable displayName", () => {
    expect(Select.displayName).toBe("Select");
    expect(Select.Label.displayName).toBe("Select.Label");
    expect(Select.Trigger.displayName).toBe("Select.Trigger");
    expect(Select.Content.displayName).toBe("Select.Content");
    expect(Select.Item.displayName).toBe("Select.Item");
    expect(Select.Group.displayName).toBe("Select.Group");
  });

  it("submits the selected value with its form", () => {
    const { container } = render(
      <form>
        <TestSelect
          name="city"
          options={[
            { value: "shanghai", label: "Shanghai" },
            { value: "beijing", label: "Beijing" },
          ]}
        />
      </form>,
    );

    fireEvent.click(screen.getByRole("combobox"));
    const options = document.querySelectorAll<HTMLElement>(".gs-select-option");
    fireEvent.click(options[1]!);

    const form = container.querySelector("form")!;
    expect(new FormData(form).get("city")).toBe("beijing");
  });

  it("dispatches a bubbling native change event for user selections", async () => {
    const { container } = render(
      <form>
        <TestSelect
          name="city"
          options={[
            { value: "shanghai", label: "Shanghai" },
            { value: "beijing", label: "Beijing" },
          ]}
        />
      </form>,
    );
    const onChange = vi.fn();
    container.querySelector("form")!.addEventListener("change", onChange);

    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(
      document.querySelectorAll<HTMLElement>(".gs-select-option")[1]!,
    );

    await waitFor(() => expect(onChange).toHaveBeenCalledOnce());
  });

  it("does not dispatch native change events for value prop updates", () => {
    const options = [
      { value: "shanghai", label: "Shanghai" },
      { value: "beijing", label: "Beijing" },
    ];
    const { container, rerender } = render(
      <form>
        <TestSelect
          name="city"
          value="shanghai"
          options={options}
          onValueChange={() => {}}
        />
      </form>,
    );
    const onChange = vi.fn();
    container.querySelector("form")!.addEventListener("change", onChange);

    rerender(
      <form>
        <TestSelect
          name="city"
          value="beijing"
          options={options}
          onValueChange={() => {}}
        />
      </form>,
    );

    expect(onChange).not.toHaveBeenCalled();
  });

  it("preserves the last controlled value when changing modes", () => {
    const options = [
      { value: "shanghai", label: "Shanghai" },
      { value: "beijing", label: "Beijing" },
    ];
    const renderSelect = (controlled: boolean) => (
      <form>
        <TestSelect
          name="city"
          defaultValue="shanghai"
          {...(controlled ? { value: "beijing" } : {})}
          options={options}
        />
      </form>
    );
    const { container, rerender } = render(renderSelect(true));

    rerender(renderSelect(false));

    const form = container.querySelector("form")!;
    expect(new FormData(form).get("city")).toBe("beijing");
    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(
      document.querySelectorAll<HTMLElement>(".gs-select-option")[0]!,
    );
    expect(new FormData(form).get("city")).toBe("shanghai");
  });

  it("keeps its form reset subscription across name prop updates", () => {
    const options = [{ value: "ready", label: "Ready" }];
    const { container, rerender } = render(
      <form>
        <TestSelect name="first" options={options} />
      </form>,
    );
    const form = container.querySelector("form")!;
    const add = vi.spyOn(form, "addEventListener");
    const remove = vi.spyOn(form, "removeEventListener");

    rerender(
      <form>
        <TestSelect name="second" options={options} />
      </form>,
    );

    expect(add.mock.calls.filter(([type]) => type === "reset")).toHaveLength(0);
    expect(remove.mock.calls.filter(([type]) => type === "reset")).toHaveLength(
      0,
    );
  });

  it("keeps its composed root ref stable across value updates", () => {
    const ref = vi.fn();
    const options = [
      { value: "shanghai", label: "Shanghai" },
      { value: "beijing", label: "Beijing" },
    ];
    const { rerender } = render(
      <TestSelect
        ref={ref}
        value="shanghai"
        options={options}
        onValueChange={() => {}}
      />,
    );
    const root = document.querySelector(".gs-select");

    rerender(
      <TestSelect
        ref={ref}
        value="beijing"
        options={options}
        onValueChange={() => {}}
      />,
    );

    expect(ref).toHaveBeenCalledOnce();
    expect(ref).toHaveBeenLastCalledWith(root);
  });

  it("restores its initial uncontrolled value on form reset", () => {
    const options = [
      { value: "shanghai", label: "Shanghai" },
      { value: "beijing", label: "Beijing" },
    ];
    const { container, rerender } = render(
      <form>
        <TestSelect name="city" defaultValue="shanghai" options={options} />
      </form>,
    );
    rerender(
      <form>
        <TestSelect name="city" defaultValue="beijing" options={options} />
      </form>,
    );

    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(
      document.querySelectorAll<HTMLElement>(".gs-select-option")[1]!,
    );
    fireEvent.reset(container.querySelector("form")!);

    expect(new FormData(container.querySelector("form")!).get("city")).toBe(
      "shanghai",
    );
  });

  it("closes on pointerdown stopped by an outside target", () => {
    render(
      <>
        <TestSelect options={[{ value: "ready", label: "Ready" }]} />
        <button onPointerDown={(event) => event.stopPropagation()}>
          Outside
        </button>
      </>,
    );

    fireEvent.click(screen.getByRole("combobox"));
    expect(document.querySelector(".gs-select-panel")).not.toBeNull();
    fireEvent.pointerDown(screen.getByRole("button", { name: "Outside" }));
    expect(document.querySelector(".gs-select-panel")).toBeNull();
  });

  it("sizes the panel to content with trigger min width and no x-overflow scroll", () => {
    render(
      <TestSelect
        options={[
          {
            value: "long",
            label:
              "A very long option label that exceeds a narrow trigger width",
          },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole("combobox"));
    const panel = document.querySelector<HTMLElement>(".gs-select-panel");
    const listbox = document.querySelector<HTMLElement>(".gs-select-listbox");
    expect(panel).not.toBeNull();
    expect(listbox).not.toBeNull();
    expect(panel!.style.minInlineSize).toBe("var(--gs-popover-trigger-width)");
    expect(panel!.style.inlineSize).toBe("max-content");
    expect(listbox!.className).toContain("overflow-x-hidden");
    expect(listbox!.className).toContain("overflow-y-auto");
  });

  it("uses valid generated ids for values containing spaces", () => {
    render(
      <TestSelect
        defaultValue="design system"
        options={[{ value: "design system", label: "Design System" }]}
      />,
    );

    const trigger = screen.getByRole("combobox");
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    const activeId = trigger.getAttribute("aria-activedescendant");
    expect(activeId).not.toContain("design system");
    expect(document.getElementById(activeId!)).not.toBeNull();
  });

  it("virtualizes large ungrouped option lists", async () => {
    render(
      <TestSelect
        options={Array.from({ length: 250 }, (_, index) => ({
          value: `option-${index + 1}`,
          label: `Option ${index + 1}`,
        }))}
      />,
    );

    fireEvent.click(screen.getByRole("combobox"));
    const listbox = document.querySelector<HTMLElement>("[role=listbox]")!;
    expect(listbox.dataset.virtualized).toBe("true");
    await waitFor(() =>
      expect(
        listbox.querySelector(".gs-select-virtual-content"),
      ).not.toBeNull(),
    );
    expect(listbox.querySelectorAll(".gs-select-option").length).toBeLessThan(
      250,
    );
  });

  it("does not emit when the selected value is chosen again", () => {
    const onChange = vi.fn();
    render(
      <TestSelect
        defaultValue="ready"
        options={[{ value: "ready", label: "Ready" }]}
        onValueChange={onChange}
      />,
    );

    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(document.querySelector<HTMLElement>(".gs-select-option")!);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("keeps option typography stable across selection changes", () => {
    render(
      <TestSelect
        defaultValue="shanghai"
        options={[
          { value: "shanghai", label: "Shanghai" },
          { value: "beijing", label: "Beijing" },
        ]}
      />,
    );
    const trigger = screen.getByRole("combobox");
    fireEvent.click(trigger);
    let options = document.querySelectorAll<HTMLElement>(".gs-select-option");
    fireEvent.click(options[1]!);
    fireEvent.click(trigger);
    options = document.querySelectorAll<HTMLElement>(".gs-select-option");

    expect(
      Array.from(options).every((option) =>
        option.classList.contains("font-gs-regular"),
      ),
    ).toBe(true);
    expect(
      Array.from(options).some((option) =>
        option.classList.contains("data-[selected=true]:font-gs-medium"),
      ),
    ).toBe(false);
  });

  it("forwards compound slot attributes to the trigger, panel, and option", () => {
    render(
      <Select>
        <Select.Trigger className="custom-trigger" placeholder="Choose" />
        <Select.Content className="custom-content" data-testid="select-content">
          <Select.Item
            value="ready"
            className="custom-option"
            data-testid="select-option"
          >
            Ready
          </Select.Item>
        </Select.Content>
      </Select>,
    );

    const trigger = screen.getByRole("combobox");
    expect(trigger.classList).toContain("custom-trigger");
    fireEvent.click(trigger);
    expect(screen.getByTestId("select-content").classList).toContain(
      "custom-content",
    );
    expect(screen.getByTestId("select-option").classList).toContain(
      "custom-option",
    );
  });

  it("closes when disabled and stays closed when re-enabled", () => {
    const renderSelect = (disabled: boolean) => (
      <TestSelect
        disabled={disabled}
        options={[{ value: "ready", label: "Ready" }]}
      />
    );
    const { rerender } = render(renderSelect(false));
    fireEvent.click(screen.getByRole("combobox"));
    expect(document.querySelector(".gs-select-panel")).not.toBeNull();

    rerender(renderSelect(true));
    expect(document.querySelector(".gs-select-panel")).toBeNull();
    rerender(renderSelect(false));
    expect(document.querySelector(".gs-select-panel")).toBeNull();
  });

  it.each([false, true])(
    "lets consumers cancel keyboard navigation with field chrome=%s",
    (withFieldChrome) => {
      const onKeyDown = vi.fn((event: { preventDefault(): void }) =>
        event.preventDefault(),
      );
      render(
        <TestSelect
          label={withFieldChrome ? "Status" : undefined}
          options={[{ value: "ready", label: "Ready" }]}
          onKeyDown={onKeyDown}
        />,
      );

      fireEvent.keyDown(screen.getByRole("combobox"), { key: "ArrowDown" });

      expect(onKeyDown).toHaveBeenCalledOnce();
      expect(document.querySelector(".gs-select-panel")).toBeNull();
    },
  );

  it("recovers when the active option becomes disabled", () => {
    const firstOptions = [
      { value: "first", label: "First" },
      { value: "second", label: "Second" },
    ];
    const { rerender } = render(<TestSelect options={firstOptions} />);
    fireEvent.click(screen.getByRole("combobox"));

    rerender(
      <TestSelect
        options={[
          { value: "first", label: "First", disabled: true },
          { value: "second", label: "Second" },
        ]}
      />,
    );

    expect(
      document.querySelector('.gs-select-option[data-active="true"]')
        ?.textContent,
    ).toContain("Second");
  });

  it("propagates direction and localized empty copy to its portal", () => {
    render(
      <TestSelect
        searchable
        dir="rtl"
        options={[]}
        empty="لا توجد خيارات"
        noMatches="لا توجد نتائج"
        searchPlaceholder="بحث"
      />,
    );
    fireEvent.click(screen.getByRole("combobox"));

    expect(
      document.querySelector(".gs-select-panel")?.getAttribute("dir"),
    ).toBe("rtl");
    expect(document.querySelector(".gs-select-empty")?.textContent).toBe(
      "لا توجد خيارات",
    );

    fireEvent.change(document.querySelector(".gs-select-search")!, {
      target: { value: "missing" },
    });
    expect(document.querySelector(".gs-select-empty")?.textContent).toBe(
      "لا توجد نتائج",
    );
  });
});
