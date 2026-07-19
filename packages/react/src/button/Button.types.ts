import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  HTMLAttributes,
} from "react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "text"
  | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export type ButtonCommonProps = {
  /** Visual style. Default: `primary`. */
  variant?: ButtonVariant;
  /** Control height and type scale. Default: `md`. */
  size?: ButtonSize;
  /** Shows a spinner, sets `aria-busy`, and disables interaction. */
  loading?: boolean;
  disabled?: boolean;
  /** Stretch to the full width of the parent. */
  block?: boolean;
  type?: "button" | "submit" | "reset";
};

export type ButtonLeadingProps = HTMLAttributes<HTMLSpanElement>;
export type ButtonTrailingProps = HTMLAttributes<HTMLSpanElement>;

export type ButtonProps =
  | (ButtonCommonProps &
      Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> & {
        as?: "button";
      })
  | (ButtonCommonProps &
      AnchorHTMLAttributes<HTMLAnchorElement> & {
        as: "a";
      });
