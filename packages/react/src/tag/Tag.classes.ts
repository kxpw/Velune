import { clsx } from "clsx";
import type { TagSize, TagTone } from "./Tag.types";

const sizeClasses: Record<TagSize, string> = {
  sm: "min-h-gs-tag-height-sm px-gs-tag-padding-x-sm text-gs-tag-font-size-sm",
  md: "min-h-gs-tag-height-md px-gs-tag-padding-x-md text-gs-tag-font-size-md",
};

const toneClasses: Record<TagTone, string> = {
  default: "bg-gs-tag-bg text-gs-tag-color",
  primary: "bg-gs-focus-subtle text-gs-text",
  success: "bg-gs-success-subtle text-gs-text",
  warning: "bg-gs-warning-subtle text-gs-text",
  error: "bg-gs-error-soft text-gs-text",
  info: "bg-gs-info-subtle text-gs-text",
  muted: "bg-gs-action-hover text-gs-text-secondary",
};

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
    "gs-tag inline-flex max-w-full select-none items-center gap-gs-tag-gap rounded-gs-tag-radius border-0 align-middle font-inherit font-gs-tag-font-weight leading-none",
    sizeClasses[size],
    toneClasses[tone],
    interactive &&
      !disabled &&
      "min-h-gs-control-hit-target min-w-gs-control-hit-target cursor-pointer transition-colors duration-200 ease-gs-standard hover:bg-gs-surface-mist focus-visible:outline-none focus-visible:shadow-gs-button-focus-border motion-reduce:transition-none [[data-reduced-motion=true]_&]:transition-none",
    disabled && "pointer-events-none cursor-not-allowed opacity-gs-disabled",
  );
}
