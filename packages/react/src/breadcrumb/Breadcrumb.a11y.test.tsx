// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Breadcrumb } from "./Breadcrumb";

afterEach(cleanup);

describe("Breadcrumb a11y", () => {
  it("exposes a named navigation landmark with the current page", () => {
    render(
      <Breadcrumb>
        <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
        <Breadcrumb.Item href="/projects">Projects</Breadcrumb.Item>
        <Breadcrumb.Item>Velune</Breadcrumb.Item>
      </Breadcrumb>,
    );

    const navigation = screen.getByRole("navigation", { name: "Breadcrumb" });
    const current = screen.getByText("Velune");
    expect(navigation.contains(current)).toBe(true);
    expect(current.getAttribute("aria-current")).toBe("page");
  });

  it("supports a custom landmark label and hides separators", () => {
    render(
      <Breadcrumb aria-label="You are here">
        <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
        <Breadcrumb.Item>Docs</Breadcrumb.Item>
      </Breadcrumb>,
    );

    expect(
      screen.getByRole("navigation", { name: "You are here" }),
    ).toBeTruthy();
    const separator = document.querySelector(".gs-breadcrumb-separator")!;
    expect(separator.getAttribute("aria-hidden")).toBe("true");
  });
});
