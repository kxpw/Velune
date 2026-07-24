import { clsx } from "clsx";
import { createRecipe } from "../shared/recipe";
import { dismissControlClasses } from "../shared/feedback-classes";
import type { TagSize, TagTone } from "./Tag.types";

const baseClasses = createRecipe({
  base: "gs-tag inline-flex max-w-full select-none items-center gap-gs-1 rounded-gs-sm border-0 align-middle font-inherit font-gs-medium leading-gs-none",
  variants: {
    size: {
      sm: "min-h-gs-5 px-gs-2 text-gs-xs",
      md: "min-h-gs-7 px-gs-2 text-gs-xs",
    },
    tone: {
      default:
        "bg-gs-surface-mist text-gs-text [[data-high-contrast=true]_&]:bg-gs-surface",
      primary: "bg-gs-focus-subtle text-gs-text",
      success: "bg-gs-success-subtle text-gs-text",
      warning: "bg-gs-warning-subtle text-gs-text",
      error: "bg-gs-error-soft text-gs-text",
      info: "bg-gs-info-subtle text-gs-text",
      muted: "bg-gs-action-hover text-gs-text-secondary",
    },
  },
  defaultVariants: {
    size: "md",
    tone: "default",
  },
});

export type TagClassesOptions = {
  /** Default: `"md"`. */
  size?: TagSize;
  /** Default: `"default"`. */
  tone?: TagTone;
  /** Adds hit-target sizing, hover, and focus treatment for clickable tags. */
  interactive?: boolean;
  disabled?: boolean;
};

/**
 * Style recipe for the Tag component. Use it to give any element the Tag
 * appearance without rendering a `<Tag>`:
 *
 * ```tsx
 * <span className={tagClasses({ tone: "success", size: "sm" })}>Done</span>
 * ```
 */
export function tagClasses({
  size = "md",
  tone = "default",
  interactive = false,
  disabled = false,
}: TagClassesOptions = {}): string {
  return clsx(
    baseClasses({ size, tone }),
    interactive &&
      !disabled &&
      "min-h-gs-11 min-w-gs-11 cursor-pointer transition-colors duration-200 ease-gs-standard hover:bg-gs-action-hover focus-visible:outline-none focus-visible:shadow-gs-button-focus-border motion-reduce:transition-none [[data-reduced-motion=true]_&]:transition-none",
    disabled && "pointer-events-none cursor-not-allowed opacity-gs-disabled",
  );
}

const iconSizeClasses: Record<TagSize, string> = {
  sm: "size-gs-3",
  md: "size-gs-3",
};

/** Classes for the Tag.Icon slot. */
export function tagIconClasses(size: TagSize): string {
  return clsx(
    "gs-tag-icon inline-flex shrink-0 items-center justify-center [&>*]:block [&>*]:size-full",
    iconSizeClasses[size],
  );
}

/** Classes for the tag label wrapper. */
export const tagLabelClasses = "gs-tag-label min-w-gs-0 truncate";

export const tagCloseClasses = dismissControlClasses("onTone", "gs-tag-close");
