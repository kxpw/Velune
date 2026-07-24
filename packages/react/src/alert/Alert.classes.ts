import { createRecipe } from "../shared/recipe";
import {
  dismissControlClasses,
  feedbackToneAccentClasses,
  feedbackToneBadgeClasses,
} from "../shared/feedback-classes";

/** Style recipe for the Alert root element. */
export const alertClasses = createRecipe({
  base: "gs-alert flex min-w-gs-0 items-start gap-gs-3 rounded-gs-sm border border-gs-border-default p-gs-4 font-inherit text-gs-sm leading-gs-body text-gs-text",
  variants: {
    tone: {
      default: `bg-gs-surface-mist ${feedbackToneAccentClasses.default}`,
      info: `bg-gs-alert-info ${feedbackToneAccentClasses.info}`,
      success: `bg-gs-alert-success ${feedbackToneAccentClasses.success}`,
      warning: `bg-gs-alert-warning ${feedbackToneAccentClasses.warning}`,
      error: `bg-gs-alert-error ${feedbackToneAccentClasses.error}`,
    },
  },
  defaultVariants: {
    tone: "info",
  },
});

/** Classes for the alert tone icon badge. */
export const alertIconClasses = feedbackToneBadgeClasses("gs-alert-icon");

/** Classes for the alert content container. */
export const alertContentClasses =
  "gs-alert-content grid min-w-gs-0 flex-auto gap-gs-1";

/** Classes for the alert close button. */
export const alertCloseClasses = dismissControlClasses(
  "inline",
  "gs-alert-close -m-gs-2",
);

/** Classes for the Alert.Title element. */
export const alertTitleClasses =
  "gs-alert-title font-gs-medium leading-gs-normal text-gs-feedback-accent";

/** Classes for the Alert.Description element. */
export const alertDescriptionClasses =
  "gs-alert-description leading-gs-body text-gs-text-secondary";

/** Classes for the Alert.Action slot. */
export const alertActionClasses =
  "gs-alert-action mt-gs-2 inline-flex flex-wrap items-center gap-gs-2";
