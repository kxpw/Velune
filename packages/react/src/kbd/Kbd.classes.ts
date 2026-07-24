import { createRecipe } from "../shared/recipe";

/** Style recipe for the Kbd component. */
export const kbdClasses = createRecipe({
  base: "gs-kbd inline-flex items-center justify-center rounded-gs-sm border border-gs-border-default bg-gs-surface-raised px-gs-1 font-gs-mono font-gs-medium leading-gs-none text-gs-text-secondary shadow-gs-surface-sheen",
  variants: {
    size: {
      sm: "min-h-gs-4 text-gs-xs",
      md: "min-h-gs-5 text-gs-xs",
    },
  },
  defaultVariants: {
    size: "md",
  },
});
