import type { CSSProperties } from "react";
import { Avatar } from "./Avatar";

const meta = {
  title: "React/Avatar",
  component: Avatar,
  parameters: { layout: "padded" },
};

export default meta;

const row: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "var(--space-4)",
  padding: "var(--space-6)",
  alignItems: "center",
};

export const Fallbacks = {
  render: () => (
    <div style={row}>
      <Avatar name="Ada Lovelace" />
      <Avatar name="Lin" />
      <Avatar />
      <Avatar shape="square" name="SQ" />
    </div>
  ),
};

export const Sizes = {
  render: () => (
    <div style={row}>
      {(["xs", "sm", "md", "lg", "xl"] as const).map((size) => (
        <Avatar key={size} size={size} name="Maya Chen" />
      ))}
    </div>
  ),
};

export const Group = {
  render: () => (
    <div style={row}>
      <Avatar.Group max={3}>
        <Avatar name="Ada Lovelace" />
        <Avatar name="Grace Hopper" />
        <Avatar name="Alan Turing" />
        <Avatar name="Katherine Johnson" />
        <Avatar name="Claude Shannon" />
      </Avatar.Group>
    </div>
  ),
};

export const CustomOverflowLabel = {
  render: () => (
    <div style={row}>
      <Avatar.Group
        max={2}
        overflowLabel={(count) => `${count} more members`}
        aria-label="Project members"
      >
        <Avatar name="Ada Lovelace" />
        <Avatar name="Grace Hopper" />
        <Avatar name="Alan Turing" />
        <Avatar name="Katherine Johnson" />
      </Avatar.Group>
    </div>
  ),
};

export const WithImage = {
  render: () => (
    <div style={row}>
      <Avatar
        src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop"
        alt="User"
        name="User"
      />
      <Avatar src="https://invalid.example/broken.jpg" name="Fallback" />
    </div>
  ),
};
