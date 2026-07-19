import type { Key } from "react";
import type { TableSortOrder, TableSortState } from "./Table.types";

let naturalCollator: Intl.Collator | undefined;

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
    const value = getByPath(record, rowKey);
    if (value != null) {
      return value as Key;
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

export function sortDataSource<T>(
  data: T[],
  sort: TableSortState,
  dataIndexByKey: Map<string, string | undefined>,
): T[] {
  if (!sort) {
    return data;
  }
  const path = dataIndexByKey.get(sort.key) ?? sort.key;
  const order: TableSortOrder = sort.order;
  const pathParts = path.split(".");
  const direction = order === "asc" ? 1 : -1;
  const decorated = data.map((record, index) => ({
    record,
    index,
    value: getByPathParts(record, pathParts),
  }));
  decorated.sort((left, right) => {
    const result = compareValues(left.value, right.value) * direction;
    return result === 0 ? left.index - right.index : result;
  });
  return decorated.map(({ record }) => record);
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
