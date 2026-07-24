// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, it, expect } from "vitest";
import { Kbd } from "./Kbd";

afterEach(cleanup);

describe("Kbd a11y", () => {
  it("preserves an explicit accessible name", () => {
    render(
      <Kbd aria-label="Control key" data-testid="kbd">
        Ctrl
      </Kbd>,
    );

    expect(screen.getByTestId("kbd").getAttribute("aria-label")).toBe(
      "Control key",
    );
  });
});
