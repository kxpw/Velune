// @vitest-environment jsdom

import { createRef } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, it, expect } from "vitest";
import { Icon } from "./Icon";

afterEach(cleanup);

describe("Icon", () => {
  it("sets a readable displayName", () => {
    expect(Icon.displayName).toBe("Icon");
  });

  it("forwards its ref and DOM props", () => {
    const ref = createRef<HTMLSpanElement>();
    render(
      <Icon ref={ref} data-testid="icon" data-state="ready">
        <svg data-testid="glyph" />
      </Icon>,
    );

    const element = screen.getByTestId("icon");
    expect(ref.current).toBe(element);
    expect(element.getAttribute("data-state")).toBe("ready");
    expect(element.getAttribute("aria-hidden")).toBe("true");
  });

  it("exposes an accessible name when label is provided", () => {
    render(
      <Icon label="Search" data-testid="icon">
        <svg />
      </Icon>,
    );

    const element = screen.getByTestId("icon");
    expect(element.getAttribute("role")).toBe("img");
    expect(element.getAttribute("aria-label")).toBe("Search");
    expect(element.getAttribute("aria-hidden")).toBeNull();
  });
});
