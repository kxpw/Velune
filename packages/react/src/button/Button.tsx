import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ForwardedRef,
  KeyboardEvent,
  MouseEvent,
  ReactElement,
  ReactNode,
} from "react";
import { forwardRef, isValidElement } from "react";
import { clsx } from "clsx";
import {
  createCompoundSlot,
  dispatchCompoundSlots,
} from "../shared/compound-slot";
import { Slot } from "../shared/slot";
import {
  buttonClasses,
  buttonContentClasses,
  buttonIconClasses,
  buttonLabelClasses,
  buttonSpinnerClasses,
  buttonSpinnerSvgClasses,
  buttonSpinnerTrackClasses,
} from "./Button.classes";
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
    <span className={buttonSpinnerClasses} aria-hidden="true">
      <svg
        className={buttonSpinnerSvgClasses(size)}
        viewBox="0 0 24 24"
        fill="none"
      >
        <circle
          className={buttonSpinnerTrackClasses}
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
    </span>
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
    <>
      <span className={buttonContentClasses(size)}>
        {leading?.children ? (
          <span
            {...leading}
            className={clsx(
              buttonIconClasses({ size, loading }),
              leading.className,
            )}
          >
            {leading.children}
          </span>
        ) : null}
        {hasLabel ? (
          <span className={buttonLabelClasses({ variant, loading })}>
            {children}
          </span>
        ) : null}
        {trailing?.children ? (
          <span
            {...trailing}
            className={clsx(
              buttonIconClasses({ size, loading }),
              trailing.className,
            )}
          >
            {trailing.children}
          </span>
        ) : null}
      </span>
      {loading ? <ButtonSpinner size={size} /> : null}
    </>
  );
}

function ButtonImpl(props: ButtonProps, ref: ForwardedRef<HTMLElement>) {
  const {
    as,
    asChild,
    variant = "primary",
    tone = "default",
    size = "md",
    fullWidth = false,
    loading = false,
    className,
    children,
    disabled,
    type: typeProp,
    onClick: providedOnClick,
    onKeyDown: providedOnKeyDown,
    ...domProps
  } = props as ButtonProps & { disabled?: boolean };

  const { content, leading, trailing } = collectButtonContent(children);

  const hasLabel = hasRenderableLabel(content);
  const iconOnly =
    !asChild && !hasLabel && Boolean(leading || trailing || loading);
  const isDisabled = Boolean(disabled || loading);

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
    "data-tone": tone === "danger" ? "danger" : undefined,
    "data-size": size,
    "data-full-width": fullWidth ? "true" : undefined,
    "data-loading": loading ? "true" : undefined,
    "data-icon-only": iconOnly ? "true" : undefined,
    "aria-busy": loading || props["aria-busy"],
    className: clsx(
      buttonClasses({
        variant,
        tone,
        size,
        fullWidth,
        iconOnly,
        disabled: Boolean(disabled),
        loading,
      }),
      className,
    ),
  };

  if (asChild) {
    return (
      <Slot
        ref={ref}
        {...domProps}
        {...sharedProps}
        aria-disabled={isDisabled || undefined}
        onClick={(event: MouseEvent<HTMLElement>) => {
          preventDisabledInteraction(event);
          if (!isDisabled) {
            (providedOnClick as (e: MouseEvent<HTMLElement>) => void)?.(event);
          }
        }}
        {...(providedOnKeyDown ? { onKeyDown: providedOnKeyDown } : {})}
      >
        {children as ReactElement}
      </Slot>
    );
  }

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
