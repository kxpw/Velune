// @vitest-environment jsdom

import { createRef } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, it, expect } from "vitest";
import { Empty } from "./Empty";

afterEach(cleanup);

describe("Empty", () => {
  it("sets a readable displayName", () => {
    expect(Empty.displayName).toBe("Empty");
  });

  it("forwards its ref and compound slots", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Empty ref={ref} data-testid="empty" data-state="ready">
        <Empty.Title>No results</Empty.Title>
        <Empty.Description>Try a different filter.</Empty.Description>
        <Empty.Action>
          <button type="button">Clear</button>
        </Empty.Action>
      </Empty>,
    );

    const element = screen.getByTestId("empty");
    expect(ref.current).toBe(element);
    expect(element.getAttribute("data-state")).toBe("ready");
    expect(screen.getByRole("heading", { name: "No results" })).toBeTruthy();
    expect(screen.getByText("Try a different filter.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Clear" })).toBeTruthy();
  });
});
