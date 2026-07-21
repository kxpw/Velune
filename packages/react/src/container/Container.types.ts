import type { ElementType, ReactNode } from "react";
import type { PolymorphicProps } from "../shared/polymorphic";
import type { Responsive } from "../shared/responsive";

export type ContainerSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface ContainerOwnProps {
  size?: Responsive<ContainerSize>;
  children?: ReactNode;
}

export type ContainerProps<TElement extends ElementType = "div"> =
  PolymorphicProps<TElement, ContainerOwnProps>;
