import type {
  HTMLAttributes,
  LiHTMLAttributes,
  MouseEventHandler,
  ReactNode,
} from "react";

export interface BreadcrumbProps extends HTMLAttributes<HTMLElement> {
  /**
   * Node rendered between items. Defaults to a chevron glyph.
   *
   * @example
   * <Breadcrumb separator="/">…</Breadcrumb>
   */
  separator?: ReactNode;
  children?: ReactNode;
}

export interface BreadcrumbItemProps extends Omit<
  LiHTMLAttributes<HTMLLIElement>,
  "onClick"
> {
  /** Renders the item content as a link. */
  href?: string;
  target?: string;
  /**
   * Marks this item as the current page (`aria-current="page"`). When no item
   * sets it explicitly, the last item is the current page.
   */
  current?: boolean;
  disabled?: boolean;
  /** Fires on the item content (link or text). Ignored when disabled. */
  onClick?: MouseEventHandler<HTMLElement>;
  children?: ReactNode;
}
