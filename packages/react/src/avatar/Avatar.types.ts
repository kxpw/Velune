import type { HTMLAttributes, ImgHTMLAttributes, ReactNode } from "react";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";
export type AvatarShape = "circle" | "square";

export interface AvatarProps extends Omit<
  HTMLAttributes<HTMLSpanElement>,
  "children"
> {
  size?: AvatarSize;
  shape?: AvatarShape;
  /** Image source. Falls back to initials or children when load fails. */
  src?: string;
  alt?: string;
  /** Used to derive initials when no image. */
  name?: string;
  /** Custom fallback content (overrides initials). */
  children?: ReactNode;
  imgProps?: Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "alt">;
}

export interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  size?: AvatarSize;
  shape?: AvatarShape;
  /** Max visible avatars before `+N` overflow. Default: `3`. */
  max?: number;
  /** Accessible label for the overflow item. */
  overflowLabel?: (count: number) => string;
  children?: ReactNode;
}
