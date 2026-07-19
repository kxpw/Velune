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
});
