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

export const CustomSort = {
  render: () => (
    <div style={frame}>
      <Table
        columns={[
          { key: "name", title: "Name", dataIndex: "name", sortable: true },
          {
            key: "status",
            title: "Status",
            dataIndex: "status",
            sortable: true,
            sortValue: (row) => (row.status === "active" ? 0 : 1),
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
            sorter: (left, right) => left.seats - right.seats,
            align: "end",
          },
        ]}
        dataSource={data}
        rowKey="id"
      >
        <Table.Caption>Custom column sorting</Table.Caption>
      </Table>
    </div>
  ),
};

export const FixedColumns = {
  render: () => (
    <div style={frame}>
      <Table
        columns={[
          {
            key: "name",
            title: "Name",
            dataIndex: "name",
            width: 180,
            fixed: "start",
          },
          { key: "role", title: "Role", dataIndex: "role", width: 140 },
          {
            key: "status",
            title: "Status",
            dataIndex: "status",
            width: 120,
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
            width: 96,
            align: "end",
            fixed: "end",
          },
        ]}
        dataSource={data}
        rowKey="id"
        selectable
        scroll={{ x: 960 }}
      >
        <Table.Caption>Fixed name and seats columns</Table.Caption>
      </Table>
    </div>
  ),
};

type TreeNode = {
  id: string;
  name: string;
  role: string;
  children?: TreeNode[];
};

const treeData: TreeNode[] = [
  {
    id: "eng",
    name: "Engineering",
    role: "Team",
    children: [
      { id: "eng-1", name: "Ada Lovelace", role: "Admin" },
      {
        id: "eng-2",
        name: "Platform",
        role: "Squad",
        children: [{ id: "eng-2-1", name: "Grace Hopper", role: "Editor" }],
      },
    ],
  },
  {
    id: "design",
    name: "Design",
    role: "Team",
    children: [{ id: "design-1", name: "Katherine Johnson", role: "Viewer" }],
  },
];

export const Tree = {
  render: () => (
    <div style={frame}>
      <Table
        columns={[
          { key: "name", title: "Name", dataIndex: "name", sortable: true },
          { key: "role", title: "Role", dataIndex: "role", sortable: true },
        ]}
        dataSource={treeData}
        rowKey="id"
        tree={{ defaultExpandAll: true }}
      >
        <Table.Caption>Organization tree</Table.Caption>
      </Table>
    </div>
  ),
};
