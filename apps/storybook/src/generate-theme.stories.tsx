import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import { Button, Input, Text } from "velune/react";
import { generateTheme, type ThemeMood } from "velune/react";

const meta = {
  title: "Theme/Generate Theme",
  parameters: { layout: "fullscreen" },
};

export default meta;

const moodLabels: Record<ThemeMood, string> = {
  porcelain: "Porcelain",
  futuristic: "Clear",
  warm: "Warm",
  mono: "Monochrome",
};

export const PorcelainBrandSeed = {
  render: function PorcelainBrandSeedStory() {
    const [brand, setBrand] = useState("#AD7C4F");
    const [mood, setMood] = useState<ThemeMood>("porcelain");
    const theme = useMemo(
      () => generateTheme({ brand, mood, contrastRatio: "AA" }),
      [brand, mood],
    );

    return (
      <main className="gs-story-shell">
        <div className="gs-story-heading">
          <Text as="h1" size="3xl">
            Generate a Velune brand theme
          </Text>
          <Text as="p" tone="muted">
            The seed drives interactive emphasis while canvas, ceramic surfaces,
            ink, and contrast remain part of the Porcelain contract.
          </Text>
        </div>

        <section
          className="gs-story-theme-controls"
          aria-label="Theme controls"
        >
          <label className="gs-story-color-field">
            <Text size="sm" weight="medium">
              Brand seed
            </Text>
            <span className="gs-story-color-input">
              <input
                type="color"
                value={brand}
                onChange={(event) => setBrand(event.target.value)}
              />
              <Text size="sm" family="mono">
                {brand.toUpperCase()}
              </Text>
            </span>
          </label>
          <div className="gs-story-mood-control">
            <Text size="sm" weight="medium">
              Mood
            </Text>
            <div className="gs-story-segmented">
              {(["porcelain", "futuristic", "warm", "mono"] as const).map(
                (item) => (
                  <Button
                    key={item}
                    size="sm"
                    variant={mood === item ? "primary" : "secondary"}
                    onClick={() => setMood(item)}
                  >
                    {moodLabels[item]}
                  </Button>
                ),
              )}
            </div>
          </div>
        </section>

        <section className="gs-story-section">
          <Text as="h2" size="xl">
            Generated interaction scale
          </Text>
          <div className="gs-story-brand-scale">
            {Object.entries(theme.scale).map(([stop, value]) => (
              <div key={stop} className="gs-story-brand-stop">
                <div style={{ "--brand-stop": value } as CSSProperties} />
                <Text size="xs" tone="muted" align="center">
                  {stop}
                </Text>
              </div>
            ))}
          </div>
        </section>

        <section
          className="gs-story-theme-preview"
          style={theme.cssVars.light as CSSProperties}
        >
          <div className="gs-story-theme-preview-header">
            <div>
              <Text as="h2" size="xl">
                Release review
              </Text>
              <Text size="sm" tone="muted">
                Porcelain component surface with generated interaction color.
              </Text>
            </div>
            <Text size="xs" tone="muted" family="mono">
              WCAG {theme.contrastRatio}
            </Text>
          </div>
          <div className="gs-story-theme-preview-body">
            <Input defaultValue="Summer porcelain" fullWidth>
              <Input.Label>Release name</Input.Label>
            </Input>
            <div className="gs-story-actions">
              <Button>Publish release</Button>
              <Button variant="secondary">Save draft</Button>
            </div>
          </div>
          <div
            className="gs-story-theme-surface-row"
            aria-label="Surface roles"
          >
            {[
              ["Canvas", "color-canvas"],
              ["Surface", "color-surface"],
              ["Mist", "color-surface-mist"],
            ].map(([label, token]) => (
              <div key={token}>
                <span
                  className="gs-story-theme-surface-swatch"
                  style={
                    { "--preview-surface": `var(--${token})` } as CSSProperties
                  }
                />
                <Text size="xs" tone="muted">
                  {label}
                </Text>
              </div>
            ))}
          </div>
        </section>
      </main>
    );
  },
};
