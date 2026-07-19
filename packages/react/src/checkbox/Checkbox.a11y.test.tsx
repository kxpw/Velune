// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Checkbox } from "./Checkbox";

afterEach(cleanup);

describe("Checkbox a11y", () => {
  it("exposes separate accessible name and description", () => {
    render(
      <Checkbox>
        Product updates
        <Checkbox.Description>Weekly release notes</Checkbox.Description>
      </Checkbox>,
    );

    expect(
      screen.getByRole("checkbox", {
        name: "Product updates",
        description: "Weekly release notes",
      }),
    ).toBeTruthy();
  });
});
