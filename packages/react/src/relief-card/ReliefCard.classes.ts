import { clsx } from "clsx";
import type { ReliefCardAnimationPreset } from "./ReliefCard.types";

/** Classes for the ReliefCard section root. */
export const reliefCardClasses =
  "gs-relief-card group relative block overflow-hidden rounded-gs-lg border-gs-border-default-width border-gs-border-default bg-gs-surface bg-gs-surface-highlight px-gs-12 pb-gs-8 pt-gs-12 font-gs-sans text-gs-text shadow-gs-relief";

export type ReliefCardTextureClassesOptions = {
  /** Whether a mask-based texture source is configured. */
  hasTextureOptions?: boolean;
  /** Whether the texture is a custom React element. */
  hasTextureElement?: boolean;
  preset?: ReliefCardAnimationPreset;
};

/** Style recipe for the decorative texture layer. */
export function reliefCardTextureClasses({
  hasTextureOptions = false,
  hasTextureElement = false,
  preset = "reveal",
}: ReliefCardTextureClassesOptions = {}): string {
  return clsx(
    "gs-relief-card-texture pointer-events-none absolute inset-gs-0 opacity-gs-relief-texture-opacity animate-[var(--relief-texture-animation)] [transition-delay:var(--relief-transition-delay)] [transition-duration:var(--relief-transition-duration)] [transition-timing-function:var(--relief-animation-easing)] motion-reduce:animate-none motion-reduce:transition-none [[data-reduced-motion=true]_&]:animate-none [[data-reduced-motion=true]_&]:transition-none",
    hasTextureOptions &&
      "bg-gs-text [mask-image:var(--relief-texture-src)] [mask-position:var(--relief-texture-position,100%_100%)] [mask-repeat:var(--relief-texture-repeat,no-repeat)] [mask-size:var(--relief-texture-custom-size,var(--relief-texture-size))]",
    hasTextureElement && "[&>*]:block [&>*]:size-full",
    (preset === "reveal" || preset === "drift") && "transition-opacity",
    (preset === "reveal" || preset === "drift") &&
      "group-hover:opacity-gs-relief-texture-opacity-hover group-focus-within:opacity-gs-relief-texture-opacity-hover",
  );
}

/** Classes for the content grid inside the card. */
export const reliefCardContentClasses =
  "gs-relief-card-content relative grid max-w-[60ch] gap-gs-3";

/** Classes for the ReliefCard.Title element. */
export const reliefCardTitleClasses =
  "gs-relief-card-title m-gs-0 font-gs-serif text-gs-xl font-gs-light leading-gs-normal text-gs-text";

/** Classes for the ReliefCard.Description element. */
export const reliefCardDescriptionClasses =
  "gs-relief-card-description m-gs-0 text-gs-sm leading-gs-body text-gs-text-secondary";

/** Classes for the ReliefCard.Action slot. */
export const reliefCardActionClasses =
  "gs-relief-card-action flex flex-wrap gap-gs-2";
