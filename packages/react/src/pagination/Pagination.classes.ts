import { clsx } from "clsx";
import { createRecipe } from "../shared/recipe";

/** Style recipe for the Pagination nav root. */
export const paginationClasses = createRecipe({
  base: "gs-pagination inline-flex select-none flex-wrap items-center gap-gs-1 font-inherit text-gs-sm leading-gs-none text-gs-text",
  variants: {
    disabled: {
      true: "opacity-gs-disabled",
    },
  },
});

/** Classes for page number buttons. */
export const paginationItemClasses =
  "gs-pagination-item m-gs-0 inline-flex min-h-gs-11 min-w-gs-11 cursor-pointer appearance-none items-center justify-center rounded-gs-sm border-0 bg-transparent px-gs-2 py-gs-0 font-inherit font-gs-regular text-inherit text-gs-text transition-[background-color,color,box-shadow,transform] duration-150 ease-gs-standard active:scale-95 hover:not-disabled:not-data-[active=true]:bg-gs-action-hover focus-visible:outline-none focus-visible:shadow-gs-button-focus-border disabled:cursor-not-allowed disabled:opacity-gs-disabled motion-reduce:transition-none motion-reduce:active:scale-100 [[data-reduced-motion=true]_&]:transition-none [[data-reduced-motion=true]_&]:active:scale-100 data-[active=true]:bg-gs-primary-strong data-[active=true]:text-gs-on-primary";

/** Classes for the previous/next chevron buttons. */
export function paginationNavClasses(): string {
  return clsx(
    paginationItemClasses,
    "gs-pagination-nav [&_svg]:block [&_svg]:size-gs-4",
  );
}

/** Classes for the "page / total" indicator in simple mode. */
export const paginationSimpleClasses =
  "gs-pagination-simple min-w-gs-10 px-gs-2 text-center text-gs-text-secondary tabular-nums";

/** Classes for the ellipsis token. */
export const paginationEllipsisClasses =
  "gs-pagination-ellipsis inline-flex min-w-gs-11 items-center justify-center text-gs-text-secondary";

/** Classes for the page-size changer container. */
export const paginationSizeClasses =
  "gs-pagination-size ms-gs-2 inline-flex items-center gap-gs-2 text-gs-xs text-gs-text-secondary";

/** Classes for the page-size label. */
export const paginationSizeLabelClasses = "gs-pagination-size-label";

/** Classes for the page-size Select control. */
export const paginationSelectClasses =
  "gs-pagination-select min-w-gs-16 [&_.gs-select-trigger]:min-h-gs-11";

/** Classes for the quick jumper label. */
export const paginationJumperClasses =
  "gs-pagination-jumper ms-gs-2 inline-flex items-center gap-gs-2 text-gs-xs text-gs-text-secondary";

/** Classes for the quick jumper input. */
export const paginationInputClasses =
  "gs-pagination-input min-h-gs-11 w-gs-12 rounded-gs-sm border border-gs-border-strong bg-gs-surface px-gs-2 py-gs-0 text-center font-inherit text-gs-sm text-gs-text transition-[border-color,box-shadow] duration-150 ease-gs-standard focus-visible:border-gs-focus focus-visible:outline-none focus-visible:shadow-gs-input-focus disabled:cursor-not-allowed disabled:opacity-gs-disabled motion-reduce:transition-none [[data-reduced-motion=true]_&]:transition-none";
