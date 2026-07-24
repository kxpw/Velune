import { clsx } from "clsx";
import type { ListSize } from "./List.types";

/** Classes for the List root `<ul>`. */
export const listClasses =
  "gs-list m-gs-0 flex list-none flex-col gap-gs-0 p-gs-0 font-inherit text-gs-text";

/** Classes for loading/empty status rows. */
export const listStatusClasses =
  "gs-list-status flex items-center justify-center px-gs-3 py-gs-8 text-gs-sm text-gs-text-secondary";

/** Classes for the default loading indicator row. */
export const listLoadingClasses =
  "gs-list-loading inline-flex items-center gap-gs-2";

/** Classes for the default empty-state copy. */
export const listEmptyClasses = "gs-list-empty text-gs-text-secondary";

export type ListItemClassesOptions = {
  size?: ListSize | undefined;
  divided?: boolean | undefined;
  hoverable?: boolean | undefined;
  interactive?: boolean | undefined;
  disabled?: boolean | undefined;
};

/** Style recipe for a List.Item row. */
export function listItemClasses({
  size = "md",
  divided = true,
  hoverable = true,
  interactive = false,
  disabled = false,
}: ListItemClassesOptions = {}): string {
  return clsx(
    "gs-list-item m-gs-0 flex items-start gap-gs-3 rounded-gs-sm bg-transparent px-gs-3 py-gs-3 text-start font-inherit text-inherit transition-colors duration-200 ease-gs-standard motion-reduce:transition-none [[data-reduced-motion=true]_&]:transition-none",
    size === "sm" && "gap-gs-2 py-gs-2",
    divided &&
      "rounded-gs-none [border-block-start:var(--control-border-width)_solid_var(--color-border-default)] first:[border-block-start-width:0] first:[border-start-start-radius:var(--radius-sm)] first:[border-start-end-radius:var(--radius-sm)] last:[border-end-start-radius:var(--radius-sm)] last:[border-end-end-radius:var(--radius-sm)]",
    hoverable && !disabled && "hover:bg-gs-action-hover",
    interactive &&
      "min-h-gs-11 min-w-gs-11 cursor-pointer focus-visible:bg-gs-action-hover focus-visible:outline-none focus-visible:shadow-gs-button-focus-inset",
    disabled && "cursor-not-allowed opacity-gs-disabled",
  );
}

/** Classes for the List.Content column. */
export const listContentClasses =
  "gs-list-content grid min-w-gs-0 flex-auto content-center gap-gs-1";

/** Classes for the List.Title element. */
export const listTitleClasses =
  "gs-list-title wrap-anywhere text-gs-sm font-gs-medium leading-gs-normal text-gs-text";

/** Classes for the List.Description element. */
export const listDescriptionClasses =
  "gs-list-description wrap-anywhere text-gs-xs font-gs-regular leading-gs-body text-gs-text-secondary";

/** Classes for the List.Leading slot. */
export const listLeadingClasses =
  "gs-list-leading inline-flex shrink-0 self-center items-center text-gs-text-secondary";

/** Classes for the List.Trailing slot. */
export const listTrailingClasses =
  "gs-list-trailing ms-auto inline-flex shrink-0 self-center items-center text-gs-text-secondary";
