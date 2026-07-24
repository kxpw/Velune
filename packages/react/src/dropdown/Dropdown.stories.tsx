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
      <Dropdown>
        <Dropdown.Trigger>
          <Button variant="secondary">
            Actions
            <Button.Trailing>
              <MoreHorizontal />
            </Button.Trailing>
          </Button>
        </Dropdown.Trigger>
        <Dropdown.Menu aria-label="Project actions">
          <Dropdown.Item value="edit">
            <Dropdown.Item.Leading>
              <Edit3 />
            </Dropdown.Item.Leading>
            Edit project
            <Dropdown.Item.Trailing>⌘E</Dropdown.Item.Trailing>
          </Dropdown.Item>
          <Dropdown.Item value="duplicate">
            <Dropdown.Item.Leading>
              <Copy />
            </Dropdown.Item.Leading>
            Duplicate
          </Dropdown.Item>
          <Dropdown.Item value="settings">
            <Dropdown.Item.Leading>
              <Settings />
            </Dropdown.Item.Leading>
            Settings
          </Dropdown.Item>
          <Dropdown.Separator />
          <Dropdown.Item value="delete" tone="danger">
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
      <Dropdown defaultOpen>
        <Dropdown.Trigger>
          <Button variant="secondary">Account</Button>
        </Dropdown.Trigger>
        <Dropdown.Menu aria-label="Account menu">
          <Dropdown.Section>
            <Dropdown.SectionTitle>Workspace</Dropdown.SectionTitle>
            <Dropdown.Item value="profile">
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
            <Dropdown.Item value="sign-out">Sign out</Dropdown.Item>
          </Dropdown.Section>
        </Dropdown.Menu>
      </Dropdown>
    </div>
  ),
};

export const DisabledTriggers = {
  render: () => (
    <div style={{ ...stageStyle, gap: "var(--space-4)" }}>
      <Dropdown disabled>
        <Dropdown.Trigger>
          <Button variant="secondary">Disabled button</Button>
        </Dropdown.Trigger>
        <Dropdown.Menu aria-label="Disabled button menu">
          <Dropdown.Item value="profile">Profile</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
      <Dropdown disabled>
        <Dropdown.Trigger>
          <a
            href="#settings"
            className="inline-flex min-h-gs-11 items-center rounded-gs-sm border border-gs-border-default bg-gs-button-bg-secondary px-gs-4 text-gs-sm font-gs-medium text-gs-text no-underline"
          >
            Disabled link
          </a>
        </Dropdown.Trigger>
        <Dropdown.Menu aria-label="Disabled link menu">
          <Dropdown.Item value="settings">Settings</Dropdown.Item>
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
            <Dropdown.Item value="name">Name</Dropdown.Item>
            <Dropdown.Item value="owner">Owner</Dropdown.Item>
            <Dropdown.Item value="status">Status</Dropdown.Item>
            <Dropdown.Item value="updated">Last updated</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        <Text size="xs" tone="muted">
          {selected.size} columns visible
        </Text>
      </div>
    );
  },
};
