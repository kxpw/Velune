import type {
  ForwardedRef,
  Key,
  KeyboardEvent,
  ReactNode,
  RefCallback,
  RefObject,
} from "react";
import { memo } from "react";
import { clsx } from "clsx";
import { Checkbox } from "../checkbox";
import { Spinner } from "../spinner";
import type { TableColumn, TableViewSource } from "./Table.types";
import type { TableState } from "./table-state";
import { getByPath, resolveRowKey } from "./table-utils";

export const tableWrapClasses =
  "gs-table-wrap relative isolate min-w-0 overflow-hidden rounded-gs-table-radius border border-gs-surface-border bg-gs-surface font-inherit text-gs-table-font-size leading-gs-normal text-gs-text";

export const tableLoadingClasses =
  "gs-table-loading absolute inset-0 z-gs-dropdown flex items-center justify-center bg-gs-table-loading-bg";

function defaultGetRowSelectionLabel(
  _record: unknown,
  _index: number,
  key: Key,
): string {
  return `Select row ${String(key)}`;
}

export interface TableRowWindow {
  virtualized: boolean;
  visibleRowIndexes: number[];
  paddingTop: number;
  paddingBottom: number;
  measureElement?: RefCallback<HTMLTableRowElement>;
}

export function TableView<T>({
  source,
  state,
  rowWindow,
  scrollRef,
  forwardedRef,
}: {
  source: TableViewSource<T>;
  state: TableState<T>;
  rowWindow: TableRowWindow;
  scrollRef: RefObject<HTMLDivElement>;
  forwardedRef: ForwardedRef<HTMLDivElement>;
}) {
  const {
    columns,
    caption,
    captionProps,
    rowKey,
    size = "md",
    loading,
    loadingLabel = "Loading table",
    empty = "No data",
    emptyProps,
    stickyHeader,
    maxHeight,
    scroll,
    selectable,
    selectAllLabel = "Select all rows",
    getRowSelectionLabel = defaultGetRowSelectionLabel,
    scrollAreaLabel,
    onRowClick,
    className,
  } = source;
  const { virtualized, visibleRowIndexes, paddingTop, paddingBottom } =
    rowWindow;
  const hasScrollableRegion =
    stickyHeader ||
    virtualized ||
    scroll?.x != null ||
    scroll?.y != null ||
    maxHeight != null;
  const hasStickyHeader = stickyHeader || virtualized || scroll?.y != null;
  const resolvedScrollAreaLabel =
    scrollAreaLabel ??
    (typeof caption === "string" || typeof caption === "number"
      ? `${caption} scroll area`
      : "Scrollable table");
  const cellClasses = clsx(
    "gs-table-cell px-gs-table-cell-padding-x py-gs-table-cell-padding-y text-start align-middle",
    size === "sm" && "py-gs-table-cell-padding-y-sm",
  );
  const domProps = cleanTableDomProps(source);

  return (
    <div
      ref={forwardedRef}
      {...domProps}
      className={clsx(tableWrapClasses, className)}
      data-size={size}
      data-sticky={hasStickyHeader ? "true" : undefined}
      data-loading={loading ? "true" : undefined}
      data-virtualized={virtualized ? "true" : undefined}
      aria-busy={loading || source["aria-busy"]}
    >
      {loading ? (
        <div className={tableLoadingClasses} aria-busy="true">
          <Spinner size="sm" aria-label={loadingLabel} />
        </div>
      ) : null}
      <div
        ref={scrollRef}
        className="gs-table-scroll max-w-full overflow-auto overscroll-contain"
        role={hasScrollableRegion ? "region" : undefined}
        tabIndex={hasScrollableRegion ? 0 : undefined}
        aria-label={hasScrollableRegion ? resolvedScrollAreaLabel : undefined}
        style={{
          maxHeight:
            scroll?.y ??
            maxHeight ??
            (virtualized ? "var(--table-virtual-height)" : undefined),
        }}
      >
        <table
          className={clsx(
            "gs-table w-full border-collapse border-spacing-0",
            loading && "opacity-gs-table-loading-content-opacity",
          )}
          aria-rowcount={virtualized ? state.rows.length + 1 : undefined}
          style={{ minWidth: scroll?.x }}
        >
          {caption ? (
            <caption
              {...captionProps}
              className={clsx(
                "gs-table-caption sr-only",
                captionProps?.className,
              )}
            >
              {caption}
            </caption>
          ) : null}
          <thead>
            <tr>
              {selectable ? (
                <th
                  className={clsx(
                    cellClasses,
                    "gs-table-header-cell gs-table-selection-cell w-gs-table-selection-cell-width whitespace-nowrap bg-gs-table-header-bg text-center font-gs-table-header-font-weight text-gs-text-secondary",
                    hasStickyHeader ? "sticky top-0 z-gs-sticky" : "static",
                  )}
                  scope="col"
                >
                  <Checkbox
                    size="sm"
                    className="gs-table-selection-checkbox items-center justify-center align-middle [&_.gs-checkbox-control]:mt-0 [&_.gs-checkbox-control]:self-center"
                    checked={state.allSelected}
                    indeterminate={state.someSelected}
                    onChange={state.toggleAll}
                    aria-label={selectAllLabel}
                  />
                </th>
              ) : null}
              {columns.map((column) => {
                const active =
                  state.sort?.key === column.key ? state.sort.order : null;
                const ariaSort =
                  active === "asc"
                    ? "ascending"
                    : active === "desc"
                      ? "descending"
                      : column.sortable
                        ? "none"
                        : undefined;
                return (
                  <th
                    key={column.key}
                    scope="col"
                    className={clsx(
                      cellClasses,
                      "gs-table-header-cell whitespace-nowrap bg-gs-table-header-bg font-gs-table-header-font-weight text-gs-text-secondary",
                      hasStickyHeader ? "sticky top-0 z-gs-sticky" : "static",
                      column.align === "center" && "text-center",
                      column.align === "end" && "text-end",
                      column.className,
                    )}
                    style={
                      column.width != null
                        ? {
                            width:
                              typeof column.width === "number"
                                ? `${column.width}px`
                                : column.width,
                          }
                        : undefined
                    }
                    data-align={column.align}
                    aria-sort={ariaSort}
                  >
                    {column.sortable ? (
                      <button
                        type="button"
                        className="gs-table-sort-button my-[calc(var(--table-cell-padding-y)*-1)] inline-flex min-h-gs-control-hit-target min-w-gs-control-hit-target cursor-pointer items-center gap-1 border-0 bg-transparent p-0 font-inherit text-inherit hover:text-gs-text focus-visible:rounded-gs-sm focus-visible:bg-gs-table-control-focus-bg focus-visible:text-gs-text focus-visible:outline-none focus-visible:shadow-gs-button-focus-border"
                        onClick={() => state.handleSort(column.key)}
                      >
                        <span>{column.title}</span>
                        <SortIcon order={active} />
                      </button>
                    ) : (
                      column.title
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {paddingTop > 0 ? (
              <VirtualSpacer
                height={paddingTop}
                colSpan={columns.length + (selectable ? 1 : 0)}
              />
            ) : null}
            {state.rows.length === 0 ? (
              <tr>
                <td
                  {...emptyProps}
                  className={clsx(
                    "gs-table-empty h-gs-table-empty-height px-gs-table-cell-padding-x py-gs-table-empty-padding-y text-center text-gs-text-secondary",
                    emptyProps?.className,
                  )}
                  colSpan={columns.length + (selectable ? 1 : 0)}
                >
                  {empty}
                </td>
              </tr>
            ) : (
              visibleRowIndexes.map((index) => {
                const record = state.rows[index]!;
                const key = resolveRowKey(record, index, rowKey);
                return (
                  <MemoTableDataRow
                    key={String(key)}
                    record={record}
                    rowIndex={index}
                    rowKey={key}
                    columns={columns}
                    cellClasses={cellClasses}
                    selectable={Boolean(selectable)}
                    selected={state.selectedSet.has(key)}
                    virtualized={virtualized}
                    measureElement={rowWindow.measureElement}
                    onRowClick={onRowClick}
                    onRowKeyDown={state.handleRowKeyDown}
                    onToggleRow={state.toggleRow}
                    getRowSelectionLabel={getRowSelectionLabel}
                  />
                );
              })
            )}
            {paddingBottom > 0 ? (
              <VirtualSpacer
                height={paddingBottom}
                colSpan={columns.length + (selectable ? 1 : 0)}
              />
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

type TableDataRowProps<T> = {
  record: T;
  rowIndex: number;
  rowKey: Key;
  columns: TableColumn<T>[];
  cellClasses: string;
  selectable: boolean;
  selected: boolean;
  virtualized: boolean;
  measureElement: RefCallback<HTMLTableRowElement> | undefined;
  onRowClick: ((record: T, index: number) => void) | undefined;
  onRowKeyDown: (
    event: KeyboardEvent<HTMLTableRowElement>,
    record: T,
    index: number,
  ) => void;
  onToggleRow: (key: Key) => void;
  getRowSelectionLabel: (record: T, index: number, key: Key) => string;
};

function TableDataRow<T>({
  record,
  rowIndex,
  rowKey,
  columns,
  cellClasses,
  selectable,
  selected,
  virtualized,
  measureElement,
  onRowClick,
  onRowKeyDown,
  onToggleRow,
  getRowSelectionLabel,
}: TableDataRowProps<T>) {
  return (
    <tr
      ref={virtualized ? measureElement : undefined}
      data-index={virtualized ? rowIndex : undefined}
      className={clsx(
        "gs-table-row [border-block-end:var(--divider-border-width)_solid_var(--color-border-default)] hover:bg-gs-table-row-hover-bg",
        selected && "bg-gs-table-row-selected-bg",
        onRowClick &&
          "cursor-pointer focus-visible:bg-gs-table-control-focus-bg focus-visible:outline-none focus-visible:shadow-gs-button-focus-inset",
      )}
      data-selected={selected ? "true" : undefined}
      data-clickable={onRowClick ? "true" : undefined}
      aria-rowindex={virtualized ? rowIndex + 2 : undefined}
      tabIndex={onRowClick ? 0 : undefined}
      onClick={onRowClick ? () => onRowClick(record, rowIndex) : undefined}
      onKeyDown={(event) => onRowKeyDown(event, record, rowIndex)}
    >
      {selectable ? (
        <td
          className={clsx(
            cellClasses,
            "gs-table-selection-cell w-gs-table-selection-cell-width text-center",
          )}
        >
          <span onClick={(event) => event.stopPropagation()}>
            <Checkbox
              size="sm"
              className="gs-table-selection-checkbox items-center justify-center align-middle [&_.gs-checkbox-control]:mt-0 [&_.gs-checkbox-control]:self-center"
              checked={selected}
              onChange={() => onToggleRow(rowKey)}
              aria-label={getRowSelectionLabel(record, rowIndex, rowKey)}
            />
          </span>
        </td>
      ) : null}
      {columns.map((column) => {
        const raw = getByPath(record, column.dataIndex ?? column.key);
        const content = column.render
          ? column.render(raw, record, rowIndex)
          : (raw as ReactNode);
        return (
          <td
            key={column.key}
            className={clsx(
              cellClasses,
              column.align === "center" && "text-center",
              column.align === "end" && "text-end",
              column.className,
            )}
            data-align={column.align}
          >
            {content}
          </td>
        );
      })}
    </tr>
  );
}

function tableDataRowPropsEqual<T>(
  previous: TableDataRowProps<T>,
  next: TableDataRowProps<T>,
): boolean {
  if (
    previous.record !== next.record ||
    previous.rowKey !== next.rowKey ||
    previous.columns !== next.columns ||
    previous.cellClasses !== next.cellClasses ||
    previous.selectable !== next.selectable ||
    previous.selected !== next.selected ||
    previous.virtualized !== next.virtualized ||
    previous.measureElement !== next.measureElement ||
    previous.onRowClick !== next.onRowClick ||
    previous.onRowKeyDown !== next.onRowKeyDown ||
    previous.onToggleRow !== next.onToggleRow ||
    previous.getRowSelectionLabel !== next.getRowSelectionLabel
  ) {
    return false;
  }

  if (previous.rowIndex === next.rowIndex) {
    return true;
  }

  return (
    !next.virtualized &&
    !next.onRowClick &&
    !next.columns.some((column) => column.render)
  );
}

const MemoTableDataRow = memo(
  TableDataRow,
  tableDataRowPropsEqual,
) as typeof TableDataRow;

function SortIcon({ order }: { order?: "asc" | "desc" | null }) {
  return (
    <span
      className={clsx(
        "gs-table-sort-icon inline-flex size-3 text-gs-text-secondary opacity-gs-table-sort-icon-opacity [&_svg]:block [&_svg]:size-full",
        order && "text-gs-border-focus opacity-100",
      )}
      data-order={order ?? "none"}
      aria-hidden="true"
    >
      <svg viewBox="0 0 12 12" fill="none">
        <path
          d="M6 2.5L9 5.5H3L6 2.5Z"
          fill="currentColor"
          className={clsx(
            "gs-table-sort-up",
            order === "desc" && "opacity-gs-table-sort-icon-inactive-opacity",
          )}
        />
        <path
          d="M6 9.5L3 6.5H9L6 9.5Z"
          fill="currentColor"
          className={clsx(
            "gs-table-sort-down",
            order === "asc" && "opacity-gs-table-sort-icon-inactive-opacity",
          )}
        />
      </svg>
    </span>
  );
}

function VirtualSpacer({
  height,
  colSpan,
}: {
  height: number;
  colSpan: number;
}) {
  return (
    <tr
      className="gs-table-virtual-spacer pointer-events-none [&_td]:p-0"
      aria-hidden="true"
    >
      <td colSpan={colSpan} style={{ height }} />
    </tr>
  );
}

/* eslint-disable @typescript-eslint/no-unused-vars */
function cleanTableDomProps<T>({
  columns,
  dataSource,
  caption,
  captionProps,
  rowKey,
  size,
  loading,
  loadingLabel,
  empty,
  emptyProps,
  stickyHeader,
  maxHeight,
  scroll,
  virtualized,
  estimatedRowHeight,
  overscan,
  selectable,
  selectAllLabel,
  getRowSelectionLabel,
  scrollAreaLabel,
  selectedRowKeys,
  defaultSelectedRowKeys,
  onSelectionChange,
  sort,
  defaultSort,
  onSortChange,
  disableClientSort,
  onRowClick,
  className,
  children,
  ...props
}: TableViewSource<T>) {
  return props;
}
/* eslint-enable @typescript-eslint/no-unused-vars */
