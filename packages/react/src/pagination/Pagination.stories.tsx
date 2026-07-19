import type { CSSProperties } from "react";
import { useState } from "react";
import { Text } from "../text";
import { Pagination } from "./Pagination";

const meta = {
  title: "React/Pagination",
  component: Pagination,
  parameters: { layout: "padded" },
};

export default meta;

const frame: CSSProperties = {
  display: "grid",
  gap: "var(--space-4)",
  padding: "var(--space-6)",
};

export const Default = {
  render: function DefaultStory() {
    const [page, setPage] = useState(1);
    return (
      <div style={frame}>
        <Text size="sm" tone="muted">
          Page {page}
        </Text>
        <Pagination
          page={page}
          total={96}
          pageSize={10}
          onPageChange={setPage}
        />
      </div>
    );
  },
};

export const WithExtras = {
  render: function ExtrasStory() {
    const [page, setPage] = useState(3);
    const [pageSize, setPageSize] = useState(10);
    return (
      <div style={frame}>
        <Pagination
          page={page}
          pageSize={pageSize}
          total={240}
          showSizeChanger
          showQuickJumper
          onPageChange={(nextPage, nextSize) => {
            setPage(nextPage);
            setPageSize(nextSize);
          }}
        />
      </div>
    );
  },
};

export const Simple = {
  render: () => (
    <div style={frame}>
      <Pagination simple total={50} pageSize={10} defaultPage={2} />
    </div>
  ),
};
