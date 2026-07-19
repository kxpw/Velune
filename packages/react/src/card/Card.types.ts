import type {
  ElementType,
  HTMLAttributes,
  KeyboardEvent,
  MouseEvent,
  ReactNode,
} from "react";
import type { PolymorphicProps } from "../shared/polymorphic";

export type CardVariant = "outlined" | "filled" | "elevated";
export type CardSize = "sm" | "md";

export interface CardOwnProps {
  /** Visual surface. Default: `elevated`. */
  variant?: CardVariant;
  size?: CardSize;
  /**
   * Hover lift + keyboard activation.
   * Implies clickable semantics when `onClick` is provided.
   */
  interactive?: boolean;
}

export type CardProps<TElement extends ElementType = "div"> = PolymorphicProps<
  TElement,
  CardOwnProps
>;

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

/** Semantic heading element defaults to `h3`. */
export type CardTitleOwnProps = object;

export type CardTitleProps<TElement extends ElementType = "h3"> =
  PolymorphicProps<TElement, CardTitleOwnProps>;

export interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  children?: ReactNode;
}

export interface CardActionProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  /** Align footer actions. Default: `end`. */
  align?: "start" | "center" | "end" | "between";
  children?: ReactNode;
}

export type CardInteractiveHandlers = {
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLElement>) => void;
};
