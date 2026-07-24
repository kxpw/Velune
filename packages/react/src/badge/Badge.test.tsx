import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Badge } from "./Badge";

describe("Badge", () => {
  it("sets a readable displayName", () => {
    expect(Badge.displayName).toBe("Badge");
  });

  it("maps tone and dot state to Tailwind utilities", () => {
    const markup = renderToStaticMarkup(
      <Badge dot tone="success" className="custom-badge" />,
    );

    expect(markup).toContain("[--gs-badge-bg:var(--color-success)]");
    expect(markup).toContain("size-gs-2");
    expect(markup).toContain("bg-gs-error");
    expect(markup).toContain("custom-badge");
  });

  it("positions an attached pill with Tailwind utilities", () => {
    const markup = renderToStaticMarkup(
      <Badge count={4}>
        <button type="button">Inbox</button>
      </Badge>,
    );

    expect(markup).toContain("gs-badge-attached relative");
    expect(markup).toContain("absolute right-gs-0 top-gs-0");
    expect(markup).toContain("translate-x-2/5");
    expect(markup).toContain("-translate-y-2/5");
  });
});
