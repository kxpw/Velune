import type { ForwardedRef, KeyboardEvent as ReactKeyboardEvent } from "react";
import { forwardRef, useId, useMemo, useState } from "react";
import { useControllableState } from "@velune/hooks";
import { clsx } from "clsx";
import { Select } from "../select";
import type { PaginationProps } from "./Pagination.types";
import { buildPageList, clampPage, getTotalPages } from "./pagination-utils";

const itemClasses =
  "gs-pagination-item m-0 inline-flex min-h-[max(var(--pagination-item-size),var(--control-hit-target))] min-w-[max(var(--pagination-item-size),var(--control-hit-target))] cursor-pointer appearance-none items-center justify-center rounded-gs-pagination-item-radius border-0 bg-transparent px-2 py-0 font-inherit font-normal text-inherit text-gs-text transition-colors duration-200 ease-gs-standard hover:not-disabled:not-data-[active=true]:bg-gs-pagination-bg-hover focus-visible:outline-none focus-visible:shadow-gs-button-focus-border disabled:cursor-not-allowed disabled:opacity-gs-disabled motion-reduce:transition-none [[data-reduced-motion=true]_&]:transition-none";

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

  const pageSize = pageSizeState;
  const totalPages = getTotalPages(total, pageSize);
  const page = clampPage(pageState, totalPages);

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

  return (
    <nav
      ref={ref}
      {...props}
      className={clsx(
        "gs-pagination inline-flex select-none flex-wrap items-center gap-gs-pagination-gap font-inherit text-gs-pagination-font-size leading-none text-gs-text",
        disabled && "opacity-gs-disabled",
        className,
      )}
      data-simple={simple ? "true" : undefined}
      data-disabled={disabled ? "true" : undefined}
      aria-label={ariaLabel}
    >
      <button
        type="button"
        className={clsx(
          itemClasses,
          "gs-pagination-nav [&_svg]:block [&_svg]:size-4",
        )}
        aria-label={previousPageLabel}
        disabled={disabled || page <= 1}
        onClick={() => go(page - 1)}
      >
        <Chevron direction="prev" />
      </button>

      {simple ? (
        <span className="gs-pagination-simple min-w-10 px-2 text-center text-gs-text-secondary tabular-nums">
          {page} / {totalPages}
        </span>
      ) : (
        pages.map((token, index) =>
          token === "ellipsis" ? (
            <span
              key={`ellipsis-${index}`}
              className="gs-pagination-ellipsis inline-flex min-w-[max(var(--pagination-item-size),var(--control-hit-target))] items-center justify-center text-gs-text-secondary"
              aria-hidden="true"
            >
              …
            </span>
          ) : (
            <button
              key={token}
              type="button"
              className={clsx(
                itemClasses,
                token === page &&
                  "bg-gs-pagination-bg-active text-gs-pagination-color-active",
              )}
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
        className={clsx(
          itemClasses,
          "gs-pagination-nav [&_svg]:block [&_svg]:size-4",
        )}
        aria-label={nextPageLabel}
        disabled={disabled || page >= totalPages}
        onClick={() => go(page + 1)}
      >
        <Chevron direction="next" />
      </button>

      {showSizeChanger ? (
        <div className="gs-pagination-size ms-2 inline-flex items-center gap-2 text-xs text-gs-text-secondary">
          <span className="gs-pagination-size-label" id={rowsLabelId}>
            {rowsPerPageLabel}
          </span>
          <Select
            className="gs-pagination-select min-w-16 [&_.gs-select-trigger]:min-h-[max(var(--pagination-item-size),var(--control-hit-target))]"
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
        <label className="gs-pagination-jumper ms-2 inline-flex items-center gap-2 text-xs text-gs-text-secondary">
          <span>{goToPageLabel}</span>
          <input
            className="gs-pagination-input min-h-[max(var(--pagination-item-size),var(--control-hit-target))] w-12 rounded-gs-pagination-item-radius border border-gs-input-border bg-gs-surface px-2 py-0 text-center font-inherit text-sm text-gs-text focus-visible:border-gs-focus focus-visible:outline-none focus-visible:shadow-gs-input-focus disabled:cursor-not-allowed disabled:opacity-gs-disabled"
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
