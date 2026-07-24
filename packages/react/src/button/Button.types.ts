import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  HTMLAttributes,
  ReactElement,
} from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "text";
export type ButtonTone = "default" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export type ButtonCommonProps = {
  /** Visual style. Default: `primary`. */
  variant?: ButtonVariant;
  /**
   * Semantic color intent, combinable with any `variant`.
   * Default: `default`.
   */
  tone?: ButtonTone;
  /** Control height and type scale. Default: `md`. */
  size?: ButtonSize;
  /** Shows a spinner, sets `aria-busy`, and disables interaction. */
  loading?: boolean;
  disabled?: boolean;
  /** Stretch to the full width of the parent. */
  fullWidth?: boolean;
  type?: "button" | "submit" | "reset";
};

export type ButtonLeadingProps = HTMLAttributes<HTMLSpanElement>;
export type ButtonTrailingProps = HTMLAttributes<HTMLSpanElement>;

export type ButtonProps =
  | (ButtonCommonProps &
      Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> & {
        as?: "button";
        asChild?: never;
      })
  | (ButtonCommonProps &
      AnchorHTMLAttributes<HTMLAnchorElement> & {
        as: "a";
        asChild?: never;
      })
  | (ButtonCommonProps &
      Omit<HTMLAttributes<HTMLElement>, "children"> & {
        /**
         * Render the single element child instead of a `<button>`, merging
         * Button styling and behavior onto it. Use for router links or other
         * custom trigger elements. `Button.Leading`/`Button.Trailing` and the
         * loading spinner are not injected in this mode.
         */
        asChild: true;
        as?: never;
        children: ReactElement;
      });
