import { clsx } from "clsx";
import { createRecipe } from "../shared/recipe";
import type { ButtonSize, ButtonTone, ButtonVariant } from "./Button.types";

const sizeClasses = createRecipe({
  variants: {
    size: {
      sm: "min-h-gs-11 px-gs-3 py-gs-1.5 text-gs-xs",
      md: "min-h-gs-11 px-gs-4 py-gs-2 text-gs-sm",
      lg: "min-h-gs-11 px-gs-6 py-gs-2.5 text-gs-md",
    },
  },
  defaultVariants: { size: "md" },
});

const iconOnlyClasses = createRecipe({
  variants: {
    size: {
      sm: "size-gs-11 p-gs-1.5",
      md: "size-gs-11 p-gs-2",
      lg: "size-gs-11 p-gs-2.5",
    },
  },
  defaultVariants: { size: "md" },
});

type ResolvedVariant = ButtonVariant;

function variantToneClasses(
  variant: ResolvedVariant,
  tone: ButtonTone,
  interactive: boolean,
): string {
  if (tone === "danger") {
    return clsx(
      "focus-visible:shadow-gs-danger-focus",
      variant === "primary" &&
        "border-gs-error bg-transparent text-gs-error [[data-high-contrast=true]_&]:border-gs-text",
      variant === "primary" &&
        interactive &&
        "hover:border-gs-error hover:bg-gs-error hover:text-gs-on-primary focus-visible:border-gs-error focus-visible:bg-gs-error focus-visible:text-gs-on-primary active:border-gs-button-bg-danger-active active:bg-gs-button-bg-danger-active active:text-gs-on-primary",
      variant === "secondary" &&
        "border-gs-error bg-gs-button-bg-secondary text-gs-error",
      variant === "secondary" &&
        interactive &&
        "hover:bg-gs-error-subtle focus-visible:bg-gs-error-subtle active:bg-gs-error-soft",
      variant === "ghost" && "border-transparent bg-transparent text-gs-error",
      variant === "ghost" &&
        interactive &&
        "hover:bg-gs-error-subtle focus-visible:bg-gs-error-subtle active:bg-gs-error-soft",
      variant === "text" &&
        "border-transparent bg-transparent px-gs-2 text-gs-error",
    );
  }

  return clsx(
    variant === "primary" &&
      "border-gs-primary-strong bg-gs-primary-strong text-gs-on-primary shadow-gs-surface-sheen focus-visible:shadow-gs-surface-button-focus [[data-high-contrast=true]_&]:border-gs-text",
    variant === "primary" &&
      interactive &&
      "hover:border-gs-primary-strong-hover hover:bg-gs-primary-strong-hover focus-visible:border-gs-primary-strong-hover focus-visible:bg-gs-primary-strong-hover active:border-gs-primary-strong-active active:bg-gs-primary-strong-active",
    variant === "secondary" &&
      "border-gs-border-default bg-gs-button-bg-secondary text-gs-text",
    variant === "secondary" &&
      interactive &&
      "hover:border-gs-border-focus hover:bg-gs-action-hover focus-visible:border-gs-border-focus focus-visible:bg-gs-action-hover active:border-gs-border-focus active:bg-gs-action-active",
    variant === "ghost" && "border-transparent bg-transparent text-gs-text",
    variant === "ghost" &&
      interactive &&
      "hover:bg-gs-action-hover focus-visible:bg-gs-action-hover active:bg-gs-action-active",
    variant === "text" &&
      "border-transparent bg-transparent px-gs-2 text-gs-text-secondary",
    variant === "text" &&
      interactive &&
      "hover:text-gs-text-accent focus-visible:text-gs-text-accent active:text-gs-text-accent",
  );
}

export type ButtonClassesOptions = {
  /** Default: `"primary"`. */
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
  tone = "default",
  size = "md",
  fullWidth = false,
  iconOnly = false,
  disabled = false,
  loading = false,
}: ButtonClassesOptions = {}): string {
  const isDisabled = disabled || loading;

  return clsx(
    "gs-button relative inline-flex min-w-gs-11 touch-manipulation select-none appearance-none items-center justify-center overflow-hidden whitespace-nowrap rounded-gs-sm border text-center font-inherit font-gs-medium leading-gs-none tracking-gs-normal no-underline align-middle transition-[background-color,border-color,color,box-shadow,opacity] duration-200 ease-gs-standard [-webkit-tap-highlight-color:transparent] focus-visible:outline-none focus-visible:shadow-gs-button-focus motion-reduce:transition-none [[data-reduced-motion=true]_&]:transition-none",
    sizeClasses({ size }),
    variantToneClasses(variant, tone, !isDisabled),
    iconOnly ? iconOnlyClasses({ size }) : fullWidth && "flex w-full",
    isDisabled ? "cursor-not-allowed opacity-gs-disabled" : "cursor-pointer",
    loading && "cursor-progress opacity-100",
  );
}

export const iconSizeClasses: Record<ButtonSize, string> = {
  sm: "size-gs-3",
  md: "size-gs-4",
  lg: "size-gs-5",
};

/**
 * Positioning shell for the loading spinner. Centering uses flex + inset
 * rather than translate, so the spin animation's `transform` cannot pull
 * the spinner off-center.
 */
export const buttonSpinnerClasses =
  "gs-button-spinner pointer-events-none absolute inset-gs-0 z-gs-base flex items-center justify-center";

/** Classes for the spinning SVG inside the loading shell. */
export function buttonSpinnerSvgClasses(size: ButtonSize): string {
  return clsx(
    "block origin-center animate-gs-button-spinner motion-reduce:animate-none [[data-reduced-motion=true]_&]:animate-none",
    iconSizeClasses[size],
  );
}

/** Classes for the spinner's faded track circle. */
export const buttonSpinnerTrackClasses = "gs-button-spinner-track opacity-28";

/** Classes for the content wrapper inside the button. */
export function buttonContentClasses(size: ButtonSize): string {
  return clsx(
    "gs-button-content pointer-events-none relative z-gs-base inline-flex min-w-gs-0 items-center justify-center gap-gs-2",
    size === "sm" && "gap-gs-1",
  );
}

export type ButtonIconClassesOptions = {
  size: ButtonSize;
  loading?: boolean | undefined;
};

/** Classes for leading/trailing icon slots. */
export function buttonIconClasses({
  size,
  loading = false,
}: ButtonIconClassesOptions): string {
  return clsx(
    "gs-button-icon inline-flex shrink-0 items-center justify-center [&>*]:block [&>*]:size-full",
    iconSizeClasses[size],
    loading && "opacity-0",
  );
}

export type ButtonLabelClassesOptions = {
  variant?: ButtonVariant | undefined;
  loading?: boolean | undefined;
};

/** Classes for the button label. */
export function buttonLabelClasses({
  variant,
  loading = false,
}: ButtonLabelClassesOptions = {}): string {
  return clsx(
    "gs-button-label inline-flex min-w-gs-0 items-center",
    variant === "text" &&
      "underline decoration-[length:var(--control-border-width)] [text-underline-offset:var(--space-1)]",
    loading && "opacity-0",
  );
}
