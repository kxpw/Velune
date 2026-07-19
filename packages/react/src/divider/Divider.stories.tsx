import type { CSSProperties } from "react";
import { Flex } from "../flex";
import { Stack } from "../stack";
import { Text } from "../text";
import { Divider } from "./Divider";

const meta = {
  title: "React/Divider",
  component: Divider,
  parameters: { layout: "padded" },
};

export default meta;

const shell: CSSProperties = { padding: "var(--space-6)", maxWidth: 480 };

export const Default = {
  render: () => (
    <div style={shell}>
      <Stack gap="4">
        <Text>Above</Text>
        <Divider />
        <Text>Below</Text>
      </Stack>
    </div>
  ),
};

export const WithLabel = {
  render: () => (
    <div style={shell}>
      <Stack gap="4">
        <Divider>Section</Divider>
        <Divider align="start">Start</Divider>
        <Divider align="end">End</Divider>
        <Divider dashed tone="subtle">
          Dashed subtle
        </Divider>
      </Stack>
    </div>
  ),
};

export const Vertical = {
  render: () => (
    <div style={shell}>
      <Flex gap="3" align="center">
        <Text>Left</Text>
        <Divider orientation="vertical" />
        <Text>Right</Text>
      </Flex>
    </div>
  ),
};
