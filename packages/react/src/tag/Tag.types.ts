import type { HTMLAttributes, MouseEvent, ReactNode } from "react";

export type TagSize = "sm" | "md";
export type TagTone =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "muted";

export interface TagProps extends Omit<
  HTMLAttributes<HTMLSpanElement>,
  "onClick"
> {
  size?: TagSize;
  tone?: TagTone;
  /** Show a dismiss control. */
  closable?: boolean;
  /** Builds the accessible dismiss label from plain-text tag content. */
  getRemoveLabel?: (label: string | null) => string;
  onClose?: (event: MouseEvent<HTMLButtonElement>) => void;
  /** Makes the whole tag interactive (button-like). */
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  disabled?: boolean;
  children?: ReactNode;
}

export type TagIconProps = HTMLAttributes<HTMLSpanElement>;
