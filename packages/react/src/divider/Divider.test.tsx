import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Divider } from "./Divider";

describe("Divider", () => {
  it("sets a readable displayName", () => {
    expect(Divider.displayName).toBe("Divider");
  });

  it("protects separator semantics from conflicting DOM props", () => {
    const markup = renderToStaticMarkup(
      <Divider
        orientation="vertical"
        role="presentation"
        aria-orientation="horizontal"
      />,
    );

    expect(markup).toContain('role="separator"');
    expect(markup).toContain('aria-orientation="vertical"');
    expect(markup).toContain(
      "[border-inline-start:var(--control-border-width)_solid_var(--gs-divider-color)]",
    );
    expect(markup).toContain("before:hidden after:hidden");
  });

  it("maps labeled horizontal variants to Tailwind pseudo utilities", () => {
    const markup = renderToStaticMarkup(
      <Divider tone="subtle" align="start" dashed>
        Details
      </Divider>,
    );

    expect(markup).toContain("before:content-[&#x27;&#x27;]");
    expect(markup).toContain("before:[border-block-start-style:dashed]");
    expect(markup).toContain("before:basis-4");
    expect(markup).toContain(
      "[--gs-divider-color:color-mix(in_oklab,var(--color-border-default)_50%,transparent)]",
    );
  });
});
