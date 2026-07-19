import type { CSSProperties } from "react";
import { useState } from "react";
import { Text } from "../text";
import { Tabs } from "./Tabs";

const meta = {
  title: "React/Tabs",
  component: Tabs,
  parameters: { layout: "padded" },
};

export default meta;

const frame: CSSProperties = {
  width: "100%",
  padding: "var(--space-6)",
};

export const Default = {
  render: () => (
    <div style={frame}>
      <Tabs defaultValue="overview">
        <Tabs.List>
          <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
          <Tabs.Trigger value="activity">Activity</Tabs.Trigger>
          <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Panel value="overview">
          <Text size="sm">Project overview and health metrics.</Text>
        </Tabs.Panel>
        <Tabs.Panel value="activity">
          <Text size="sm">Recent commits, reviews, and deploys.</Text>
        </Tabs.Panel>
        <Tabs.Panel value="settings">
          <Text size="sm">Visibility, members, and integrations.</Text>
        </Tabs.Panel>
      </Tabs>
    </div>
  ),
};

export const Vertical = {
  render: () => (
    <div style={frame}>
      <Tabs defaultValue="general" orientation="vertical">
        <Tabs.List>
          <Tabs.Trigger value="general">General</Tabs.Trigger>
          <Tabs.Trigger value="security">Security</Tabs.Trigger>
          <Tabs.Trigger value="billing">Billing</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Panel value="general">
          <Text size="sm">Workspace name and default locale.</Text>
        </Tabs.Panel>
        <Tabs.Panel value="security">
          <Text size="sm">SSO, sessions, and API tokens.</Text>
        </Tabs.Panel>
        <Tabs.Panel value="billing">
          <Text size="sm">Plan, invoices, and payment method.</Text>
        </Tabs.Panel>
      </Tabs>
    </div>
  ),
};

export const FullWidth = {
  render: () => (
    <div style={frame}>
      <Tabs defaultValue="overview">
        <Tabs.List fullWidth>
          <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
          <Tabs.Trigger value="activity">Activity</Tabs.Trigger>
          <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Panel value="overview">
          <Text size="sm">Project overview and health metrics.</Text>
        </Tabs.Panel>
        <Tabs.Panel value="activity">
          <Text size="sm">Recent commits, reviews, and deploys.</Text>
        </Tabs.Panel>
        <Tabs.Panel value="settings">
          <Text size="sm">Visibility, members, and integrations.</Text>
        </Tabs.Panel>
      </Tabs>
    </div>
  ),
};

export const Block = {
  render: () => (
    <div style={frame}>
      <Tabs defaultValue="overview" variant="block">
        <Tabs.List>
          <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
          <Tabs.Trigger value="activity">Activity</Tabs.Trigger>
          <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Panel value="overview">
          <Text size="sm">Project overview and health metrics.</Text>
        </Tabs.Panel>
        <Tabs.Panel value="activity">
          <Text size="sm">Recent commits, reviews, and deploys.</Text>
        </Tabs.Panel>
        <Tabs.Panel value="settings">
          <Text size="sm">Visibility, members, and integrations.</Text>
        </Tabs.Panel>
      </Tabs>
    </div>
  ),
};

export const Controlled = {
  render: function ControlledStory() {
    const [value, setValue] = useState("one");
    return (
      <div style={frame}>
        <Text size="sm" tone="muted">
          Active: {value}
        </Text>
        <Tabs value={value} onValueChange={setValue}>
          <Tabs.List>
            <Tabs.Trigger value="one">One</Tabs.Trigger>
            <Tabs.Trigger value="two">Two</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Panel value="one">
            <Text size="sm">First panel</Text>
          </Tabs.Panel>
          <Tabs.Panel value="two">
            <Text size="sm">Second panel</Text>
          </Tabs.Panel>
        </Tabs>
      </div>
    );
  },
};

export const ManualActivation = {
  render: () => (
    <div style={frame}>
      <Tabs defaultValue="details" activationMode="manual">
        <Tabs.List>
          <Tabs.Trigger value="details">Details</Tabs.Trigger>
          <Tabs.Trigger value="history">History</Tabs.Trigger>
          <Tabs.Trigger value="archive" disabled>
            Archive
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Panel value="details">
          <Text size="sm">Record details.</Text>
        </Tabs.Panel>
        <Tabs.Panel value="history">
          <Text size="sm">Change history.</Text>
        </Tabs.Panel>
        <Tabs.Panel value="archive">
          <Text size="sm">Archive settings.</Text>
        </Tabs.Panel>
      </Tabs>
    </div>
  ),
};
