import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Skeleton } from "./Skeleton";

describe("Skeleton", () => {
  it("renders defaults and stays hidden from assistive technology", () => {
    const markup = renderToStaticMarkup(<Skeleton />);

    expect(markup).toContain('class="gs-skeleton ');
    expect(markup).toContain("animate-gs-skeleton-pulse");
    expect(markup).toContain("motion-reduce:animate-none");
    expect(markup).toContain('data-variant="text"');
    expect(markup).toContain('data-animation="pulse"');
    expect(markup).toContain('aria-hidden="true"');
  });

  it("supports variants, animation, dimensions, and native props", () => {
    const markup = renderToStaticMarkup(
      <Skeleton
        variant="circular"
        animation="wave"
        width={48}
        height="3rem"
        className="avatar-placeholder"
        data-testid="skeleton"
      />,
    );

    expect(markup).toContain("gs-skeleton");
    expect(markup).toContain("avatar-placeholder");
    expect(markup).toContain('data-variant="circular"');
    expect(markup).toContain('data-animation="wave"');
    expect(markup).toContain("--gs-skeleton-width:48px");
    expect(markup).toContain("--gs-skeleton-height:3rem");
    expect(markup).toContain('data-testid="skeleton"');
    expect(markup).toContain("after:content-[&#x27;&#x27;]");
    expect(markup).toContain("after:animate-gs-skeleton-wave");
  });

  it("allows style overrides", () => {
    const markup = renderToStaticMarkup(
      <Skeleton width={120} style={{ width: "50%" }} />,
    );

    expect(markup).toContain("--gs-skeleton-width:120px");
    expect(markup).toContain("width:50%");
  });

  it("sets a readable displayName", () => {
    expect(Skeleton.displayName).toBe("Skeleton");
  });
});
