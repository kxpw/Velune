import type { CSSProperties } from "react";
import { Text } from "velune/react";
import { themeTokens } from "velune/react";

const meta = {
  title: "Design System/Tokens",
};

export default meta;

type Story = {
  render: () => JSX.Element;
};

const layoutSpacing = [
  ["spacing-xs", "8px", "Small layout gap"],
  ["spacing-sm", "16px", "Related content"],
  ["spacing-md", "24px", "Component groups"],
  ["spacing-lg", "32px", "Surface padding"],
  ["spacing-xl", "48px", "Content regions"],
  ["spacing-2xl", "64px", "Desktop gutter"],
  ["spacing-3xl", "104px", "Large section rhythm"],
] as const;

function TokenRow({ name, value }: { name: string; value: string }) {
  return (
    <div className="gs-story-token-row">
      <Text size="sm" family="mono">
        --{name}
      </Text>
      <Text size="sm" tone="muted" family="mono">
        {value}
      </Text>
    </div>
  );
}

export const TokenIndex: Story = {
  render: () => {
    const tokenGroups = Object.entries(themeTokens).filter(
      ([name]) => name !== "reference" && name !== "semantic",
    );

    return (
      <main className="gs-story-shell">
        <div className="gs-story-heading">
          <Text as="h1" size="3xl">
            Public token index
          </Text>
          <Text as="p" tone="muted">
            Runtime values generated from packages/react/tokens.json. New
            components consume semantic or component tokens only.
          </Text>
        </div>
        {tokenGroups.map(([group, tokens]) => (
          <section className="gs-story-section" key={group}>
            <Text as="h2" size="xl">
              {group}
            </Text>
            <div className="gs-story-token-list">
              {Object.entries(tokens).map(([name, value]) => (
                <TokenRow key={name} name={name} value={String(value)} />
              ))}
            </div>
          </section>
        ))}
      </main>
    );
  },
};

export const Spacing: Story = {
  render: () => (
    <main className="gs-story-shell">
      <div className="gs-story-heading">
        <Text as="h1" size="3xl">
          Velune spacing
        </Text>
        <Text as="p" tone="muted">
          Page layout follows an 8pt rhythm. The 4px atomic token remains for
          optical correction and compact component internals.
        </Text>
      </div>
      <div className="gs-story-spacing-list">
        {layoutSpacing.map(([name, value, use]) => (
          <div className="gs-story-spacing-row" key={name}>
            <div>
              <Text size="sm" weight="medium">
                {name}
              </Text>
              <Text size="xs" tone="muted">
                {value} · {use}
              </Text>
            </div>
            <div className="gs-story-spacing-track">
              <div
                className="gs-story-space"
                style={
                  {
                    "--space-width": `var(--${name})`,
                  } as CSSProperties
                }
              />
            </div>
          </div>
        ))}
        <div className="gs-story-spacing-row">
          <div>
            <Text size="sm" weight="medium">
              control-hit-target
            </Text>
            <Text size="xs" tone="muted">
              44px · minimum interactive area
            </Text>
          </div>
          <div className="gs-story-hit-target" aria-label="44px hit target">
            44
          </div>
        </div>
      </div>
    </main>
  ),
};
