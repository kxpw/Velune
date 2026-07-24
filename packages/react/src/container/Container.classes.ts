import { clsx } from "clsx";
import type { Responsive } from "../shared/responsive";
import { responsiveClasses } from "../shared/responsive";
import type { ContainerSize } from "./Container.types";

export const sizeClasses: Record<ContainerSize, string> = {
  xs: "max-w-gs-breakpoint-sm",
  sm: "max-w-gs-breakpoint-md",
  md: "max-w-gs-breakpoint-lg",
  lg: "max-w-gs-breakpoint-xl",
  xl: "max-w-gs-breakpoint-2xl",
};

export type ContainerClassesOptions = {
  /** Default: `"lg"`. */
  size?: Responsive<ContainerSize>;
};

/** Style recipe for the Container component. */
export function containerClasses({
  size = "lg",
}: ContainerClassesOptions = {}): string {
  return clsx(
    "gs-container mx-auto box-border w-full px-gs-4",
    responsiveClasses(size, sizeClasses, "lg"),
  );
}
