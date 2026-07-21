import type { HTMLAttributes, ReactNode } from "react";

export type PaginationProps = Omit<HTMLAttributes<HTMLElement>, "onChange"> & {
  /** 1-based current page. */
  page?: number;
  defaultPage?: number;
  pageSize?: number;
  defaultPageSize?: number;
  total: number;
  onPageChange?: (page: number, pageSize: number) => void;
  /** Compact prev/next only. */
  simple?: boolean;
  /** Render nothing when there is at most one page. */
  hideOnSinglePage?: boolean;
  showSizeChanger?: boolean;
  pageSizeOptions?: number[];
  showQuickJumper?: boolean;
  /** Pages on each side of the current page. Default: `1`. */
  siblingCount?: number;
  disabled?: boolean;
  /** Accessible name for the pagination landmark. Default: `Pagination`. */
  "aria-label"?: string;
  /** Accessible label for the previous-page command. */
  previousPageLabel?: string;
  /** Accessible label for the next-page command. */
  nextPageLabel?: string;
  /** Builds the accessible label for a numbered page command. */
  getPageLabel?: (page: number) => string;
  /** Visible label for the page-size selector. */
  rowsPerPageLabel?: ReactNode;
  /** Visible label before the quick-jump input. */
  goToPageLabel?: ReactNode;
  /** Accessible label for the quick-jump input. */
  jumpToPageLabel?: string;
};
