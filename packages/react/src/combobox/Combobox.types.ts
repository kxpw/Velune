import type { HTMLAttributes, LabelHTMLAttributes, ReactNode } from "react";
import type { InputSize } from "../input";

export type ComboboxValue = string;

export interface ComboboxProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "defaultValue" | "onChange"
> {
  /** `Combobox.Label`, `Combobox.Item`, and `Combobox.Empty` slots. */
  children: ReactNode;
  /** Controlled selected value. */
  value?: ComboboxValue;
  defaultValue?: ComboboxValue;
  onValueChange?: (value: ComboboxValue) => void;
  /** Called when the typed filter query changes. */
  onInputChange?: (query: string) => void;
  /** Placeholder shown while no option is selected. */
  placeholder?: string;
  size?: InputSize;
  /** Render the options panel in a portal. Default: `true`. */
  portal?: boolean;
  invalid?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  required?: boolean;
  /** Native form field name, submitted through a hidden input. */
  name?: string;
  /** Associates the hidden input with a form outside its DOM ancestry. */
  form?: string;
  "aria-label"?: string;
}

export interface ComboboxItemProps extends HTMLAttributes<HTMLDivElement> {
  value: ComboboxValue;
  disabled?: boolean | undefined;
  /** Text used for filtering when children are not plain text. */
  textValue?: string | undefined;
  children?: ReactNode;
}

export type ComboboxLabelProps = LabelHTMLAttributes<HTMLLabelElement>;

export type ComboboxDescriptionProps = HTMLAttributes<HTMLSpanElement>;

export type ComboboxErrorMessageProps = HTMLAttributes<HTMLSpanElement>;

/** Shown when the typed query matches no options. */
/** Shown when the combobox has no options at all. */
export type ComboboxEmptyProps = HTMLAttributes<HTMLDivElement>;

/**
 * Shown when a filter query matches no options. Falls back to
 * `Combobox.Empty` content when not provided.
 */
export type ComboboxNoMatchesProps = HTMLAttributes<HTMLDivElement>;
