import type { ElementType, ForwardedRef, KeyboardEvent } from "react";
import { createElement, forwardRef } from "react";
import { clsx } from "clsx";
import type {
  CardActionProps,
  CardBodyProps,
  CardDescriptionProps,
  CardFooterProps,
  CardHeaderProps,
  CardProps,
  CardTitleProps,
} from "./Card.types";
import type { PolymorphicComponent } from "../shared/polymorphic";

const variantClasses = {
  outlined:
    "[--gs-card-bg:var(--card-bg)] [--gs-card-border:var(--card-border-outlined)] [--gs-card-border-width:var(--card-border-width-outlined)] [--gs-card-shadow:0_0_0_transparent] [--gs-card-sheen:0_0_0_transparent] bg-none",
  filled:
    "[--gs-card-bg:var(--card-bg-filled)] [--gs-card-border:transparent] [--gs-card-border-width:0px] [--gs-card-shadow:0_0_0_transparent] [--gs-card-sheen:0_0_0_transparent] bg-none",
  elevated:
    "[--gs-card-bg:var(--card-bg)] [--gs-card-border:var(--card-border)] [--gs-card-border-width:var(--card-border-width)] [--gs-card-shadow:var(--card-shadow-elevated)] [--gs-card-sheen:var(--surface-sheen)]",
} as const;

const footerAlignClasses = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
} as const;

function CardImpl(
  {
    as = "div",
    variant = "elevated",
    size = "md",
    interactive,
    className,
    children,
    onClick,
    onKeyDown,
    role,
    tabIndex,
    ...props
  }: CardProps<ElementType>,
  ref: ForwardedRef<HTMLElement>,
) {
  const hasAction = typeof onClick === "function";
  const hasInteractiveStyle = Boolean(interactive || hasAction);

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    onKeyDown?.(event);
    if (
      !event.defaultPrevented &&
      event.target === event.currentTarget &&
      hasAction &&
      (event.key === "Enter" || event.key === " ")
    ) {
      event.preventDefault();
      event.currentTarget.click();
    }
  };

  return createElement(
    as,
    {
      ref,
      ...props,
      className: clsx(
        "gs-card flex min-w-0 flex-col rounded-gs-card-radius border-gs-card-border-width border-gs-card-border bg-gs-card-bg bg-gs-surface-highlight font-inherit text-gs-card-color shadow-gs-card transition-[background-color,box-shadow,border-color] duration-200 ease-gs-standard [--gs-card-padding:var(--card-padding)] [&>:last-child:is(.gs-card-header,.gs-card-body,.gs-card-footer)]:pb-[calc(var(--gs-card-padding)-var(--space-1))] motion-reduce:transition-none [[data-reduced-motion=true]_&]:transition-none",
        size === "sm" && "[--gs-card-padding:var(--card-padding-sm)]",
        variantClasses[variant],
        hasInteractiveStyle &&
          "min-h-gs-control-hit-target min-w-gs-control-hit-target touch-manipulation cursor-pointer [-webkit-tap-highlight-color:transparent] focus-visible:outline-none focus-visible:shadow-gs-card-focus",
        hasInteractiveStyle &&
          variant === "filled" &&
          "hover:bg-gs-card-bg-filled-hover hover:shadow-gs-card",
        hasInteractiveStyle &&
          variant === "outlined" &&
          "hover:border-gs-card-border-outlined-hover hover:shadow-gs-card",
        hasInteractiveStyle &&
          variant === "elevated" &&
          "hover:bg-gs-card-bg-interactive-hover hover:shadow-gs-card-hover",
        className,
      ),
      "data-variant": variant,
      "data-size": size,
      "data-interactive": hasInteractiveStyle ? "true" : undefined,
      role: role ?? (hasAction ? "button" : undefined),
      tabIndex: tabIndex ?? (hasAction ? 0 : undefined),
      onClick,
      onKeyDown: hasAction ? handleKeyDown : onKeyDown,
    },
    children,
  );
}

const CardRoot = forwardRef(CardImpl) as unknown as PolymorphicComponent<
  "div",
  import("./Card.types").CardOwnProps
>;
CardRoot.displayName = "Card";

function CardHeaderImpl(
  { className, children, ...props }: CardHeaderProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  return (
    <div
      ref={ref}
      {...props}
      className={clsx(
        "gs-card-header grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-x-gs-card-header-gap gap-y-1 p-gs-card-padding",
        className,
      )}
    >
      {children}
    </div>
  );
}

const CardHeader = forwardRef(CardHeaderImpl);
CardHeader.displayName = "Card.Header";

function CardTitleImpl(
  { as = "h3", className, children, ...props }: CardTitleProps<ElementType>,
  ref: ForwardedRef<HTMLElement>,
) {
  return createElement(
    as,
    {
      ref,
      ...props,
      className: clsx(
        "gs-card-title col-start-1 row-start-1 m-0 min-w-0 wrap-anywhere text-gs-card-title-size font-gs-card-title-weight leading-gs-normal text-gs-card-color [[data-size=sm]_&]:text-sm",
        className,
      ),
    },
    children,
  );
}

const CardTitle = forwardRef(CardTitleImpl) as unknown as PolymorphicComponent<
  "h3",
  import("./Card.types").CardTitleOwnProps
>;
CardTitle.displayName = "Card.Title";

const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, children, ...props }, ref) => (
    <p
      ref={ref}
      className={clsx(
        "gs-card-description col-start-1 row-start-2 m-0 min-w-0 wrap-anywhere text-gs-card-description-size font-normal leading-gs-normal text-gs-text-secondary",
        className,
      )}
      {...props}
    >
      {children}
    </p>
  ),
);
CardDescription.displayName = "Card.Description";

const CardAction = forwardRef<HTMLDivElement, CardActionProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={clsx(
        "gs-card-action col-start-2 row-span-2 row-start-1 inline-flex shrink-0 items-center gap-2",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  ),
);
CardAction.displayName = "Card.Action";

function CardBodyImpl(
  { className, children, ...props }: CardBodyProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  return (
    <div
      ref={ref}
      className={clsx(
        "gs-card-body min-w-0 flex-auto p-gs-card-padding text-sm leading-gs-body text-gs-card-color [&:not(:first-child)]:pt-0",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

const CardBody = forwardRef(CardBodyImpl);
CardBody.displayName = "Card.Body";

function CardFooterImpl(
  { align = "end", className, children, ...props }: CardFooterProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  return (
    <div
      ref={ref}
      {...props}
      className={clsx(
        "gs-card-footer flex min-w-0 flex-wrap items-center gap-2 p-gs-card-padding [&:not(:first-child)]:pt-0",
        footerAlignClasses[align],
        className,
      )}
      data-align={align}
    >
      {children}
    </div>
  );
}

const CardFooter = forwardRef(CardFooterImpl);
CardFooter.displayName = "Card.Footer";

export const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Title: CardTitle,
  Description: CardDescription,
  Action: CardAction,
  Body: CardBody,
  Footer: CardFooter,
});
