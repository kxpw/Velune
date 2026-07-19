import type {
  ElementType,
  HTMLAttributes,
  MouseEvent,
  ReactNode,
  RefObject,
} from "react";
import type { PolymorphicProps } from "../shared/polymorphic";

export type ModalSize = "sm" | "md" | "lg" | "fullscreen";

export interface ModalProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "title"
> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  size?: ModalSize;
  /** Close on Escape. Default: `true`. */
  closeOnEsc?: boolean;
  /** Close when clicking the overlay. Default: `true`. */
  closeOnOverlayClick?: boolean;
  /** Lock body scroll while open. Default: `true`. */
  lockScroll?: boolean;
  /** Element to restore focus to on close. Defaults to previously focused element. */
  finalFocusRef?: RefObject<HTMLElement | null>;
  /** Element to focus on open. Defaults to first focusable in content. */
  initialFocusRef?: RefObject<HTMLElement | null>;
  /** Called before initial focus moves into the dialog. */
  onOpenAutoFocus?: (event: Event) => void;
  /** Called before focus restores after the dialog closes. */
  onCloseAutoFocus?: (event: Event) => void;
  /** Called for Escape before dismissal. Prevent to keep the dialog open. */
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  /** Called for overlay clicks before dismissal. Prevent to keep it open. */
  onOverlayClick?: (event: MouseEvent<HTMLDivElement>) => void;
  children?: ReactNode;
}

export interface ModalContentProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export interface ModalHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

/** Semantic heading element defaults to `h2`. */
export type ModalTitleOwnProps = object;

export type ModalTitleProps<TElement extends ElementType = "h2"> =
  PolymorphicProps<TElement, ModalTitleOwnProps>;

export interface ModalDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  children?: ReactNode;
}

export interface ModalBodyProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export interface ModalFooterProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export interface ModalCloseProps extends HTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  "aria-label"?: string;
}
