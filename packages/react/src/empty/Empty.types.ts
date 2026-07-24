import type { HTMLAttributes, ReactNode } from "react";

export interface EmptyProps extends HTMLAttributes<HTMLDivElement> {
  /** Primary message. Prefer Empty.Title for compound use. */
  children?: ReactNode;
}

export interface EmptyTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children?: ReactNode;
}

export interface EmptyDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  children?: ReactNode;
}

export interface EmptyActionProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}
