// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { DatePicker } from "./DatePicker";

afterEach(cleanup);

describe("DatePicker a11y", () => {
  it("connects its label, descriptions, and validation state", () => {
    render(
      <DatePicker required invalid name="due">
        <DatePicker.Label>Due date</DatePicker.Label>
        <DatePicker.Description>
          Use the project timezone.
        </DatePicker.Description>
        <DatePicker.ErrorMessage>
          A due date is required.
        </DatePicker.ErrorMessage>
      </DatePicker>,
    );

    const control = screen.getByRole("button", { name: "Due date" });
    const describedBy = control.getAttribute("aria-describedby")!.split(" ");
    const native = document.querySelector<HTMLInputElement>(
      '.gs-datepicker-native[name="due"]',
    )!;
    expect(control.getAttribute("aria-required")).toBe("true");
    expect(control.getAttribute("aria-invalid")).toBe("true");
    expect(describedBy).toContain(
      screen.getByText("Use the project timezone.").id,
    );
    expect(describedBy).toContain(screen.getByRole("alert").id);
    expect(native.required).toBe(true);
  });
});
