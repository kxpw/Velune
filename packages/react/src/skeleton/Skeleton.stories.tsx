import type { CSSProperties } from "react";
import { Skeleton } from "./Skeleton";

const meta = {
  title: "React/Skeleton",
  component: Skeleton,
  parameters: { layout: "padded" },
};

export default meta;

const column: CSSProperties = {
  display: "grid",
  gap: "var(--space-3)",
  maxWidth: "28rem",
  padding: "var(--space-6)",
};

export const Default = {
  render: () => (
    <div style={column}>
      <Skeleton width="72%" />
      <Skeleton />
      <Skeleton width="46%" />
    </div>
  ),
};

export const Variants = {
  render: () => (
    <div style={column}>
      <Skeleton variant="text" width="70%" />
      <Skeleton variant="rectangular" height={96} />
      <Skeleton variant="rounded" height={96} />
      <Skeleton variant="circular" width={48} />
    </div>
  ),
};

export const Animations = {
  render: () => (
    <div style={column}>
      <Skeleton animation="pulse" height={32} variant="rounded" />
      <Skeleton animation="wave" height={32} variant="rounded" />
      <Skeleton animation="none" height={32} variant="rounded" />
    </div>
  ),
};

export const ContentPreview = {
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "3rem 1fr",
        gap: "var(--space-3)",
        alignItems: "center",
        maxWidth: "28rem",
        padding: "var(--space-6)",
      }}
    >
      <Skeleton variant="circular" width={48} />
      <div style={{ display: "grid", gap: "var(--space-2)" }}>
        <Skeleton width="42%" />
        <Skeleton width="84%" />
      </div>
      <Skeleton
        variant="rounded"
        height={160}
        style={{ gridColumn: "1 / -1" }}
      />
    </div>
  ),
};
