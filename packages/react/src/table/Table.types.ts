import type { CSSProperties, HTMLAttributes, Key, ReactNode } from "react";

export type TableSize = "sm" | "md";
export type TableAlign = "start" | "center" | "end";
export type TableSortOrder = "asc" | "desc";

export type TableSortState = {
  key: string;
  order: TableSortOrder;
} | null;

export type TableScroll = {
  /** Minimum table width. Overflow becomes horizontally scrollable. */
  x?: CSSProperties["minWidth"];
  /** Maximum viewport height. Overflow becomes vertically scrollable. */
  y?: CSSProperties["maxHeight"];
};

export type TableColumn<T> = {
  /** Unique column id used for sort / keys. */
  key: string;
  title: ReactNode;
  /** Path into the record, e.g. `"name"` or `"user.email"`. */
  dataIndex?: string;
  sortable?: boolean;
  width?: number | string;
  align?: TableAlign;
  render?: (value: unknown, record: T, index: number) => ReactNode;
  className?: string;
};

export interface TableProps<T = Record<string, unknown>> extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "children"
> {
  children?: ReactNode;
  columns: TableColumn<T>[];
  dataSource: T[];
  /** Unique row key field or getter. Default: `"key"` then `"id"`. */
  rowKey?: string | ((record: T, index: number) => Key);
  size?: TableSize;
  loading?: boolean;
  /** Accessible label for the loading indicator. Default: `Loading table`. */
  loadingLabel?: string;
  /** Sticky header while the table body scrolls. */
  stickyHeader?: boolean;
  /** Maximum scroll area height. Pair with `stickyHeader` for long tables. */
  maxHeight?: CSSProperties["maxHeight"];
  /** Configure synchronized horizontal and vertical table overflow. */
  scroll?: TableScroll;
  /**
   * Render only rows near the scroll viewport.
   * @deprecated Import and render `VirtualTable` directly to avoid the lazy
   * compatibility boundary.
   */
  virtualized?: boolean;
  /** Estimated row height in pixels used before a row is measured. */
  estimatedRowHeight?: number;
  /** Number of rows rendered outside the visible range. Default: `5`. */
  overscan?: number;
  /** Enable row selection checkboxes. */
  selectable?: boolean;
  /** Accessible label for the header selection control. */
  selectAllLabel?: string;
  /** Builds an accessible label for a row selection control. */
  getRowSelectionLabel?: (record: T, index: number, key: Key) => string;
  /** Accessible name for a keyboard-focusable scroll region. */
  scrollAreaLabel?: string;
  selectedRowKeys?: Key[];
  defaultSelectedRowKeys?: Key[];
  onSelectionChange?: (keys: Key[], rows: T[]) => void;
  sort?: TableSortState;
  defaultSort?: TableSortState;
  onSortChange?: (sort: TableSortState) => void;
  /** Disable client-side sort (use with controlled dataSource). */
  disableClientSort?: boolean;
  onRowClick?: (record: T, index: number) => void;
}

export type TableCaptionProps = HTMLAttributes<HTMLTableCaptionElement>;
export type TableEmptyProps = HTMLAttributes<HTMLTableCellElement>;

export interface TableViewSource<
  T = Record<string, unknown>,
> extends TableProps<T> {
  caption?: ReactNode;
  captionProps?: TableCaptionProps | undefined;
  empty?: ReactNode;
  emptyProps?: TableEmptyProps | undefined;
}
