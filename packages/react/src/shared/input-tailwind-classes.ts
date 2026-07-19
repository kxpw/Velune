import type { InputSize } from "../input";

export const inputFieldClasses =
  "inline-grid max-w-full gap-gs-input-field-gap align-top font-gs-sans text-gs-text";

export const inputLabelClasses =
  "inline-flex cursor-pointer select-none items-baseline gap-gs-input-label-gap text-xs font-medium leading-gs-normal text-gs-text-primary";

export const inputLabelSizeClasses: Record<InputSize, string> = {
  sm: "text-xs",
  md: "text-xs",
  lg: "text-sm",
};

export const inputRequiredClasses = "font-medium text-gs-error";

export const inputDescriptionClasses =
  "text-xs leading-gs-normal text-gs-text-secondary";

export const inputErrorClasses = "text-xs leading-gs-normal text-gs-error";
