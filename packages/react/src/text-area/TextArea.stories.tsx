import type { CSSProperties } from "react";
import { useState } from "react";
import { TextArea } from "./TextArea";
import type { InputSize } from "../input";

const meta = {
  title: "React/TextArea",
  component: TextArea,
  parameters: {
    layout: "padded",
  },
};

export default meta;

const stackStyle: CSSProperties = {
  display: "grid",
  gap: "var(--space-5)",
  padding: "var(--space-6)",
  maxWidth: 480,
};

const labelStyle: CSSProperties = {
  margin: 0,
  color: "var(--color-text-secondary)",
  fontSize: "var(--font-size-xs)",
  fontWeight: "var(--font-weight-medium)" as CSSProperties["fontWeight"],
  letterSpacing: "0.04em",
  textTransform: "uppercase",
};

const sizes: InputSize[] = ["sm", "md", "lg"];

export const Default = {
  render: () => (
    <div style={stackStyle}>
      <TextArea aria-label="Description" placeholder="Write something…" />
    </div>
  ),
};

export const Sizes = {
  render: () => (
    <div style={stackStyle}>
      {sizes.map((size) => (
        <TextArea
          key={size}
          size={size}
          aria-label={`Size ${size}`}
          placeholder={`Size ${size}`}
          fullWidth
        />
      ))}
    </div>
  ),
};

export const WithLabel = {
  render: () => (
    <div style={stackStyle}>
      <TextArea placeholder="Tell us about yourself" fullWidth>
        <TextArea.Label>Bio</TextArea.Label>
        <TextArea.Description>
          Visible on your public profile.
        </TextArea.Description>
      </TextArea>
      <TextArea required placeholder="Required notes" fullWidth>
        <TextArea.Label>Notes</TextArea.Label>
      </TextArea>
    </div>
  ),
};

export const WithCount = {
  render: () => (
    <div style={stackStyle}>
      <TextArea maxLength={120} showCount placeholder="Keep it short" fullWidth>
        <TextArea.Label>Short bio</TextArea.Label>
      </TextArea>
    </div>
  ),
};

export const Autosize = {
  render: () => (
    <div style={stackStyle}>
      <TextArea
        autosize={{ minRows: 2, maxRows: 8 }}
        placeholder="Type multiple lines…"
        fullWidth
      >
        <TextArea.Label>Autosize</TextArea.Label>
        <TextArea.Description>
          Grows with content up to 8 rows.
        </TextArea.Description>
      </TextArea>
    </div>
  ),
};

export const States = {
  render: () => (
    <div style={stackStyle}>
      <div>
        <p style={labelStyle}>Disabled / readonly</p>
        <div style={{ display: "grid", gap: "var(--space-3)" }}>
          <TextArea
            aria-label="Disabled"
            disabled
            value="Disabled content"
            fullWidth
          />
          <TextArea
            aria-label="Readonly"
            readOnly
            value="Read only content"
            fullWidth
          />
        </div>
      </div>
      <div>
        <p style={labelStyle}>Invalid</p>
        <TextArea
          invalid
          defaultValue="Too short"
          showCount
          maxLength={200}
          fullWidth
        >
          <TextArea.Label>Feedback</TextArea.Label>
          <TextArea.ErrorMessage>
            Please write at least 20 characters.
          </TextArea.ErrorMessage>
        </TextArea>
      </div>
    </div>
  ),
};

export const Controlled = {
  render: function ControlledStory() {
    const [value, setValue] = useState("Hello");
    return (
      <div style={stackStyle}>
        <TextArea
          value={value}
          onChange={(event) => setValue(event.currentTarget.value)}
          showCount
          maxLength={200}
          fullWidth
        >
          <TextArea.Label>Controlled</TextArea.Label>
          <TextArea.Description>{`Length: ${value.length}`}</TextArea.Description>
        </TextArea>
      </div>
    );
  },
};
