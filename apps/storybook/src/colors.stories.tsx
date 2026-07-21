import type { CSSProperties } from "react";
import { Text } from "velune/react";

const colorFamilies = ["biscuit", "celadon", "clay", "oxblood"] as const;
const colorStops = [
  "50",
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
] as const;
const neutralStops = [
  "0",
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
  "1000",
] as const;

const semanticGroups = [
  {
    name: "Canvas and surface",
    tokens: [
      ["Canvas", "color-canvas"],
      ["Surface", "color-surface"],
      ["Raised", "color-surface-raised"],
      ["Ivory", "color-surface-mist"],
    ],
  },
  {
    name: "Interaction",
    tokens: [
      ["Biscuit", "color-primary"],
      ["Hover", "color-primary-hover"],
      ["Pressed", "color-primary-active"],
      ["Strong fill", "color-primary-strong"],
    ],
  },
  {
    name: "Ink and structure",
    tokens: [
      ["Ink", "color-text-primary"],
      ["Secondary text", "color-text-secondary"],
      ["Disabled text", "color-text-disabled"],
      ["Border · default", "color-border-default"],
      ["Border · strong", "color-border-strong"],
    ],
  },
  {
    name: "Status",
    tokens: [
      ["Success", "color-success"],
      ["Warning", "color-warning"],
      ["Error", "color-error"],
      ["Information", "color-info"],
    ],
  },
] as const;

const meta = {
  title: "Design System/Colors",
};

export default meta;

type Story = {
  render: () => JSX.Element;
};

function Swatch({ label, token }: { label: string; token: string }) {
  return (
    <div className="gs-story-swatch">
      <div
        className="gs-story-swatch-color"
        style={{ "--swatch-color": `var(--${token})` } as CSSProperties}
      />
      <div className="gs-story-swatch-body">
        <Text size="sm" weight="medium">
          {label}
        </Text>
        <Text size="xs" tone="muted" family="mono">
          --{token}
        </Text>
      </div>
    </div>
  );
}

export const SemanticColors: Story = {
  render: () => (
    <main className="gs-story-shell">
      <div className="gs-story-heading">
        <Text as="h1" size="3xl">
          Velune semantic color
        </Text>
        <Text as="p" tone="muted">
          Sweet-white surfaces carry the composition. Biscuit is reserved for
          the one action that matters, oxblood for consequences, and the
          celadon/clay status colors stay quiet by design.
        </Text>
      </div>
      {semanticGroups.map((group) => (
        <section className="gs-story-section" key={group.name}>
          <Text as="h2" size="xl">
            {group.name}
          </Text>
          <div className="gs-story-grid">
            {group.tokens.map(([label, token]) => (
              <Swatch key={token} label={label} token={token} />
            ))}
          </div>
        </section>
      ))}
    </main>
  ),
};

export const ReferenceScales: Story = {
  render: () => (
    <main className="gs-story-shell">
      <div className="gs-story-heading">
        <Text as="h1" size="3xl">
          Reference scales
        </Text>
        <Text as="p" tone="muted">
          Generated theme inputs. Components consume semantic roles instead of
          these palette values directly.
        </Text>
      </div>
      {colorFamilies.map((family) => (
        <section className="gs-story-section" key={family}>
          <Text as="h2" size="xl">
            {family}
          </Text>
          <div className="gs-story-grid gs-story-grid-dense">
            {colorStops.map((stop) => (
              <Swatch
                key={stop}
                label={stop}
                token={`color-${family}-${stop}`}
              />
            ))}
          </div>
        </section>
      ))}
      <section className="gs-story-section">
        <Text as="h2" size="xl">
          neutral
        </Text>
        <div className="gs-story-grid gs-story-grid-dense">
          {neutralStops.map((stop) => (
            <Swatch key={stop} label={stop} token={`color-neutral-${stop}`} />
          ))}
        </div>
      </section>
    </main>
  ),
};
