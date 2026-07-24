import { createRecipe } from "../shared/recipe";

/** Style recipe for the Icon wrapper. */
export const iconClasses = createRecipe({
  base: "gs-icon inline-flex shrink-0 items-center justify-center text-current [&_svg]:block [&_svg]:size-full",
  variants: {
    size: {
      sm: "size-gs-3",
      md: "size-gs-4",
      lg: "size-gs-5",
    },
  },
  defaultVariants: {
    size: "md",
  },
});
