import { createRecipe } from "../shared/recipe";

/** Style recipe for the Progress root element. */
export const progressClasses = createRecipe({
  base: "gs-progress flex w-full items-center gap-gs-2 font-gs-sans",
});

/** Style recipe for the progress track. */
export const progressTrackClasses = createRecipe({
  base: "gs-progress-track relative flex-auto overflow-hidden rounded-gs-full bg-gs-surface-mist",
  variants: {
    size: {
      sm: "h-gs-1",
      md: "h-gs-2",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

/** Style recipe for the progress fill bar. */
export const progressFillClasses = createRecipe({
  base: "gs-progress-fill h-full rounded-inherit bg-gs-progress-fill [transition-property:inline-size] duration-gs-normal ease-gs-glide motion-reduce:transition-none [[data-reduced-motion=true]_&]:transition-none",
  variants: {
    indeterminate: {
      true: "absolute inset-block-0 w-2/5 animate-gs-progress-slide motion-reduce:w-full motion-reduce:animate-none [[data-reduced-motion=true]_&]:w-full [[data-reduced-motion=true]_&]:animate-none",
      false: "w-gs-0",
    },
  },
  defaultVariants: {
    indeterminate: false,
  },
});

/** Classes for the numeric value label. */
export const progressValueClasses =
  "gs-progress-value shrink-0 font-gs-mono text-gs-2xs leading-gs-none text-gs-text-secondary tabular-nums";
