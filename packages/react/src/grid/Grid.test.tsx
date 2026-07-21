// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Grid } from "./Grid";

afterEach(cleanup);

describe("Grid", () => {
  it("sets a readable displayName", () => {
    expect(Grid.displayName).toBe("Grid");
  });

  it("maps grid props and responsive behavior to Tailwind utilities", () => {
    render(
      <Grid
        data-testid="grid"
        columns={6}
        gap="8"
        align="baseline"
        justify="stretch"
      />,
    );

    expect(Array.from(screen.getByTestId("grid").classList)).toEqual(
      expect.arrayContaining([
        "grid",
        "grid-cols-6",
        "max-md:grid-cols-1",
        "gap-8",
        "items-baseline",
        "justify-items-stretch",
        "w-full",
      ]),
    );
  });

  it("supports responsive columns and gaps", () => {
    render(
      <Grid
        data-testid="grid"
        columns={{ base: 1, sm: 2, lg: 4 }}
        gap={{ base: "2", md: "6" }}
      />,
    );
    expect(Array.from(screen.getByTestId("grid").classList)).toEqual(
      expect.arrayContaining([
        "grid-cols-1",
        "sm:grid-cols-2",
        "lg:grid-cols-4",
        "gap-2",
        "md:gap-6",
      ]),
    );
    expect(
      screen.getByTestId("grid").classList.contains("max-md:grid-cols-1"),
    ).toBe(false);
  });
});
