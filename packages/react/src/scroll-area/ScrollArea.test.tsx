// @vitest-environment jsdom

import { createRef } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, it, expect } from "vitest";
import { ScrollArea } from "./ScrollArea";

afterEach(cleanup);

describe("ScrollArea", () => {
  it("sets a readable displayName", () => {
    expect(ScrollArea.displayName).toBe("ScrollArea");
  });

  it("forwards its ref and DOM props", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <ScrollArea
        ref={ref}
        data-testid="scroll-area"
        data-state="ready"
        maxHeight={120}
        aria-label="Scrollable content"
      >
        Content
      </ScrollArea>,
    );

    const element = screen.getByTestId("scroll-area");
    expect(ref.current).toBe(element);
    expect(element.getAttribute("data-state")).toBe("ready");
    expect(element.style.maxHeight).toBe("120px");
    expect(element.tabIndex).toBe(0);
  });
});
