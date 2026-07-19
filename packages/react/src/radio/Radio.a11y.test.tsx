// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Radio } from "./Radio";

afterEach(cleanup);

describe("Radio a11y", () => {
  it("exposes separate option names and descriptions inside a named group", () => {
    render(
      <Radio.Group aria-label="Delivery speed">
        <Radio value="standard">
          Standard
          <Radio.Description>Three to five days</Radio.Description>
        </Radio>
      </Radio.Group>,
    );

    expect(
      screen.getByRole("radio", {
        name: "Standard",
        description: "Three to five days",
      }),
    ).toBeTruthy();
  });
});
