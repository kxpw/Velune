import type { CSSProperties } from "react";
import { Spinner } from "./Spinner";

const meta = {
  title: "React/Spinner",
  component: Spinner,
  parameters: {
    layout: "padded",
  },
};

export default meta;

const rowStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: "var(--space-4)",
  padding: "var(--space-6)",
};

export const Default = {
  render: () => (
    <div style={rowStyle}>
      <Spinner />
    </div>
  ),
};

export const Sizes = {
  render: () => (
    <div style={rowStyle}>
      <Spinner size="sm" />
      <Spinner size="md" />
      <Spinner size="lg" />
    </div>
  ),
};

export const Tones = {
  render: () => (
    <div style={rowStyle}>
      <Spinner tone="primary" />
      <Spinner tone="muted" />
      <Spinner tone="success" />
      <Spinner tone="warning" />
      <Spinner tone="error" />
      <Spinner tone="info" />
      <span style={{ color: "var(--color-primary)", display: "inline-flex" }}>
        <Spinner tone="current" />
      </span>
    </div>
  ),
};

export const WithLabel = {
  render: () => (
    <div style={rowStyle}>
      <Spinner aria-label="Saving changes" size="lg" />
    </div>
  ),
};
