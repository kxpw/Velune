// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Flex } from "./Flex";

afterEach(cleanup);

describe("Flex", () => {
  it("sets a readable displayName", () => {
    expect(Flex.displayName).toBe("Flex");
  });

  it("maps flex props to Tailwind utilities", () => {
    render(
      <Flex
        data-testid="flex"
        direction="column-reverse"
        align="center"
        justify="between"
        gap="6"
        wrap
        inline
        fullWidth
      />,
    );

    expect(Array.from(screen.getByTestId("flex").classList)).toEqual(
      expect.arrayContaining([
        "inline-flex",
        "flex-col-reverse",
        "items-center",
        "justify-between",
        "gap-6",
        "flex-wrap",
        "w-full",
      ]),
    );
  });

  it("supports responsive direction, gap, and wrapping", () => {
    render(
      <Flex
        data-testid="flex"
        direction={{ base: "column", md: "row" }}
        gap={{ base: "2", lg: "6" }}
        wrap={{ base: "nowrap", md: "wrap" }}
      />,
    );
    expect(Array.from(screen.getByTestId("flex").classList)).toEqual(
      expect.arrayContaining([
        "flex-col",
        "md:flex-row",
        "gap-2",
        "lg:gap-6",
        "flex-nowrap",
        "md:flex-wrap",
      ]),
    );
  });
});
