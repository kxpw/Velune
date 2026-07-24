import type { TableProps } from "../table/Table.types";

export interface VirtualTableProps<
  T = Record<string, unknown>,
> extends TableProps<T> {
  /** Estimated row height in pixels used before a row is measured. */
  estimatedRowHeight?: number;
  /** Number of rows rendered outside the visible range. Default: `5`. */
  overscan?: number;
}
