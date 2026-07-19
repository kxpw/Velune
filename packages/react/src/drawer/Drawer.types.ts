import type {
  ElementType,
  HTMLAttributes,
  MouseEvent,
  ReactNode,
  RefObject,
} from "react";
import type { PolymorphicProps } from "../shared/polymorphic";

export type DrawerPlacement = "left" | "right" | "top" | "bottom";
export type DrawerSize = "sm" | "md" | "lg";

export interface DrawerProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "title"
> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: DrawerPlacement;
  size?: DrawerSize;
  closeOnEsc?: boolean;
  closeOnOverlayClick?: boolean;
  lockScroll?: boolean;
  finalFocusRef?: RefObject<HTMLElement | null>;
  initialFocusRef?: RefObject<HTMLElement | null>;
  /** Called before initial focus moves into the drawer. */
  onOpenAutoFocus?: (event: Event) => void;
  /** Called before focus restores after the drawer closes. */
  onCloseAutoFocus?: (event: Event) => void;
  /** Called for Escape before dismissal. Prevent to keep the drawer open. */
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  /** Called for overlay clicks before dismissal. Prevent to keep it open. */
  onOverlayClick?: (event: MouseEvent<HTMLDivElement>) => void;
  children?: ReactNode;
}

export interface DrawerContentProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export interface DrawerHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

/** Semantic heading element defaults to `h2`. */
export type DrawerTitleOwnProps = object;

export type DrawerTitleProps<TElement extends ElementType = "h2"> =
  PolymorphicProps<TElement, DrawerTitleOwnProps>;

export interface DrawerDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  children?: ReactNode;
}

export interface DrawerBodyProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export interface DrawerFooterProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export interface DrawerCloseProps extends HTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  "aria-label"?: string;
}
