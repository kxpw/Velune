import { createRecipe } from "../shared/recipe";

/** Style recipe for the Skeleton component. */
export const skeletonClasses = createRecipe({
  base: "gs-skeleton pointer-events-none block select-none overflow-hidden bg-gs-action-hover",
  variants: {
    variant: {
      text: "h-[var(--gs-skeleton-height,1em)] w-[var(--gs-skeleton-width,100%)] rounded-gs-sm",
      rectangular:
        "h-[var(--gs-skeleton-height,1em)] w-[var(--gs-skeleton-width,100%)] rounded-gs-none",
      rounded:
        "h-[var(--gs-skeleton-height,1em)] w-[var(--gs-skeleton-width,100%)] rounded-gs-sm",
      circular:
        "h-[var(--gs-skeleton-height,var(--gs-skeleton-width,var(--space-10)))] w-[var(--gs-skeleton-width,var(--space-10))] rounded-gs-full",
    },
    animation: {
      pulse:
        "animate-gs-skeleton-pulse motion-reduce:animate-none [[data-reduced-motion=true]_&]:animate-none",
      wave: "relative after:absolute after:inset-gs-0 after:translate-x-[-100%] after:bg-gs-skeleton-shimmer after:content-[''] after:animate-gs-skeleton-wave motion-reduce:after:animate-none [[data-reduced-motion=true]_&]:after:animate-none",
      none: "",
    },
  },
  defaultVariants: {
    variant: "text",
    animation: "pulse",
  },
});
