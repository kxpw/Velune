import type { Key, KeyboardEvent } from "react";
import { useCallback, useMemo, useRef, useState } from "react";
import type { TableProps, TableSortState } from "./Table.types";
import { nextSortState, resolveRowKey, sortDataSource } from "./table-utils";

const allKeysSelected = { has: () => true } as const;

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
}: TableProps<T>) {
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

  const dataIndexByKey = useMemo(() => {
    const map = new Map<string, string | undefined>();
    columns.forEach((column) => {
      map.set(column.key, column.dataIndex);
    });
    return map;
  }, [columns]);

  const rows = useMemo(() => {
    if (disableClientSort || !sort) return dataSource;
    return sortDataSource(dataSource, sort, dataIndexByKey);
  }, [dataIndexByKey, dataSource, disableClientSort, sort]);

  const allKeys = useMemo(
    () =>
      selectable
        ? rows.map((record, index) => resolveRowKey(record, index, rowKey))
        : [],
    [rowKey, rows, selectable],
  );
  const usesAllKeys = allKeys.length > 0 && selected === allKeys;
  const selectedSet = useMemo(
    () => (usesAllKeys ? allKeysSelected : new Set(selected)),
    [selected, usesAllKeys],
  );
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
    handleRowKeyDown,
    handleSort,
    rows,
    selectedSet,
    someSelected,
    sort,
    toggleAll,
    toggleRow,
  };
}

export type TableState<T> = ReturnType<typeof useTableState<T>>;
