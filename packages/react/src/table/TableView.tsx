import type {
  CSSProperties,
  ForwardedRef,
  Key,
  KeyboardEvent,
  ReactNode,
  RefCallback,
  RefObject,
} from "react";
import { memo, useMemo } from "react";
import { clsx } from "clsx";
import { Checkbox } from "../checkbox";
import { Spinner } from "../spinner";
import type { TableColumn, TableViewSource } from "./Table.types";
import type { TableState } from "./table-state";
import {
  buildFixedColumnLayout,
  SELECTION_COLUMN_WIDTH_PX,
  getByPath,
  resolveColumnWidthPx,
  resolveRowKey,
} from "./table-utils";
import {
  tableCaptionClasses,
  tableCellClasses,
  tableClasses,
  tableEmptyClasses,
  tableFixedCellClasses,
  tableFixedEndEdgeClasses,
  tableFixedStartEdgeClasses,
  tableHeaderCellClasses,
  tableLoadingClasses,
  tableRowClasses,
  tableScrollClasses,
  tableSelectionCellClasses,
  tableSelectionCheckboxClasses,
  tableSelectionHeaderCellClasses,
  tableSortButtonClasses,
  tableSortIconClasses,
  tableSortIconInactiveClasses,
  tableTreeCellClasses,
  tableTreeExpandButtonClasses,
  tableTreeExpandSpacerClasses,
  tableVirtualSpacerClasses,
  tableWrapClasses,
} from "./Table.classes";

export { tableLoadingClasses, tableWrapClasses };

function defaultGetRowSelectionLabel(
  _record: unknown,
  _index: number,
  key: Key,
): string {
  return `Select row ${String(key)}`;
}

export interface TableRowWindow {
  virtualized: boolean;
  /** Row indexes to render. `null` means render every row in `state.rows`. */
  visibleRowIndexes: number[] | null;
  paddingTop: number;
  paddingBottom: number;
  measureElement?: RefCallback<HTMLTableRowElement>;
}

const idleTableRowClassName = tableRowClasses();
const defaultTableCellClassName = tableCellClasses();
const smallTableCellClassName = tableCellClasses({ size: "sm" });

type ColumnView<T> = {
  column: TableColumn<T>;
  key: string;
  className: string;
  headerClassName: string;
  style: CSSProperties | undefined;
  headerStyle: CSSProperties | undefined;
  isTreeColumn: boolean;
  align: TableColumn<T>["align"];
  fixed: TableColumn<T>["fixed"];
  getContent: (record: T, rowIndex: number) => ReactNode;
};

function createColumnContentReader<T>(
  column: TableColumn<T>,
): (record: T, rowIndex: number) => ReactNode {
  const dataPath = column.dataIndex ?? column.key;
  const render = column.render;
  if (render) {
    return (record, rowIndex) =>
      render(getByPath(record, dataPath), record, rowIndex);
  }
  if (dataPath && !dataPath.includes(".")) {
    return (record) =>
      record != null && typeof record === "object"
        ? ((record as Record<string, unknown>)[dataPath] as ReactNode)
        : undefined;
  }
  return (record) => getByPath(record, dataPath) as ReactNode;
}

function resolvePlainRowKey<T>(
  record: T,
  index: number,
  rowKey: TableViewSource<T>["rowKey"],
): Key {
  if (typeof rowKey === "string" && !rowKey.includes(".")) {
    if (record != null && typeof record === "object") {
      const value = (record as Record<string, unknown>)[rowKey];
      if (value != null) {
        return value as Key;
      }
    }
  }
  return resolveRowKey(record, index, rowKey);
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
  const cellClasses =
    size === "sm" ? smallTableCellClassName : defaultTableCellClassName;
  const domProps = cleanTableDomProps(source);
  const tableMinWidthPx = resolveColumnWidthPx(
    typeof scroll?.x === "number" || typeof scroll?.x === "string"
      ? scroll.x
      : undefined,
  );
  const fixedLayout = useMemo(
    () => buildFixedColumnLayout(columns, Boolean(selectable), tableMinWidthPx),
    [columns, selectable, tableMinWidthPx],
  );
  const hasHorizontalFixed =
    fixedLayout.hasStartFixed || fixedLayout.hasEndFixed;
  const treeEnabled = state.treeMeta != null;
  const firstDataColumnKey = columns[0]?.key;
  const headerCellStickyClass = tableHeaderCellClasses({
    sticky: hasStickyHeader,
  });
  const columnViews = useMemo(() => {
    return columns.map((column, columnIndex): ColumnView<T> => {
      const fixedOffset = fixedLayout.offsets[columnIndex] ?? null;
      const isFixed = fixedOffset != null;
      const isStartEdge = columnIndex === fixedLayout.lastStartFixedIndex;
      const isEndEdge = columnIndex === fixedLayout.firstEndFixedIndex;
      const alignClass =
        column.align === "center"
          ? "text-center"
          : column.align === "end"
            ? "text-end"
            : undefined;
      const sharedClassName = clsx(
        cellClasses,
        alignClass,
        isFixed && tableFixedCellClasses,
        isStartEdge && tableFixedStartEdgeClasses,
        isEndEdge && tableFixedEndEdgeClasses,
        column.className,
      );
      return {
        column,
        key: column.key,
        className: sharedClassName,
        headerClassName: clsx(
          sharedClassName,
          headerCellStickyClass,
          !isFixed && hasStickyHeader && !hasHorizontalFixed && "z-gs-sticky",
        ),
        style: columnCellStyle(
          column,
          fixedOffset,
          false,
          hasHorizontalFixed,
          fixedLayout.columnWidths[columnIndex],
        ),
        headerStyle: columnCellStyle(
          column,
          fixedOffset,
          hasStickyHeader,
          hasHorizontalFixed,
          fixedLayout.columnWidths[columnIndex],
        ),
        isTreeColumn: treeEnabled && column.key === firstDataColumnKey,
        align: column.align,
        fixed: column.fixed,
        getContent: createColumnContentReader(column),
      };
    });
  }, [
    cellClasses,
    columns,
    firstDataColumnKey,
    fixedLayout,
    hasHorizontalFixed,
    hasStickyHeader,
    headerCellStickyClass,
    treeEnabled,
  ]);
  const bodyRowIndexes = virtualized ? (visibleRowIndexes ?? []) : null;
  const selectionBodyCellClassName = useMemo(
    () =>
      selectable
        ? clsx(
            cellClasses,
            tableSelectionCellClasses,
            fixedLayout.hasStartFixed && tableFixedCellClasses,
          )
        : "",
    [cellClasses, fixedLayout.hasStartFixed, selectable],
  );
  const selectionBodyCellStyle = useMemo(
    () =>
      selectable
        ? selectionCellStyle(fixedLayout.hasStartFixed, false)
        : undefined,
    [fixedLayout.hasStartFixed, selectable],
  );

  return (
    <div
      ref={forwardedRef}
      {...domProps}
      className={clsx(tableWrapClasses, className)}
      data-size={size}
      data-sticky={hasStickyHeader ? "true" : undefined}
      data-loading={loading ? "true" : undefined}
      data-virtualized={virtualized ? "true" : undefined}
      data-tree={treeEnabled ? "true" : undefined}
      aria-busy={loading || source["aria-busy"]}
    >
      {loading ? (
        <div className={tableLoadingClasses} aria-busy="true">
          <Spinner size="sm" aria-label={loadingLabel} />
        </div>
      ) : null}
      <div
        ref={scrollRef}
        className={tableScrollClasses}
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
          className={tableClasses({ loading: Boolean(loading) })}
          role={treeEnabled ? "treegrid" : undefined}
          aria-readonly={treeEnabled ? "true" : undefined}
          aria-rowcount={virtualized ? state.rows.length + 1 : undefined}
          style={{
            width: hasHorizontalFixed ? scroll?.x : undefined,
            minWidth: scroll?.x,
            // Auto table layout ignores cell max-width, so sticky start
            // offsets drift when the selection column grows with content.
            tableLayout: hasHorizontalFixed ? "fixed" : undefined,
          }}
        >
          {caption ? (
            <caption
              {...captionProps}
              className={clsx(tableCaptionClasses, captionProps?.className)}
            >
              {caption}
            </caption>
          ) : null}
          {hasHorizontalFixed ? (
            <colgroup>
              {selectable ? (
                <col style={{ width: fixedLayout.selectionWidth }} />
              ) : null}
              {fixedLayout.columnWidths.map((width, index) => (
                <col
                  key={columns[index]!.key}
                  style={width > 0 ? { width } : undefined}
                />
              ))}
            </colgroup>
          ) : null}
          <thead>
            <tr>
              {selectable ? (
                <th
                  className={clsx(
                    cellClasses,
                    `gs-table-header-cell ${tableSelectionHeaderCellClasses}`,
                    hasStickyHeader && "sticky top-gs-0",
                    hasStickyHeader &&
                      !fixedLayout.hasStartFixed &&
                      "z-gs-sticky",
                    fixedLayout.hasStartFixed && tableFixedCellClasses,
                  )}
                  scope="col"
                  style={selectionCellStyle(
                    fixedLayout.hasStartFixed,
                    hasStickyHeader,
                  )}
                >
                  <Checkbox
                    size="sm"
                    className={tableSelectionCheckboxClasses}
                    checked={state.allSelected}
                    indeterminate={state.someSelected}
                    onChange={state.toggleAll}
                    aria-label={selectAllLabel}
                  />
                </th>
              ) : null}
              {columnViews.map((columnView) => {
                const { column } = columnView;
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
                    key={columnView.key}
                    scope="col"
                    className={columnView.headerClassName}
                    style={columnView.headerStyle}
                    data-align={column.align}
                    data-fixed={column.fixed}
                    aria-sort={ariaSort}
                  >
                    {column.sortable ? (
                      <button
                        type="button"
                        className={tableSortButtonClasses}
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
                  className={clsx(tableEmptyClasses, emptyProps?.className)}
                  colSpan={columns.length + (selectable ? 1 : 0)}
                >
                  {empty}
                </td>
              </tr>
            ) : bodyRowIndexes ? (
              bodyRowIndexes.map((index) => {
                const record = state.rows[index]!;
                const key = resolveRowKey(record, index, rowKey);
                const meta = state.treeMeta?.[index];
                return (
                  <MemoTableDataRow
                    key={key}
                    record={record}
                    rowIndex={index}
                    rowKey={key}
                    columnViews={columnViews}
                    selectable={Boolean(selectable)}
                    selectionCellClassName={selectionBodyCellClassName}
                    selectionCellStyle={selectionBodyCellStyle}
                    selected={selectable ? state.selectedSet.has(key) : false}
                    virtualized={virtualized}
                    measureElement={rowWindow.measureElement}
                    onRowClick={onRowClick}
                    onRowKeyDown={state.handleRowKeyDown}
                    onToggleRow={state.toggleRow}
                    getRowSelectionLabel={getRowSelectionLabel}
                    treeDepth={meta?.depth}
                    treeHasChildren={meta?.hasChildren}
                    treeExpanded={
                      meta?.hasChildren ? state.expandedSet.has(key) : undefined
                    }
                    treeIndent={state.treeIndent}
                    onToggleExpand={state.toggleExpand}
                  />
                );
              })
            ) : (
              state.rows.map((record, index) => {
                const key = resolvePlainRowKey(record, index, rowKey);
                const meta = state.treeMeta?.[index];
                return (
                  <MemoTableDataRow
                    key={key}
                    record={record}
                    rowIndex={index}
                    rowKey={key}
                    columnViews={columnViews}
                    selectable={Boolean(selectable)}
                    selectionCellClassName={selectionBodyCellClassName}
                    selectionCellStyle={selectionBodyCellStyle}
                    selected={selectable ? state.selectedSet.has(key) : false}
                    virtualized={false}
                    measureElement={undefined}
                    onRowClick={onRowClick}
                    onRowKeyDown={state.handleRowKeyDown}
                    onToggleRow={state.toggleRow}
                    getRowSelectionLabel={getRowSelectionLabel}
                    treeDepth={meta?.depth}
                    treeHasChildren={meta?.hasChildren}
                    treeExpanded={
                      meta?.hasChildren ? state.expandedSet.has(key) : undefined
                    }
                    treeIndent={state.treeIndent}
                    onToggleExpand={state.toggleExpand}
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

function columnWidthStyle<T>(
  column: TableColumn<T>,
  resolvedWidthPx?: number,
): CSSProperties | undefined {
  if (resolvedWidthPx != null && resolvedWidthPx > 0) {
    return {
      width: resolvedWidthPx,
      minWidth: resolvedWidthPx,
      ...(column.fixed ? { maxWidth: resolvedWidthPx } : null),
    };
  }
  if (column.width == null) return undefined;
  if (typeof column.width === "number") {
    return {
      width: `${column.width}px`,
      minWidth: `${column.width}px`,
    };
  }
  return {
    width: column.width,
    minWidth:
      resolveColumnWidthPx(column.width) > 0
        ? `${resolveColumnWidthPx(column.width)}px`
        : undefined,
  };
}

function columnCellStyle<T>(
  column: TableColumn<T>,
  fixedOffset: number | null | undefined,
  hasStickyHeader: boolean,
  hasHorizontalFixed = false,
  resolvedWidthPx?: number,
): CSSProperties | undefined {
  const widthStyle = columnWidthStyle(column, resolvedWidthPx);
  if (fixedOffset != null) {
    const isStart = column.fixed === "start";
    return {
      ...widthStyle,
      ...(isStart
        ? { insetInlineStart: fixedOffset }
        : { insetInlineEnd: fixedOffset }),
      // Keep fixed data columns above scrolling cells, but below the selection
      // column so horizontal scroll never paints over row checkboxes.
      zIndex: hasStickyHeader ? 4 : 2,
    };
  }
  if (hasStickyHeader && hasHorizontalFixed) {
    return { ...widthStyle, zIndex: 1 };
  }
  return widthStyle;
}

/**
 * Keep the selection column width in sync with sticky start offsets, and
 * stack it above start-fixed data cells so horizontal scroll cannot cover
 * row checkboxes.
 */
function selectionCellStyle(
  hasStartFixed: boolean,
  hasStickyHeader: boolean,
): CSSProperties {
  const widthStyle: CSSProperties = {
    width: SELECTION_COLUMN_WIDTH_PX,
    minWidth: SELECTION_COLUMN_WIDTH_PX,
    maxWidth: SELECTION_COLUMN_WIDTH_PX,
    // Defeat `tableCellClasses` horizontal padding so width stays exact.
    paddingInline: 0,
  };
  if (!hasStartFixed) return widthStyle;
  return {
    ...widthStyle,
    insetInlineStart: 0,
    // Above start-fixed data cells (2/4) and scrolling content.
    zIndex: hasStickyHeader ? 5 : 3,
  };
}

type TableDataRowProps<T> = {
  record: T;
  rowIndex: number;
  rowKey: Key;
  columnViews: ColumnView<T>[];
  selectable: boolean;
  selectionCellClassName: string;
  selectionCellStyle: CSSProperties | undefined;
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
  treeDepth: number | undefined;
  treeHasChildren: boolean | undefined;
  treeExpanded: boolean | undefined;
  treeIndent: number;
  onToggleExpand: (key: Key) => void;
};

function TableDataRow<T>({
  record,
  rowIndex,
  rowKey,
  columnViews,
  selectable,
  selectionCellClassName,
  selectionCellStyle,
  selected,
  virtualized,
  measureElement,
  onRowClick,
  onRowKeyDown,
  onToggleRow,
  getRowSelectionLabel,
  treeDepth,
  treeHasChildren,
  treeExpanded,
  treeIndent,
  onToggleExpand,
}: TableDataRowProps<T>) {
  // Hot path: static data grid (TableMount) — no selection/tree/virtual/click.
  if (!selectable && !virtualized && !onRowClick && treeDepth == null) {
    return (
      <tr className={idleTableRowClassName}>
        {columnViews.map((columnView) => (
          <td
            key={columnView.key}
            className={columnView.className}
            style={columnView.style}
            data-align={columnView.align}
            data-fixed={columnView.fixed}
          >
            {columnView.getContent(record, rowIndex)}
          </td>
        ))}
      </tr>
    );
  }

  const treeEnabled = treeDepth != null;
  const rowClassName =
    selected || onRowClick
      ? tableRowClasses({
          selected,
          clickable: Boolean(onRowClick),
        })
      : idleTableRowClassName;
  return (
    <tr
      ref={virtualized ? measureElement : undefined}
      data-index={virtualized ? rowIndex : undefined}
      className={rowClassName}
      data-selected={selected ? "true" : undefined}
      data-clickable={onRowClick ? "true" : undefined}
      aria-rowindex={virtualized ? rowIndex + 2 : undefined}
      aria-level={treeEnabled ? (treeDepth ?? 0) + 1 : undefined}
      aria-expanded={treeHasChildren ? treeExpanded : undefined}
      tabIndex={onRowClick ? 0 : undefined}
      onClick={onRowClick ? () => onRowClick(record, rowIndex) : undefined}
      onKeyDown={
        onRowClick
          ? (event) => onRowKeyDown(event, record, rowIndex)
          : undefined
      }
    >
      {selectable ? (
        <td className={selectionCellClassName} style={selectionCellStyle}>
          <span onClick={(event) => event.stopPropagation()}>
            <Checkbox
              size="sm"
              className={tableSelectionCheckboxClasses}
              checked={selected}
              onChange={() => onToggleRow(rowKey)}
              aria-label={getRowSelectionLabel(record, rowIndex, rowKey)}
            />
          </span>
        </td>
      ) : null}
      {columnViews.map((columnView) => {
        const content = columnView.getContent(record, rowIndex);
        return (
          <td
            key={columnView.key}
            className={columnView.className}
            style={columnView.style}
            data-align={columnView.align}
            data-fixed={columnView.fixed}
          >
            {columnView.isTreeColumn ? (
              <span
                className={tableTreeCellClasses}
                style={{
                  paddingInlineStart: (treeDepth ?? 0) * treeIndent,
                }}
              >
                {treeHasChildren ? (
                  <button
                    type="button"
                    className={tableTreeExpandButtonClasses}
                    aria-label={treeExpanded ? "Collapse row" : "Expand row"}
                    aria-expanded={treeExpanded}
                    onClick={(event) => {
                      event.stopPropagation();
                      onToggleExpand(rowKey);
                    }}
                  >
                    <ExpandIcon expanded={Boolean(treeExpanded)} />
                  </button>
                ) : (
                  <span
                    className={tableTreeExpandSpacerClasses}
                    aria-hidden="true"
                  />
                )}
                <span className="min-w-gs-0">{content}</span>
              </span>
            ) : (
              content
            )}
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
    previous.columnViews !== next.columnViews ||
    previous.selectable !== next.selectable ||
    previous.selectionCellClassName !== next.selectionCellClassName ||
    previous.selectionCellStyle !== next.selectionCellStyle ||
    previous.selected !== next.selected ||
    previous.virtualized !== next.virtualized ||
    previous.measureElement !== next.measureElement ||
    previous.onRowClick !== next.onRowClick ||
    previous.onRowKeyDown !== next.onRowKeyDown ||
    previous.onToggleRow !== next.onToggleRow ||
    previous.getRowSelectionLabel !== next.getRowSelectionLabel ||
    previous.treeDepth !== next.treeDepth ||
    previous.treeHasChildren !== next.treeHasChildren ||
    previous.treeExpanded !== next.treeExpanded ||
    previous.treeIndent !== next.treeIndent ||
    previous.onToggleExpand !== next.onToggleExpand
  ) {
    return false;
  }

  if (previous.rowIndex === next.rowIndex) {
    return true;
  }

  return (
    !next.virtualized &&
    !next.onRowClick &&
    !next.columnViews.some((columnView) => columnView.column.render) &&
    next.treeDepth == null
  );
}

const MemoTableDataRow = memo(
  TableDataRow,
  tableDataRowPropsEqual,
) as typeof TableDataRow;

function SortIcon({ order }: { order?: "asc" | "desc" | null }) {
  return (
    <span
      className={tableSortIconClasses({ active: Boolean(order) })}
      data-order={order ?? "none"}
      aria-hidden="true"
    >
      <svg viewBox="0 0 12 12" fill="none">
        <path
          d="M6 2.5L9 5.5H3L6 2.5Z"
          fill="currentColor"
          className={clsx(
            "gs-table-sort-up",
            order === "desc" && tableSortIconInactiveClasses,
          )}
        />
        <path
          d="M6 9.5L3 6.5H9L6 9.5Z"
          fill="currentColor"
          className={clsx(
            "gs-table-sort-down",
            order === "asc" && tableSortIconInactiveClasses,
          )}
        />
      </svg>
    </span>
  );
}

function ExpandIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
      style={{
        transform: expanded ? "rotate(90deg)" : undefined,
      }}
    >
      <path
        d="M4.25 2.5L8.25 6L4.25 9.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
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
    <tr className={tableVirtualSpacerClasses} aria-hidden="true">
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
  tree,
  className,
  children,
  ...props
}: TableViewSource<T>) {
  return props;
}
/* eslint-enable @typescript-eslint/no-unused-vars */
