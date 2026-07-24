import type { CSSProperties } from "react";
import { Alert } from "./Alert";
import { Button } from "../button";

const meta = {
  title: "React/Alert",
  component: Alert,
};

export default meta;

const stackStyle: CSSProperties = {
  display: "grid",
  gap: "var(--space-3)",
  maxWidth: 560,
};

export const Tones = {
  render: () => (
    <div style={stackStyle}>
      <Alert tone="default">A neutral note about this workspace.</Alert>
      <Alert tone="info">A new version is available.</Alert>
      <Alert tone="success">Your changes have been saved.</Alert>
      <Alert tone="warning">Storage is almost full.</Alert>
      <Alert tone="error">Deployment failed. Check the logs.</Alert>
    </div>
  ),
};

export const WithTitleAndDescription = {
  render: () => (
    <div style={stackStyle}>
      <Alert tone="success">
        <Alert.Title>Deploy complete</Alert.Title>
        <Alert.Description>
          All 12 checks passed. The new revision is now serving traffic.
        </Alert.Description>
      </Alert>
    </div>
  ),
};

export const WithAction = {
  render: () => (
    <div style={stackStyle}>
      <Alert tone="warning">
        <Alert.Title>Storage almost full</Alert.Title>
        <Alert.Description>
          You have used 9.5 GB of your 10 GB quota.
        </Alert.Description>
        <Alert.Action>
          <Button size="sm" variant="secondary">
            Manage storage
          </Button>
          <Button size="sm" variant="ghost">
            Upgrade
          </Button>
        </Alert.Action>
      </Alert>
    </div>
  ),
};

export const Closable = {
  render: () => (
    <div style={stackStyle}>
      <Alert tone="info" closable>
        <Alert.Title>Scheduled maintenance</Alert.Title>
        <Alert.Description>
          The API will be read-only on Sunday between 02:00 and 03:00 UTC.
        </Alert.Description>
      </Alert>
    </div>
  ),
};

export const CustomIcon = {
  render: () => (
    <div style={stackStyle}>
      <Alert
        tone="default"
        icon={
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M8 1.5L9.8 5.9L14.5 6.3L10.9 9.4L12 14L8 11.5L4 14L5.1 9.4L1.5 6.3L6.2 5.9L8 1.5Z"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
          </svg>
        }
      >
        Starred workspaces sync across devices.
      </Alert>
      <Alert tone="info" icon={null}>
        An icon-less alert for dense layouts.
      </Alert>
    </div>
  ),
};
