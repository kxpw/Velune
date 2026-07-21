import type { ForwardedRef, MouseEvent, ReactNode } from "react";
import { Children, forwardRef } from "react";
import { clsx } from "clsx";
import {
  createCompoundSlot,
  dispatchCompoundSlots,
} from "../shared/compound-slot";
import { tagClasses } from "./Tag.classes";
import type { TagIconProps, TagProps } from "./Tag.types";

function collectTagContent(children: ReactNode): {
  content: ReactNode;
  icon?: TagIconProps | undefined;
} {
  const content: ReactNode[] = [];
  let icon: TagIconProps | undefined;
  dispatchCompoundSlots(
    children,
    {
      "Tag.Icon": (child) => {
        icon = child.props as TagIconProps;
      },
    },
    (child) => content.push(child),
  );
  return { content, icon };
}

const iconSizeClasses = {
  sm: "size-gs-tag-icon-size-sm",
  md: "size-gs-tag-icon-size-md",
} as const;

function CloseIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M4 4L12 12M12 4L4 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function defaultGetRemoveLabel(label: string | null): string {
  return label ? `Remove ${label}` : "Remove";
}

function TagImpl(
  {
    size = "md",
    tone = "default",
    closable,
    getRemoveLabel = defaultGetRemoveLabel,
    onClose,
    onClick,
    disabled,
    className,
    children,
    onKeyDown,
    role,
    tabIndex,
    "aria-disabled": ariaDisabled,
    ...props
  }: TagProps,
  ref: ForwardedRef<HTMLSpanElement>,
) {
  const { content, icon } = collectTagContent(children);
  const labelParts = Children.toArray(content);
  const labelText = labelParts.every(
    (part) => typeof part === "string" || typeof part === "number",
  )
    ? labelParts.join("")
    : null;
  const interactive = !!onClick && !disabled;

  const handleClose = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (disabled) {
      return;
    }
    onClose?.(event);
  };

  return (
    <span
      ref={ref}
      {...props}
      className={clsx(
        tagClasses({
          size,
          tone,
          interactive,
          disabled: Boolean(disabled),
        }),
        className,
      )}
      data-size={size}
      data-tone={tone}
      data-closable={closable ? "true" : undefined}
      data-interactive={interactive ? "true" : undefined}
      data-disabled={disabled ? "true" : undefined}
      role={role ?? (onClick ? "button" : undefined)}
      tabIndex={onClick ? (disabled ? -1 : (tabIndex ?? 0)) : tabIndex}
      aria-disabled={disabled || ariaDisabled}
      onClick={interactive ? onClick : undefined}
      onKeyDown={
        onClick
          ? (event) => {
              onKeyDown?.(event);
              if (
                !event.defaultPrevented &&
                !disabled &&
                event.target === event.currentTarget &&
                (event.key === "Enter" || event.key === " ")
              ) {
                event.preventDefault();
                event.currentTarget.click();
              }
            }
          : onKeyDown
      }
    >
      {icon?.children ? (
        <span
          {...icon}
          className={clsx(
            "gs-tag-icon inline-flex shrink-0 items-center justify-center [&>*]:block [&>*]:size-full",
            iconSizeClasses[size],
            icon.className,
          )}
        >
          {icon.children}
        </span>
      ) : null}
      {Children.count(content) > 0 ? (
        <span className="gs-tag-label min-w-0 truncate">{content}</span>
      ) : null}
      {closable ? (
        <button
          type="button"
          className="gs-tag-close -me-1 inline-flex size-gs-control-hit-target shrink-0 cursor-pointer items-center justify-center rounded-gs-sm border-0 bg-transparent p-0 text-inherit opacity-72 transition-[background-color,opacity,box-shadow,transform] duration-150 ease-gs-standard active:scale-95 hover:bg-gs-current-subtle hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:shadow-gs-button-focus-border motion-reduce:transition-none motion-reduce:active:scale-100 [[data-reduced-motion=true]_&]:transition-none [[data-reduced-motion=true]_&]:active:scale-100 [&_svg]:block [&_svg]:size-3"
          aria-label={getRemoveLabel(labelText)}
          disabled={disabled}
          onClick={handleClose}
        >
          <CloseIcon />
        </button>
      ) : null}
    </span>
  );
}

const TagRoot = forwardRef(TagImpl);
TagRoot.displayName = "Tag";

const TagIcon = createCompoundSlot<TagIconProps>("Tag.Icon");

export const Tag = Object.assign(TagRoot, { Icon: TagIcon });
