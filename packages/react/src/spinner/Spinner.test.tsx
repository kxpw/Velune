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
});
