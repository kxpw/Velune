import type { HTMLAttributes, LiHTMLAttributes, ReactNode } from "react";

export type ListSize = "sm" | "md";

export interface ListProps extends HTMLAttributes<HTMLUListElement> {
  size?: ListSize;
  /** Show dividers between items. Default: `true`. */
  divided?: boolean;
  /** Soft hover surface on items. Default: `true`. */
  hoverable?: boolean;
  /** Show the loading state instead of items. */
  loading?: boolean;
  /** Default loading-state copy. Default: `Loading…`. */
  loadingLabel?: string;
  /** Default empty-state copy. Default: `No items`. */
  emptyLabel?: string;
  children?: ReactNode;
}

export type ListEmptyProps = LiHTMLAttributes<HTMLLIElement>;
export type ListLoadingProps = LiHTMLAttributes<HTMLLIElement>;

export interface ListItemProps extends Omit<
  LiHTMLAttributes<HTMLLIElement>,
  "title" | "prefix"
> {
  /** Makes the row look and behave interactive. */
  interactive?: boolean;
  disabled?: boolean;
  children?: ReactNode;
}

export interface ListContentProps extends HTMLAttributes<HTMLSpanElement> {
  children?: ReactNode;
}

export interface ListTitleProps extends HTMLAttributes<HTMLSpanElement> {
  children?: ReactNode;
}

export interface ListDescriptionProps extends HTMLAttributes<HTMLSpanElement> {
  children?: ReactNode;
}

export interface ListLeadingProps extends HTMLAttributes<HTMLSpanElement> {
  children?: ReactNode;
}

export interface ListTrailingProps extends HTMLAttributes<HTMLSpanElement> {
  children?: ReactNode;
}
