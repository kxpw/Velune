import type { CSSProperties } from "react";
import { useState } from "react";
import { Switch } from "./Switch";

const meta = {
  title: "React/Switch",
  component: Switch,
  parameters: {
    layout: "padded",
  },
};

export default meta;

const stackStyle: CSSProperties = {
  display: "grid",
  gap: "var(--space-4)",
  padding: "var(--space-6)",
  maxWidth: 420,
};

export const Default = {
  render: () => (
    <div style={stackStyle}>
      <Switch name="notifications">Notifications</Switch>
    </div>
  ),
};

export const Sizes = {
  render: () => (
    <div style={stackStyle}>
      <Switch size="sm" defaultChecked>
        Small
      </Switch>
      <Switch size="md" defaultChecked>
        Medium
      </Switch>
      <Switch size="lg" defaultChecked>
        Large
      </Switch>
    </div>
  ),
};

export const WithDescription = {
  render: () => (
    <div style={stackStyle}>
      <Switch defaultChecked>
        Email notifications
        <Switch.Description>
          Send me product updates and security alerts.
        </Switch.Description>
      </Switch>
      <Switch>
        Face ID
        <Switch.Description>
          Use biometric unlock on this device.
        </Switch.Description>
      </Switch>
    </div>
  ),
};

export const States = {
  render: () => (
    <div style={stackStyle}>
      <Switch defaultChecked>On</Switch>
      <Switch>Off</Switch>
      <Switch disabled>Disabled off</Switch>
      <Switch disabled defaultChecked>
        Disabled on
      </Switch>
      <Switch loading>Loading</Switch>
      <Switch loading defaultChecked>
        Loading on
      </Switch>
    </div>
  ),
};

export const Controlled = {
  render: function ControlledStory() {
    const [checked, setChecked] = useState(true);
    return (
      <div style={stackStyle}>
        <Switch checked={checked} onCheckedChange={setChecked}>
          Controlled ({checked ? "on" : "off"})
        </Switch>
      </div>
    );
  },
};
