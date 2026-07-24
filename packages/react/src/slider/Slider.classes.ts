import { clsx } from "clsx";

/**
 * Native range inputs stacked over a custom-drawn rail. Each thumb is the
 * input's own ::-webkit-slider-thumb / ::-moz-range-thumb, so keyboard,
 * pointer, and form semantics come from the platform. With multiple thumbs
 * the inputs ignore pointer events except on the thumb itself so overlapping
 * inputs do not shadow each other.
 */
export const thumbClasses = [
  // WebKit/Blink thumb
  "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:size-gs-slider-thumb-size [&::-webkit-slider-thumb]:rounded-gs-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-solid [&::-webkit-slider-thumb]:border-gs-primary [&::-webkit-slider-thumb]:bg-gs-surface [&::-webkit-slider-thumb]:shadow-gs-1 [&::-webkit-slider-thumb]:transition-shadow [&::-webkit-slider-thumb]:duration-150 [&::-webkit-slider-thumb]:ease-gs-standard [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:active:cursor-grabbing",
  "[&:focus-visible::-webkit-slider-thumb]:shadow-gs-button-focus-border",
  "[&:disabled::-webkit-slider-thumb]:cursor-not-allowed",
  // Firefox thumb
  "[&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:box-border [&::-moz-range-thumb]:size-gs-slider-thumb-size [&::-moz-range-thumb]:rounded-gs-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-solid [&::-moz-range-thumb]:border-gs-primary [&::-moz-range-thumb]:bg-gs-surface [&::-moz-range-thumb]:shadow-gs-1 [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:active:cursor-grabbing",
  "[&:focus-visible::-moz-range-thumb]:shadow-gs-button-focus-border",
  "[&:disabled::-moz-range-thumb]:cursor-not-allowed",
].join(" ");

export type SliderClassesOptions = {
  horizontal?: boolean;
  disabled?: boolean;
};

/** Style recipe for the Slider root element. */
export function sliderClasses({
  horizontal = true,
  disabled = false,
}: SliderClassesOptions = {}): string {
  return clsx(
    "gs-slider font-inherit text-gs-sm text-gs-text",
    horizontal
      ? "grid w-full min-w-gs-0 gap-gs-2"
      : "inline-grid h-40 justify-items-center gap-gs-2",
    disabled && "cursor-not-allowed opacity-gs-disabled",
  );
}

/** Classes for the label/output header row. */
export const sliderHeaderClasses =
  "gs-slider-header flex min-w-gs-0 items-center justify-between gap-gs-2";

/** Classes for the Slider.Label slot. */
export const sliderLabelClasses =
  "gs-slider-label min-w-gs-0 truncate leading-gs-normal";

/** Classes for the Slider.Output slot. */
export const sliderOutputClasses =
  "gs-slider-output shrink-0 font-gs-mono text-gs-2xs leading-gs-none text-gs-text-secondary tabular-nums";

/** Style recipe for the track container. */
export function sliderTrackClasses(horizontal: boolean): string {
  return clsx(
    "gs-slider-track relative",
    horizontal
      ? "h-gs-slider-thumb-size w-full"
      : "h-full w-gs-slider-thumb-size justify-self-center",
  );
}

/** Style recipe for the background rail. */
export function sliderRailClasses(horizontal: boolean): string {
  return clsx(
    "gs-slider-rail absolute rounded-gs-full bg-gs-border-default",
    horizontal
      ? "inset-x-0 top-1/2 h-gs-1.5 -translate-y-1/2"
      : "inset-y-0 left-1/2 w-gs-1.5 -translate-x-1/2",
  );
}

/** Style recipe for the filled range segment. */
export function sliderFillClasses(horizontal: boolean): string {
  return clsx(
    "gs-slider-fill absolute rounded-gs-full bg-gs-primary",
    horizontal
      ? "top-1/2 h-gs-1.5 -translate-y-1/2"
      : "left-1/2 w-gs-1.5 -translate-x-1/2",
  );
}

export type SliderInputClassesOptions = {
  horizontal?: boolean;
  /** More than one thumb rendered. */
  multiThumb?: boolean;
  disabled?: boolean;
};

/** Style recipe for each native range input. */
export function sliderInputClasses({
  horizontal = true,
  multiThumb = false,
  disabled = false,
}: SliderInputClassesOptions = {}): string {
  return clsx(
    "gs-slider-input absolute m-gs-0 appearance-none bg-transparent p-gs-0 outline-none",
    horizontal
      ? "inset-gs-0 h-full w-full"
      : "inset-gs-0 size-full [direction:rtl] [writing-mode:vertical-lr]",
    // Overlapping inputs would shadow each other; only the thumbs
    // stay interactive when there is more than one.
    multiThumb &&
      "pointer-events-none [&::-moz-range-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:pointer-events-auto",
    disabled && "cursor-not-allowed",
    thumbClasses,
  );
}
