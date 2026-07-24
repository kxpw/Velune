// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, it, expect } from "vitest";
import { Icon } from "./Icon";

afterEach(cleanup);

describe("Icon a11y", () => {
  it("stays decorative by default and names itself when labeled", () => {
    const { rerender } = render(
      <Icon data-testid="icon">
        <svg />
      </Icon>,
    );

    expect(screen.getByTestId("icon").getAttribute("aria-hidden")).toBe("true");

    rerender(
      <Icon label="Settings" data-testid="icon">
        <svg />
      </Icon>,
    );

    expect(screen.getByRole("img", { name: "Settings" })).toBeTruthy();
  });
});
