import type { CSSProperties } from "react";
import { VirtualTable } from "./VirtualTable";

const meta = {
  title: "React/VirtualTable",
  component: VirtualTable,
  parameters: { layout: "padded" },
};

export default meta;

const columns = [
  { key: "name", title: "Name", dataIndex: "name", sortable: true },
  { key: "role", title: "Role", dataIndex: "role" },
  { key: "seats", title: "Seats", dataIndex: "seats", align: "end" as const },
];

const data = Array.from({ length: 10000 }, (_, index) => ({
  id: index + 1,
  name: `Member ${index + 1}`,
  role: index % 3 === 0 ? "Admin" : index % 3 === 1 ? "Editor" : "Viewer",
  seats: index % 8,
}));

const frame: CSSProperties = {
  padding: "var(--space-6)",
  width: "100%",
};

export const Default = {
  render: () => (
    <div style={frame}>
      <VirtualTable
        columns={columns}
        dataSource={data}
        rowKey="id"
        selectable
        scroll={{
          x: "calc(var(--space-20) * 20)",
          y: "calc(var(--space-20) * 4)",
        }}
      >
        <VirtualTable.Caption>
          Virtualized workspace members
        </VirtualTable.Caption>
      </VirtualTable>
    </div>
  ),
};
