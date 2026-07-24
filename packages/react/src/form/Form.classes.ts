import { createRecipe } from "../shared/recipe";

/** Style recipe for the Form root element. */
export const formClasses = createRecipe({
  base: "gs-form flex min-w-gs-0 flex-col gap-gs-4 font-inherit text-gs-text",
});

/** Style recipe for the Form.Item wrapper. */
export const formItemClasses = createRecipe({
  base: "gs-form-item grid min-w-gs-0 gap-gs-1",
});

/** Classes for the Form.Item control container. */
export const formControlClasses = "gs-form-control min-w-gs-0";

/** Classes for the Form.Item error message. */
export const formErrorClasses =
  "gs-form-error text-gs-xs leading-gs-normal text-gs-error";
