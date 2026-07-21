// @vitest-environment jsdom

import { createRef } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Breadcrumb } from "./Breadcrumb";

afterEach(cleanup);

function BasicBreadcrumb() {
  return (
    <Breadcrumb data-testid="breadcrumb">
      <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
      <Breadcrumb.Item href="/projects">Projects</Breadcrumb.Item>
      <Breadcrumb.Item>Velune</Breadcrumb.Item>
    </Breadcrumb>
  );
}

describe("Breadcrumb", () => {
  it("sets readable displayNames", () => {
    expect(Breadcrumb.displayName).toBe("Breadcrumb");
    expect((Breadcrumb.Item as { displayName?: string }).displayName).toBe(
      "Breadcrumb.Item",
    );
  });

  it("forwards its ref and renders a nav > ol > li structure", () => {
    const ref = createRef<HTMLElement>();
    render(
      <Breadcrumb ref={ref} data-testid="breadcrumb">
        <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
        <Breadcrumb.Item>Docs</Breadcrumb.Item>
      </Breadcrumb>,
    );

    const nav = screen.getByTestId("breadcrumb");
    expect(ref.current).toBe(nav);
    expect(nav.tagName).toBe("NAV");
    const list = nav.querySelector("ol")!;
    expect(list).toBeTruthy();
    expect(list.querySelectorAll("li.gs-breadcrumb-item")).toHaveLength(2);
  });

  it("renders separators between items and supports a custom separator", () => {
    const { rerender } = render(<BasicBreadcrumb />);
    let separators = document.querySelectorAll(".gs-breadcrumb-separator");
    expect(separators).toHaveLength(2);
    expect(separators[0]!.querySelector("svg")).toBeTruthy();

    rerender(
      <Breadcrumb separator="/">
        <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
        <Breadcrumb.Item>Docs</Breadcrumb.Item>
      </Breadcrumb>,
    );
    separators = document.querySelectorAll(".gs-breadcrumb-separator");
    expect(separators).toHaveLength(1);
    expect(separators[0]!.textContent).toBe("/");
  });

  it("marks the last item as the current page automatically", () => {
    render(<BasicBreadcrumb />);

    const current = screen.getByText("Velune");
    expect(current.getAttribute("aria-current")).toBe("page");
    expect(current.closest("li")!.getAttribute("data-current")).toBe("true");
    expect(screen.getByText("Home").getAttribute("aria-current")).toBeNull();
  });

  it("lets an explicit current item override the default", () => {
    render(
      <Breadcrumb>
        <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
        <Breadcrumb.Item current>Projects</Breadcrumb.Item>
        <Breadcrumb.Item>Velune</Breadcrumb.Item>
      </Breadcrumb>,
    );

    expect(screen.getByText("Projects").getAttribute("aria-current")).toBe(
      "page",
    );
    expect(screen.getByText("Velune").getAttribute("aria-current")).toBeNull();
  });

  it("renders anchors for linked items and fires onClick", () => {
    const onClick = vi.fn((event: { preventDefault: () => void }) =>
      event.preventDefault(),
    );
    render(
      <Breadcrumb>
        <Breadcrumb.Item href="/projects" onClick={onClick}>
          Projects
        </Breadcrumb.Item>
        <Breadcrumb.Item>Velune</Breadcrumb.Item>
      </Breadcrumb>,
    );

    const link = screen.getByRole("link", { name: "Projects" });
    expect(link.getAttribute("href")).toBe("/projects");
    fireEvent.click(link);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renders disabled items as inert text", () => {
    const onClick = vi.fn();
    render(
      <Breadcrumb>
        <Breadcrumb.Item href="/hidden" disabled onClick={onClick}>
          Restricted
        </Breadcrumb.Item>
        <Breadcrumb.Item>Velune</Breadcrumb.Item>
      </Breadcrumb>,
    );

    expect(screen.queryByRole("link", { name: "Restricted" })).toBeNull();
    const item = screen.getByText("Restricted");
    fireEvent.click(item);
    expect(onClick).not.toHaveBeenCalled();
    expect(item.closest("li")!.getAttribute("data-disabled")).toBe("true");
  });
});
