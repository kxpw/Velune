// @vitest-environment jsdom

import { createRef } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, it, expect } from "vitest";
import { Kbd } from "./Kbd";

afterEach(cleanup);

describe("Kbd", () => {
  it("sets a readable displayName", () => {
    expect(Kbd.displayName).toBe("Kbd");
  });

  it("forwards its ref and DOM props", () => {
    const ref = createRef<HTMLElement>();
    render(
      <Kbd ref={ref} data-testid="kbd" data-state="ready">
        Ctrl
      </Kbd>,
    );

    const element = screen.getByTestId("kbd");
    expect(ref.current).toBe(element);
    expect(element.getAttribute("data-state")).toBe("ready");
    expect(element.textContent).toBe("Ctrl");
  });
});
