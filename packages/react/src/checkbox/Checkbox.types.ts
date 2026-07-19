import type { HTMLAttributes, InputHTMLAttributes, ReactNode } from "react";

export type CheckboxValue = string;
export type CheckboxSize = "sm" | "md" | "lg";
export type CheckboxGroupOrientation = "horizontal" | "vertical";

export interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "value" | "size"
> {
  /** Value used inside `Checkbox.Group`. */
  value?: CheckboxValue;
  /** Visual size of the control + label. Default: `md`. */
  size?: CheckboxSize;
  /** Renders the mixed state and sets the native `indeterminate` flag. */
  indeterminate?: boolean;
  children?: ReactNode;
}

export type CheckboxDescriptionProps = HTMLAttributes<HTMLSpanElement>;

export interface CheckboxGroupProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "defaultValue" | "onChange"
> {
  value?: CheckboxValue[];
  defaultValue?: CheckboxValue[];
  onValueChange?: (nextValue: CheckboxValue[]) => void;
  /** Shared `name` applied to every child input (overridable per item). */
  name?: string;
  /** Associates every checkbox with a form outside the group ancestry. */
  form?: string;
  /** Applies a default size to every child checkbox. */
  size?: CheckboxSize;
  /** Layout of options. Default: `vertical`. */
  orientation?: CheckboxGroupOrientation;
  /** Disable every checkbox in the group. */
  disabled?: boolean;
}
