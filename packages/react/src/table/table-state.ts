import type { Key, KeyboardEvent } from "react";
import { useCallback, useMemo, useRef, useState } from "react";
import type { TableProps, TableSortState } from "./Table.types";
import type { FlatTreeMeta } from "./table-utils";
import {
  flattenTreeRows,
  collectExpandableKeys,
  nextSortState,
  resolveRowKey,
  resolveTableTree,
  sortDataSource,
  sortTreeDataSource,
} from "./table-utils";

const allKeysSelected = { has: () => true } as const;
const EMPTY_KEY_SET: ReadonlySet<Key> = new Set();

export function useTableState<T>({
  columns,
  dataSource,
  rowKey,
  selectedRowKeys,
  defaultSelectedRowKeys = [],
  onSelectionChange,
  sort: sortProp,
  defaultSort = null,
  onSortChange,
  disableClientSort = false,
  onRowClick,
  selectable = false,
  tree,
}: TableProps<T>) {
  const treeConfig = useMemo(() => resolveTableTree(tree), [tree]);
  const isSortControlled = sortProp !== undefined;
  const [innerSort, setInnerSort] = useState<TableSortState>(defaultSort);
  const sort = isSortControlled ? sortProp : innerSort;

  const isSelectionControlled = selectedRowKeys !== undefined;
  const [innerSelected, setInnerSelected] = useState<Key[]>(
    defaultSelectedRowKeys,
  );
  const selected = isSelectionControlled
    ? (selectedRowKeys as Key[])
    : innerSelected;

  const isExpandControlled = treeConfig.expandedRowKeys !== undefined;
  const [innerExpanded, setInnerExpanded] = useState<Key[]>(() => {
    if (!treeConfig.enabled) return [];
    if (treeConfig.defaultExpandAll) {
      return collectExpandableKeys(dataSource, treeConfig.childrenKey, rowKey);
    }
    return treeConfig.defaultExpandedRowKeys ?? [];
  });
  const expanded = isExpandControlled
    ? (treeConfig.expandedRowKeys as Key[])
    : innerExpanded;
  const expandedSet = useMemo(
    () => (expanded.length === 0 ? EMPTY_KEY_SET : new Set(expanded)),
    [expanded],
  );

  const { rows, treeMeta } = useMemo(() => {
    let nextData = dataSource;
    if (!disableClientSort && sort) {
      nextData = treeConfig.enabled
        ? sortTreeDataSource(dataSource, sort, columns, treeConfig.childrenKey)
        : sortDataSource(dataSource, sort, columns);
    }
    if (!treeConfig.enabled) {
      return { rows: nextData, treeMeta: null as FlatTreeMeta[] | null };
    }
    const flattened = flattenTreeRows(nextData, {
      childrenKey: treeConfig.childrenKey,
      expandedKeys: expandedSet,
      ...(rowKey !== undefined ? { rowKey } : {}),
    });
    return { rows: flattened.records, treeMeta: flattened.meta };
  }, [
    columns,
    dataSource,
    disableClientSort,
    expandedSet,
    rowKey,
    sort,
    treeConfig.childrenKey,
    treeConfig.enabled,
  ]);

  const allKeys = useMemo(
    () =>
      selectable
        ? rows.map((record, index) => resolveRowKey(record, index, rowKey))
        : [],
    [rowKey, rows, selectable],
  );
  const usesAllKeys = allKeys.length > 0 && selected === allKeys;
  const selectedSet = useMemo(() => {
    if (!selectable) {
      return EMPTY_KEY_SET;
    }
    if (usesAllKeys) {
      return allKeysSelected;
    }
    return selected.length === 0 ? EMPTY_KEY_SET : new Set(selected);
  }, [selectable, selected, usesAllKeys]);
  const { allSelected, someSelected } = useMemo(() => {
    if (allKeys.length === 0 || selected.length === 0) {
      return { allSelected: false, someSelected: false };
    }
    if (usesAllKeys) {
      return { allSelected: true, someSelected: false };
    }
    const everySelected = allKeys.every((key) => selectedSet.has(key));
    return {
      allSelected: everySelected,
      someSelected:
        !everySelected && allKeys.some((key) => selectedSet.has(key)),
    };
  }, [allKeys, selected.length, selectedSet, usesAllKeys]);

  const emitSelection = useCallback(
    (keys: Key[]) => {
      if (!isSelectionControlled) setInnerSelected(keys);
      if (!onSelectionChange) return;
      const keySet = new Set(keys);
      const selectedRows = rows.filter((record, index) =>
        keySet.has(resolveRowKey(record, index, rowKey)),
      );
      onSelectionChange(keys, selectedRows);
    },
    [isSelectionControlled, onSelectionChange, rowKey, rows],
  );

  const selectionSnapshotRef = useRef({ emitSelection, selected, selectedSet });
  selectionSnapshotRef.current = { emitSelection, selected, selectedSet };

  const handleSort = useCallback(
    (key: string) => {
      const next = nextSortState(sort ?? null, key);
      if (!isSortControlled) setInnerSort(next);
      onSortChange?.(next);
    },
    [isSortControlled, onSortChange, sort],
  );

  const emitExpanded = useCallback(
    (keys: Key[]) => {
      if (!isExpandControlled) setInnerExpanded(keys);
      treeConfig.onExpandedRowsChange?.(keys);
    },
    [isExpandControlled, treeConfig],
  );

  const toggleExpand = useCallback(
    (key: Key) => {
      emitExpanded(
        expandedSet.has(key)
          ? expanded.filter((item) => item !== key)
          : [...expanded, key],
      );
    },
    [emitExpanded, expanded, expandedSet],
  );

  const toggleAll = useCallback(() => {
    emitSelection(allSelected ? [] : allKeys);
  }, [allKeys, allSelected, emitSelection]);

  const toggleRow = useCallback((key: Key) => {
    const {
      emitSelection: emit,
      selected: keys,
      selectedSet: keySet,
    } = selectionSnapshotRef.current;
    emit(
      keySet.has(key) ? keys.filter((item) => item !== key) : [...keys, key],
    );
  }, []);

  const handleRowKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTableRowElement>, record: T, index: number) => {
      if (!onRowClick || (event.key !== "Enter" && event.key !== " ")) return;
      event.preventDefault();
      onRowClick(record, index);
    },
    [onRowClick],
  );

  return {
    allSelected,
    expandedSet,
    handleRowKeyDown,
    handleSort,
    rows,
    selectedSet,
    someSelected,
    sort,
    toggleAll,
    toggleExpand,
    toggleRow,
    treeIndent: treeConfig.indent,
    treeMeta,
  };
}

export type TableState<T> = ReturnType<typeof useTableState<T>>;
