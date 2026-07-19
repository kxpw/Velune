// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DatePicker } from "./DatePicker";
import { parseDate, serializeDate } from "./date-picker-utils";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("DatePicker", () => {
  it("sets a readable displayName", () => {
    expect(DatePicker.displayName).toBe("DatePicker");
  });

  it("serializes dates for form submission", () => {
    expect(serializeDate(new Date(2026, 6, 13))).toBe("2026-07-13");
    expect(serializeDate(null)).toBe("");
  });

  it("parses ISO calendar dates", () => {
    expect(parseDate("2026-07-13")?.getFullYear()).toBe(2026);
    expect(parseDate("13/07/2026")).toBeNull();
    expect(parseDate("2026-02-29")).toBeNull();
    expect(serializeDate(parseDate("2028-02-29"))).toBe("2028-02-29");
  });

  it("closes when an outside target stops pointerdown propagation", () => {
    render(
      <>
        <DatePicker defaultOpen />
        <button onPointerDown={(event) => event.stopPropagation()}>
          Outside
        </button>
      </>,
    );

    expect(document.querySelector(".gs-datepicker-panel")).not.toBeNull();
    fireEvent.pointerDown(screen.getByRole("button", { name: "Outside" }));
    expect(document.querySelector(".gs-datepicker-panel")).toBeNull();
  });

  it("moves focus into the calendar after the portal mounts", async () => {
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
      x: 0,
      y: 0,
      width: 320,
      height: 44,
      top: 0,
      right: 320,
      bottom: 44,
      left: 0,
      toJSON: () => ({}),
    });
    render(
      <DatePicker defaultValue={new Date(2026, 6, 13)}>
        <DatePicker.Label>Launch date</DatePicker.Label>
      </DatePicker>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Launch date" }));

    await waitFor(() =>
      expect(document.activeElement).toBe(
        document.querySelector('.gs-datepicker-day[aria-selected="true"]'),
      ),
    );
  });

  it("participates in external form validation and submission", () => {
    const { container } = render(
      <>
        <form id="schedule" />
        <DatePicker name="due" form="schedule" required />
      </>,
    );
    const form = container.querySelector("form")!;
    const native = container.querySelector<HTMLInputElement>(
      ".gs-datepicker-native",
    )!;
    const trigger = screen.getByRole("button", { name: "Select date" });

    expect(form.checkValidity()).toBe(false);
    fireEvent.invalid(native);
    expect(document.activeElement).toBe(trigger);
  });

  it("dispatches native change and resets to the initial default value", async () => {
    const initial = new Date(2026, 6, 13);
    const replacementDefault = new Date(2026, 6, 14);
    const renderPicker = (defaultValue: Date) => (
      <form>
        <DatePicker name="due" defaultValue={defaultValue} defaultOpen />
      </form>
    );
    const { container, rerender } = render(renderPicker(initial));
    rerender(renderPicker(replacementDefault));
    const form = container.querySelector("form")!;
    const onChange = vi.fn();
    form.addEventListener("change", onChange);

    const nextDay = Array.from(
      document.querySelectorAll<HTMLButtonElement>(".gs-datepicker-day"),
    ).find((day) => day.getAttribute("aria-selected") === "false")!;
    fireEvent.click(nextDay);
    await waitFor(() => expect(onChange).toHaveBeenCalledOnce());

    fireEvent.reset(form);
    expect(new FormData(form).get("due")).toBe("2026-07-13");
  });

  it("does not dispatch native change events for value prop updates", () => {
    const first = new Date(2026, 6, 13);
    const second = new Date(2026, 6, 14);
    const { container, rerender } = render(
      <form>
        <DatePicker name="due" value={first} onValueChange={() => {}} />
      </form>,
    );
    const onChange = vi.fn();
    container.querySelector("form")!.addEventListener("change", onChange);

    rerender(
      <form>
        <DatePicker name="due" value={second} onValueChange={() => {}} />
      </form>,
    );

    expect(onChange).not.toHaveBeenCalled();
  });

  it("preserves the last controlled value when changing modes", () => {
    const renderPicker = (controlled: boolean) => (
      <form>
        <DatePicker
          name="due"
          defaultValue={new Date(2026, 6, 1)}
          clearable
          {...(controlled ? { value: new Date(2026, 6, 13) } : {})}
        />
      </form>
    );
    const { container, rerender } = render(renderPicker(true));

    rerender(renderPicker(false));

    const form = container.querySelector("form")!;
    expect(new FormData(form).get("due")).toBe("2026-07-13");
    fireEvent.click(screen.getByRole("button", { name: "Clear date" }));
    expect(new FormData(form).get("due")).toBe("");
  });

  it("keeps its form reset subscription across name prop updates", () => {
    const { container, rerender } = render(
      <form>
        <DatePicker name="first" />
      </form>,
    );
    const form = container.querySelector("form")!;
    const add = vi.spyOn(form, "addEventListener");
    const remove = vi.spyOn(form, "removeEventListener");

    rerender(
      <form>
        <DatePicker name="second" />
      </form>,
    );

    expect(add.mock.calls.filter(([type]) => type === "reset")).toHaveLength(0);
    expect(remove.mock.calls.filter(([type]) => type === "reset")).toHaveLength(
      0,
    );
  });

  it("does not emit when the selected date is chosen again", () => {
    const onChange = vi.fn();
    render(
      <DatePicker
        defaultValue={new Date(2026, 6, 13)}
        defaultOpen
        onValueChange={onChange}
      />,
    );

    fireEvent.click(
      document.querySelector<HTMLButtonElement>(
        '.gs-datepicker-day[aria-selected="true"]',
      )!,
    );
    expect(onChange).not.toHaveBeenCalled();
  });

  it("keeps day typography stable across calendar states", () => {
    render(<DatePicker defaultValue={new Date(2026, 6, 13)} defaultOpen />);
    const days = document.querySelectorAll<HTMLElement>(".gs-datepicker-day");

    expect(
      Array.from(days).every((day) => day.classList.contains("font-normal")),
    ).toBe(true);
    expect(
      Array.from(days).some((day) =>
        day.classList.contains("data-[selected=true]:font-medium"),
      ),
    ).toBe(false);
  });

  it("stays closed after becoming read-only and editable again", () => {
    const renderPicker = (readOnly: boolean) => (
      <DatePicker defaultOpen readOnly={readOnly} />
    );
    const { rerender } = render(renderPicker(false));
    expect(document.querySelector(".gs-datepicker-panel")).not.toBeNull();

    rerender(renderPicker(true));
    expect(document.querySelector(".gs-datepicker-panel")).toBeNull();
    rerender(renderPicker(false));
    expect(document.querySelector(".gs-datepicker-panel")).toBeNull();
  });

  it("keeps RTL portal direction and moves left to the next calendar day", () => {
    render(
      <DatePicker
        defaultValue={new Date(2026, 6, 13)}
        defaultOpen
        locale="ar"
        dir="rtl"
        todayLabel="اليوم"
        previousMonthLabel="الشهر السابق"
      />,
    );

    const root = document.querySelector(".gs-datepicker")!;
    const panel = document.querySelector(".gs-datepicker-panel")!;
    const selectedDay = document.querySelector<HTMLButtonElement>(
      '.gs-datepicker-day[aria-selected="true"]',
    )!;
    selectedDay.focus();
    fireEvent.keyDown(selectedDay, { key: "ArrowLeft" });

    expect(root.getAttribute("dir")).toBe("rtl");
    expect(panel.getAttribute("dir")).toBe("rtl");
    expect(document.activeElement?.textContent).toBe("14");
    expect(
      document
        .querySelector('.gs-datepicker-nav[aria-label="الشهر السابق"]')
        ?.querySelector("path")
        ?.getAttribute("d"),
    ).toBe("M6 3.5L10.5 8L6 12.5");
    expect(document.querySelector(".gs-datepicker-today")?.textContent).toBe(
      "اليوم",
    );
  });

  it("links composed field metadata to the trigger", () => {
    render(
      <DatePicker>
        <DatePicker.Label>Launch date</DatePicker.Label>
        <DatePicker.Description>Uses your local time.</DatePicker.Description>
        <DatePicker.ErrorMessage>Date is required.</DatePicker.ErrorMessage>
      </DatePicker>,
    );

    const trigger = screen.getByRole("button", { name: "Launch date" });
    const describedBy = trigger.getAttribute("aria-describedby")!.split(" ");

    expect(trigger.getAttribute("aria-invalid")).toBe("true");
    expect(describedBy).toContain(
      screen.getByText("Uses your local time.").getAttribute("id"),
    );
    expect(describedBy).toContain(
      screen.getByText("Date is required.").getAttribute("id"),
    );
  });
});
