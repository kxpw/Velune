import { clsx } from "clsx";
import { createRecipe } from "../shared/recipe";
import {
  dismissControlClasses,
  feedbackToneAccentClasses,
  feedbackToneBadgeClasses,
} from "../shared/feedback-classes";
import type { ToastPosition, ToastTone } from "./Toast.types";

export const toastToneClasses: Record<ToastTone, string> =
  feedbackToneAccentClasses;

export const toastActionClasses =
  "gs-toast-action mt-gs-2 inline-flex min-h-gs-8 min-w-gs-0 cursor-pointer items-center justify-center justify-self-start rounded-gs-sm border border-gs-border-default bg-gs-surface px-gs-3 py-gs-1.5 font-inherit text-gs-xs font-gs-medium leading-gs-none text-gs-text shadow-gs-surface-sheen hover:border-gs-border-strong hover:bg-gs-action-hover focus-visible:outline-none focus-visible:shadow-gs-button-focus-border sm:mt-gs-0 sm:self-center";

export const toastCloseClasses = dismissControlClasses(
  "reveal",
  "gs-toast-close absolute right-gs-0 top-gs-0 m-gs-0",
);

export function toastIndicatorClasses(className?: string): string {
  return feedbackToneBadgeClasses(clsx("gs-toast-indicator", className));
}

export const toastRootClasses =
  "gs-toast group/toast pointer-events-auto relative grid min-w-[min(var(--toast-min-width),100%)] max-w-full grid-cols-1 select-none items-start gap-x-gs-3 box-border rounded-gs-sm border border-gs-border-default bg-gs-surface-raised bg-gs-surface-highlight px-gs-4 py-gs-3 pe-gs-12 font-inherit text-gs-sm leading-gs-normal text-gs-text shadow-gs-2 touch-pan-y sm:grid-cols-[minmax(0,1fr)_auto] data-[swipe-direction=down]:touch-pan-x data-[swipe-direction=up]:touch-pan-x data-[swipe=start]:[transform:translate3d(var(--gs-toast-swipe-x,0),var(--gs-toast-swipe-y,0),0)] data-[swipe=move]:[transform:translate3d(var(--gs-toast-swipe-x,0),var(--gs-toast-swipe-y,0),0)] data-[swipe=start]:animate-none data-[swipe=move]:animate-none data-[swipe=cancel]:translate-none data-[swipe=cancel]:animate-none data-[swipe=cancel]:transition-transform data-[swipe=cancel]:duration-200 data-[swipe=cancel]:ease-gs-standard motion-reduce:animate-none motion-reduce:transition-none [[data-reduced-motion=true]_&]:animate-none [[data-reduced-motion=true]_&]:transition-none";

export const toastTitleClasses =
  "gs-toast-title wrap-anywhere text-gs-sm font-gs-medium leading-gs-tight text-gs-feedback-accent";

export const toastDescriptionClasses =
  "gs-toast-description wrap-anywhere text-gs-sm font-gs-regular leading-gs-tight text-gs-text-secondary";

/** Style recipe for the fixed toast viewport. */
export const toastViewportClasses = createRecipe({
  base: "gs-toast-viewport pointer-events-none fixed z-gs-toast m-0 flex w-[min(var(--toast-max-width),calc(100vw-(var(--space-4)*2)))] max-w-gs-toast-max-width box-border flex-col gap-gs-2 p-0",
  variants: {
    position: {
      "top-right": "right-gs-4 top-gs-4 items-end",
      "top-left": "left-gs-4 top-gs-4 items-start",
      "top-center": "left-1/2 top-gs-4 -translate-x-1/2 items-center",
      "bottom-right": "right-gs-4 bottom-gs-4 flex-col-reverse items-end",
      "bottom-left": "left-gs-4 bottom-gs-4 flex-col-reverse items-start",
      "bottom-center":
        "left-1/2 bottom-gs-4 -translate-x-1/2 flex-col-reverse items-center",
    },
  },
  defaultVariants: {
    position: "bottom-right" as ToastPosition,
  },
});
