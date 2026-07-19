import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Text } from "./Text";

describe("Text", () => {
  it("sets a readable displayName", () => {
    expect(Text.displayName).toBe("Text");
  });

  it("maps typography props to token-backed Tailwind utilities", () => {
    const markup = renderToStaticMarkup(
      <Text
        as="p"
        size="2xl"
        weight="semibold"
        tone="success"
        family="mono"
        align="center"
        lines={3}
      >
        Result
      </Text>,
    );

    expect(markup).toContain("text-gs-2xl");
    expect(markup).toContain("font-gs-semibold");
    expect(markup).toContain("text-gs-success");
    expect(markup).toContain("font-gs-mono");
    expect(markup).toContain("text-center");
    expect(markup).toContain("line-clamp-3");
  });

  it("keeps opt-in CJK Tailwind variants with an English language tag", () => {
    const markup = renderToStaticMarkup(
      <Text lang="en" cjk>
        Sample text
      </Text>,
    );

    expect(markup).toContain('lang="en"');
    expect(markup).toContain('data-cjk="true"');
    expect(markup).toContain(
      "[&amp;:where(:lang(zh),:lang(ja),:lang(ko),[data-cjk=true])]:leading-gs-relaxed",
    );
  });

  it("uses the accessible text accent token for the primary tone", () => {
    const markup = renderToStaticMarkup(<Text tone="primary">Accent</Text>);

    expect(markup).toContain("text-gs-text-accent");
    expect(markup).not.toContain("text-gs-primary");
  });
});
