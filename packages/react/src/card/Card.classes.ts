import { createRecipe } from "../shared/recipe";

/** Style recipe for the Card root element. */
export const cardClasses = createRecipe({
  base: "gs-card flex min-w-gs-0 flex-col rounded-gs-sm border-[length:var(--gs-card-border-width)] border-[color:var(--gs-card-border)] bg-[var(--gs-card-bg)] bg-gs-surface-highlight font-inherit text-gs-text shadow-gs-card transition-[background-color,box-shadow,border-color] duration-200 ease-gs-standard [--gs-card-padding:var(--space-8)] [&>:last-child:is(.gs-card-header,.gs-card-body,.gs-card-footer)]:pb-[calc(var(--gs-card-padding)-var(--space-1))] motion-reduce:transition-none [[data-reduced-motion=true]_&]:transition-none",
  variants: {
    size: {
      sm: "[--gs-card-padding:var(--space-6)]",
    },
    variant: {
      outlined:
        "[--gs-card-bg:var(--color-surface)] [--gs-card-border:var(--color-border-default)] [--gs-card-border-width:var(--control-border-width)] [--gs-card-shadow:0_0_0_transparent] [--gs-card-sheen:0_0_0_transparent] bg-none",
      filled:
        "[--gs-card-bg:var(--color-surface-mist)] [--gs-card-border:transparent] [--gs-card-border-width:0px] [--gs-card-shadow:0_0_0_transparent] [--gs-card-sheen:0_0_0_transparent] bg-none",
      elevated:
        "[--gs-card-bg:var(--color-surface)] [--gs-card-border:var(--color-border-default)] [--gs-card-border-width:var(--control-border-width)] [--gs-card-shadow:var(--shadow-level-2)] [--gs-card-sheen:var(--surface-sheen)]",
    },
    interactive: {
      true: "min-h-gs-11 min-w-gs-11 touch-manipulation cursor-pointer [-webkit-tap-highlight-color:transparent] focus-visible:outline-none focus-visible:shadow-gs-card-focus",
    },
  },
  compoundVariants: [
    {
      interactive: true,
      variant: "filled",
      className: "hover:bg-gs-action-active hover:shadow-gs-card",
    },
    {
      interactive: true,
      variant: "outlined",
      className: "hover:border-gs-border-strong hover:shadow-gs-card",
    },
    {
      interactive: true,
      variant: "elevated",
      className: "hover:bg-gs-action-hover hover:shadow-gs-card-hover",
    },
  ],
  defaultVariants: {
    variant: "elevated",
  },
});

/** Classes for the Card.Header grid. */
export const cardHeaderClasses =
  "gs-card-header grid min-w-gs-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-x-gs-4 gap-y-gs-1 p-gs-8";

/** Classes for the Card.Title element. */
export const cardTitleClasses =
  "gs-card-title col-start-1 row-start-1 m-gs-0 min-w-gs-0 wrap-anywhere text-gs-md font-gs-medium leading-gs-normal text-gs-text [[data-size=sm]_&]:text-gs-sm";

/** Classes for the Card.Description element. */
export const cardDescriptionClasses =
  "gs-card-description col-start-1 row-start-2 m-gs-0 min-w-gs-0 wrap-anywhere text-gs-sm font-gs-regular leading-gs-normal text-gs-text-secondary";

/** Classes for the Card.Action slot. */
export const cardActionClasses =
  "gs-card-action col-start-2 row-span-2 row-start-1 inline-flex shrink-0 items-center gap-gs-2";

/** Classes for the Card.Body element. */
export const cardBodyClasses =
  "gs-card-body min-w-gs-0 flex-auto p-gs-8 text-gs-sm leading-gs-body text-gs-text [&:not(:first-child)]:pt-gs-0";

/** Style recipe for the Card.Footer element. */
export const cardFooterClasses = createRecipe({
  base: "gs-card-footer flex min-w-gs-0 flex-wrap items-center gap-gs-2 p-gs-8 [&:not(:first-child)]:pt-gs-0",
  variants: {
    align: {
      start: "justify-start",
      center: "justify-center",
      end: "justify-end",
      between: "justify-between",
    },
  },
  defaultVariants: {
    align: "end",
  },
});
