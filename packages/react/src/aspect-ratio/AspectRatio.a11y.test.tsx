// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, it, expect } from "vitest";
import { AspectRatio } from "./AspectRatio";

afterEach(cleanup);

describe("AspectRatio a11y", () => {
  it("preserves an explicit accessible name", () => {
    render(
      <AspectRatio role="img" aria-label="Product preview">
        <img alt="" src="about:blank" />
      </AspectRatio>,
    );

    expect(screen.getByRole("img").getAttribute("aria-label")).toBe(
      "Product preview",
    );
  });
});
