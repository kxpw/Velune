import type { Key } from "react";
import type {
  TableColumn,
  TableSortOrder,
  TableSortState,
  TableTreeConfig,
} from "./Table.types";

let naturalCollator: Intl.Collator | undefined;

export type FlatTreeMeta = {
  depth: number;
  hasChildren: boolean;
};

export type ResolvedTableTree = {
  enabled: boolean;
  childrenKey: string;
  indent: number;
  defaultExpandAll: boolean;
  expandedRowKeys?: Key[];
  defaultExpandedRowKeys?: Key[];
  onExpandedRowsChange?: (keys: Key[]) => void;
};

export function resolveTableTree(
  tree: boolean | TableTreeConfig | undefined,
): ResolvedTableTree {
  if (!tree) {
    return DISABLED_TABLE_TREE;
  }
  const config = tree === true ? {} : tree;
  return {
    enabled: true,
    childrenKey: config.childrenKey ?? "children",
    indent: config.indent ?? 16,
    defaultExpandAll: Boolean(config.defaultExpandAll),
    ...(config.expandedRowKeys !== undefined
      ? { expandedRowKeys: config.expandedRowKeys }
      : {}),
    ...(config.defaultExpandedRowKeys !== undefined
      ? { defaultExpandedRowKeys: config.defaultExpandedRowKeys }
      : {}),
    ...(config.onExpandedRowsChange !== undefined
      ? { onExpandedRowsChange: config.onExpandedRowsChange }
      : {}),
  };
}

const DISABLED_TABLE_TREE: ResolvedTableTree = {
  enabled: false,
  childrenKey: "children",
  indent: 16,
  defaultExpandAll: false,
};

export function getByPath(record: unknown, path?: string): unknown {
  if (!path || record == null || typeof record !== "object") {
    return undefined;
  }
  if (!path.includes(".")) {
    return (record as Record<string, unknown>)[path];
  }
  return getByPathParts(record, path.split("."));
}

export function resolveRowKey<T>(
  record: T,
  index: number,
  rowKey?: string | ((record: T, index: number) => Key),
): Key {
  if (typeof rowKey === "function") {
    return rowKey(record, index);
  }
  if (typeof rowKey === "string") {
    // Hot path: plain property (TableMount / most apps).
    if (!rowKey.includes(".") && record != null && typeof record === "object") {
      const value = (record as Record<string, unknown>)[rowKey];
      if (value != null) {
        return value as Key;
      }
    } else {
      const value = getByPath(record, rowKey);
      if (value != null) {
        return value as Key;
      }
    }
  }
  const asRecord = record as Record<string, unknown>;
  if (asRecord.key != null) {
    return asRecord.key as Key;
  }
  if (asRecord.id != null) {
    return asRecord.id as Key;
  }
  return index;
}

function compareValues(a: unknown, b: unknown): number {
  if (a == null && b == null) {
    return 0;
  }
  if (a == null) {
    return -1;
  }
  if (b == null) {
    return 1;
  }
  if (typeof a === "number" && typeof b === "number") {
    return a - b;
  }
  naturalCollator ??= new Intl.Collator(undefined, {
    numeric: true,
    sensitivity: "base",
  });
  return naturalCollator.compare(String(a), String(b));
}

function findSortColumn<T>(
  columns: readonly TableColumn<T>[],
  sortKey: string,
): TableColumn<T> | undefined {
  return columns.find((column) => column.key === sortKey);
}

function getSortComparable<T>(
  record: T,
  column: TableColumn<T> | undefined,
  sortKey: string,
): unknown {
  if (column?.sortValue) {
    return column.sortValue(record);
  }
  const path = column?.dataIndex ?? sortKey;
  return getByPath(record, path);
}

export function sortDataSource<T>(
  data: T[],
  sort: TableSortState,
  columns: readonly TableColumn<T>[],
): T[] {
  if (!sort) {
    return data;
  }
  const column = findSortColumn(columns, sort.key);
  const order: TableSortOrder = sort.order;
  const direction = order === "asc" ? 1 : -1;
  const decorated = data.map((record, index) => ({
    record,
    index,
    value: column?.sorter
      ? undefined
      : getSortComparable(record, column, sort.key),
  }));
  decorated.sort((left, right) => {
    let result: number;
    if (column?.sorter) {
      result = column.sorter(left.record, right.record);
    } else {
      result = compareValues(left.value, right.value);
    }
    result *= direction;
    return result === 0 ? left.index - right.index : result;
  });
  return decorated.map(({ record }) => record);
}

export function getTreeChildren<T>(
  record: T,
  childrenKey: string,
): T[] | undefined {
  if (record == null || typeof record !== "object") {
    return undefined;
  }
  const value = (record as Record<string, unknown>)[childrenKey];
  return Array.isArray(value) ? (value as T[]) : undefined;
}

export function sortTreeDataSource<T>(
  data: T[],
  sort: TableSortState,
  columns: readonly TableColumn<T>[],
  childrenKey: string,
): T[] {
  if (!sort) {
    return data;
  }
  return sortDataSource(data, sort, columns).map((record) => {
    const children = getTreeChildren(record, childrenKey);
    if (!children?.length) {
      return record;
    }
    return {
      ...(record as object),
      [childrenKey]: sortTreeDataSource(children, sort, columns, childrenKey),
    } as T;
  });
}

export function collectExpandableKeys<T>(
  data: T[],
  childrenKey: string,
  rowKey?: string | ((record: T, index: number) => Key),
): Key[] {
  const keys: Key[] = [];
  let counter = 0;
  const walk = (nodes: T[]) => {
    for (const record of nodes) {
      const index = counter;
      counter += 1;
      const children = getTreeChildren(record, childrenKey);
      if (children?.length) {
        keys.push(resolveRowKey(record, index, rowKey));
        walk(children);
      }
    }
  };
  walk(data);
  return keys;
}

export function flattenTreeRows<T>(
  data: T[],
  {
    childrenKey,
    expandedKeys,
    rowKey,
  }: {
    childrenKey: string;
    expandedKeys: ReadonlySet<Key>;
    rowKey?: string | ((record: T, index: number) => Key);
  },
  depth = 0,
  records: T[] = [],
  meta: FlatTreeMeta[] = [],
): { records: T[]; meta: FlatTreeMeta[] } {
  for (const record of data) {
    const children = getTreeChildren(record, childrenKey);
    const hasChildren = Boolean(children?.length);
    const flatIndex = records.length;
    const key = resolveRowKey(record, flatIndex, rowKey);
    records.push(record);
    meta.push({ depth, hasChildren });
    if (hasChildren && expandedKeys.has(key) && children) {
      flattenTreeRows(
        children,
        {
          childrenKey,
          expandedKeys,
          ...(rowKey !== undefined ? { rowKey } : {}),
        },
        depth + 1,
        records,
        meta,
      );
    }
  }
  return { records, meta };
}

function getByPathParts(record: unknown, parts: readonly string[]): unknown {
  let value = record;
  for (const part of parts) {
    if (value == null || typeof value !== "object") {
      return undefined;
    }
    value = (value as Record<string, unknown>)[part];
  }
  return value;
}

export function nextSortState(
  current: TableSortState,
  key: string,
): TableSortState {
  if (!current || current.key !== key) {
    return { key, order: "asc" };
  }
  if (current.order === "asc") {
    return { key, order: "desc" };
  }
  return null;
}

export function resolveColumnWidthPx(
  width: number | string | undefined,
): number {
  if (typeof width === "number" && Number.isFinite(width)) {
    return width;
  }
  if (typeof width === "string") {
    const trimmed = width.trim();
    if (trimmed.endsWith("px")) {
      const parsed = Number.parseFloat(trimmed);
      return Number.isFinite(parsed) ? parsed : 0;
    }
    const bare = Number.parseFloat(trimmed);
    if (Number.isFinite(bare) && /^\d+(\.\d+)?$/.test(trimmed)) {
      return bare;
    }
  }
  return 0;
}

export type FixedColumnLayout = {
  /** True when any column uses `fixed: "start"`. */
  hasStartFixed: boolean;
  /** True when any column uses `fixed: "end"`. */
  hasEndFixed: boolean;
  /** Inline-start offset for the selection column when pinned. */
  selectionOffset: number;
  /** Selection column width in px (0 when not selectable). */
  selectionWidth: number;
  /**
   * Resolved px widths for each data column. When `tableMinWidthPx` is set,
   * leftover width is absorbed by non-fixed columns so selection/fixed
   * columns keep their declared sizes under `table-layout: fixed`.
   */
  columnWidths: number[];
  /** Per data-column sticky offset (px) or null when not fixed. */
  offsets: Array<number | null>;
  /** Index of the last start-fixed data column, or -1. */
  lastStartFixedIndex: number;
  /** Index of the first end-fixed data column, or -1. */
  firstEndFixedIndex: number;
};

/**
 * Selection column width in px. Must fit the sm checkbox touch target
 * (`min-w-gs-11` = 44px) with zero horizontal cell padding, and must match
 * the sticky `inset-inline-start` reserved for the first start-fixed column.
 */
export const SELECTION_COLUMN_WIDTH_PX = 48;

/** Shared layout when no column uses `fixed` and no min-width redistribution is needed. */
export const EMPTY_FIXED_LAYOUT: FixedColumnLayout = {
  hasStartFixed: false,
  hasEndFixed: false,
  selectionOffset: 0,
  selectionWidth: 0,
  columnWidths: [],
  offsets: [],
  lastStartFixedIndex: -1,
  firstEndFixedIndex: -1,
};

export function buildFixedColumnLayout<T>(
  columns: readonly TableColumn<T>[],
  selectable: boolean,
  tableMinWidthPx = 0,
): FixedColumnLayout {
  let hasStartFixed = false;
  let hasEndFixed = false;
  for (const column of columns) {
    if (column.fixed === "start") {
      hasStartFixed = true;
    } else if (column.fixed === "end") {
      hasEndFixed = true;
    }
  }

  if (!hasStartFixed && !hasEndFixed && tableMinWidthPx <= 0) {
    return selectable
      ? {
          ...EMPTY_FIXED_LAYOUT,
          selectionWidth: SELECTION_COLUMN_WIDTH_PX,
        }
      : EMPTY_FIXED_LAYOUT;
  }

  const offsets: Array<number | null> = columns.map(() => null);
  let lastStartFixedIndex = -1;
  let firstEndFixedIndex = -1;

  columns.forEach((column, index) => {
    if (column.fixed === "start") {
      lastStartFixedIndex = index;
    } else if (column.fixed === "end") {
      if (firstEndFixedIndex === -1) {
        firstEndFixedIndex = index;
      }
    }
    if (
      process.env.NODE_ENV !== "production" &&
      column.fixed &&
      resolveColumnWidthPx(column.width) === 0
    ) {
      console.warn(
        `[Velune Table] Column "${column.key}" uses \`fixed\` without a numeric (or px) \`width\`.`,
      );
    }
  });

  const selectionWidth = selectable ? SELECTION_COLUMN_WIDTH_PX : 0;
  const columnWidths = columns.map((column) =>
    resolveColumnWidthPx(column.width),
  );

  if (tableMinWidthPx > 0) {
    const declaredSum =
      selectionWidth + columnWidths.reduce((sum, width) => sum + width, 0);
    const remainder = tableMinWidthPx - declaredSum;
    if (remainder > 0) {
      const flexIndexes = columns.flatMap((column, index) =>
        column.fixed ? [] : [index],
      );
      const targets =
        flexIndexes.length > 0
          ? flexIndexes
          : columnWidths.length > 0
            ? [columnWidths.length - 1]
            : [];
      if (targets.length > 0) {
        const base = Math.floor(remainder / targets.length);
        const leftover = remainder - base * targets.length;
        targets.forEach((index, order) => {
          columnWidths[index] =
            (columnWidths[index] ?? 0) + base + (order === 0 ? leftover : 0);
        });
      }
    }
  }

  const selectionOffset = 0;
  let startCursor = selectable && hasStartFixed ? selectionWidth : 0;
  columns.forEach((column, index) => {
    if (column.fixed !== "start") return;
    offsets[index] = startCursor;
    startCursor += resolveColumnWidthPx(column.width);
  });

  let endCursor = 0;
  for (let index = columns.length - 1; index >= 0; index -= 1) {
    const column = columns[index]!;
    if (column.fixed !== "end") continue;
    offsets[index] = endCursor;
    endCursor += resolveColumnWidthPx(column.width);
  }

  return {
    hasStartFixed,
    hasEndFixed,
    selectionOffset,
    selectionWidth,
    columnWidths,
    offsets,
    lastStartFixedIndex,
    firstEndFixedIndex,
  };
}
