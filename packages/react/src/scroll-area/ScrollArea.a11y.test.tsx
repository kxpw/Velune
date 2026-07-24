// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, it, expect } from "vitest";
import { ScrollArea } from "./ScrollArea";

afterEach(cleanup);

describe("ScrollArea a11y", () => {
  it("preserves an explicit accessible name", () => {
    render(
      <ScrollArea role="region" aria-label="Notifications">
        Content
      </ScrollArea>,
    );

    expect(screen.getByRole("region").getAttribute("aria-label")).toBe(
      "Notifications",
    );
  });
});
