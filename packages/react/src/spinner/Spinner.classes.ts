import { createRecipe } from "../shared/recipe";

/** Style recipe for the Spinner root element. */
export const spinnerClasses = createRecipe({
  base: "gs-spinner inline-flex shrink-0 items-center justify-center align-middle leading-gs-none",
  variants: {
    size: {
      sm: "size-gs-3",
      md: "size-gs-4",
      lg: "size-gs-6",
    },
    tone: {
      primary: "text-current",
      current: "text-current",
      muted: "text-gs-text-secondary",
      success: "text-gs-success",
      warning: "text-gs-warning",
      error: "text-gs-error",
      info: "text-gs-info",
    },
  },
  defaultVariants: {
    size: "md",
    tone: "primary",
  },
});

/** Classes for the spinning SVG element. */
export const spinnerSvgClasses =
  "gs-spinner-svg block size-full origin-center animate-gs-spinner motion-reduce:animate-none [[data-reduced-motion=true]_&]:animate-none";

/** Classes for the faded circular track. */
export const spinnerTrackClasses =
  "gs-spinner-track opacity-28 motion-reduce:opacity-40 [[data-reduced-motion=true]_&]:opacity-40";

/** Classes for the highlighted spinner arc. */
export const spinnerArcClasses =
  "gs-spinner-arc opacity-100 motion-reduce:opacity-90 motion-reduce:[stroke-dasharray:12_40] [[data-reduced-motion=true]_&]:opacity-90 [[data-reduced-motion=true]_&]:[stroke-dasharray:12_40]";
