// @vitest-environment jsdom

import { fireEvent, render, within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { Table } from "./Table";
import { nextSortState, sortDataSource } from "./table-utils";

describe("Table", () => {
  it("keeps sticky headers above positioned row controls", () => {
    const markup = renderToStaticMarkup(
      <Table
        stickyHeader
        selectable
        columns={[{ key: "name", title: "Name", dataIndex: "name" }]}
        dataSource={[{ id: 1, name: "Ada" }]}
        rowKey="id"
      />,
    );

    expect(markup).toContain("relative isolate");
    expect(markup).toContain("sticky top-0 z-gs-sticky");
    expect(markup).toContain("items-center justify-center align-middle");
    expect(markup).toContain("[&amp;_.gs-checkbox-control]:mt-0");
    expect(markup).toContain("[&amp;_.gs-checkbox-control]:self-center");
  });

  it("sets a readable displayName", () => {
    expect((Table as { displayName?: string }).displayName).toBe("Table");
  });

  it("renders a regular table without the virtualization boundary", () => {
    const markup = renderToStaticMarkup(
      <Table
        columns={[{ key: "name", title: "Name", dataIndex: "name" }]}
        dataSource={[{ id: 1, name: "Ada" }]}
        rowKey="id"
      >
        <Table.Caption>Members</Table.Caption>
      </Table>,
    );

    expect(markup).toContain("<table");
    expect(markup).toContain("Ada");
    expect(markup).not.toContain('data-virtualized="true"');
  });

  it("does not build selection keys when selection is disabled", () => {
    const resolveKey = vi.fn((record: { id: number }) => record.id);

    renderToStaticMarkup(
      <Table
        columns={[{ key: "name", title: "Name", dataIndex: "name" }]}
        dataSource={[
          { id: 1, name: "Ada" },
          { id: 2, name: "Grace" },
        ]}
        rowKey={resolveKey}
      />,
    );

    expect(resolveKey).toHaveBeenCalledTimes(2);
  });

  it("does not rerender stable rows when only root props change", () => {
    const renderCell = vi.fn((value: unknown) => String(value));
    const columns = [
      {
        key: "name",
        title: "Name",
        dataIndex: "name",
        render: renderCell,
      },
    ];
    const dataSource = [
      { id: 1, name: "Ada" },
      { id: 2, name: "Grace" },
    ];
    const { rerender } = render(
      <Table
        aria-label="Members"
        columns={columns}
        dataSource={dataSource}
        rowKey="id"
      />,
    );

    expect(renderCell).toHaveBeenCalledTimes(2);
    rerender(
      <Table
        aria-label="Project members"
        columns={columns}
        dataSource={dataSource}
        rowKey="id"
      />,
    );
    expect(renderCell).toHaveBeenCalledTimes(2);
  });

  it("rerenders only the row whose selection changes", () => {
    const renderCell = vi.fn((value: unknown) => String(value));
    const onSelectionChange = vi.fn();
    const columns = [
      {
        key: "name",
        title: "Name",
        dataIndex: "name",
        render: renderCell,
      },
    ];
    const dataSource = [
      { id: 1, name: "Ada" },
      { id: 2, name: "Grace" },
      { id: 3, name: "Linus" },
    ];
    const { getByLabelText } = render(
      <Table
        aria-label="Members"
        columns={columns}
        dataSource={dataSource}
        rowKey="id"
        selectable
        onSelectionChange={onSelectionChange}
      />,
    );

    expect(renderCell).toHaveBeenCalledTimes(3);
    fireEvent.click(getByLabelText("Select row 2"));

    expect(renderCell).toHaveBeenCalledTimes(4);
    expect(onSelectionChange).toHaveBeenLastCalledWith([2], [dataSource[1]]);
  });

  it("selects and clears every row through the header checkbox", () => {
    const { container } = render(
      <Table
        aria-label="Members"
        columns={[{ key: "name", title: "Name", dataIndex: "name" }]}
        dataSource={[
          { id: 1, name: "Ada" },
          { id: 2, name: "Grace" },
        ]}
        rowKey="id"
        selectable
      />,
    );
    const table = within(container);
    const selectAll = table.getByLabelText(
      "Select all rows",
    ) as HTMLInputElement;
    const firstRow = table.getByLabelText("Select row 1") as HTMLInputElement;
    const secondRow = table.getByLabelText("Select row 2") as HTMLInputElement;

    fireEvent.click(selectAll);
    expect(selectAll.checked).toBe(true);
    expect(firstRow.checked).toBe(true);
    expect(secondRow.checked).toBe(true);

    fireEvent.click(selectAll);
    expect(selectAll.checked).toBe(false);
    expect(firstRow.checked).toBe(false);
    expect(secondRow.checked).toBe(false);
  });

  it("moves index-independent rows without rebuilding their cells on sort", () => {
    let statusReads = 0;
    const dataSource = ["Beta", "Alpha", "Gamma"].map((name, index) => ({
      id: index + 1,
      name,
      get status() {
        statusReads += 1;
        return "Ready";
      },
    }));
    const { getByRole } = render(
      <Table
        aria-label="Projects"
        columns={[
          { key: "name", title: "Name", dataIndex: "name", sortable: true },
          { key: "status", title: "Status", dataIndex: "status" },
        ]}
        dataSource={dataSource}
        rowKey="id"
      />,
    );

    expect(statusReads).toBe(3);
    fireEvent.click(getByRole("button", { name: "Name" }));

    expect(statusReads).toBe(3);
    expect(
      getByRole("button", { name: "Name" }).classList.contains(
        "active:scale-[.98]",
      ),
    ).toBe(true);
  });

  it("makes a constrained scroll area keyboard accessible", () => {
    const markup = renderToStaticMarkup(
      <Table
        columns={[{ key: "name", title: "Name", dataIndex: "name" }]}
        dataSource={[{ id: 1, name: "Ada" }]}
        rowKey="id"
        scroll={{ x: 720, y: 280 }}
      >
        <Table.Caption>Members</Table.Caption>
      </Table>,
    );

    expect(markup).toContain('tabindex="0"');
    expect(markup).toContain('aria-label="Members scroll area"');
  });

  it("uses custom table controls and safely labels non-text captions", () => {
    const { getByLabelText, getByRole, rerender } = render(
      <Table
        columns={[{ key: "name", title: "Full name", dataIndex: "name" }]}
        dataSource={[{ id: 1, name: "Ada" }]}
        rowKey="id"
        selectable
        scroll={{ y: 280 }}
        scrollAreaLabel="Team roster"
        selectAllLabel="Mark every row"
        getRowSelectionLabel={(record) => `Mark ${record.name}`}
      >
        <Table.Caption>
          <span>Team members</span>
        </Table.Caption>
      </Table>,
    );

    expect(getByRole("region", { name: "Team roster" })).toBeTruthy();
    expect(getByLabelText("Mark every row")).toBeTruthy();
    expect(getByLabelText("Mark Ada")).toBeTruthy();

    rerender(
      <Table
        columns={[{ key: "name", title: "Full name", dataIndex: "name" }]}
        dataSource={[]}
        loading
        loadingLabel="Refreshing team roster"
      />,
    );
    expect(
      getByRole("status", { name: "Refreshing team roster" }),
    ).toBeTruthy();
  });

  it("does not stringify a React caption into a scroll-region label", () => {
    const markup = renderToStaticMarkup(
      <Table
        columns={[{ key: "name", title: "Name", dataIndex: "name" }]}
        dataSource={[]}
        scroll={{ y: 280 }}
      >
        <Table.Caption>
          <span>Members</span>
        </Table.Caption>
      </Table>,
    );

    expect(markup).toContain('aria-label="Scrollable table"');
    expect(markup).not.toContain("[object Object]");
  });

  it("does not let DOM props hide a loading state", () => {
    const markup = renderToStaticMarkup(
      <Table
        aria-busy={false}
        loading
        columns={[{ key: "name", title: "Name", dataIndex: "name" }]}
        dataSource={[]}
      />,
    );

    expect(markup).toContain('class="gs-table-wrap ');
    expect(markup).toContain('aria-busy="true"');
  });

  it("cycles sort state", () => {
    expect(nextSortState(null, "name")).toEqual({ key: "name", order: "asc" });
    expect(nextSortState({ key: "name", order: "asc" }, "name")).toEqual({
      key: "name",
      order: "desc",
    });
    expect(nextSortState({ key: "name", order: "desc" }, "name")).toBeNull();
  });

  it("sorts rows by data path", () => {
    const rows = [{ name: "b" }, { name: "a" }, { name: "c" }];
    const sorted = sortDataSource(
      rows,
      { key: "name", order: "asc" },
      new Map([["name", "name"]]),
    );
    expect(sorted.map((row) => row.name)).toEqual(["a", "b", "c"]);
  });

  it("resolves each sort value once and preserves equal-value order", () => {
    let reads = 0;
    const rows = [
      {
        id: 1,
        get group() {
          reads += 1;
          return "b";
        },
      },
      {
        id: 2,
        get group() {
          reads += 1;
          return "a";
        },
      },
      {
        id: 3,
        get group() {
          reads += 1;
          return "a";
        },
      },
    ];

    const sorted = sortDataSource(
      rows,
      { key: "group", order: "asc" },
      new Map([["group", "group"]]),
    );

    expect(reads).toBe(3);
    expect(sorted.map((row) => row.id)).toEqual([2, 3, 1]);
  });
});
