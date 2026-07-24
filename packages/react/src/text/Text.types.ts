import type { ElementType } from "react";
import type { PolymorphicProps } from "../shared/polymorphic";

export type TextSize =
  | "2xs"
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "4xl";
export type TextWeight = "light" | "regular" | "medium";
export type TextTone =
  | "default"
  | "muted"
  | "accent"
  | "success"
  | "warning"
  | "error";
export type TextAlign = "start" | "center" | "end" | "justify";
export type TextFamily = "sans" | "serif" | "mono";

export interface TextOwnProps {
  /** Token-backed text size. Defaults to `md`. */
  size?: TextSize;
  /** Defaults to `regular`; `4xl` defaults to `light`. */
  weight?: TextWeight;
  tone?: TextTone;
  /** Text alignment. */
  align?: TextAlign;
  /** Font family token. Defaults to `sans`. */
  family?: TextFamily;
  /** Single-line ellipsis. */
  truncate?: boolean;
  /** Multi-line clamp (1–5). */
  lines?: 1 | 2 | 3 | 4 | 5;
  /** Applies CJK-friendly line-height and letter-spacing. */
  cjk?: boolean;
}

export type TextProps<TElement extends ElementType = "span"> = PolymorphicProps<
  TElement,
  TextOwnProps
>;
