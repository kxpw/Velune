import type { CSSProperties } from "react";
import { Button } from "../button";
import { Badge } from "./Badge";

const meta = {
  title: "React/Badge",
  component: Badge,
  parameters: { layout: "padded" },
};

export default meta;

const row: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "var(--space-6)",
  padding: "var(--space-6)",
  alignItems: "center",
};

export const Counts = {
  render: () => (
    <div style={row}>
      <Badge count={5} />
      <Badge count={12} tone="primary" />
      <Badge count={120} />
      <Badge count={0} showZero />
      <Badge dot />
      <Badge dot tone="success" />
    </div>
  ),
};

export const Attached = {
  render: () => (
    <div style={row}>
      <Badge count={3}>
        <Button variant="secondary">Inbox</Button>
      </Badge>
      <Badge count={128} tone="primary">
        <Button>Messages</Button>
      </Badge>
      <Badge dot tone="error">
        <Button variant="ghost">Alerts</Button>
      </Badge>
      <Badge count={0}>
        <Button variant="secondary">Empty</Button>
      </Badge>
    </div>
  ),
};

export const Tones = {
  render: () => (
    <div style={row}>
      {(
        ["default", "primary", "success", "warning", "error", "info"] as const
      ).map((tone) => (
        <Badge key={tone} count={9} tone={tone} />
      ))}
    </div>
  ),
};
