// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Box } from "./Box";

afterEach(cleanup);

describe("Box", () => {
  it("sets a readable displayName", () => {
    expect(Box.displayName).toBe("Box");
  });

  it("maps layout props to token-backed Tailwind utilities", () => {
    render(
      <Box
        data-testid="box"
        padding="4"
        margin="2"
        display="inline-flex"
        className="custom-box"
      />,
    );

    expect(screen.getByTestId("box").className).toContain("p-gs-4");
    expect(screen.getByTestId("box").className).toContain("m-gs-2");
    expect(Array.from(screen.getByTestId("box").classList)).toEqual(
      expect.arrayContaining([
        "gs-box",
        "box-border",
        "inline-flex",
        "custom-box",
      ]),
    );
  });

  it("maps responsive spacing and display values", () => {
    render(
      <Box
        data-testid="box"
        padding={{ base: "2", md: "6" }}
        display={{ base: "block", md: "grid" }}
      />,
    );
    expect(Array.from(screen.getByTestId("box").classList)).toEqual(
      expect.arrayContaining(["p-gs-2", "md:p-gs-6", "block", "md:grid"]),
    );
  });
});
