import type { CSSProperties, HTMLAttributes, Key, ReactNode } from "react";

export type TableSize = "sm" | "md";
export type TableAlign = "start" | "center" | "end";
export type TableSortOrder = "asc" | "desc";
export type TableColumnFixed = "start" | "end";

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
  /**
   * Sort key extracted from the record when it differs from `dataIndex`
   * (for example rendered Tag labels).
   */
  sortValue?: (record: T) => unknown;
  /** Custom comparator; Table applies asc/desc direction. */
  sorter?: (a: T, b: T) => number;
  width?: number | string;
  align?: TableAlign;
  /**
   * Pin the column while the table scrolls horizontally.
   * Requires `scroll.x` and a numeric (or `px`) `width`.
   */
  fixed?: TableColumnFixed;
  render?: (value: unknown, record: T, index: number) => ReactNode;
  className?: string;
};

export type TableTreeConfig = {
  /** Nested children field. Default: `"children"`. */
  childrenKey?: string;
  /** Expand every parent on first render when uncontrolled. */
  defaultExpandAll?: boolean;
  expandedRowKeys?: Key[];
  defaultExpandedRowKeys?: Key[];
  onExpandedRowsChange?: (keys: Key[]) => void;
  /** Indent per depth in pixels. Default: `16` (`space-4`). */
  indent?: number;
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
  /**
   * Render nested `children` as an expandable tree.
   * Pass `true` for defaults, or a config object.
   */
  tree?: boolean | TableTreeConfig;
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
