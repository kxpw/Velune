import { clsx } from "clsx";

/** Shared feedback accent CSS variable used by Alert and Toast. */
export const feedbackAccentVar = "--gs-feedback-accent";

export type FeedbackTone = "default" | "info" | "success" | "warning" | "error";

/** Sets `--gs-feedback-accent` for a tone. */
export const feedbackToneAccentClasses: Record<FeedbackTone, string> = {
  default: "[--gs-feedback-accent:var(--color-text-primary)]",
  info: "[--gs-feedback-accent:var(--color-info)]",
  success: "[--gs-feedback-accent:var(--color-success)]",
  warning: "[--gs-feedback-accent:var(--color-warning)]",
  error: "[--gs-feedback-accent:var(--color-error)]",
};

/** Circular tone badge around a feedback icon. */
export function feedbackToneBadgeClasses(className?: string): string {
  return clsx(
    "mt-gs-0.5 inline-flex size-gs-6 shrink-0 items-center justify-center rounded-gs-full bg-[color-mix(in_oklab,var(--gs-feedback-accent)_12%,transparent)] text-gs-feedback-accent [&>*]:block [&>*]:size-gs-4",
    className,
  );
}

export type DismissControlVariant = "inline" | "reveal" | "onTone" | "chrome";

/**
 * Shared dismiss/close control recipe.
 * - `inline`: always visible (Alert)
 * - `reveal`: hover-reveal on desktop (Toast)
 * - `onTone`: inherits currentColor with subtle hover (Tag)
 * - `chrome`: overlay chrome (Modal / Drawer), no opacity fade
 */
export function dismissControlClasses(
  variant: DismissControlVariant = "inline",
  className?: string,
): string {
  return clsx(
    "inline-flex size-gs-11 shrink-0 cursor-pointer items-center justify-center rounded-gs-sm border-0 bg-transparent p-gs-0 transition-[background-color,color,opacity,box-shadow,transform] duration-150 ease-gs-standard focus-visible:outline-none focus-visible:shadow-gs-button-focus-border motion-reduce:transition-none [[data-reduced-motion=true]_&]:transition-none [&_svg]:block",
    variant === "inline" &&
      "text-gs-text-secondary opacity-60 hover:bg-gs-action-hover hover:text-gs-text hover:opacity-100 focus-visible:opacity-100 [&_svg]:size-3.5",
    variant === "reveal" &&
      "text-gs-text-secondary opacity-60 hover:bg-gs-action-hover hover:text-gs-text hover:opacity-100 focus-visible:opacity-100 sm:pointer-events-none sm:opacity-0 sm:group-hover/toast:pointer-events-auto sm:group-hover/toast:opacity-100 sm:focus-visible:pointer-events-auto [&_svg]:size-3.5",
    variant === "onTone" &&
      "-me-gs-1 text-inherit opacity-72 hover:bg-gs-current-subtle hover:opacity-100 focus-visible:opacity-100 [&_svg]:size-gs-3",
    variant === "chrome" &&
      "text-gs-text-secondary hover:bg-gs-action-hover hover:text-gs-text active:scale-95 motion-reduce:active:scale-100 [[data-reduced-motion=true]_&]:active:scale-100 [&_svg]:size-gs-4",
    className,
  );
}

/** @deprecated Import from `./control-shell-classes` instead. */
export {
  controlShellBaseClasses,
  controlShellInvalidClasses,
  controlShellInvalidHoverClasses,
} from "./control-shell-classes";

/** @deprecated Import from `./listbox-classes` instead. */
export {
  listboxEmptyClasses,
  listboxOptionClasses,
  listboxPanelClasses,
} from "./listbox-classes";
