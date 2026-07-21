import type {
  HTMLAttributes,
  LabelHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";
import type { InputSize } from "../input";

export type TextAreaAutosize =
  | boolean
  | {
      minRows?: number;
      maxRows?: number;
    };

export type TextAreaResize = "none" | "vertical" | "horizontal" | "both";

export interface TextAreaProps extends Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "children" | "size"
> {
  children?: ReactNode;
  /** Visual density. Default: `md`. */
  size?: InputSize;
  /**
   * Grow with content.
   * - `true`: browser `field-sizing: content` when supported
   * - `{ minRows, maxRows }`: JS-assisted clamp (with field-sizing fallback)
   */
  autosize?: TextAreaAutosize;
  /**
   * Manual resize handle. Default: `vertical`.
   * Ignored while `autosize` is enabled.
   */
  resize?: TextAreaResize;
  /** Show character count; pairs with `maxLength` when set. */
  showCount?: boolean;
  /** Marks the field as invalid (`aria-invalid`). */
  invalid?: boolean;
  /** Stretch to 100% of the parent width. */
  fullWidth?: boolean;
}

export type TextAreaLabelProps = LabelHTMLAttributes<HTMLLabelElement>;
export type TextAreaDescriptionProps = HTMLAttributes<HTMLSpanElement>;
export type TextAreaErrorMessageProps = HTMLAttributes<HTMLSpanElement>;
