// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { DateRangePicker } from "./DateRangePicker";

afterEach(cleanup);

describe("DateRangePicker a11y", () => {
  it("exposes invalid and required state", () => {
    render(
      <DateRangePicker required invalid>
        <DateRangePicker.Label>Billing period</DateRangePicker.Label>
        <DateRangePicker.ErrorMessage>
          A complete range is required.
        </DateRangePicker.ErrorMessage>
      </DateRangePicker>,
    );

    expect(
      screen
        .getByRole("group", { name: "Billing period" })
        .getAttribute("aria-invalid"),
    ).toBe("true");
    expect(document.querySelectorAll('input[type="date"]')).toHaveLength(2);
    expect(
      Array.from(document.querySelectorAll('input[type="date"]')).every(
        (input) => (input as HTMLInputElement).required,
      ),
    ).toBe(true);
  });
});
