import { createRecipe } from "../shared/recipe";

/** Style recipe for the ScrollArea viewport. */
export const scrollAreaClasses = createRecipe({
  base: "gs-scroll-area relative min-w-gs-0 overscroll-contain",
  variants: {
    orientation: {
      vertical: "overflow-y-auto overflow-x-hidden",
      horizontal: "overflow-x-auto overflow-y-hidden",
      both: "overflow-auto",
    },
  },
  defaultVariants: {
    orientation: "vertical",
  },
});
