// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Stack } from "./Stack";

afterEach(cleanup);

describe("Stack", () => {
  it("sets a readable displayName", () => {
    expect(Stack.displayName).toBe("Stack");
  });

  it("maps stack props to Tailwind utilities", () => {
    render(
      <Stack
        data-testid="stack"
        gap="5"
        align="end"
        justify="center"
        reverse
        fullWidth
      />,
    );

    expect(Array.from(screen.getByTestId("stack").classList)).toEqual(
      expect.arrayContaining([
        "flex",
        "flex-col-reverse",
        "gap-gs-5",
        "items-end",
        "justify-center",
        "w-full",
      ]),
    );
  });

  it("renders a divider between each pair of children", () => {
    render(
      <Stack data-testid="stack" divider={<hr data-testid="divider" />}>
        <span>First</span>
        <span>Second</span>
        <span>Third</span>
      </Stack>,
    );

    const stack = screen.getByTestId("stack");
    expect(screen.getAllByTestId("divider")).toHaveLength(2);
    expect(
      Array.from(stack.children).map((child) => child.tagName.toLowerCase()),
    ).toEqual(["span", "hr", "span", "hr", "span"]);
  });

  it("skips dividers around null children and single children", () => {
    render(
      <Stack data-testid="stack" divider={<hr data-testid="divider" />}>
        {null}
        <span>Only</span>
        {false}
      </Stack>,
    );

    expect(screen.queryByTestId("divider")).toBeNull();
  });

  it("supports responsive gaps and direction", () => {
    render(
      <Stack
        data-testid="stack"
        gap={{ base: "2", md: "5" }}
        reverse={{ base: false, lg: true }}
      />,
    );
    expect(Array.from(screen.getByTestId("stack").classList)).toEqual(
      expect.arrayContaining([
        "gap-gs-2",
        "md:gap-gs-5",
        "flex-col",
        "lg:flex-col-reverse",
      ]),
    );
  });
});
