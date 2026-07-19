import type { CSSProperties } from "react";
import { Avatar } from "../avatar";
import { Badge } from "../badge";
import { Tag } from "../tag";
import { List } from "./List";

const meta = {
  title: "React/List",
  component: List,
  parameters: { layout: "padded" },
};

export default meta;

const frame: CSSProperties = {
  maxWidth: 420,
  padding: "var(--space-6)",
};

export const Default = {
  render: () => (
    <div style={frame}>
      <List>
        <List.Item>
          <List.Leading>
            <Avatar size="sm" name="Ada Lovelace" />
          </List.Leading>
          <List.Content>
            <List.Title>Ada Lovelace</List.Title>
            <List.Description>First programmer</List.Description>
          </List.Content>
          <List.Trailing>
            <Tag size="sm" tone="primary">
              Active
            </Tag>
          </List.Trailing>
        </List.Item>
        <List.Item>
          <List.Leading>
            <Avatar size="sm" name="Grace Hopper" />
          </List.Leading>
          <List.Content>
            <List.Title>Grace Hopper</List.Title>
            <List.Description>COBOL pioneer</List.Description>
          </List.Content>
          <List.Trailing>
            <Badge count={2} />
          </List.Trailing>
        </List.Item>
        <List.Item>
          <List.Leading>
            <Avatar size="sm" name="Alan Turing" />
          </List.Leading>
          <List.Content>
            <List.Title>Alan Turing</List.Title>
            <List.Description>Computing theory</List.Description>
          </List.Content>
        </List.Item>
      </List>
    </div>
  ),
};

export const Interactive = {
  render: () => (
    <div style={frame}>
      <List>
        <List.Item onClick={() => undefined}>
          <List.Content>
            <List.Title>Notifications</List.Title>
            <List.Description>Push and email alerts</List.Description>
          </List.Content>
        </List.Item>
        <List.Item onClick={() => undefined}>
          <List.Content>
            <List.Title>Security</List.Title>
            <List.Description>Password and sessions</List.Description>
          </List.Content>
        </List.Item>
        <List.Item disabled>
          <List.Content>
            <List.Title>Billing</List.Title>
            <List.Description>Invoices</List.Description>
          </List.Content>
        </List.Item>
      </List>
    </div>
  ),
};

export const EmptyAndLoading = {
  render: () => (
    <div style={{ ...frame, display: "grid", gap: "var(--space-6)" }}>
      <List>
        <List.Empty>Nothing here yet.</List.Empty>
      </List>
      <List loading>
        <List.Loading>Loading projects...</List.Loading>
      </List>
    </div>
  ),
};

export const Compact = {
  render: () => (
    <div style={frame}>
      <List size="sm" divided={false}>
        {[
          ["Inbox", "12"],
          ["Starred", "3"],
          ["Archive", "48"],
        ].map(([title, count]) => (
          <List.Item key={title}>
            <List.Content>
              <List.Title>{title}</List.Title>
            </List.Content>
            <List.Trailing>{count}</List.Trailing>
          </List.Item>
        ))}
      </List>
    </div>
  ),
};
