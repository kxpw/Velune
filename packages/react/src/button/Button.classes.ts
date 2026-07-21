import { clsx } from "clsx";
import type { ButtonSize, ButtonTone, ButtonVariant } from "./Button.types";

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-[max(var(--button-height-sm),var(--control-hit-target))] px-gs-button-padding-x-sm py-gs-button-padding-y-sm text-gs-button-font-size-sm",
  md: "min-h-[max(var(--button-height-md),var(--control-hit-target))] px-gs-button-padding-x py-gs-button-padding-y text-gs-button-font-size",
  lg: "min-h-[max(var(--button-height-lg),var(--control-hit-target))] px-gs-button-padding-x-lg py-gs-button-padding-y-lg text-gs-button-font-size-lg",
};

const iconOnlyClasses: Record<ButtonSize, string> = {
  sm: "w-[max(var(--button-height-sm),var(--control-hit-target))] min-w-[max(var(--button-height-sm),var(--control-hit-target))] p-gs-button-padding-y-sm",
  md: "w-[max(var(--button-height-md),var(--control-hit-target))] min-w-[max(var(--button-height-md),var(--control-hit-target))] p-gs-button-padding-y",
  lg: "w-[max(var(--button-height-lg),var(--control-hit-target))] min-w-[max(var(--button-height-lg),var(--control-hit-target))] p-gs-button-padding-y-lg",
};

type ResolvedVariant = "primary" | "secondary" | "ghost" | "text";

function variantToneClasses(
  variant: ResolvedVariant,
  tone: ButtonTone,
  interactive: boolean,
): string {
  if (tone === "danger") {
    return clsx(
      "focus-visible:shadow-gs-danger-focus",
      variant === "primary" &&
        "border-gs-button-color-danger bg-gs-button-bg-danger text-gs-button-color-danger [[data-high-contrast=true]_&]:border-gs-button-border",
      variant === "primary" &&
        interactive &&
        "hover:border-gs-button-bg-danger-hover hover:bg-gs-button-bg-danger-hover hover:text-gs-button-color-on-fill focus-visible:border-gs-button-bg-danger-hover focus-visible:bg-gs-button-bg-danger-hover focus-visible:text-gs-button-color-on-fill active:border-gs-button-bg-danger-active active:bg-gs-button-bg-danger-active active:text-gs-button-color-on-fill",
      variant === "secondary" &&
        "border-gs-error bg-gs-button-bg-secondary text-gs-error",
      variant === "secondary" &&
        interactive &&
        "hover:bg-gs-error-subtle focus-visible:bg-gs-error-subtle active:bg-gs-error-tint",
      variant === "ghost" &&
        "border-transparent bg-gs-button-bg-ghost text-gs-error",
      variant === "ghost" &&
        interactive &&
        "hover:bg-gs-error-subtle focus-visible:bg-gs-error-subtle active:bg-gs-error-tint",
      variant === "text" &&
        "border-transparent bg-transparent px-2 text-gs-error",
    );
  }

  return clsx(
    variant === "primary" &&
      "border-gs-button-bg-primary bg-gs-button-bg-primary text-gs-button-color-on-primary shadow-gs-surface-sheen focus-visible:shadow-gs-surface-button-focus [[data-high-contrast=true]_&]:border-gs-button-border",
    variant === "primary" &&
      interactive &&
      "hover:border-gs-button-bg-primary-hover hover:bg-gs-button-bg-primary-hover focus-visible:border-gs-button-bg-primary-hover focus-visible:bg-gs-button-bg-primary-hover active:border-gs-button-bg-primary-active active:bg-gs-button-bg-primary-active",
    variant === "secondary" &&
      "border-gs-button-border-secondary bg-gs-button-bg-secondary text-gs-button-color",
    variant === "secondary" &&
      interactive &&
      "hover:border-gs-button-border-secondary-hover hover:bg-gs-button-bg-secondary-hover focus-visible:border-gs-button-border-secondary-hover focus-visible:bg-gs-button-bg-secondary-hover active:border-gs-button-border-secondary-active active:bg-gs-button-bg-secondary-active",
    variant === "ghost" &&
      "border-transparent bg-gs-button-bg-ghost text-gs-button-color",
    variant === "ghost" &&
      interactive &&
      "hover:bg-gs-button-bg-ghost-hover focus-visible:bg-gs-button-bg-ghost-hover active:bg-gs-button-bg-ghost-active",
    variant === "text" &&
      "border-transparent bg-transparent px-2 text-gs-button-color-text",
    variant === "text" &&
      interactive &&
      "hover:text-gs-button-color-text-hover focus-visible:text-gs-button-color-text-hover active:text-gs-button-color-text-hover",
  );
}

export type ButtonClassesOptions = {
  /** Default: `"primary"`. The deprecated `"danger"` maps to `primary` + `tone: "danger"`. */
  variant?: ButtonVariant;
  /** Default: `"default"`. */
  tone?: ButtonTone;
  /** Default: `"md"`. */
  size?: ButtonSize;
  fullWidth?: boolean;
  /** Square hit target for icon-only content. */
  iconOnly?: boolean;
  disabled?: boolean;
  loading?: boolean;
};

/**
 * Style recipe for the Button component. Use it to give any element the
 * Button appearance without rendering a `<Button>`, e.g. a router link:
 *
 * ```tsx
 * <Link to="/docs" className={buttonClasses({ variant: "secondary" })} />
 * ```
 */
export function buttonClasses({
  variant = "primary",
  tone,
  size = "md",
  fullWidth = false,
  iconOnly = false,
  disabled = false,
  loading = false,
}: ButtonClassesOptions = {}): string {
  const resolvedTone: ButtonTone =
    tone ?? (variant === "danger" ? "danger" : "default");
  const resolvedVariant: ResolvedVariant =
    variant === "danger" ? "primary" : variant;
  const isDisabled = disabled || loading;

  return clsx(
    "gs-button relative inline-flex min-w-gs-control-hit-target touch-manipulation select-none appearance-none items-center justify-center overflow-hidden whitespace-nowrap rounded-gs-button-radius border text-center font-inherit font-gs-button-font-weight leading-none tracking-normal no-underline align-middle transition-[background-color,border-color,color,box-shadow,opacity] duration-200 ease-gs-standard [-webkit-tap-highlight-color:transparent] focus-visible:outline-none focus-visible:shadow-gs-button-focus motion-reduce:transition-none [[data-reduced-motion=true]_&]:transition-none",
    sizeClasses[size],
    variantToneClasses(resolvedVariant, resolvedTone, !isDisabled),
    iconOnly ? iconOnlyClasses[size] : fullWidth && "flex w-full",
    isDisabled ? "cursor-not-allowed opacity-gs-disabled" : "cursor-pointer",
    loading && "cursor-progress opacity-100",
  );
}
