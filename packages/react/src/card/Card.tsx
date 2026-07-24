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
import {
  cardActionClasses,
  cardBodyClasses,
  cardClasses,
  cardDescriptionClasses,
  cardFooterClasses,
  cardHeaderClasses,
  cardTitleClasses,
} from "./Card.classes";

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
        cardClasses({
          size: size === "sm" ? "sm" : undefined,
          variant,
          interactive: hasInteractiveStyle,
        }),
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
    <div ref={ref} {...props} className={clsx(cardHeaderClasses, className)}>
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
      className: clsx(cardTitleClasses, className),
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
    <p ref={ref} className={clsx(cardDescriptionClasses, className)} {...props}>
      {children}
    </p>
  ),
);
CardDescription.displayName = "Card.Description";

const CardAction = forwardRef<HTMLDivElement, CardActionProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={clsx(cardActionClasses, className)} {...props}>
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
    <div ref={ref} className={clsx(cardBodyClasses, className)} {...props}>
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
      className={clsx(cardFooterClasses({ align }), className)}
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
