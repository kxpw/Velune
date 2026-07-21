import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Spinner } from "./Spinner";

describe("Spinner", () => {
  it("sets a readable displayName", () => {
    expect(Spinner.displayName).toBe("Spinner");
  });

  it("maps visual props to Tailwind utilities", () => {
    const markup = renderToStaticMarkup(
      <Spinner size="lg" tone="success" className="custom-spinner" />,
    );

    expect(markup).toContain("size-gs-spinner-size-lg");
    expect(markup).toContain("text-gs-success");
    expect(markup).toContain("animate-gs-spinner");
    expect(markup).toContain("motion-reduce:animate-none");
    expect(markup).toContain("custom-spinner");
  });

  it("resolves the accessible name from label with an aria-label override", () => {
    expect(renderToStaticMarkup(<Spinner />)).toContain('aria-label="Loading"');
    expect(renderToStaticMarkup(<Spinner label="Saving draft" />)).toContain(
      'aria-label="Saving draft"',
    );
    expect(
      renderToStaticMarkup(<Spinner label="Saving" aria-label="Uploading" />),
    ).toContain('aria-label="Uploading"');
  });
});
