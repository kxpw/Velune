// @vitest-environment jsdom

import { afterEach, describe, expect, it } from "vitest";
import { createFocusTrap } from "./focus-trap";

afterEach(() => {
  document.body.innerHTML = "";
});

describe("createFocusTrap", () => {
  it("redirects programmatic focus back to the last focused element", () => {
    const { container, inside, outside } = createFixture();
    inside.focus();
    const release = createFocusTrap(container);

    outside.focus();

    expect(document.activeElement).toBe(inside);
    release();
  });

  it("allows focus in a non-scope overlay branch", () => {
    const { container, inside } = createFixture();
    const portal = document.createElement("div");
    portal.setAttribute("data-gs-overlay-branch", "");
    const portalInput = document.createElement("input");
    portal.append(portalInput);
    document.body.append(portal);
    inside.focus();
    const release = createFocusTrap(container);

    portalInput.focus();

    expect(document.activeElement).toBe(portalInput);
    release();
  });

  it("keeps focus in the top scope and resumes the previous scope", () => {
    const outer = createScope("Outer");
    const inner = createScope("Inner");
    const outside = document.createElement("button");
    document.body.append(outside);
    outer.button.focus();
    const releaseOuter = createFocusTrap(outer.container);
    const releaseInner = createFocusTrap(inner.container);
    inner.button.focus();

    outer.button.focus();
    expect(document.activeElement).toBe(inner.button);

    releaseInner();
    outside.focus();
    expect(document.activeElement).toBe(outer.button);
    releaseOuter();
  });
});

function createFixture() {
  const scope = createScope("Inside");
  const outside = document.createElement("button");
  outside.textContent = "Outside";
  document.body.append(outside);
  return { container: scope.container, inside: scope.button, outside };
}

function createScope(label: string) {
  const root = document.createElement("div");
  root.setAttribute("data-gs-overlay-branch", "");
  root.setAttribute("data-gs-focus-scope", "");
  const container = document.createElement("div");
  const button = document.createElement("button");
  button.textContent = label;
  container.append(button);
  root.append(container);
  document.body.append(root);
  return { container, button };
}
