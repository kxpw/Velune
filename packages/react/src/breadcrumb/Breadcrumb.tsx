import type { ForwardedRef, ReactElement, ReactNode } from "react";
import { forwardRef } from "react";
import { clsx } from "clsx";
import {
  createCompoundSlot,
  dispatchCompoundSlots,
} from "../shared/compound-slot";
import type { BreadcrumbItemProps, BreadcrumbProps } from "./Breadcrumb.types";
import {
  breadcrumbClasses,
  breadcrumbItemClasses,
  breadcrumbLinkClasses,
  breadcrumbListClasses,
  breadcrumbSeparatorClasses,
  breadcrumbTextClasses,
} from "./Breadcrumb.classes";

function ChevronIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M6 4L10 8L6 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function renderItem(
  props: BreadcrumbItemProps,
  key: number,
  isCurrent: boolean,
): ReactElement {
  const {
    href,
    target,
    current: _current,
    disabled = false,
    onClick,
    className,
    children,
    ...itemProps
  } = props;
  void _current;

  const handleClick: BreadcrumbItemProps["onClick"] = (event) => {
    if (disabled) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };

  const content =
    href !== undefined && !disabled ? (
      <a
        href={href}
        {...(target !== undefined ? { target } : {})}
        className={breadcrumbLinkClasses()}
        {...(isCurrent ? { "aria-current": "page" as const } : {})}
        onClick={handleClick}
      >
        {children}
      </a>
    ) : (
      <span
        className={breadcrumbTextClasses({ disabled, current: isCurrent })}
        {...(isCurrent ? { "aria-current": "page" as const } : {})}
        onClick={handleClick}
      >
        {children}
      </span>
    );

  return (
    <li
      {...itemProps}
      key={key}
      className={clsx(breadcrumbItemClasses, className)}
      data-current={isCurrent ? "true" : undefined}
      data-disabled={disabled ? "true" : undefined}
    >
      {content}
    </li>
  );
}

function BreadcrumbImpl(
  {
    separator,
    className,
    children,
    "aria-label": ariaLabel = "Breadcrumb",
    ...props
  }: BreadcrumbProps,
  ref: ForwardedRef<HTMLElement>,
) {
  const items: BreadcrumbItemProps[] = [];
  dispatchCompoundSlots(
    children,
    {
      "Breadcrumb.Item": (child) => {
        items.push(child.props as BreadcrumbItemProps);
      },
    },
    () => {},
  );

  const hasExplicitCurrent = items.some((item) => item.current);
  const nodes: ReactNode[] = [];
  items.forEach((item, index) => {
    const isCurrent = hasExplicitCurrent
      ? Boolean(item.current)
      : index === items.length - 1;
    nodes.push(renderItem(item, index, isCurrent));
    if (index < items.length - 1) {
      nodes.push(
        <li
          key={`separator-${index}`}
          role="presentation"
          aria-hidden="true"
          className={breadcrumbSeparatorClasses}
        >
          {separator ?? <ChevronIcon />}
        </li>,
      );
    }
  });

  return (
    <nav
      ref={ref}
      aria-label={ariaLabel}
      {...props}
      className={clsx(breadcrumbClasses, className)}
    >
      <ol className={breadcrumbListClasses}>{nodes}</ol>
    </nav>
  );
}

const BreadcrumbRoot = forwardRef(BreadcrumbImpl);
BreadcrumbRoot.displayName = "Breadcrumb";

const BreadcrumbItem =
  createCompoundSlot<BreadcrumbItemProps>("Breadcrumb.Item");
(BreadcrumbItem as { displayName?: string }).displayName = "Breadcrumb.Item";

export const Breadcrumb = Object.assign(BreadcrumbRoot, {
  Item: BreadcrumbItem,
});
