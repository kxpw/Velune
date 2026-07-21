import type { CSSProperties } from "react";
import { useState } from "react";
import { Button, Text } from "velune/react";

const meta = {
  title: "Design System/Porcelain Foundations",
};

export default meta;

type Story = {
  render: () => JSX.Element;
};

const typography = [
  ["Display", "font-size-display", "line-height-normal"],
  ["Heading 1", "font-size-4xl", "line-height-normal"],
  ["Heading 2", "font-size-xl", "line-height-normal"],
  ["Heading 3", "font-size-lg", "line-height-normal"],
  ["Body", "font-size-sm", "line-height-body"],
  ["Caption", "font-size-xs", "line-height-body"],
] as const;

const radii = [
  ["radius-xs", "8px"],
  ["radius-sm", "10px"],
  ["radius-md", "10px"],
  ["radius-lg", "24px"],
] as const;

const elevations = [
  ["Level 0", "shadow-level-0", "Inline surface"],
  ["Level 1", "shadow-level-1", "Subtle elevation"],
  ["Level 2", "shadow-level-2", "Dialog or popover"],
  ["Level 3", "shadow-level-3", "Highest transient layer"],
] as const;

const motion = [
  ["Fast", "duration-fast", "200ms"],
  ["Normal", "duration-normal", "240ms"],
  ["Slow", "duration-slow", "320ms"],
  ["Glaze", "duration-glaze", "500ms"],
] as const;

export const CeramicSurface: Story = {
  render: () => (
    <main className="gs-story-shell">
      <div className="gs-story-heading">
        <Text as="h1" size="3xl">
          Ceramic surface
        </Text>
        <Text as="p" tone="muted">
          Sweet-white surfaces: one warm temperature, a hairline border,
          glaze-like elevation, and an inset sheen instead of decoration.
        </Text>
      </div>
      <div className="gs-story-surface-grid">
        <section className="gs-story-material gs-story-material-canvas">
          <Text weight="semibold">Canvas</Text>
          <Text size="sm" tone="muted" family="mono">
            --color-canvas
          </Text>
        </section>
        <section className="gs-story-material gs-story-material-surface">
          <Text weight="semibold">Surface</Text>
          <Text size="sm" tone="muted" family="mono">
            --color-surface
          </Text>
        </section>
        <section className="gs-story-material gs-story-material-raised">
          <Text weight="semibold">Raised surface</Text>
          <Text size="sm" tone="muted" family="mono">
            --color-surface-raised
          </Text>
        </section>
        <section className="gs-story-material gs-story-material-mist">
          <Text weight="semibold">Mist state</Text>
          <Text size="sm" tone="muted" family="mono">
            --color-surface-mist
          </Text>
        </section>
      </div>
    </main>
  ),
};

export const Typography: Story = {
  render: () => (
    <main className="gs-story-shell">
      <div className="gs-story-heading">
        <Text as="h1" size="3xl">
          Typography
        </Text>
        <Text as="p" tone="muted">
          A restrained sans-serif scale with generous body leading and zero
          negative letter spacing.
        </Text>
      </div>
      <div className="gs-story-type-list">
        {typography.map(([label, size, lineHeight]) => (
          <div className="gs-story-type-row" key={label}>
            <div>
              <Text size="sm" weight="medium">
                {label}
              </Text>
              <Text size="xs" tone="muted" family="mono">
                --{size}
              </Text>
            </div>
            <p
              className="gs-story-type-sample"
              style={
                {
                  "--type-size": `var(--${size})`,
                  "--type-leading": `var(--${lineHeight})`,
                } as CSSProperties
              }
            >
              Quiet technology, crafted with balance.
            </p>
          </div>
        ))}
      </div>
    </main>
  ),
};

export const Radius: Story = {
  render: () => (
    <main className="gs-story-shell">
      <div className="gs-story-heading">
        <Text as="h1" size="3xl">
          Radius
        </Text>
        <Text as="p" tone="muted">
          Containers stay soft without becoming toy-like. Full radius is
          reserved for intrinsically circular controls.
        </Text>
      </div>
      <div className="gs-story-foundation-grid">
        {radii.map(([name, value]) => (
          <div className="gs-story-radius-item" key={name}>
            <div
              className="gs-story-radius-shape"
              style={{ "--radius-value": `var(--${name})` } as CSSProperties}
            />
            <Text size="sm" weight="medium">
              {name}
            </Text>
            <Text size="xs" tone="muted" family="mono">
              {value}
            </Text>
          </div>
        ))}
      </div>
    </main>
  ),
};

export const Elevation: Story = {
  render: () => (
    <main className="gs-story-shell">
      <div className="gs-story-heading">
        <Text as="h1" size="3xl">
          Elevation
        </Text>
        <Text as="p" tone="muted">
          Border establishes hierarchy first. Four levels cap shadow opacity at
          six percent.
        </Text>
      </div>
      <div className="gs-story-foundation-grid">
        {elevations.map(([label, token, use]) => (
          <div
            className="gs-story-elevation-item"
            key={token}
            style={{ "--elevation": `var(--${token})` } as CSSProperties}
          >
            <Text weight="semibold">{label}</Text>
            <Text size="xs" tone="muted" family="mono">
              --{token}
            </Text>
            <Text size="sm" tone="muted">
              {use}
            </Text>
          </div>
        ))}
      </div>
    </main>
  ),
};

export const Motion: Story = {
  render: function MotionStory() {
    const [run, setRun] = useState(0);

    return (
      <main className="gs-story-shell">
        <div className="gs-story-heading">
          <Text as="h1" size="3xl">
            Motion
          </Text>
          <Text as="p" tone="muted">
            Movement settles with a single calm easing curve. Reduced-motion
            preferences collapse these demonstrations automatically.
          </Text>
        </div>
        <div className="gs-story-motion-list">
          {motion.map(([label, token, value]) => (
            <div className="gs-story-motion-row" key={token}>
              <div>
                <Text size="sm" weight="medium">
                  {label}
                </Text>
                <Text size="xs" tone="muted" family="mono">
                  {value}
                </Text>
              </div>
              <div className="gs-story-motion-track">
                <span
                  key={`${token}-${run}`}
                  className="gs-story-motion-marker"
                  style={
                    { "--motion-duration": `var(--${token})` } as CSSProperties
                  }
                />
              </div>
            </div>
          ))}
        </div>
        <div className="gs-story-actions">
          <Button
            variant="secondary"
            onClick={() => setRun((value) => value + 1)}
          >
            Replay motion
          </Button>
          <Text size="xs" tone="muted" family="mono">
            --easing-standard
          </Text>
        </div>
      </main>
    );
  },
};
