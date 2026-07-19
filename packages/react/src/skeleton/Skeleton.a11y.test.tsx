import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Skeleton } from "./Skeleton";

describe("Skeleton a11y", () => {
  it("cannot expose placeholder content to the accessibility tree", () => {
    const markup = renderToStaticMarkup(
      <Skeleton aria-hidden="false" aria-label="Ignored loading label" />,
    );

    expect(markup).toContain('aria-hidden="true"');
    expect(markup).not.toContain('aria-hidden="false"');
  });
});
