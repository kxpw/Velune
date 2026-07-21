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

  it("supports responsive max-widths", () => {
    render(
      <Container data-testid="container" size={{ base: "sm", lg: "xl" }} />,
    );
    expect(Array.from(screen.getByTestId("container").classList)).toEqual(
      expect.arrayContaining([
        "max-w-gs-breakpoint-md",
        "lg:max-w-gs-breakpoint-2xl",
      ]),
    );
  });

  it("renders a custom element through the as prop", () => {
    render(
      <Container as="main" data-testid="container">
        Page content
      </Container>,
    );

    expect(screen.getByTestId("container").tagName).toBe("MAIN");
    expect(screen.getByRole("main")).toBeTruthy();
  });
});
