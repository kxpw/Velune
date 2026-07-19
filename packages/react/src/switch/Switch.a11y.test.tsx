// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Switch } from "./Switch";

afterEach(cleanup);

describe("Switch a11y", () => {
  it("exposes separate accessible name and description", () => {
    render(
      <Switch>
        Notifications
        <Switch.Description>Sends a weekly digest</Switch.Description>
      </Switch>,
    );

    expect(
      screen.getByRole("switch", {
        name: "Notifications",
        description: "Sends a weekly digest",
      }),
    ).toBeTruthy();
  });
});
