import type { ForwardedRef, ReactElement } from "react";
import { forwardRef, useCallback, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { resolveRowKey } from "../table/table-utils";
import { useTableState } from "../table/table-state";
import { TableView } from "../table/TableView";
import {
  resolveTableSource,
  TableCaption,
  TableEmpty,
} from "../table/Table.parts";
import type { VirtualTableProps } from "./VirtualTable.types";

const DEFAULT_ESTIMATED_ROW_HEIGHT = {
  sm: 36,
  md: 44,
} as const;
const DEFAULT_OVERSCAN = 5;

function VirtualTableForwardRef<T>(
  props: VirtualTableProps<T>,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const source = resolveTableSource(props);
  const state = useTableState(source);
  const scrollRef = useRef<HTMLDivElement>(null);
  const estimatedRowHeight =
    source.estimatedRowHeight ??
    DEFAULT_ESTIMATED_ROW_HEIGHT[source.size ?? "md"];
  const getVirtualRowKey = useCallback(
    (index: number) => resolveRowKey(state.rows[index]!, index, source.rowKey),
    [source.rowKey, state.rows],
  );
  const rowVirtualizer = useVirtualizer({
    count: state.rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => estimatedRowHeight,
    getItemKey: getVirtualRowKey,
    overscan: source.overscan ?? DEFAULT_OVERSCAN,
  });
  const virtualRows = rowVirtualizer.getVirtualItems();

  return (
    <TableView
      source={source}
      state={state}
      scrollRef={scrollRef}
      forwardedRef={ref}
      rowWindow={{
        virtualized: true,
        visibleRowIndexes: virtualRows.map((row) => row.index),
        paddingTop: virtualRows[0]?.start ?? 0,
        paddingBottom: Math.max(
          0,
          rowVirtualizer.getTotalSize() -
            (virtualRows[virtualRows.length - 1]?.end ?? 0),
        ),
        measureElement: rowVirtualizer.measureElement,
      }}
    />
  );
}

const VirtualTableRoot = forwardRef(VirtualTableForwardRef) as <T>(
  props: VirtualTableProps<T> & { ref?: ForwardedRef<HTMLDivElement> },
) => ReactElement | null;

(VirtualTableRoot as { displayName?: string }).displayName = "VirtualTable";

export const VirtualTable = Object.assign(VirtualTableRoot, {
  Caption: TableCaption,
  Empty: TableEmpty,
});
