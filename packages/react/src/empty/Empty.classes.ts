import { createRecipe } from "../shared/recipe";

/** Style recipe for the Empty root. */
export const emptyClasses = createRecipe({
  base: "gs-empty flex min-w-gs-0 flex-col items-center justify-center gap-gs-3 px-gs-4 py-gs-16 text-center font-inherit text-gs-text",
});

/** Classes for Empty.Title. */
export const emptyTitleClasses =
  "gs-empty-title m-gs-0 text-gs-md font-gs-medium leading-gs-normal text-gs-text";

/** Classes for Empty.Description. */
export const emptyDescriptionClasses =
  "gs-empty-description m-gs-0 max-w-[36ch] text-gs-sm leading-gs-body text-gs-text-secondary";

/** Classes for Empty.Action. */
export const emptyActionClasses =
  "gs-empty-action mt-gs-1 flex flex-wrap items-center justify-center gap-gs-3";
