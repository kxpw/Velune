import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";

export type SwitchSize = "sm" | "md" | "lg";

export interface SwitchProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "onChange" | "value" | "type"
> {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  /** Value submitted with `name` when checked. Default: `"on"`. */
  value?: string;
  /** Require the switch's submitted checkbox to be checked. */
  required?: boolean;
  size?: SwitchSize;
  /** Locks interaction and shows a busy state on the thumb. */
  loading?: boolean;
  children?: ReactNode;
}

export type SwitchDescriptionProps = HTMLAttributes<HTMLSpanElement>;
