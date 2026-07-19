import type { CSSProperties } from "react";
import { Progress } from "./Progress";

const meta = {
  title: "React/Progress",
  component: Progress,
  parameters: {
    layout: "padded",
  },
};

export default meta;

const stackStyle: CSSProperties = {
  display: "grid",
  gap: "var(--space-6)",
  maxWidth: "420px",
  padding: "var(--space-6)",
};

export const Default = {
  render: () => (
    <div style={stackStyle}>
      <Progress value={64} aria-label="Upload progress" />
    </div>
  ),
};

export const WithValue = {
  render: () => (
    <div style={stackStyle}>
      <Progress value={24} aria-label="Importing" showValue />
      <Progress value={64} aria-label="Transcoding" showValue />
      <Progress value={100} aria-label="Publishing" showValue />
    </div>
  ),
};

export const Sizes = {
  render: () => (
    <div style={stackStyle}>
      <Progress size="sm" value={40} aria-label="Small progress" />
      <Progress size="md" value={40} aria-label="Medium progress" />
    </div>
  ),
};

export const Indeterminate = {
  render: () => (
    <div style={stackStyle}>
      <Progress aria-label="Processing" />
    </div>
  ),
};

export const CustomValueText = {
  render: () => (
    <div style={stackStyle}>
      <Progress
        value={38}
        max={50}
        aria-label="File processing progress"
        getValueLabel={(value, max) => `${value} of ${max} files processed`}
        showValue
      />
    </div>
  ),
};
