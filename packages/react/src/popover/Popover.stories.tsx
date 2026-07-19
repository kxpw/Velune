import type { CSSProperties } from "react";
import { useState } from "react";
import { Button } from "../button";
import { Input } from "../input";
import { Stack } from "../stack";
import { Text } from "../text";
import { Popover } from "./Popover";

const meta = {
  title: "React/Popover",
  component: Popover,
  parameters: {
    layout: "padded",
  },
};

export default meta;

const rowStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "var(--space-4)",
  padding: "var(--space-16)",
  justifyContent: "center",
};

const collisionStageStyle: CSSProperties = {
  position: "relative",
  inlineSize: "min(100%, 640px)",
  blockSize: 360,
  margin: "var(--space-6) auto",
  border: "1px dashed var(--color-border-strong)",
};

export const Default = {
  render: () => (
    <div style={rowStyle}>
      <Popover>
        <Popover.Trigger>
          <Button variant="secondary">Open popover</Button>
        </Popover.Trigger>
        <Popover.Content>
          <Stack gap="2">
            <Text weight="medium">Share project</Text>
            <Text tone="muted" size="sm">
              Anyone with the link can view this board.
            </Text>
            <Button size="sm">Copy link</Button>
          </Stack>
        </Popover.Content>
      </Popover>
    </div>
  ),
};

export const Placements = {
  render: () => (
    <div style={rowStyle}>
      {(["top", "right", "bottom", "left"] as const).map((placement) => (
        <Popover key={placement} placement={placement}>
          <Popover.Trigger>
            <Button variant="secondary">{placement}</Button>
          </Popover.Trigger>
          <Popover.Content>
            <Text size="sm">Anchored to {placement}</Text>
          </Popover.Content>
        </Popover>
      ))}
    </div>
  ),
};

export const CollisionBoundaries = {
  render: () => (
    <div style={collisionStageStyle}>
      <div
        style={{ position: "fixed", insetBlockStart: 64, insetInlineEnd: 0 }}
      >
        <Popover
          defaultOpen
          placement="bottom-start"
          style={{ inlineSize: 220 }}
        >
          <Popover.Trigger>
            <Button variant="secondary">Right edge</Button>
          </Popover.Trigger>
          <Popover.Content>
            <Text size="sm">
              This panel shifts left without changing sides.
            </Text>
          </Popover.Content>
        </Popover>
      </div>

      <div
        style={{ position: "fixed", insetBlockEnd: 0, insetInlineStart: 80 }}
      >
        <Popover defaultOpen placement="bottom">
          <Popover.Trigger>
            <Button variant="secondary">Bottom edge</Button>
          </Popover.Trigger>
          <Popover.Content>
            <Text size="sm">This panel flips above its anchor.</Text>
          </Popover.Content>
        </Popover>
      </div>
    </div>
  ),
};

export const Controlled = {
  render: function ControlledStory() {
    const [open, setOpen] = useState(false);
    return (
      <div style={rowStyle}>
        <Popover open={open} onOpenChange={setOpen}>
          <Popover.Trigger>
            <Button>Toggle</Button>
          </Popover.Trigger>
          <Popover.Content>
            <Stack gap="2">
              <Text>Controlled open: {String(open)}</Text>
              <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
                Close
              </Button>
            </Stack>
          </Popover.Content>
        </Popover>
      </div>
    );
  },
};

export const FocusLifecycle = {
  render: () => (
    <div style={rowStyle}>
      <Popover>
        <Popover.Trigger>
          <Button variant="secondary">Rename</Button>
        </Popover.Trigger>
        <Popover.Content>
          <Stack gap="2">
            <Text weight="medium">Rename board</Text>
            <Input aria-label="Board name" defaultValue="Roadmap" />
            <Button size="sm">Apply</Button>
          </Stack>
        </Popover.Content>
      </Popover>
      <Button variant="ghost">Outside action</Button>
    </div>
  ),
};
