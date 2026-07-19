import type { CSSProperties } from "react";
import { useRef, useState } from "react";
import { Button } from "../button";
import { Checkbox } from "./Checkbox";
import type { CheckboxSize } from "./Checkbox.types";

const meta = {
  title: "React/Checkbox",
  component: Checkbox,
  parameters: {
    layout: "padded",
  },
};

export default meta;

const rowStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: "var(--space-4)",
  padding: "var(--space-4)",
};

const stackStyle: CSSProperties = {
  display: "grid",
  gap: "var(--space-5)",
  padding: "var(--space-6)",
  maxWidth: 480,
};

const labelStyle: CSSProperties = {
  margin: 0,
  color: "var(--color-text-muted)",
  fontSize: "var(--font-size-xs)",
  fontWeight: "var(--font-weight-medium)" as CSSProperties["fontWeight"],
  letterSpacing: "0.04em",
  textTransform: "uppercase",
};

const sizes: CheckboxSize[] = ["sm", "md", "lg"];

export const Default = {
  render: () => (
    <div style={rowStyle}>
      <Checkbox defaultChecked>Accept terms</Checkbox>
    </div>
  ),
};

export const Sizes = {
  render: () => (
    <div style={stackStyle}>
      {sizes.map((size) => (
        <Checkbox key={size} size={size} defaultChecked>
          Size {size}
        </Checkbox>
      ))}
    </div>
  ),
};

export const States = {
  render: () => (
    <div style={stackStyle}>
      <div>
        <p style={labelStyle}>Interactive</p>
        <div style={{ display: "grid", gap: "var(--space-2)" }}>
          <Checkbox>Unchecked</Checkbox>
          <Checkbox defaultChecked>Checked</Checkbox>
          <Checkbox indeterminate>Indeterminate</Checkbox>
          <Checkbox required>Required</Checkbox>
          <Checkbox aria-invalid="true">Invalid</Checkbox>
          <Checkbox aria-invalid="true" defaultChecked>
            Invalid checked
          </Checkbox>
        </div>
      </div>
      <div>
        <p style={labelStyle}>Disabled</p>
        <div style={{ display: "grid", gap: "var(--space-2)" }}>
          <Checkbox disabled>Disabled</Checkbox>
          <Checkbox disabled defaultChecked>
            Disabled checked
          </Checkbox>
          <Checkbox disabled indeterminate>
            Disabled indeterminate
          </Checkbox>
        </div>
      </div>
    </div>
  ),
};

export const WithDescription = {
  render: () => (
    <div style={stackStyle}>
      <Checkbox defaultChecked>
        Subscribe to newsletter
        <Checkbox.Description>
          We will only email product updates. No spam.
        </Checkbox.Description>
      </Checkbox>
      <Checkbox size="sm" required>
        Enable advanced security
        <Checkbox.Description>
          Applies to all workspaces you own.
        </Checkbox.Description>
      </Checkbox>
      <Checkbox aria-invalid="true">
        Confirm data processing
        <Checkbox.Description>
          This preference can be changed later in settings.
        </Checkbox.Description>
      </Checkbox>
    </div>
  ),
};

export const Controlled = {
  render: function ControlledStory() {
    const [checked, setChecked] = useState(false);
    return (
      <div style={stackStyle}>
        <Checkbox
          checked={checked}
          onChange={(event) => setChecked(event.currentTarget.checked)}
        >
          Controlled ({checked ? "on" : "off"})
          <Checkbox.Description>
            State is controlled by React.
          </Checkbox.Description>
        </Checkbox>
      </div>
    );
  },
};

export const IndeterminateParent = {
  name: "Parent / children",
  render: function ParentChildrenStory() {
    const options = ["Email", "SMS", "Push"] as const;
    const [selected, setSelected] = useState<string[]>(["Email"]);
    const allChecked = selected.length === options.length;
    const indeterminate = selected.length > 0 && !allChecked;

    return (
      <div style={stackStyle}>
        <Checkbox
          checked={allChecked}
          indeterminate={indeterminate}
          onChange={(event) => {
            setSelected(event.currentTarget.checked ? [...options] : []);
          }}
        >
          Notify me about everything
        </Checkbox>
        <Checkbox.Group
          value={selected}
          onValueChange={setSelected}
          name="channels"
          orientation="vertical"
        >
          {options.map((option) => (
            <Checkbox key={option} value={option}>
              {option}
            </Checkbox>
          ))}
        </Checkbox.Group>
      </div>
    );
  },
};

export const Group = {
  render: () => (
    <div style={stackStyle}>
      <div>
        <p style={labelStyle}>Vertical</p>
        <Checkbox.Group
          defaultValue={["a"]}
          name="prefs"
          orientation="vertical"
        >
          <Checkbox value="a">
            Email digests
            <Checkbox.Description>Morning summary</Checkbox.Description>
          </Checkbox>
          <Checkbox value="b">
            Product updates
            <Checkbox.Description>Feature launches</Checkbox.Description>
          </Checkbox>
          <Checkbox value="c">
            Security alerts
            <Checkbox.Description>Critical only</Checkbox.Description>
          </Checkbox>
        </Checkbox.Group>
      </div>
      <div>
        <p style={labelStyle}>Horizontal · sm · disabled group</p>
        <Checkbox.Group
          defaultValue={["b"]}
          orientation="horizontal"
          size="sm"
          disabled
          name="cadence"
        >
          <Checkbox value="a">Daily</Checkbox>
          <Checkbox value="b">Weekly</Checkbox>
          <Checkbox value="c">Monthly</Checkbox>
        </Checkbox.Group>
      </div>
    </div>
  ),
};

export const BatchedGroupChanges = {
  name: "Batched group changes",
  render: function BatchedGroupChangesStory() {
    const [selected, setSelected] = useState<string[]>([]);
    const groupRef = useRef<HTMLDivElement>(null);
    return (
      <div style={stackStyle}>
        <Button
          variant="secondary"
          onClick={() => {
            const inputs = groupRef.current?.querySelectorAll("input");
            inputs?.[0]?.click();
            inputs?.[1]?.click();
          }}
        >
          Enable essentials
        </Button>
        <Checkbox.Group
          ref={groupRef}
          value={selected}
          onValueChange={setSelected}
          aria-label="Essential features"
        >
          <Checkbox value="search">Search</Checkbox>
          <Checkbox value="export">Export</Checkbox>
          <Checkbox value="audit">Audit log</Checkbox>
        </Checkbox.Group>
      </div>
    );
  },
};

export const LongLabel = {
  render: () => (
    <div style={{ ...stackStyle, maxWidth: 360 }}>
      <Checkbox defaultChecked>
        I agree to the processing of my personal data for account security,
        product improvement, and optional marketing communications.
        <Checkbox.Description>
          You can withdraw consent at any time from account settings.
        </Checkbox.Description>
      </Checkbox>
    </div>
  ),
};
