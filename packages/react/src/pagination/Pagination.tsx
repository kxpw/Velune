import type { ForwardedRef, KeyboardEvent as ReactKeyboardEvent } from "react";
import { forwardRef, useEffect, useId, useMemo, useRef, useState } from "react";
import { useControllableState } from "@velune/hooks";
import { clsx } from "clsx";
import { Select } from "../select";
import type { PaginationProps } from "./Pagination.types";
import { buildPageList, clampPage, getTotalPages } from "./pagination-utils";
import {
  paginationClasses,
  paginationEllipsisClasses,
  paginationInputClasses,
  paginationItemClasses,
  paginationJumperClasses,
  paginationNavClasses,
  paginationSelectClasses,
  paginationSimpleClasses,
  paginationSizeClasses,
  paginationSizeLabelClasses,
} from "./Pagination.classes";

function defaultGetPageLabel(page: number): string {
  return `Page ${page}`;
}

function Chevron({ direction }: { direction: "prev" | "next" }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
      {direction === "prev" ? (
        <path
          d="M10 3.5L5.5 8L10 12.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M6 3.5L10.5 8L6 12.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

function PaginationImpl(
  {
    page: pageProp,
    defaultPage = 1,
    pageSize: pageSizeProp,
    defaultPageSize = 10,
    total,
    onPageChange,
    simple = false,
    hideOnSinglePage = false,
    showSizeChanger = false,
    pageSizeOptions = [10, 20, 50, 100],
    showQuickJumper = false,
    siblingCount = 1,
    disabled = false,
    previousPageLabel = "Previous page",
    nextPageLabel = "Next page",
    getPageLabel = defaultGetPageLabel,
    rowsPerPageLabel = "Rows",
    goToPageLabel = "Go to",
    jumpToPageLabel = "Jump to page",
    "aria-label": ariaLabel = "Pagination",
    className,
    ...props
  }: PaginationProps,
  ref: ForwardedRef<HTMLElement>,
) {
  const [pageState, setPageState] = useControllableState({
    value: pageProp,
    defaultValue: defaultPage,
  });
  const [pageSizeState, setPageSizeState] = useControllableState({
    value: pageSizeProp,
    defaultValue: defaultPageSize,
  });
  const [jumpValue, setJumpValue] = useState("");
  const rowsLabelId = useId();
  const boundsSyncKeyRef = useRef("");

  const pageSize = pageSizeState;
  const totalPages = getTotalPages(total, pageSize);
  const page = clampPage(pageState, totalPages);

  // When total/pageSize shrink, keep stored page in range. Display already
  // clamps via `page`, but uncontrolled state (and controlled parents) must
  // also be notified so the value does not jump back when bounds expand.
  useEffect(() => {
    const safePage = clampPage(pageState, totalPages);
    if (safePage === pageState) {
      boundsSyncKeyRef.current = "";
      return;
    }
    const key = `${pageState}->${safePage}@${totalPages}:${pageSize}`;
    if (boundsSyncKeyRef.current === key) return;
    boundsSyncKeyRef.current = key;
    if (pageProp === undefined) {
      setPageState(safePage);
    }
    onPageChange?.(safePage, pageSize);
  }, [onPageChange, pageProp, pageSize, pageState, setPageState, totalPages]);

  const pages = useMemo(
    () => buildPageList(page, totalPages, siblingCount),
    [page, siblingCount, totalPages],
  );

  const sizeOptions = useMemo(
    () =>
      pageSizeOptions.map((option) => ({
        value: String(option),
        label: String(option),
      })),
    [pageSizeOptions],
  );

  const emit = (nextPage: number, nextSize = pageSize) => {
    const pagesCount = getTotalPages(total, nextSize);
    const safePage = clampPage(nextPage, pagesCount);
    if (safePage === page && nextSize === pageSize) {
      return;
    }
    setPageState(safePage);
    if (nextSize !== pageSize) {
      setPageSizeState(nextSize);
    }
    onPageChange?.(safePage, nextSize);
  };

  const go = (next: number) => {
    if (disabled) {
      return;
    }
    emit(next);
  };

  const handleJump = () => {
    const parsed = Number.parseInt(jumpValue, 10);
    if (Number.isFinite(parsed)) {
      go(parsed);
    }
    setJumpValue("");
  };

  if (hideOnSinglePage && totalPages <= 1) {
    return null;
  }

  return (
    <nav
      ref={ref}
      {...props}
      className={clsx(paginationClasses({ disabled }), className)}
      data-simple={simple ? "true" : undefined}
      data-disabled={disabled ? "true" : undefined}
      aria-label={ariaLabel}
    >
      <button
        type="button"
        className={paginationNavClasses()}
        aria-label={previousPageLabel}
        disabled={disabled || page <= 1}
        onClick={() => go(page - 1)}
      >
        <Chevron direction="prev" />
      </button>

      {simple ? (
        <span className={paginationSimpleClasses}>
          {page} / {totalPages}
        </span>
      ) : (
        pages.map((token, index) =>
          token === "ellipsis" ? (
            <span
              key={`ellipsis-${index}`}
              className={paginationEllipsisClasses}
              aria-hidden="true"
            >
              …
            </span>
          ) : (
            <button
              key={token}
              type="button"
              className={paginationItemClasses}
              data-active={token === page ? "true" : undefined}
              aria-current={token === page ? "page" : undefined}
              aria-label={getPageLabel(token)}
              disabled={disabled}
              onClick={() => go(token)}
            >
              {token}
            </button>
          ),
        )
      )}

      <button
        type="button"
        className={paginationNavClasses()}
        aria-label={nextPageLabel}
        disabled={disabled || page >= totalPages}
        onClick={() => go(page + 1)}
      >
        <Chevron direction="next" />
      </button>

      {showSizeChanger ? (
        <div className={paginationSizeClasses}>
          <span className={paginationSizeLabelClasses} id={rowsLabelId}>
            {rowsPerPageLabel}
          </span>
          <Select
            className={paginationSelectClasses}
            size="sm"
            value={String(pageSize)}
            disabled={disabled}
            aria-labelledby={rowsLabelId}
            onValueChange={(next) => {
              const nextSize = Number(Array.isArray(next) ? next[0] : next);
              if (Number.isFinite(nextSize)) {
                emit(1, nextSize);
              }
            }}
          >
            <Select.Trigger />
            <Select.Content>
              {sizeOptions.map((option) => (
                <Select.Item key={option.value} value={option.value}>
                  {option.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        </div>
      ) : null}

      {showQuickJumper && !simple ? (
        <label className={paginationJumperClasses}>
          <span>{goToPageLabel}</span>
          <input
            className={paginationInputClasses}
            inputMode="numeric"
            disabled={disabled}
            value={jumpValue}
            onChange={(event) => setJumpValue(event.target.value)}
            onKeyDown={(event: ReactKeyboardEvent<HTMLInputElement>) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleJump();
              }
            }}
            onBlur={handleJump}
            aria-label={jumpToPageLabel}
          />
        </label>
      ) : null}
    </nav>
  );
}

export const Pagination = forwardRef(PaginationImpl);
Pagination.displayName = "Pagination";
