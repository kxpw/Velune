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
import { DateRangePicker } from "./DateRangePicker";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

// jsdom reports zero-sized rects, which keeps the floating calendar in its
// hidden pre-positioning state; give elements a measurable size.
function mockElementGeometry() {
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
    x: 0,
    y: 0,
    width: 288,
    height: 44,
    top: 0,
    right: 288,
    bottom: 44,
    left: 0,
    toJSON: () => ({}),
  });
}

describe("DateRangePicker", () => {
  it("sets a readable displayName", () => {
    expect(DateRangePicker.displayName).toBe("DateRangePicker");
  });

  it("forwards its ref and root attributes", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <DateRangePicker ref={ref} data-testid="range" className="custom" />,
    );

    expect(ref.current).toBe(screen.getByTestId("range"));
    expect(ref.current?.classList.contains("custom")).toBe(true);
  });

  it("renders an accessible pair of date fields", () => {
    render(
      <DateRangePicker>
        <DateRangePicker.Label>Travel dates</DateRangePicker.Label>
        <DateRangePicker.Description>
          Choose arrival and departure dates.
        </DateRangePicker.Description>
      </DateRangePicker>,
    );

    expect(screen.getByRole("group", { name: "Travel dates" })).toBeTruthy();
    expect(
      screen.getAllByRole("spinbutton", { name: /Start date/ }),
    ).toHaveLength(3);
    expect(
      screen.getAllByRole("spinbutton", { name: /End date/ }),
    ).toHaveLength(3);
    expect(screen.getByRole("button", { name: /Open calendar/ })).toBeTruthy();
  });

  it("submits both values with their field names", () => {
    const { container } = render(
      <form>
        <DateRangePicker
          startName="from"
          endName="to"
          defaultValue={{
            start: new Date(2026, 6, 13),
            end: new Date(2026, 6, 18),
          }}
        />
      </form>,
    );
    const data = new FormData(container.querySelector("form")!);

    expect(data.get("from")).toBe("2026-07-13");
    expect(data.get("to")).toBe("2026-07-18");
  });

  it("preserves the last controlled range when changing modes", () => {
    const controlledValue = {
      start: new Date(2026, 6, 13),
      end: new Date(2026, 6, 18),
    };
    const { container, rerender } = render(
      <form>
        <DateRangePicker
          startName="from"
          endName="to"
          value={controlledValue}
        />
      </form>,
    );

    rerender(
      <form>
        <DateRangePicker startName="from" endName="to" />
      </form>,
    );

    const data = new FormData(container.querySelector("form")!);
    expect(data.get("from")).toBe("2026-07-13");
    expect(data.get("to")).toBe("2026-07-18");
  });

  it("selects a range from the shared calendar", async () => {
    mockElementGeometry();
    const onValueChange = vi.fn();
    render(<DateRangePicker defaultOpen onValueChange={onValueChange} />);

    // The calendar panel is lazy-loaded; allow for slow full-suite runs.
    const firstDay = await screen.findByRole(
      "gridcell",
      { name: /July 20, 2026/ },
      { timeout: 8000 },
    );
    expect(firstDay.classList.contains("active:scale-95")).toBe(true);
    expect(firstDay.classList.contains("motion-reduce:transition-none")).toBe(
      true,
    );
    fireEvent.click(firstDay);
    fireEvent.click(screen.getByRole("gridcell", { name: /July 23, 2026/ }));

    expect(onValueChange).toHaveBeenLastCalledWith({
      start: new Date(2026, 6, 20),
      end: new Date(2026, 6, 23),
    });
  }, 15000);

  it("dispatches bubbling native change events for user selections", async () => {
    mockElementGeometry();
    const { container } = render(
      <form>
        <DateRangePicker startName="from" endName="to" defaultOpen />
      </form>,
    );
    const form = container.querySelector("form")!;
    const onChange = vi.fn();
    form.addEventListener("change", onChange);

    fireEvent.click(
      await screen.findByRole(
        "gridcell",
        { name: /July 20, 2026/ },
        { timeout: 8000 },
      ),
    );
    fireEvent.click(screen.getByRole("gridcell", { name: /July 23, 2026/ }));

    await waitFor(() => expect(onChange).toHaveBeenCalled());
    const changedNames = onChange.mock.calls.map(
      ([event]) => (event.target as HTMLInputElement).name,
    );
    expect(changedNames).toContain("from");
    expect(changedNames).toContain("to");
  }, 15000);

  it("does not dispatch native change events for value prop updates", () => {
    const first = {
      start: new Date(2026, 6, 13),
      end: new Date(2026, 6, 18),
    };
    const second = {
      start: new Date(2026, 7, 3),
      end: new Date(2026, 7, 8),
    };
    const renderPicker = (value: typeof first) => (
      <form>
        <DateRangePicker
          startName="from"
          endName="to"
          value={value}
          onValueChange={() => {}}
        />
      </form>
    );
    const { container, rerender } = render(renderPicker(first));
    const onChange = vi.fn();
    container.querySelector("form")!.addEventListener("change", onChange);

    rerender(renderPicker(second));

    expect(onChange).not.toHaveBeenCalled();
  });

  it("moves native validation focus to the first visible date segment", () => {
    render(<DateRangePicker required />);
    const firstSegment = screen.getAllByRole("spinbutton")[0]!;
    const nativeInput = document.querySelector<HTMLInputElement>(
      '.gs-date-range-picker-native[slot="start"], .gs-date-range-picker-native',
    )!;

    fireEvent.invalid(nativeInput);

    expect(document.activeElement).toBe(firstSegment);
  });

  it("uses a custom calendar command and exposes root state", async () => {
    const { rerender } = render(
      <DateRangePicker defaultOpen openCalendarLabel="Open date chooser" />,
    );
    const root = document.querySelector<HTMLElement>(".gs-date-range-picker")!;

    expect(
      document.querySelector('button[aria-label="Open date chooser"]'),
    ).not.toBeNull();
    expect(root.dataset.open).toBe("true");

    rerender(
      <DateRangePicker
        defaultOpen
        openCalendarLabel="Open date chooser"
        disabled
        required
      />,
    );

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(root.dataset.open).toBeUndefined();
    expect(root.dataset.disabled).toBe("true");
    expect(root.dataset.required).toBe("true");
  });

  it("restores its initial uncontrolled range on form reset", () => {
    const { container } = render(
      <form>
        <DateRangePicker
          startName="from"
          endName="to"
          defaultValue={{
            start: new Date(2026, 6, 13),
            end: new Date(2026, 6, 18),
          }}
          clearable
        />
      </form>,
    );
    const form = container.querySelector("form")!;

    fireEvent.click(screen.getByRole("button", { name: "Clear date range" }));
    fireEvent.reset(form);

    const data = new FormData(form);
    expect(data.get("from")).toBe("2026-07-13");
    expect(data.get("to")).toBe("2026-07-18");
  });
});
