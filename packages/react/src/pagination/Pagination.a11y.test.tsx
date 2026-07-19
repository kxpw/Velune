// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Pagination } from "./Pagination";

afterEach(cleanup);

describe("Pagination a11y", () => {
  it("marks the current page inside a named navigation landmark", () => {
    render(<Pagination page={2} total={50} aria-label="Results pages" />);

    const navigation = screen.getByRole("navigation", {
      name: "Results pages",
    });
    const current = screen.getByRole("button", { name: "Page 2" });
    expect(navigation.contains(current)).toBe(true);
    expect(current.getAttribute("aria-current")).toBe("page");
  });
});
