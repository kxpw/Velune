// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, it, expect } from "vitest";
import { Empty } from "./Empty";

afterEach(cleanup);

describe("Empty a11y", () => {
  it("exposes a status region with an accessible name", () => {
    render(
      <Empty aria-label="Empty workspace">
        <Empty.Title>Nothing here</Empty.Title>
      </Empty>,
    );

    expect(
      screen.getByRole("status", { name: "Empty workspace" }),
    ).toBeTruthy();
  });
});
