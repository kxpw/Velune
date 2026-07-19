// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Container } from "./Container";

afterEach(cleanup);

describe("Container", () => {
  it("sets a readable displayName", () => {
    expect(Container.displayName).toBe("Container");
  });

  it("uses a token-backed Tailwind max width", () => {
    render(<Container data-testid="container" size="xl" />);

    expect(Array.from(screen.getByTestId("container").classList)).toEqual(
      expect.arrayContaining([
        "mx-auto",
        "box-border",
        "w-full",
        "px-4",
        "max-w-gs-breakpoint-2xl",
      ]),
    );
  });
});
