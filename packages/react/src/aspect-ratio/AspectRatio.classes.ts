import { createRecipe } from "../shared/recipe";

/** Style recipe for the AspectRatio container. */
export const aspectRatioClasses = createRecipe({
  base: "gs-aspect-ratio relative w-full overflow-hidden [&>*]:absolute [&>*]:inset-gs-0 [&>*]:size-full",
});
