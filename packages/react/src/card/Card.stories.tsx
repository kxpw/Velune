import type { CSSProperties } from "react";
import { Button } from "../button";
import { Tag } from "../tag";
import { Text } from "../text";
import { Card } from "./Card";

const meta = {
  title: "React/Card",
  component: Card,
  parameters: { layout: "padded" },
};

export default meta;

const grid: CSSProperties = {
  display: "grid",
  gap: "var(--space-4)",
  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
  padding: "var(--space-6)",
};

export const Variants = {
  render: () => (
    <div style={grid}>
      <Card variant="outlined">
        <Card.Header>
          <Card.Title>Outlined</Card.Title>
          <Card.Description>Subtle edge, no shadow</Card.Description>
        </Card.Header>
        <Card.Body>
          <Text tone="muted" size="sm">
            Use for dense dashboards and nested surfaces.
          </Text>
        </Card.Body>
      </Card>
      <Card variant="filled">
        <Card.Header>
          <Card.Title>Filled</Card.Title>
          <Card.Description>Soft tinted background</Card.Description>
        </Card.Header>
        <Card.Body>
          <Text tone="muted" size="sm">
            Reads as a quiet grouping without elevation.
          </Text>
        </Card.Body>
      </Card>
      <Card variant="elevated">
        <Card.Header>
          <Card.Title>Elevated</Card.Title>
          <Card.Description>Default raised surface</Card.Description>
        </Card.Header>
        <Card.Body>
          <Text tone="muted" size="sm">
            Best for primary content blocks.
          </Text>
        </Card.Body>
      </Card>
    </div>
  ),
};

export const WithSections = {
  render: () => (
    <div style={{ ...grid, maxWidth: 420 }}>
      <Card>
        <Card.Header>
          <Card.Title>Project overview</Card.Title>
          <Card.Description>Shared with 12 collaborators</Card.Description>
          <Card.Action>
            <Tag size="sm" tone="primary">
              Active
            </Tag>
          </Card.Action>
        </Card.Header>
        <Card.Body>
          <Text size="sm">
            Velune ships borderless surfaces, soft tints, and token-driven
            spacing so cards stay calm in light and dark themes.
          </Text>
        </Card.Body>
        <Card.Footer>
          <Button size="sm" variant="ghost">
            Dismiss
          </Button>
          <Button size="sm">Open</Button>
        </Card.Footer>
      </Card>
    </div>
  ),
};

export const Interactive = {
  render: () => (
    <div style={grid}>
      {(["outlined", "filled", "elevated"] as const).map((variant) => (
        <Card
          key={variant}
          variant={variant}
          interactive
          onClick={() => undefined}
        >
          <Card.Header>
            <Card.Title>{variant}</Card.Title>
            <Card.Description>Click or focus + Enter</Card.Description>
          </Card.Header>
          <Card.Body>
            <Text size="sm" tone="muted">
              Hover and focus states lift or tint the surface.
            </Text>
          </Card.Body>
        </Card>
      ))}
    </div>
  ),
};

export const Compact = {
  render: () => (
    <div style={{ ...grid, maxWidth: 360 }}>
      <Card size="sm" variant="filled">
        <Card.Header>
          <Card.Title>Compact card</Card.Title>
          <Card.Action>
            <Button size="sm">Edit</Button>
          </Card.Action>
        </Card.Header>
        <Card.Body>
          <Text size="sm">Smaller padding for sidebars and rails.</Text>
        </Card.Body>
        <Card.Footer align="between">
          <Text size="xs" tone="muted">
            Updated 2h ago
          </Text>
          <Button size="sm" variant="secondary">
            Details
          </Button>
        </Card.Footer>
      </Card>
    </div>
  ),
};
