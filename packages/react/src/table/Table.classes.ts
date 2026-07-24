import { createRecipe } from "../shared/recipe";

/** Classes for the table outer wrapper. */
export const tableWrapClasses =
  "gs-table-wrap relative isolate min-w-gs-0 overflow-hidden rounded-gs-sm border border-gs-border-default bg-gs-surface font-inherit text-gs-sm leading-gs-normal text-gs-text";

/** Classes for the loading overlay. */
export const tableLoadingClasses =
  "gs-table-loading absolute inset-gs-0 z-gs-dropdown flex items-center justify-center bg-gs-table-loading-bg";

/** Style recipe for every table cell (header and body). */
export const tableCellClasses = createRecipe({
  base: "gs-table-cell px-gs-4 py-gs-4 text-start align-middle",
  variants: {
    size: {
      sm: "py-gs-2",
    },
  },
});

/** Classes for the scrollable region around the table element. */
export const tableScrollClasses =
  "gs-table-scroll max-w-full overflow-auto overscroll-contain";

/** Style recipe for the `<table>` element. */
export const tableClasses = createRecipe({
  base: "gs-table w-full border-collapse border-spacing-0",
  variants: {
    loading: {
      true: "opacity-gs-table-loading-content-opacity",
    },
  },
});

/** Classes for the visually hidden caption. */
export const tableCaptionClasses = "gs-table-caption sr-only";

/** Style recipe for header cells. */
export const tableHeaderCellClasses = createRecipe({
  base: "gs-table-header-cell whitespace-nowrap bg-gs-surface font-gs-medium text-gs-text-secondary",
  variants: {
    sticky: {
      // z-index is applied in TableView so horizontal fixed columns can stack
      // above scrolling header cells without fighting `z-gs-sticky`.
      true: "sticky top-gs-0",
      false: "static",
    },
  },
});

/** Extra classes for the selection header/body cell. */
export const tableSelectionCellClasses =
  "gs-table-selection-cell box-border w-gs-12 min-w-gs-12 max-w-gs-12 px-gs-0 text-center";

/** Extra classes for the selection header cell (adds centering). */
export const tableSelectionHeaderCellClasses =
  "gs-table-selection-cell box-border w-gs-12 min-w-gs-12 max-w-gs-12 whitespace-nowrap bg-gs-surface px-gs-0 text-center font-gs-medium text-gs-text-secondary";

/** Classes for the selection checkbox inside table cells. */
export const tableSelectionCheckboxClasses =
  "gs-table-selection-checkbox items-center justify-center align-middle [&_.gs-checkbox-control]:mt-gs-0 [&_.gs-checkbox-control]:self-center";

/** Classes for the sortable header button. */
export const tableSortButtonClasses =
  "gs-table-sort-button my-[calc(var(--space-4)*-1)] inline-flex min-h-gs-11 min-w-gs-11 cursor-pointer items-center gap-gs-1 border-0 bg-transparent p-gs-0 font-inherit text-inherit transition-[background-color,color,box-shadow,transform] duration-150 ease-gs-standard active:scale-[.98] hover:text-gs-text focus-visible:rounded-gs-sm focus-visible:bg-gs-table-control-focus-bg focus-visible:text-gs-text focus-visible:outline-none focus-visible:shadow-gs-button-focus-border motion-reduce:transition-none motion-reduce:active:scale-100 [[data-reduced-motion=true]_&]:transition-none [[data-reduced-motion=true]_&]:active:scale-100";

/** Style recipe for the sort direction indicator. */
export const tableSortIconClasses = createRecipe({
  base: "gs-table-sort-icon inline-flex size-gs-3 text-gs-text-secondary opacity-gs-table-sort-icon-opacity [&_svg]:block [&_svg]:size-full",
  variants: {
    active: {
      true: "text-gs-border-focus opacity-100",
    },
  },
});

/** Classes muting the inactive half of the sort glyph. */
export const tableSortIconInactiveClasses =
  "opacity-gs-table-sort-icon-inactive-opacity";

/** Classes for the empty-state cell. */
export const tableEmptyClasses =
  "gs-table-empty h-gs-20 px-gs-4 py-gs-10 text-center text-gs-text-secondary";

/** Sticky pin for horizontally fixed cells. */
export const tableFixedCellClasses = "gs-table-fixed-cell sticky bg-gs-surface";

/** Edge shadow on the last start-fixed column. */
export const tableFixedStartEdgeClasses =
  "gs-table-fixed-start-edge [box-shadow:2px_0_6px_color-mix(in_oklab,var(--color-text-primary)_8%,transparent)]";

/** Edge shadow on the first end-fixed column. */
export const tableFixedEndEdgeClasses =
  "gs-table-fixed-end-edge [box-shadow:-2px_0_6px_color-mix(in_oklab,var(--color-text-primary)_8%,transparent)]";

/** Wrapper for tree expand control + cell content. */
export const tableTreeCellClasses =
  "gs-table-tree-cell inline-flex min-w-gs-0 items-center gap-gs-1";

/** Expand/collapse control for tree rows. */
export const tableTreeExpandButtonClasses =
  "gs-table-tree-expand inline-flex size-gs-6 shrink-0 cursor-pointer items-center justify-center rounded-gs-sm border-0 bg-transparent p-gs-0 text-gs-text-secondary transition-[background-color,color,transform] duration-150 ease-gs-standard hover:bg-gs-action-hover hover:text-gs-text focus-visible:outline-none focus-visible:shadow-gs-button-focus-border active:scale-95 motion-reduce:transition-none motion-reduce:active:scale-100 [[data-reduced-motion=true]_&]:transition-none [[data-reduced-motion=true]_&]:active:scale-100 [&_svg]:block [&_svg]:size-gs-3";

/** Spacer matching expand button width for leaf rows. */
export const tableTreeExpandSpacerClasses =
  "gs-table-tree-expand-spacer inline-flex size-gs-6 shrink-0";

/** Style recipe for body rows. */
export const tableRowClasses = createRecipe({
  base: "gs-table-row [border-block-end:var(--control-border-width)_solid_var(--color-border-default)] transition-colors duration-150 ease-gs-standard hover:bg-gs-action-hover motion-reduce:transition-none [[data-reduced-motion=true]_&]:transition-none",
  variants: {
    selected: {
      true: "bg-gs-table-row-selected-bg",
    },
    clickable: {
      true: "cursor-pointer focus-visible:bg-gs-table-control-focus-bg focus-visible:outline-none focus-visible:shadow-gs-button-focus-inset",
    },
  },
});

/** Classes for virtualization spacer rows. */
export const tableVirtualSpacerClasses =
  "gs-table-virtual-spacer pointer-events-none [&_td]:p-gs-0";
