import { clsx } from "clsx";

export const itemContentClasses =
  "gs-breadcrumb-item-content inline-flex max-w-full min-w-gs-0 items-center truncate rounded-gs-xs leading-gs-normal transition-colors duration-150 ease-gs-standard motion-reduce:transition-none";

export const linkClasses =
  "cursor-pointer text-gs-text-secondary no-underline hover:text-gs-text hover:underline focus-visible:outline-none focus-visible:shadow-gs-button-focus-border";

/** Classes for a breadcrumb item rendered as a link. */
export function breadcrumbLinkClasses(): string {
  return clsx(itemContentClasses, linkClasses);
}

export type BreadcrumbTextClassesOptions = {
  disabled?: boolean;
  current?: boolean;
};

/** Classes for a breadcrumb item rendered as plain text. */
export function breadcrumbTextClasses({
  disabled = false,
  current = false,
}: BreadcrumbTextClassesOptions = {}): string {
  return clsx(
    itemContentClasses,
    disabled
      ? "cursor-not-allowed text-gs-text-disabled"
      : current
        ? "font-gs-medium text-gs-text"
        : "text-gs-text-secondary",
  );
}

/** Classes for the breadcrumb item list element. */
export const breadcrumbItemClasses =
  "gs-breadcrumb-item flex min-w-gs-0 items-center";

/** Classes for the separator between breadcrumb items. */
export const breadcrumbSeparatorClasses =
  "gs-breadcrumb-separator inline-flex shrink-0 select-none items-center text-gs-text-secondary [&_svg]:size-3.5";

/** Classes for the Breadcrumb nav root. */
export const breadcrumbClasses =
  "gs-breadcrumb font-inherit text-gs-sm text-gs-text";

/** Classes for the ordered list inside the breadcrumb nav. */
export const breadcrumbListClasses =
  "gs-breadcrumb-list m-gs-0 flex min-w-gs-0 list-none flex-wrap items-center gap-gs-1.5 p-gs-0";
