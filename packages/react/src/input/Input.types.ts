import type {
  HTMLAttributes,
  InputHTMLAttributes,
  LabelHTMLAttributes,
  ReactNode,
} from "react";

export type InputSize = "sm" | "md" | "lg";

export interface InputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "children" | "size" | "prefix"
> {
  children?: ReactNode;
  /** Control height and type scale. Default: `md`. */
  size?: InputSize;
  /** Show a clear control when the field has a value. */
  clearable?: boolean;
  /** Accessible label for the clear control. Default: `Clear input`. */
  clearLabel?: string;
  /** Accessible label for revealing a password. Default: `Show password`. */
  showPasswordLabel?: string;
  /** Accessible label for concealing a password. Default: `Hide password`. */
  hidePasswordLabel?: string;
  /** Marks the field as invalid (`aria-invalid`). */
  invalid?: boolean;
  /** Stretch the shell to 100% of the parent width. */
  fullWidth?: boolean;
}

export type InputLabelProps = LabelHTMLAttributes<HTMLLabelElement>;
export type InputPrefixProps = HTMLAttributes<HTMLSpanElement>;
export type InputSuffixProps = HTMLAttributes<HTMLSpanElement>;
export type InputDescriptionProps = HTMLAttributes<HTMLSpanElement>;
export type InputErrorMessageProps = HTMLAttributes<HTMLSpanElement>;
