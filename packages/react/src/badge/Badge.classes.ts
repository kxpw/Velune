import { createRecipe } from "../shared/recipe";

/** Style recipe for the Badge root element. */
export const badgeRootClasses = createRecipe({
  base: "gs-badge box-border inline-flex align-middle font-inherit leading-gs-none",
  variants: {
    attached: {
      true: "gs-badge-attached relative",
      false: "gs-badge-standalone",
    },
    tone: {
      default: "[--gs-badge-bg:var(--color-text-secondary)]",
      primary: "[--gs-badge-bg:var(--color-border-focus)]",
      success: "[--gs-badge-bg:var(--color-success)]",
      warning: "[--gs-badge-bg:var(--color-warning)]",
      error: "[--gs-badge-bg:var(--color-error)]",
      info: "[--gs-badge-bg:var(--color-info)]",
    },
  },
  defaultVariants: {
    attached: false,
    tone: "error",
  },
});

/** Style recipe for the badge pill (count or dot indicator). */
export const badgePillClasses = createRecipe({
  base: "gs-badge-pill inline-flex min-h-gs-5 min-w-gs-5 items-center justify-center whitespace-nowrap rounded-gs-full border border-[color-mix(in_oklab,var(--gs-badge-bg)_24%,var(--color-border-default))] bg-gs-badge-subtle px-gs-1 text-gs-xs font-gs-medium leading-gs-none text-gs-text",
  variants: {
    dot: {
      true: "size-gs-2 min-h-gs-2 min-w-gs-2 border-0 bg-gs-error p-gs-0",
    },
    attached: {
      true: "absolute right-gs-0 top-gs-0 z-gs-base translate-x-2/5 -translate-y-2/5 shadow-gs-surface-outline",
    },
  },
});

/** Classes for the wrapper around badge target content. */
export const badgeTargetClasses = "gs-badge-target inline-flex max-w-full";
