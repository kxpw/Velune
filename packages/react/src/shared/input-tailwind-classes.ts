import type { InputSize } from "../input";

export const inputFieldClasses =
  "inline-grid max-w-full gap-gs-1 align-top font-gs-sans text-gs-text";

export const inputLabelClasses =
  "inline-flex cursor-pointer select-none items-baseline gap-gs-1 text-gs-xs font-gs-medium leading-gs-normal text-gs-text";

export const inputLabelSizeClasses: Record<InputSize, string> = {
  sm: "text-gs-xs",
  md: "text-gs-xs",
  lg: "text-gs-sm",
};

export const inputRequiredClasses = "font-gs-medium text-gs-error";

export const inputDescriptionClasses =
  "text-gs-xs leading-gs-normal text-gs-text-secondary";

export const inputErrorClasses = "text-gs-xs leading-gs-normal text-gs-error";
