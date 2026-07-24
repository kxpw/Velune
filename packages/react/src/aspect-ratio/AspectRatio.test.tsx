// @vitest-environment jsdom

import { createRef } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, it, expect } from "vitest";
import { AspectRatio } from "./AspectRatio";

afterEach(cleanup);

describe("AspectRatio", () => {
  it("sets a readable displayName", () => {
    expect(AspectRatio.displayName).toBe("AspectRatio");
  });

  it("forwards its ref and applies the ratio", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <AspectRatio
        ref={ref}
        ratio="4/3"
        data-testid="aspect-ratio"
        data-state="ready"
      >
        <img alt="" src="about:blank" />
      </AspectRatio>,
    );

    const element = screen.getByTestId("aspect-ratio");
    expect(ref.current).toBe(element);
    expect(element.getAttribute("data-state")).toBe("ready");
    expect(element.style.aspectRatio).toBe("4 / 3");
  });
});
