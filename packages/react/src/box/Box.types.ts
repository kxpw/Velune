import type { ElementType } from "react";
import type { PolymorphicProps } from "../shared/polymorphic";

export type BoxSpacing =
  | "0"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "11"
  | "12"
  | "16"
  | "20";
export type BoxDisplay =
  | "block"
  | "inline"
  | "inline-block"
  | "flex"
  | "inline-flex"
  | "grid"
  | "none";

export interface BoxOwnProps {
  padding?: BoxSpacing;
  margin?: BoxSpacing;
  display?: BoxDisplay;
}

export type BoxProps<TElement extends ElementType = "div"> = PolymorphicProps<
  TElement,
  BoxOwnProps
>;
