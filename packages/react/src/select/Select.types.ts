import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  LabelHTMLAttributes,
  ReactNode,
} from "react";
import type { InputSize } from "../input";

export type SelectValue = string;
export type SelectDirection = "ltr" | "rtl";

interface SelectBaseProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "defaultValue" | "onChange"
> {
  children: ReactNode;
  /**
   * Called when the search query changes.
   * When provided, local filtering is skipped so you can drive remote search.
   */
  onSearch?: (query: string) => void;
  /** Placeholder for the in-panel search field. Default: "Search…" */
  searchPlaceholder?: string;
  /** Reading direction for the control and portaled panel. Default: `ltr`. */
  dir?: SelectDirection;
  size?: InputSize;
  /** Enable search. Shows a sticky search field inside the dropdown. */
  searchable?: boolean;
  /** Render the options panel in a portal. Default: `true`. */
  portal?: boolean;
  invalid?: boolean;
  disabled?: boolean | undefined;
  fullWidth?: boolean;
  required?: boolean;
  /** Native form field name. */
  name?: string;
  /** Associates the control with a form outside its DOM ancestry. */
  form?: string;
  autoComplete?: string;
  "aria-label"?: string;
}

export interface SelectSingleProps extends SelectBaseProps {
  multiple?: false;
  value?: SelectValue;
  defaultValue?: SelectValue;
  onValueChange?: (value: SelectValue) => void;
}

export interface SelectMultipleProps extends SelectBaseProps {
  multiple: true;
  value?: SelectValue[];
  defaultValue?: SelectValue[];
  onValueChange?: (value: SelectValue[]) => void;
}

export type SelectProps = SelectSingleProps | SelectMultipleProps;

export interface SelectTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Placeholder shown until a value is selected. */
  placeholder?: ReactNode;
}

export type SelectContentProps = HTMLAttributes<HTMLDivElement>;

export interface SelectItemProps extends HTMLAttributes<HTMLDivElement> {
  value: SelectValue;
  disabled?: boolean | undefined;
  /** Text used for typeahead and search when children are not plain text. */
  textValue?: string | undefined;
  children?: ReactNode;
}

export interface SelectGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Text used for group-level search when the label is not plain text. */
  textValue?: string | undefined;
  children?: ReactNode;
}

export type SelectGroupLabelProps = HTMLAttributes<HTMLDivElement>;

export type SelectLabelProps = LabelHTMLAttributes<HTMLLabelElement>;

export type SelectDescriptionProps = HTMLAttributes<HTMLSpanElement>;

export type SelectErrorMessageProps = HTMLAttributes<HTMLSpanElement>;

export type SelectEmptyProps = HTMLAttributes<HTMLDivElement>;
export type SelectNoMatchesProps = HTMLAttributes<HTMLDivElement>;
