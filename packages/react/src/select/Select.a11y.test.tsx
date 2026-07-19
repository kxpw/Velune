// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Select } from "./Select";

afterEach(cleanup);

describe("Select a11y", () => {
  it("connects its label, descriptions, and validation state", () => {
    render(
      <Select required invalid>
        <Select.Label>Status</Select.Label>
        <Select.Description>Choose the current status.</Select.Description>
        <Select.ErrorMessage>A status is required.</Select.ErrorMessage>
        <Select.Trigger />
        <Select.Content>
          <Select.Item value="ready">Ready</Select.Item>
        </Select.Content>
      </Select>,
    );

    const control = screen.getByRole("combobox", { name: "Status" });
    const describedBy = control.getAttribute("aria-describedby")!.split(" ");
    expect(control.getAttribute("aria-required")).toBe("true");
    expect(control.getAttribute("aria-invalid")).toBe("true");
    expect(describedBy).toContain(
      screen.getByText("Choose the current status.").id,
    );
    expect(describedBy).toContain(screen.getByRole("alert").id);
  });
});
