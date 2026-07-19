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
        "gap-5",
        "items-end",
        "justify-center",
        "w-full",
      ]),
    );
  });
});
