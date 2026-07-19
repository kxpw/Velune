// @vitest-environment jsdom

import { act } from "@testing-library/react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";
import { Portal } from "./portal";

afterEach(() => {
  document.body.innerHTML = "";
});

describe("Portal", () => {
  it("keeps the server and first hydration render aligned", async () => {
    const markup = renderToString(
      <Portal>
        <span data-testid="portaled">Content</span>
      </Portal>,
    );
    expect(markup).toBe("");

    const container = document.createElement("div");
    container.innerHTML = markup;
    document.body.append(container);

    let root: ReturnType<typeof hydrateRoot>;
    await act(async () => {
      root = hydrateRoot(
        container,
        <Portal>
          <span data-testid="portaled">Content</span>
        </Portal>,
      );
    });

    expect(container.childElementCount).toBe(0);
    expect(
      document.body.querySelector("[data-testid='portaled']"),
    ).not.toBeNull();

    await act(async () => root!.unmount());
  });

  it("renders into a custom container after mounting", async () => {
    const host = document.createElement("div");
    document.body.append(host);
    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(<Portal container={host}>Content</Portal>);
    });

    expect(host.textContent).toBe("Content");
    await act(async () => root.unmount());
  });
});
