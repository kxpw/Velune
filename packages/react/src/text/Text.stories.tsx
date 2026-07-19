import type { CSSProperties } from "react";
import { Stack } from "../stack";
import { Text } from "./Text";

const meta = {
  title: "React/Text",
  component: Text,
  parameters: { layout: "padded" },
};

export default meta;

const shell: CSSProperties = { padding: "var(--space-6)", maxWidth: 560 };

export const Default = {
  render: () => (
    <div style={shell}>
      <Text>Body text</Text>
    </div>
  ),
};

export const Sizes = {
  render: () => (
    <div style={shell}>
      <Stack gap="3">
        <Text size="xs">Extra small</Text>
        <Text size="sm">Small</Text>
        <Text size="md">Medium</Text>
        <Text size="lg">Large</Text>
        <Text size="xl">Extra large</Text>
        <Text size="2xl" weight="semibold">
          Heading 2xl
        </Text>
        <Text size="3xl" weight="semibold" as="h2">
          Heading 3xl
        </Text>
        <Text size="4xl" weight="bold" as="h1">
          Heading 4xl
        </Text>
        <Text size="display" weight="bold" as="h1">
          Display
        </Text>
      </Stack>
    </div>
  ),
};

export const Tones = {
  render: () => (
    <div style={shell}>
      <Stack gap="2">
        <Text>Default</Text>
        <Text muted>Muted</Text>
        <Text tone="primary">Primary</Text>
        <Text tone="success">Success</Text>
        <Text tone="warning">Warning</Text>
        <Text tone="error">Error</Text>
        <Text family="mono" size="sm">
          mono: const value = 42
        </Text>
      </Stack>
    </div>
  ),
};

export const Truncate = {
  render: () => (
    <div style={{ ...shell, maxWidth: 280 }}>
      <Stack gap="3">
        <Text truncate>
          Single line truncation for a very long sentence that should ellipsis.
        </Text>
        <Text lines={2}>
          Multi-line clamp keeps two rows of copy and hides the rest of this
          paragraph once it overflows the available width of the container.
        </Text>
      </Stack>
    </div>
  ),
};

export const Cjk = {
  render: () => (
    <div style={shell}>
      <Text cjk as="p">
        CJK typography uses relaxed line height and spacing.
      </Text>
    </div>
  ),
};
