// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Pagination } from "./Pagination";
import { buildPageList, getTotalPages } from "./pagination-utils";

afterEach(cleanup);

describe("Pagination", () => {
  it("sets a readable displayName", () => {
    expect(Pagination.displayName).toBe("Pagination");
  });

  it("computes total pages", () => {
    expect(getTotalPages(95, 10)).toBe(10);
    expect(getTotalPages(0, 10)).toBe(1);
  });

  it("builds compact page lists", () => {
    expect(buildPageList(1, 1)).toEqual([1]);
    expect(buildPageList(5, 10, 1)).toEqual([
      1,
      "ellipsis",
      4,
      5,
      6,
      "ellipsis",
      10,
    ]);
  });

  it("does not emit when the current page is selected again", () => {
    const onChange = vi.fn();
    render(
      <Pagination page={2} pageSize={10} total={50} onPageChange={onChange} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Page 2" }));
    expect(onChange).not.toHaveBeenCalled();
    const active = screen.getByRole("button", { name: "Page 2" });
    expect(
      active.classList.contains(
        "data-[active=true]:bg-gs-pagination-bg-active",
      ),
    ).toBe(true);
    expect(active.getAttribute("data-active")).toBe("true");
    expect(active.classList.contains("font-normal")).toBe(true);
    expect(active.classList.contains("font-medium")).toBe(false);
    expect(
      screen
        .getByRole("button", { name: "Page 1" })
        .classList.contains("font-normal"),
    ).toBe(true);
    expect(active.classList.contains("motion-reduce:transition-none")).toBe(
      true,
    );
  });

  it("maps simple and disabled states to Tailwind utilities", () => {
    render(
      <Pagination
        simple
        disabled
        page={2}
        total={50}
        data-simple="false"
        data-disabled="false"
      />,
    );

    const root = screen.getByRole("navigation", { name: "Pagination" });
    expect(root.dataset.simple).toBe("true");
    expect(root.dataset.disabled).toBe("true");
    expect(root.classList.contains("opacity-gs-disabled")).toBe(true);
    expect(
      root
        .querySelector(".gs-pagination-simple")
        ?.classList.contains("tabular-nums"),
    ).toBe(true);
    expect(
      screen
        .getByRole("button", { name: "Previous page" })
        .classList.contains("[&_svg]:size-4"),
    ).toBe(true);
  });

  it("uses custom navigation, page-size, and quick-jump labels", () => {
    render(
      <Pagination
        aria-label="Results navigation"
        total={50}
        showSizeChanger
        showQuickJumper
        previousPageLabel="Back"
        nextPageLabel="Forward"
        getPageLabel={(page) => `Result page ${page}`}
        rowsPerPageLabel="Results per page"
        goToPageLabel="Open"
        jumpToPageLabel="Page number"
      />,
    );

    expect(
      screen.getByRole("navigation", { name: "Results navigation" }),
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: "Back" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Forward" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Result page 1" })).toBeTruthy();
    expect(screen.getByText("Results per page")).toBeTruthy();
    expect(screen.getByText("Open")).toBeTruthy();
    const input = screen.getByRole("textbox", { name: "Page number" });
    expect(input).toBeTruthy();
    expect(
      input.classList.contains("transition-[border-color,box-shadow]"),
    ).toBe(true);
    expect(input.classList.contains("motion-reduce:transition-none")).toBe(
      true,
    );
  });

  it("preserves the last controlled page and size when changing modes", () => {
    const { rerender } = render(
      <Pagination simple page={4} pageSize={20} total={200} />,
    );

    rerender(<Pagination simple total={200} />);

    expect(screen.getByText("4 / 10")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Next page" }));
    expect(screen.getByText("5 / 10")).toBeTruthy();
  });

  it("renders nothing on a single page when hideOnSinglePage is set", () => {
    const { rerender } = render(
      <Pagination hideOnSinglePage total={8} pageSize={10} />,
    );
    expect(screen.queryByRole("navigation")).toBeNull();

    rerender(<Pagination hideOnSinglePage total={80} pageSize={10} />);
    expect(screen.getByRole("navigation")).toBeTruthy();

    rerender(<Pagination total={8} pageSize={10} />);
    expect(screen.getByRole("navigation")).toBeTruthy();
  });
});
