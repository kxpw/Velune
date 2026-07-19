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
});
