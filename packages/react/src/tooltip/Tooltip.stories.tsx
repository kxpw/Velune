import type { CSSProperties } from "react";
import { Button } from "../button";
import { Tooltip } from "./Tooltip";

const meta = {
  title: "React/Tooltip",
  component: Tooltip,
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

export const Default = {
  render: () => (
    <div style={rowStyle}>
      <Tooltip>
        <Tooltip.Trigger>
          <Button variant="secondary">Hover me</Button>
        </Tooltip.Trigger>
        <Tooltip.Content>Copy to clipboard</Tooltip.Content>
      </Tooltip>
    </div>
  ),
};

export const Placements = {
  render: () => (
    <div style={rowStyle}>
      {(["top", "right", "bottom", "left"] as const).map((placement) => (
        <Tooltip key={placement} placement={placement}>
          <Tooltip.Trigger>
            <Button variant="secondary">{placement}</Button>
          </Tooltip.Trigger>
          <Tooltip.Content>{`Placement: ${placement}`}</Tooltip.Content>
        </Tooltip>
      ))}
    </div>
  ),
};

export const ClickTrigger = {
  render: () => (
    <div style={rowStyle}>
      <Tooltip trigger="click">
        <Tooltip.Trigger>
          <Button>Click toggle</Button>
        </Tooltip.Trigger>
        <Tooltip.Content>Pinned until click again or Esc</Tooltip.Content>
      </Tooltip>
    </div>
  ),
};

export const KeyboardHandoff = {
  render: () => (
    <div style={rowStyle}>
      <Tooltip delay={1000}>
        <Tooltip.Trigger>
          <Button variant="secondary">Previous</Button>
        </Tooltip.Trigger>
        <Tooltip.Content>Previous record</Tooltip.Content>
      </Tooltip>
      <Tooltip delay={1000}>
        <Tooltip.Trigger>
          <Button variant="secondary">Next</Button>
        </Tooltip.Trigger>
        <Tooltip.Content>Next record</Tooltip.Content>
      </Tooltip>
    </div>
  ),
};

export const SkipDelayHandoff = {
  render: () => (
    <div style={rowStyle}>
      {["Backlog", "In progress", "Complete"].map((status) => (
        <Tooltip
          key={status}
          delay={{ open: 800, close: 0 }}
          skipDelayDuration={400}
        >
          <Tooltip.Trigger>
            <Button variant="secondary">{status}</Button>
          </Tooltip.Trigger>
          <Tooltip.Content>{`${status} details`}</Tooltip.Content>
        </Tooltip>
      ))}
    </div>
  ),
};

export const LongContent = {
  render: () => (
    <div style={rowStyle}>
      <Tooltip>
        <Tooltip.Trigger>
          <Button variant="ghost">Long label</Button>
        </Tooltip.Trigger>
        <Tooltip.Content>
          This tooltip wraps longer copy so users can read the full explanation
          without crowding the layout.
        </Tooltip.Content>
      </Tooltip>
    </div>
  ),
};
