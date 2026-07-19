import type { HTMLAttributes, InputHTMLAttributes, ReactNode } from "react";

export type RadioValue = string;
export type RadioSize = "sm" | "md" | "lg";
export type RadioGroupOrientation = "horizontal" | "vertical";
export type RadioGroupDirection = "ltr" | "rtl";

export interface RadioProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "value" | "size"
> {
  /** Value used inside `Radio.Group`. Required for group selection. */
  value?: RadioValue;
  /** Visual size of the control + label. Default: `md`. */
  size?: RadioSize;
  children?: ReactNode;
}

export type RadioDescriptionProps = HTMLAttributes<HTMLSpanElement>;

export interface RadioGroupProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "children" | "defaultValue" | "dir" | "onChange"
> {
  name?: string;
  /** Associates every radio with a form outside the group ancestry. */
  form?: string;
  value?: RadioValue;
  defaultValue?: RadioValue;
  onValueChange?: (nextValue: RadioValue) => void;
  /** Applies a default size to every child radio. */
  size?: RadioSize;
  /** Layout of options. Default: `vertical`. */
  orientation?: RadioGroupOrientation;
  /** Reading direction used by horizontal arrow navigation. Default: `ltr`. */
  dir?: RadioGroupDirection;
  /** Wrap keyboard focus from the last option to the first. Default: `true`. */
  loop?: boolean;
  /** Disable every radio in the group. */
  disabled?: boolean;
  /** Marks the radiogroup as required. */
  required?: boolean;
  children?: ReactNode;
}

export type RadioGroupLabelProps = HTMLAttributes<HTMLDivElement>;
export type RadioGroupDescriptionProps = HTMLAttributes<HTMLParagraphElement>;
export type RadioGroupErrorMessageProps = HTMLAttributes<HTMLParagraphElement>;
