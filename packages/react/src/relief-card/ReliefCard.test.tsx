import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ReliefCard } from "./ReliefCard";

describe("ReliefCard", () => {
  it("sets a readable displayName", () => {
    expect(ReliefCard.displayName).toBe("ReliefCard");
    expect(ReliefCard.Title.displayName).toBe("ReliefCard.Title");
    expect(ReliefCard.Description.displayName).toBe("ReliefCard.Description");
    expect(ReliefCard.Action.displayName).toBe("ReliefCard.Action");
  });

  it("renders its relief and typography with Tailwind utilities", () => {
    const markup = renderToStaticMarkup(
      <ReliefCard>
        <ReliefCard.Title>Relief</ReliefCard.Title>
        <ReliefCard.Description>Description</ReliefCard.Description>
      </ReliefCard>,
    );

    expect(markup).toContain("group relative block");
    expect(markup).toContain('data-animation="reveal"');
    expect(markup).toContain("--relief-texture-src:");
    expect(markup).toContain("--relief-animation-duration:500ms");
    expect(markup).toContain("--relief-transition-duration:500ms");
    expect(markup).toContain("[mask-image:var(--relief-texture-src)]");
    expect(markup).toContain(
      "group-hover:opacity-gs-relief-texture-opacity-hover",
    );
    expect(markup).toContain("motion-reduce:transition-none");
    expect(markup).toContain("font-gs-serif");
  });

  it("accepts a configured texture animation", () => {
    const markup = renderToStaticMarkup(
      <ReliefCard
        animation={{
          preset: "drift",
          duration: 1200,
          delay: 150,
          easing: "linear",
        }}
      >
        <ReliefCard.Title>Animated relief</ReliefCard.Title>
      </ReliefCard>,
    );

    expect(markup).toContain('data-animation="drift"');
    expect(markup).toContain("--relief-animation-duration:1200ms");
    expect(markup).toContain("--relief-transition-duration:500ms");
    expect(markup).toContain(
      "--relief-texture-animation:gs-relief-drift 1200ms linear 150ms infinite",
    );
    expect(markup).toContain("animate-[var(--relief-texture-animation)]");
  });

  it("can disable texture animation", () => {
    const markup = renderToStaticMarkup(
      <ReliefCard animation="none">
        <ReliefCard.Title>Still relief</ReliefCard.Title>
      </ReliefCard>,
    );

    expect(markup).toContain('data-animation="none"');
    expect(markup).toContain("--relief-texture-animation:none");
    expect(markup).not.toContain(
      "group-hover:opacity-gs-relief-texture-opacity-hover",
    );
  });

  it("accepts custom CSS mask options", () => {
    const markup = renderToStaticMarkup(
      <ReliefCard
        texture={{
          source: "radial-gradient(circle, #000 1px, transparent 1px)",
          size: "18px 18px",
          position: "center",
          repeat: "repeat",
        }}
      >
        <ReliefCard.Title>Custom texture</ReliefCard.Title>
      </ReliefCard>,
    );

    expect(markup).toContain('data-texture="custom"');
    expect(markup).toContain(
      "--relief-texture-src:radial-gradient(circle, #000 1px, transparent 1px)",
    );
    expect(markup).toContain("--relief-texture-custom-size:18px 18px");
    expect(markup).toContain("--relief-texture-position:center");
    expect(markup).toContain("--relief-texture-repeat:repeat");
  });

  it("accepts a React texture element or no texture", () => {
    const elementMarkup = renderToStaticMarkup(
      <ReliefCard texture={<span data-testid="custom-texture" />}>
        <ReliefCard.Title>Element texture</ReliefCard.Title>
      </ReliefCard>,
    );
    const noTextureMarkup = renderToStaticMarkup(
      <ReliefCard texture={false}>
        <ReliefCard.Title>No texture</ReliefCard.Title>
      </ReliefCard>,
    );

    expect(elementMarkup).toContain('data-texture="element"');
    expect(elementMarkup).toContain('data-testid="custom-texture"');
    expect(noTextureMarkup).toContain('data-texture="none"');
    expect(noTextureMarkup).not.toContain("gs-relief-card-texture");
  });
});
