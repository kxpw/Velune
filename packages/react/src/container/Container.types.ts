import type { HTMLAttributes, ReactNode } from "react";

export type ContainerSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: ContainerSize;
  children?: ReactNode;
}
