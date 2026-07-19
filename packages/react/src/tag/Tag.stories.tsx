import type { CSSProperties } from "react";
import { useState } from "react";
import { Tag } from "./Tag";

const meta = {
  title: "React/Tag",
  component: Tag,
  parameters: { layout: "padded" },
};

export default meta;

const row: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "var(--space-2)",
  padding: "var(--space-6)",
  alignItems: "center",
};

export const Default = {
  render: () => (
    <div style={row}>
      <Tag>Default</Tag>
      <Tag tone="primary">Primary</Tag>
      <Tag tone="success">Success</Tag>
      <Tag tone="warning">Warning</Tag>
      <Tag tone="error">Error</Tag>
      <Tag tone="info">Info</Tag>
      <Tag tone="muted">Muted</Tag>
    </div>
  ),
};

export const Sizes = {
  render: () => (
    <div style={row}>
      <Tag size="sm">Small</Tag>
      <Tag size="md">Medium</Tag>
    </div>
  ),
};

export const Closable = {
  render: function ClosableStory() {
    const [tags, setTags] = useState(["Design", "React", "Tokens"]);
    return (
      <div style={row}>
        {tags.map((tag) => (
          <Tag
            key={tag}
            closable
            onClose={() =>
              setTags((list) => list.filter((item) => item !== tag))
            }
          >
            {tag}
          </Tag>
        ))}
      </div>
    );
  },
};

export const Interactive = {
  render: () => (
    <div style={row}>
      <Tag tone="primary" onClick={() => undefined}>
        Clickable
      </Tag>
      <Tag disabled>Disabled</Tag>
    </div>
  ),
};
