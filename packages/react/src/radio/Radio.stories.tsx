import type { CSSProperties } from "react";
import { useState } from "react";
import { Radio } from "./Radio";
import type { RadioSize } from "./Radio.types";

const meta = {
  title: "React/Radio",
  component: Radio,
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

const sizes: RadioSize[] = ["sm", "md", "lg"];

export const Default = {
  render: () => (
    <div style={stackStyle}>
      <Radio name="solo" defaultChecked>
        Default option
      </Radio>
    </div>
  ),
};

export const Sizes = {
  render: () => (
    <div style={stackStyle}>
      {sizes.map((size) => (
        <Radio key={size} size={size} name={`size-${size}`} defaultChecked>
          Size {size}
        </Radio>
      ))}
    </div>
  ),
};

export const Group = {
  render: () => (
    <div style={stackStyle}>
      <Radio.Group defaultValue="email" name="notify" orientation="vertical">
        <Radio.Group.Label>Notification channel</Radio.Group.Label>
        <Radio.Group.Description>
          Choose how we reach you.
        </Radio.Group.Description>
        <Radio value="email">
          Email
          <Radio.Description>Morning summary</Radio.Description>
        </Radio>
        <Radio value="sms">
          SMS
          <Radio.Description>Urgent only</Radio.Description>
        </Radio>
        <Radio value="push">
          Push
          <Radio.Description>Real-time alerts</Radio.Description>
        </Radio>
      </Radio.Group>

      <div>
        <p style={labelStyle}>Horizontal · sm</p>
        <Radio.Group
          defaultValue="weekly"
          name="cadence"
          orientation="horizontal"
          size="sm"
        >
          <Radio value="daily">Daily</Radio>
          <Radio value="weekly">Weekly</Radio>
          <Radio value="monthly">Monthly</Radio>
        </Radio.Group>
      </div>
    </div>
  ),
};

export const States = {
  render: () => (
    <div style={stackStyle}>
      <Radio.Group defaultValue="b" name="states" orientation="vertical">
        <Radio.Group.Label>Interactive</Radio.Group.Label>
        <Radio value="a">Unchecked</Radio>
        <Radio value="b">Checked</Radio>
        <Radio value="c" aria-invalid="true">
          Invalid option
        </Radio>
      </Radio.Group>

      <Radio name="invalid-selected" defaultChecked aria-invalid="true">
        Invalid selected
      </Radio>

      <Radio.Group
        defaultValue="x"
        name="disabled-group"
        disabled
        orientation="vertical"
      >
        <Radio.Group.Label>Disabled group</Radio.Group.Label>
        <Radio value="x">Disabled selected</Radio>
        <Radio value="y">Disabled option</Radio>
      </Radio.Group>

      <Radio.Group required name="required-plan" orientation="vertical">
        <Radio.Group.Label>Required plan</Radio.Group.Label>
        <Radio.Group.ErrorMessage>
          Select a plan to continue.
        </Radio.Group.ErrorMessage>
        <Radio value="free">
          Free
          <Radio.Description>For individuals</Radio.Description>
        </Radio>
        <Radio value="pro">
          Pro
          <Radio.Description>For growing teams</Radio.Description>
        </Radio>
      </Radio.Group>
    </div>
  ),
};

export const Controlled = {
  render: function ControlledStory() {
    const [value, setValue] = useState("pro");
    return (
      <div style={stackStyle}>
        <Radio.Group value={value} onValueChange={setValue} name="plan">
          <Radio.Group.Label>Plan</Radio.Group.Label>
          <Radio.Group.Description>
            You can change this anytime.
          </Radio.Group.Description>
          <Radio value="free">
            Free
            <Radio.Description>For individuals</Radio.Description>
          </Radio>
          <Radio value="pro">
            Pro
            <Radio.Description>For growing teams</Radio.Description>
          </Radio>
          <Radio value="enterprise">
            Enterprise
            <Radio.Description>Custom contracts</Radio.Description>
          </Radio>
        </Radio.Group>
        <p style={{ margin: 0, color: "var(--color-text-secondary)" }}>
          Selected: {value}
        </p>
      </div>
    );
  },
};

export const RtlNavigation = {
  render: () => (
    <div style={stackStyle} dir="rtl">
      <Radio.Group
        defaultValue="email"
        name="rtl-channel"
        orientation="horizontal"
        dir="rtl"
      >
        <Radio.Group.Label>طريقة التواصل</Radio.Group.Label>
        <Radio.Group.Description>
          استخدم مفاتيح الأسهم للتنقل.
        </Radio.Group.Description>
        <Radio value="email">البريد الإلكتروني</Radio>
        <Radio value="sms">رسالة نصية</Radio>
        <Radio value="push">إشعار فوري</Radio>
      </Radio.Group>
    </div>
  ),
};

export const LongLabel = {
  render: () => (
    <div style={{ ...stackStyle, maxWidth: 360 }}>
      <Radio.Group defaultValue="agree" name="consent">
        <Radio.Group.Label>Consent</Radio.Group.Label>
        <Radio.Group.Description>Pick one option.</Radio.Group.Description>
        <Radio value="agree">
          I agree to receive product updates, security notices, and occasional
          research invitations.
          <Radio.Description>
            You can change this later in settings.
          </Radio.Description>
        </Radio>
        <Radio value="decline">No thanks</Radio>
      </Radio.Group>
    </div>
  ),
};
