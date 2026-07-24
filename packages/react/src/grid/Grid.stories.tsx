import type { CSSProperties } from "react";
import { Text } from "../text";
import { Grid } from "./Grid";

const meta = {
  title: "React/Grid",
  component: Grid,
  parameters: { layout: "padded" },
};

export default meta;

const shell: CSSProperties = { padding: "var(--space-6)" };
const cell: CSSProperties = {
  padding: "var(--space-4)",
  borderRadius: "var(--radius-sm)",
  background: "var(--color-surface-mist)",
};

export const Default = {
  render: () => (
    <div style={shell}>
      <Grid columns={3} gap="3">
        <div style={cell}>
          <Text weight="medium">One</Text>
        </div>
        <div style={cell}>
          <Text weight="medium">Two</Text>
        </div>
        <div style={cell}>
          <Text weight="medium">Three</Text>
        </div>
      </Grid>
    </div>
  ),
};

export const Responsive = {
  render: () => (
    <div style={shell}>
      <Text tone="muted" size="sm">
        Collapses to 1 column below 768px
      </Text>
      <div style={{ marginTop: "var(--space-3)" }}>
        <Grid
          columns={{ base: 1, sm: 2, lg: 4 }}
          gap={{ base: "2", md: "3" }}
          responsive={false}
        >
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} style={cell}>
              Col {i + 1}
            </div>
          ))}
        </Grid>
      </div>
    </div>
  ),
};
