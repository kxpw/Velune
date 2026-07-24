import type { ForwardedRef, ReactElement } from "react";
import { forwardRef, useRef } from "react";
import type { TableProps } from "./Table.types";
import { resolveTableSource, TableCaption, TableEmpty } from "./Table.parts";
import { useTableState } from "./table-state";
import { TableView, type TableRowWindow } from "./TableView";
import { tableWrapClasses } from "./Table.classes";

export { tableWrapClasses };

const STATIC_ROW_WINDOW: TableRowWindow = {
  virtualized: false,
  visibleRowIndexes: null,
  paddingTop: 0,
  paddingBottom: 0,
};

function StaticTable<T>({
  source,
  forwardedRef,
}: {
  source: TableProps<T>;
  forwardedRef: ForwardedRef<HTMLDivElement>;
}) {
  const resolvedSource = resolveTableSource(source);
  const state = useTableState(resolvedSource);
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <TableView
      source={resolvedSource}
      state={state}
      scrollRef={scrollRef}
      forwardedRef={forwardedRef}
      rowWindow={STATIC_ROW_WINDOW}
    />
  );
}

function TableForwardRef<T>(
  props: TableProps<T>,
  ref: ForwardedRef<HTMLDivElement>,
) {
  return <StaticTable source={props} forwardedRef={ref} />;
}

const TableRoot = forwardRef(TableForwardRef) as <T>(
  props: TableProps<T> & { ref?: ForwardedRef<HTMLDivElement> },
) => ReactElement | null;
(TableRoot as { displayName?: string }).displayName = "Table";

export const Table = Object.assign(TableRoot, {
  Caption: TableCaption,
  Empty: TableEmpty,
});
