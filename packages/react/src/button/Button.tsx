import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ForwardedRef,
  KeyboardEvent,
  MouseEvent,
  ReactNode,
} from "react";
import { forwardRef, isValidElement } from "react";
import { clsx } from "clsx";
import {
  createCompoundSlot,
  dispatchCompoundSlots,
} from "../shared/compound-slot";
import type {
  ButtonLeadingProps,
  ButtonProps,
  ButtonTrailingProps,
} from "./Button.types";

function collectButtonContent(children: ReactNode): {
  content: ReactNode;
  leading?: ButtonLeadingProps | undefined;
  trailing?: ButtonTrailingProps | undefined;
} {
  const content: ReactNode[] = [];
  let leading: ButtonLeadingProps | undefined;
  let trailing: ButtonTrailingProps | undefined;

  dispatchCompoundSlots(
    children,
    {
      "Button.Leading": (child) => {
        leading = child.props as ButtonLeadingProps;
      },
      "Button.Trailing": (child) => {
        trailing = child.props as ButtonTrailingProps;
      },
    },
    (child) => content.push(child),
  );

  return { content, leading, trailing };
}

const sizeClasses = {
  sm: "min-h-[max(var(--button-height-sm),var(--control-hit-target))] px-gs-button-padding-x-sm py-gs-button-padding-y-sm text-gs-button-font-size-sm",
  md: "min-h-[max(var(--button-height-md),var(--control-hit-target))] px-gs-button-padding-x py-gs-button-padding-y text-gs-button-font-size",
  lg: "min-h-[max(var(--button-height-lg),var(--control-hit-target))] px-gs-button-padding-x-lg py-gs-button-padding-y-lg text-gs-button-font-size-lg",
} as const;

const iconSizeClasses = {
  sm: "size-gs-button-icon-size-sm",
  md: "size-gs-button-icon-size",
  lg: "size-gs-button-icon-size-lg",
} as const;

const iconOnlyClasses = {
  sm: "w-[max(var(--button-height-sm),var(--control-hit-target))] min-w-[max(var(--button-height-sm),var(--control-hit-target))] p-gs-button-padding-y-sm",
  md: "w-[max(var(--button-height-md),var(--control-hit-target))] min-w-[max(var(--button-height-md),var(--control-hit-target))] p-gs-button-padding-y",
  lg: "w-[max(var(--button-height-lg),var(--control-hit-target))] min-w-[max(var(--button-height-lg),var(--control-hit-target))] p-gs-button-padding-y-lg",
} as const;

function hasRenderableLabel(children: ReactNode): boolean {
  if (children == null || children === false || children === true) {
    return false;
  }
  if (typeof children === "string" || typeof children === "number") {
    return String(children).trim().length > 0;
  }
  if (Array.isArray(children)) {
    return children.some((child) => hasRenderableLabel(child));
  }
  return isValidElement(children);
}

function ButtonSpinner({ size }: { size: "sm" | "md" | "lg" }) {
  return (
    <svg
      className={clsx(
        "gs-button-spinner absolute left-1/2 top-1/2 block -translate-x-1/2 -translate-y-1/2 origin-center animate-gs-button-spinner motion-reduce:animate-none [[data-reduced-motion=true]_&]:animate-none",
        iconSizeClasses[size],
      )}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="gs-button-spinner-track opacity-28"
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ButtonContent({
  leading,
  trailing,
  loading,
  children,
  hasLabel,
  size,
  variant,
}: Pick<ButtonProps, "loading" | "children"> & {
  leading?: ButtonLeadingProps | undefined;
  trailing?: ButtonTrailingProps | undefined;
  hasLabel: boolean;
  size: "sm" | "md" | "lg";
  variant: ButtonProps["variant"];
}) {
  return (
    <span
      className={clsx(
        "gs-button-content pointer-events-none relative z-gs-base inline-flex min-w-0 items-center justify-center gap-gs-button-gap",
        size === "sm" && "gap-gs-button-gap-sm",
      )}
    >
      {leading?.children ? (
        <span
          {...leading}
          className={clsx(
            "gs-button-icon inline-flex shrink-0 items-center justify-center [&>*]:block [&>*]:size-full",
            iconSizeClasses[size],
            loading && "opacity-0",
            leading.className,
          )}
        >
          {leading.children}
        </span>
      ) : null}
      {loading ? <ButtonSpinner size={size} /> : null}
      {hasLabel ? (
        <span
          className={clsx(
            "gs-button-label inline-flex min-w-0 items-center",
            variant === "text" &&
              "underline decoration-[length:var(--button-border-width)] underline-offset-gs-button-underline-offset",
            loading && "opacity-0",
          )}
        >
          {children}
        </span>
      ) : null}
      {trailing?.children ? (
        <span
          {...trailing}
          className={clsx(
            "gs-button-icon inline-flex shrink-0 items-center justify-center [&>*]:block [&>*]:size-full",
            iconSizeClasses[size],
            loading && "opacity-0",
            trailing.className,
          )}
        >
          {trailing.children}
        </span>
      ) : null}
    </span>
  );
}

function ButtonImpl(props: ButtonProps, ref: ForwardedRef<HTMLElement>) {
  const {
    as,
    variant = "primary",
    size = "md",
    block,
    loading = false,
    className,
    children,
    disabled,
    type: typeProp,
    onClick: providedOnClick,
    onKeyDown: providedOnKeyDown,
    ...domProps
  } = props;

  const { content, leading, trailing } = collectButtonContent(children);

  const hasLabel = hasRenderableLabel(content);
  const iconOnly = !hasLabel && Boolean(leading || trailing || loading);
  const isDisabled = Boolean(disabled || loading);

  const variantClassName = clsx(
    variant === "primary" &&
      "border-gs-button-bg-primary bg-gs-button-bg-primary text-gs-button-color-on-primary shadow-gs-surface-sheen focus-visible:shadow-gs-surface-button-focus [[data-high-contrast=true]_&]:border-gs-button-border",
    variant === "primary" &&
      !isDisabled &&
      "hover:border-gs-button-bg-primary-hover hover:bg-gs-button-bg-primary-hover focus-visible:border-gs-button-bg-primary-hover focus-visible:bg-gs-button-bg-primary-hover active:border-gs-button-bg-primary-active active:bg-gs-button-bg-primary-active",
    variant === "secondary" &&
      "border-gs-button-border-secondary bg-gs-button-bg-secondary text-gs-button-color",
    variant === "secondary" &&
      !isDisabled &&
      "hover:border-gs-button-border-secondary-hover hover:bg-gs-button-bg-secondary-hover focus-visible:border-gs-button-border-secondary-hover focus-visible:bg-gs-button-bg-secondary-hover active:border-gs-button-border-secondary-active active:bg-gs-button-bg-secondary-active",
    variant === "ghost" &&
      "border-transparent bg-gs-button-bg-ghost text-gs-button-color",
    variant === "ghost" &&
      !isDisabled &&
      "hover:bg-gs-button-bg-ghost-hover focus-visible:bg-gs-button-bg-ghost-hover active:bg-gs-button-bg-ghost-active",
    variant === "text" &&
      "border-transparent bg-transparent px-2 text-gs-button-color-text",
    variant === "text" &&
      !isDisabled &&
      "hover:text-gs-button-color-text-hover focus-visible:text-gs-button-color-text-hover active:text-gs-button-color-text-hover",
    variant === "danger" &&
      "border-gs-button-color-danger bg-gs-button-bg-danger text-gs-button-color-danger focus-visible:shadow-gs-danger-focus [[data-high-contrast=true]_&]:border-gs-button-border",
    variant === "danger" &&
      !isDisabled &&
      "hover:border-gs-button-bg-danger-hover hover:bg-gs-button-bg-danger-hover hover:text-gs-button-color-on-fill focus-visible:border-gs-button-bg-danger-hover focus-visible:bg-gs-button-bg-danger-hover focus-visible:text-gs-button-color-on-fill active:border-gs-button-bg-danger-active active:bg-gs-button-bg-danger-active active:text-gs-button-color-on-fill",
  );

  const preventDisabledInteraction = (
    event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>,
  ) => {
    if (isDisabled) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  const sharedProps = {
    "data-variant": variant,
    "data-size": size,
    "data-block": block ? "true" : undefined,
    "data-loading": loading ? "true" : undefined,
    "data-icon-only": iconOnly ? "true" : undefined,
    "aria-busy": loading || props["aria-busy"],
    className: clsx(
      "gs-button relative inline-flex min-w-gs-control-hit-target touch-manipulation select-none appearance-none items-center justify-center overflow-hidden whitespace-nowrap rounded-gs-button-radius border text-center font-inherit font-gs-button-font-weight leading-none tracking-normal no-underline align-middle transition-[background-color,border-color,color,box-shadow,opacity] duration-200 ease-gs-standard [-webkit-tap-highlight-color:transparent] focus-visible:outline-none focus-visible:shadow-gs-button-focus motion-reduce:transition-none [[data-reduced-motion=true]_&]:transition-none",
      sizeClasses[size],
      variantClassName,
      iconOnly ? iconOnlyClasses[size] : block && "flex w-full",
      isDisabled ? "cursor-not-allowed opacity-gs-disabled" : "cursor-pointer",
      loading && "cursor-progress opacity-100",
      className,
    ),
  };

  if (as === "a") {
    const anchorProps = domProps as AnchorHTMLAttributes<HTMLAnchorElement>;
    const onClick =
      providedOnClick as AnchorHTMLAttributes<HTMLAnchorElement>["onClick"];
    const onKeyDown =
      providedOnKeyDown as AnchorHTMLAttributes<HTMLAnchorElement>["onKeyDown"];

    const handleAnchorClick = (event: MouseEvent<HTMLAnchorElement>) => {
      preventDisabledInteraction(event);
      if (!isDisabled) {
        onClick?.(event);
      }
    };

    const handleAnchorKeyDown = (event: KeyboardEvent<HTMLAnchorElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented || isDisabled) {
        if (isDisabled && (event.key === " " || event.key === "Enter")) {
          event.preventDefault();
        }
        return;
      }

      // Anchor elements without href use button keyboard semantics.
      if (!anchorProps.href && event.key === " ") {
        event.preventDefault();
        event.currentTarget.click();
      }
    };

    return (
      <a
        ref={ref as ForwardedRef<HTMLAnchorElement>}
        {...anchorProps}
        role={anchorProps.role ?? (anchorProps.href ? undefined : "button")}
        aria-disabled={isDisabled || anchorProps["aria-disabled"] || undefined}
        {...sharedProps}
        tabIndex={isDisabled ? -1 : anchorProps.tabIndex}
        onClick={handleAnchorClick}
        onKeyDown={handleAnchorKeyDown}
      >
        <ButtonContent
          leading={leading}
          trailing={trailing}
          loading={loading}
          hasLabel={hasLabel}
          size={size}
          variant={variant}
        >
          {content}
        </ButtonContent>
      </a>
    );
  }

  const buttonProps = domProps as ButtonHTMLAttributes<HTMLButtonElement>;
  const type = typeProp ?? "button";
  const onClick =
    providedOnClick as ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
  const onKeyDown =
    providedOnKeyDown as ButtonHTMLAttributes<HTMLButtonElement>["onKeyDown"];

  const handleButtonClick = (event: MouseEvent<HTMLButtonElement>) => {
    preventDisabledInteraction(event);
    if (!isDisabled) {
      onClick?.(event);
    }
  };

  return (
    <button
      ref={ref as ForwardedRef<HTMLButtonElement>}
      {...buttonProps}
      {...sharedProps}
      type={type}
      disabled={isDisabled}
      onClick={handleButtonClick}
      onKeyDown={onKeyDown}
    >
      <ButtonContent
        leading={leading}
        trailing={trailing}
        loading={loading}
        hasLabel={hasLabel}
        size={size}
        variant={variant}
      >
        {content}
      </ButtonContent>
    </button>
  );
}

const ButtonRoot = forwardRef(ButtonImpl);
ButtonRoot.displayName = "Button";

const ButtonLeading = createCompoundSlot<ButtonLeadingProps>("Button.Leading");
const ButtonTrailing =
  createCompoundSlot<ButtonTrailingProps>("Button.Trailing");

export const Button = Object.assign(ButtonRoot, {
  Leading: ButtonLeading,
  Trailing: ButtonTrailing,
});
