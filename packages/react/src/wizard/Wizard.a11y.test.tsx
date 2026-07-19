// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Wizard } from "./Wizard";

afterEach(cleanup);

describe("Wizard a11y", () => {
  it("identifies the current step and its active panel", () => {
    render(
      <Wizard defaultStep="profile" stepsLabel="Setup steps">
        <Wizard.Step value="profile">
          <Wizard.Title>Profile</Wizard.Title>
          Profile fields
        </Wizard.Step>
        <Wizard.Step value="review">
          <Wizard.Title>Review</Wizard.Title>
          Review fields
        </Wizard.Step>
      </Wizard>,
    );

    expect(screen.getByRole("list", { name: "Setup steps" })).toBeTruthy();
    expect(
      screen
        .getByRole("button", { name: "Profile" })
        .getAttribute("aria-current"),
    ).toBe("step");
    expect(
      screen.getByRole("group", { name: "Profile" }).textContent,
    ).toContain("Profile fields");
  });
});
