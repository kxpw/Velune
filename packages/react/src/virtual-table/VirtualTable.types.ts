import type { TableProps } from "../table/Table.types";

export interface VirtualTableProps<T = Record<string, unknown>> extends Omit<
  TableProps<T>,
  "virtualized"
> {
  /** VirtualTable always virtualizes its rows. */
  virtualized?: never;
}
