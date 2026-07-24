import type { CSSProperties } from "react";
import { useState } from "react";
import { Check } from "lucide-react";
import { Input } from "./Input";
import type { InputSize } from "./Input.types";

const meta = {
  title: "React/Input",
  component: Input,
  parameters: {
    layout: "padded",
  },
};

export default meta;

const stackStyle: CSSProperties = {
  display: "grid",
  gap: "var(--space-5)",
  padding: "var(--space-6)",
  maxWidth: 420,
};

const rowStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "var(--space-3)",
  padding: "var(--space-4)",
  alignItems: "flex-start",
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
      <Input aria-label="Name" placeholder="Name" />
    </div>
  ),
};

export const Sizes = {
  render: () => (
    <div style={stackStyle}>
      {sizes.map((size) => (
        <Input
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
      <Input type="email" placeholder="you@company.com" fullWidth>
        <Input.Label>Email</Input.Label>
        <Input.Description>We will never share your email.</Input.Description>
      </Input>
      <Input required placeholder="kaixin" fullWidth>
        <Input.Label>Username</Input.Label>
      </Input>
    </div>
  ),
};

export const Affixes = {
  render: () => (
    <div style={stackStyle}>
      <Input placeholder="0.00" fullWidth>
        <Input.Label>Amount</Input.Label>
        <Input.Prefix>$</Input.Prefix>
        <Input.Suffix>USD</Input.Suffix>
      </Input>
      <Input placeholder="velune" fullWidth>
        <Input.Label>Website</Input.Label>
        <Input.Prefix>https://</Input.Prefix>
        <Input.Suffix>.com</Input.Suffix>
      </Input>
      <Input placeholder="Find components" clearable fullWidth>
        <Input.Label>Search</Input.Label>
        <Input.Prefix>
          <Check className="gs-input-affix-icon" />
        </Input.Prefix>
      </Input>
    </div>
  ),
};

export const Password = {
  render: () => (
    <div style={stackStyle}>
      <Input type="password" placeholder="Enter password" fullWidth>
        <Input.Label>Password</Input.Label>
        <Input.Description>At least 8 characters.</Input.Description>
      </Input>
      <Input type="password" defaultValue="secret-value" clearable fullWidth>
        <Input.Label>Password + clear</Input.Label>
      </Input>
    </div>
  ),
};

export const Clearable = {
  render: () => (
    <div style={stackStyle}>
      <Input defaultValue="Velune" clearable fullWidth>
        <Input.Label>Project name</Input.Label>
      </Input>
    </div>
  ),
};

export const States = {
  render: () => (
    <div style={stackStyle}>
      <div>
        <p style={labelStyle}>Default / filled</p>
        <div style={{ display: "grid", gap: "var(--space-3)" }}>
          <Input aria-label="Empty" placeholder="Empty" fullWidth />
          <Input aria-label="Filled" defaultValue="Filled value" fullWidth />
        </div>
      </div>
      <div>
        <p style={labelStyle}>Disabled / readonly</p>
        <div style={{ display: "grid", gap: "var(--space-3)" }}>
          <Input aria-label="Disabled" disabled value="Disabled" fullWidth />
          <Input aria-label="Readonly" readOnly value="Read only" fullWidth />
        </div>
      </div>
      <div>
        <p style={labelStyle}>Invalid</p>
        <div style={{ display: "grid", gap: "var(--space-3)" }}>
          <Input invalid defaultValue="not-an-email" fullWidth>
            <Input.Label>Email</Input.Label>
            <Input.ErrorMessage>
              Enter a valid email address.
            </Input.ErrorMessage>
          </Input>
        </div>
      </div>
    </div>
  ),
};

export const Controlled = {
  render: function ControlledStory() {
    const [value, setValue] = useState("Hello");
    return (
      <div style={stackStyle}>
        <Input
          value={value}
          onChange={(event) => setValue(event.currentTarget.value)}
          clearable
          fullWidth
        >
          <Input.Label>Controlled</Input.Label>
          <Input.Description>{`Length: ${value.length}`}</Input.Description>
        </Input>
      </div>
    );
  },
};

export const Composition = {
  render: () => (
    <div style={rowStyle}>
      <Input size="sm" placeholder="Small" aria-label="Small" />
      <Input placeholder="Medium" aria-label="Medium" clearable />
      <Input size="lg" placeholder="Large" aria-label="Large" />
    </div>
  ),
};
