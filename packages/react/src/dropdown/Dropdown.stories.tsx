import type { CSSProperties } from "react";
import { useState } from "react";
import {
  Copy,
  Edit3,
  MoreHorizontal,
  Settings,
  Trash2,
  User,
} from "lucide-react";
import { Button } from "../button";
import { Text } from "../text";
import { Dropdown } from "./Dropdown";

const meta = {
  title: "React/Dropdown",
  component: Dropdown,
  parameters: { layout: "centered" },
};

export default meta;

const stageStyle: CSSProperties = {
  display: "grid",
  minWidth: 320,
  minHeight: 280,
  placeItems: "start center",
  padding: "var(--space-8)",
};

export const Default = {
  render: () => (
    <div style={stageStyle}>
      <Dropdown fullWidth={false}>
        <Dropdown.Trigger>
          <Button variant="secondary">
            Actions
            <Button.Trailing>
              <MoreHorizontal />
            </Button.Trailing>
          </Button>
        </Dropdown.Trigger>
        <Dropdown.Menu aria-label="Project actions">
          <Dropdown.Item id="edit">
            <Dropdown.Item.Leading>
              <Edit3 />
            </Dropdown.Item.Leading>
            Edit project
            <Dropdown.Item.Trailing>⌘E</Dropdown.Item.Trailing>
          </Dropdown.Item>
          <Dropdown.Item id="duplicate">
            <Dropdown.Item.Leading>
              <Copy />
            </Dropdown.Item.Leading>
            Duplicate
          </Dropdown.Item>
          <Dropdown.Item id="settings">
            <Dropdown.Item.Leading>
              <Settings />
            </Dropdown.Item.Leading>
            Settings
          </Dropdown.Item>
          <Dropdown.Separator />
          <Dropdown.Item id="delete" tone="danger">
            <Dropdown.Item.Leading>
              <Trash2 />
            </Dropdown.Item.Leading>
            Delete project
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </div>
  ),
};

export const Sections = {
  render: () => (
    <div style={stageStyle}>
      <Dropdown fullWidth={false} defaultOpen>
        <Dropdown.Trigger>
          <Button variant="secondary">Account</Button>
        </Dropdown.Trigger>
        <Dropdown.Menu aria-label="Account menu">
          <Dropdown.Section>
            <Dropdown.SectionTitle>Workspace</Dropdown.SectionTitle>
            <Dropdown.Item id="profile">
              <Dropdown.Item.Leading>
                <User />
              </Dropdown.Item.Leading>
              Profile
              <Dropdown.Item.Description>
                Manage your public identity
              </Dropdown.Item.Description>
            </Dropdown.Item>
          </Dropdown.Section>
          <Dropdown.Separator />
          <Dropdown.Section>
            <Dropdown.SectionTitle>Session</Dropdown.SectionTitle>
            <Dropdown.Item id="sign-out">Sign out</Dropdown.Item>
          </Dropdown.Section>
        </Dropdown.Menu>
      </Dropdown>
    </div>
  ),
};

export const DisabledTriggers = {
  render: () => (
    <div style={{ ...stageStyle, gap: "var(--space-4)" }}>
      <Dropdown disabled fullWidth={false}>
        <Dropdown.Trigger>
          <Button variant="secondary">Disabled button</Button>
        </Dropdown.Trigger>
        <Dropdown.Menu aria-label="Disabled button menu">
          <Dropdown.Item id="profile">Profile</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
      <Dropdown disabled fullWidth={false}>
        <Dropdown.Trigger>
          <a
            href="#settings"
            className="inline-flex min-h-gs-control-hit-target items-center rounded-gs-button-radius border border-gs-button-border-secondary bg-gs-button-bg-secondary px-4 text-sm font-medium text-gs-button-color no-underline"
          >
            Disabled link
          </a>
        </Dropdown.Trigger>
        <Dropdown.Menu aria-label="Disabled link menu">
          <Dropdown.Item id="settings">Settings</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </div>
  ),
};

export const MultipleSelection = {
  render: function MultipleSelectionStory() {
    const [selected, setSelected] = useState<Set<string | number>>(
      new Set(["name", "status"]),
    );
    return (
      <div style={stageStyle}>
        <Dropdown>
          <Dropdown.Trigger>
            <Button variant="secondary">Visible columns</Button>
          </Dropdown.Trigger>
          <Dropdown.Menu
            aria-label="Visible columns"
            selectionMode="multiple"
            selectedKeys={selected}
            onSelectionChange={(keys) => {
              if (keys !== "all") setSelected(new Set(keys));
            }}
          >
            <Dropdown.Item id="name">Name</Dropdown.Item>
            <Dropdown.Item id="owner">Owner</Dropdown.Item>
            <Dropdown.Item id="status">Status</Dropdown.Item>
            <Dropdown.Item id="updated">Last updated</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        <Text size="xs" muted>
          {selected.size} columns visible
        </Text>
      </div>
    );
  },
};
