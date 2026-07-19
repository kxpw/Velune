import type {
  ComponentType,
  ForwardedRef,
  ReactElement,
  RefAttributes,
} from "react";
import { forwardRef, lazy, Suspense, useMemo, useRef } from "react";
import { clsx } from "clsx";
import { Spinner } from "../spinner";
import type { VirtualTableProps } from "../virtual-table/VirtualTable.types";
import type { TableProps } from "./Table.types";
import { resolveTableSource, TableCaption, TableEmpty } from "./Table.parts";
import { useTableState } from "./table-state";
import { tableLoadingClasses, tableWrapClasses, TableView } from "./TableView";

const LazyVirtualTable = lazy(async () => {
  const module = await import("../virtual-table/VirtualTable");
  return {
    default: module.VirtualTable as ComponentType<
      VirtualTableProps & RefAttributes<HTMLDivElement>
    >,
  };
});

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
  const visibleRowIndexes = useMemo(
    () => state.rows.map((_, index) => index),
    [state.rows],
  );

  return (
    <TableView
      source={resolvedSource}
      state={state}
      scrollRef={scrollRef}
      forwardedRef={forwardedRef}
      rowWindow={{
        virtualized: false,
        visibleRowIndexes,
        paddingTop: 0,
        paddingBottom: 0,
      }}
    />
  );
}

function TableForwardRef<T>(
  props: TableProps<T>,
  ref: ForwardedRef<HTMLDivElement>,
) {
  if (props.virtualized) {
    const VirtualComponent = LazyVirtualTable as unknown as ComponentType<
      VirtualTableProps<T> & RefAttributes<HTMLDivElement>
    >;
    return (
      <Suspense
        fallback={<VirtualTableFallback source={props} forwardedRef={ref} />}
      >
        <VirtualComponent {...withoutVirtualized(props)} ref={ref} />
      </Suspense>
    );
  }
  return <StaticTable source={props} forwardedRef={ref} />;
}

function VirtualTableFallback<T>({
  source: {
    className,
    size = "md",
    scroll,
    maxHeight,
    loadingLabel = "Loading table",
  },
  forwardedRef,
}: {
  source: TableProps<T>;
  forwardedRef: ForwardedRef<HTMLDivElement>;
}) {
  return (
    <div
      ref={forwardedRef}
      className={clsx(tableWrapClasses, className)}
      data-size={size}
      data-sticky="true"
      data-virtualized="true"
      aria-busy="true"
      style={{
        minHeight: scroll?.y ?? maxHeight ?? "var(--table-virtual-height)",
      }}
    >
      <div className={tableLoadingClasses}>
        <Spinner size="sm" aria-label={loadingLabel} />
      </div>
    </div>
  );
}

function withoutVirtualized<T>(props: TableProps<T>): VirtualTableProps<T> {
  const next = { ...props } as TableProps<T> & { virtualized?: boolean };
  delete next.virtualized;
  return next as unknown as VirtualTableProps<T>;
}

const TableRoot = forwardRef(TableForwardRef) as <T>(
  props: TableProps<T> & { ref?: ForwardedRef<HTMLDivElement> },
) => ReactElement | null;

(TableRoot as { displayName?: string }).displayName = "Table";

export const Table = Object.assign(TableRoot, {
  Caption: TableCaption,
  Empty: TableEmpty,
});
