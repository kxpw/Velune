import type { CSSProperties } from "react";
import { Button } from "../button";
import { Text } from "../text";
import { Stack } from "./Stack";

const meta = {
  title: "React/Stack",
  component: Stack,
  parameters: { layout: "padded" },
};

export default meta;

const shell: CSSProperties = { padding: "var(--space-6)", maxWidth: 360 };

export const Default = {
  render: () => (
    <div style={shell}>
      <Stack gap="3">
        <Text weight="medium">Profile</Text>
        <Text tone="muted">Vertical rhythm with token spacing.</Text>
        <Button>Continue</Button>
      </Stack>
    </div>
  ),
};

export const Align = {
  render: () => (
    <div style={shell}>
      <Stack gap="3" align="center" fullWidth>
        <Text align="center" weight="medium">
          Centered stack
        </Text>
        <Button variant="secondary">Action</Button>
      </Stack>
    </div>
  ),
};

export const Responsive = {
  render: () => (
    <div style={shell}>
      <Stack gap={{ base: "2", md: "4" }} reverse={{ base: false, lg: true }}>
        <Text weight="medium">Responsive rhythm</Text>
        <Text tone="muted">Spacing and order change at larger viewports.</Text>
      </Stack>
    </div>
  ),
};
