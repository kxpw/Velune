import type { CSSProperties } from "react";
import { Button } from "../button";
import { Text } from "../text";
import { Flex } from "./Flex";

const meta = {
  title: "React/Flex",
  component: Flex,
  parameters: { layout: "padded" },
};

export default meta;

const shell: CSSProperties = { padding: "var(--space-6)" };
const item: CSSProperties = {
  padding: "var(--space-3)",
  borderRadius: "var(--radius-md)",
  background: "var(--color-bg-subtle)",
};

export const Default = {
  render: () => (
    <div style={shell}>
      <Flex gap="3" align="center">
        <div style={item}>One</div>
        <div style={item}>Two</div>
        <div style={item}>Three</div>
      </Flex>
    </div>
  ),
};

export const Justify = {
  render: () => (
    <div style={shell}>
      <Flex gap="3" justify="between" fullWidth align="center">
        <Text weight="medium">Title</Text>
        <Flex gap="2">
          <Button size="sm" variant="secondary">
            Cancel
          </Button>
          <Button size="sm">Save</Button>
        </Flex>
      </Flex>
    </div>
  ),
};

export const Wrap = {
  render: () => (
    <div style={{ ...shell, maxWidth: 320 }}>
      <Flex gap="2" wrap>
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} style={item}>
            Item {i + 1}
          </div>
        ))}
      </Flex>
    </div>
  ),
};
