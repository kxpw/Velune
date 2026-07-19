import type { CSSProperties } from "react";
import { useState } from "react";
import { Tag } from "../tag";
import { Table } from "./Table";
import type { TableColumn } from "./Table.types";

const meta = {
  title: "React/Table",
  component: Table,
  parameters: { layout: "padded" },
};

export default meta;

type User = {
  id: string;
  name: string;
  role: string;
  status: "active" | "invited";
  seats: number;
};

const data: User[] = [
  { id: "1", name: "Ada Lovelace", role: "Admin", status: "active", seats: 3 },
  { id: "2", name: "Grace Hopper", role: "Editor", status: "active", seats: 1 },
  { id: "3", name: "Alan Turing", role: "Viewer", status: "invited", seats: 0 },
  {
    id: "4",
    name: "Katherine Johnson",
    role: "Editor",
    status: "active",
    seats: 2,
  },
];

const columns: TableColumn<User>[] = [
  { key: "name", title: "Name", dataIndex: "name", sortable: true },
  { key: "role", title: "Role", dataIndex: "role", sortable: true },
  {
    key: "status",
    title: "Status",
    dataIndex: "status",
    render: (value) => (
      <Tag size="sm" tone={value === "active" ? "success" : "warning"}>
        {String(value)}
      </Tag>
    ),
  },
  {
    key: "seats",
    title: "Seats",
    dataIndex: "seats",
    sortable: true,
    align: "end",
  },
];

const frame: CSSProperties = {
  padding: "var(--space-6)",
  width: "100%",
};

export const Default = {
  render: () => (
    <div style={frame}>
      <Table columns={columns} dataSource={data} rowKey="id" />
    </div>
  ),
};

export const Selectable = {
  render: function SelectableStory() {
    const [keys, setKeys] = useState<Array<string | number>>(["1"]);
    return (
      <div style={frame}>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          selectable
          selectedRowKeys={keys}
          onSelectionChange={(next) => setKeys(next as string[])}
        />
      </div>
    );
  },
};

export const Loading = {
  render: () => (
    <div style={frame}>
      <Table columns={columns} dataSource={data} loading />
    </div>
  ),
};

export const Empty = {
  render: () => (
    <div style={frame}>
      <Table columns={columns} dataSource={[]}>
        <Table.Caption>Workspace members</Table.Caption>
        <Table.Empty>No members found</Table.Empty>
      </Table>
    </div>
  ),
};

export const Compact = {
  render: () => (
    <div style={frame}>
      <Table columns={columns} dataSource={data} rowKey="id" size="sm">
        <Table.Caption>Compact workspace members</Table.Caption>
      </Table>
    </div>
  ),
};

export const StickyHeader = {
  render: () => (
    <div style={frame}>
      <Table
        columns={columns}
        dataSource={[
          ...data,
          ...data.map((row) => ({ ...row, id: `copy-${row.id}` })),
        ]}
        rowKey="id"
        stickyHeader
        maxHeight="calc(var(--space-20) * 2)"
      >
        <Table.Caption>Workspace members with sticky header</Table.Caption>
      </Table>
    </div>
  ),
};

export const Scrollable = {
  render: () => (
    <div style={frame}>
      <Table
        columns={columns}
        dataSource={Array.from({ length: 6 }, (_, group) =>
          data.map((row) => ({ ...row, id: `scroll-${group}-${row.id}` })),
        ).flat()}
        rowKey="id"
        selectable
        scroll={{
          x: "calc(var(--space-20) * 20)",
          y: "calc(var(--space-20) * 3)",
        }}
      >
        <Table.Caption>Scrollable workspace members</Table.Caption>
      </Table>
    </div>
  ),
};
