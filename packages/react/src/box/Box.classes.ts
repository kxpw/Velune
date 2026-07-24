import { clsx } from "clsx";
import type { Responsive } from "../shared/responsive";
import { responsiveClasses } from "../shared/responsive";
import { marginClasses, paddingClasses } from "../shared/tailwind-classes";
import type { BoxDisplay, BoxSpacing } from "./Box.types";

export const displayClasses: Record<BoxDisplay, string> = {
  block: "block",
  inline: "inline",
  "inline-block": "inline-block",
  flex: "flex",
  "inline-flex": "inline-flex",
  grid: "grid",
  none: "hidden",
};

export type BoxClassesOptions = {
  padding?: Responsive<BoxSpacing> | undefined;
  margin?: Responsive<BoxSpacing> | undefined;
  display?: Responsive<BoxDisplay> | undefined;
};

/** Style recipe for the Box component. */
export function boxClasses({
  padding,
  margin,
  display,
}: BoxClassesOptions = {}): string {
  return clsx(
    "gs-box box-border",
    responsiveClasses(padding, paddingClasses),
    responsiveClasses(margin, marginClasses),
    responsiveClasses(display, displayClasses),
  );
}
