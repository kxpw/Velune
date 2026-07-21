import { clsx } from "clsx";
import type { InputSize } from "./Input.types";

export const inputShellSizeClasses: Record<InputSize, string> = {
  sm: "[--gs-input-box:var(--input-height-sm)] [--gs-input-pad-y:var(--input-padding-y-sm)] [--gs-input-pad-x:var(--space-2)] [--gs-input-font:var(--input-font-size-sm)] [--gs-input-icon:var(--input-icon-size-sm)] [--gs-input-action:var(--input-action-size-sm)] [--gs-input-gap:var(--input-gap-sm)]",
  md: "[--gs-input-box:var(--input-height-md)] [--gs-input-pad-y:var(--input-padding-y)] [--gs-input-pad-x:var(--space-3)] [--gs-input-font:var(--input-font-size)] [--gs-input-icon:var(--input-icon-size)] [--gs-input-action:var(--input-action-size)] [--gs-input-gap:var(--input-gap)]",
  lg: "[--gs-input-box:var(--input-height-lg)] [--gs-input-pad-y:var(--input-padding-y-lg)] [--gs-input-pad-x:var(--space-4)] [--gs-input-font:var(--input-font-size-lg)] [--gs-input-icon:var(--input-icon-size-lg)] [--gs-input-action:var(--input-action-size-lg)] [--gs-input-gap:var(--input-gap)]",
};

export type InputShellClassesOptions = {
  /** Default: `"md"`. */
  size?: InputSize;
  invalid?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  fullWidth?: boolean;
};

/**
 * Style recipe for the Input control shell (the bordered box around the
 * native input). Use it to give custom field controls the Input appearance:
 *
 * ```tsx
 * <span className={inputShellClasses({ size: "sm" })}>
 *   <input className="gs-input ..." />
 * </span>
 * ```
 */
export function inputShellClasses({
  size = "md",
  invalid = false,
  disabled = false,
  readOnly = false,
  fullWidth = false,
}: InputShellClassesOptions = {}): string {
  return clsx(
    "gs-input-shell group/input-shell inline-flex h-[max(var(--gs-input-box),var(--control-hit-target))] min-h-[max(var(--gs-input-box),var(--control-hit-target))] min-w-gs-control-hit-target max-w-full items-center gap-gs-local-input-gap box-border rounded-gs-xs border border-gs-default bg-gs-surface bg-gs-surface-highlight px-gs-input-pad-x py-gs-input-pad-y align-middle text-gs-input-font font-gs-input-font-weight leading-[1.25] text-gs-input-color shadow-gs-surface-sheen transition-[background-color,border-color,box-shadow,opacity] duration-200 ease-gs-standard focus-within:border-gs-focus focus-within:bg-gs-surface-raised focus-within:shadow-gs-input-focus-border has-[.gs-input:focus-visible]:shadow-gs-input-surface-focus motion-reduce:transition-none [[data-reduced-motion=true]_&]:transition-none [[data-high-contrast=true]_&]:border [[data-high-contrast=true]_&]:border-gs-input-border [[data-high-contrast=true]_&]:focus-within:border-gs-focus",
    inputShellSizeClasses[size],
    fullWidth && "flex w-full",
    invalid
      ? "border-gs-error bg-gs-error-subtle focus-within:border-gs-error focus-within:bg-gs-error-subtle focus-within:shadow-gs-input-invalid-border has-[.gs-input:focus-visible]:shadow-gs-input-invalid-focus [[data-high-contrast=true]_&]:border-gs-error"
      : !disabled &&
          !readOnly &&
          "hover:not-focus-within:border-gs-strong hover:not-focus-within:bg-gs-surface-muted",
    invalid &&
      !disabled &&
      "hover:not-focus-within:border-gs-error hover:not-focus-within:bg-gs-error-tint",
    disabled
      ? "cursor-not-allowed opacity-gs-disabled"
      : readOnly && "cursor-default",
  );
}
