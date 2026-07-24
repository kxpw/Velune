import type { ForwardedRef, MouseEvent, ReactNode } from "react";
import { Children, forwardRef } from "react";
import { clsx } from "clsx";
import {
  createCompoundSlot,
  dispatchCompoundSlots,
} from "../shared/compound-slot";
import { CloseIcon } from "../shared/icons";
import {
  tagClasses,
  tagCloseClasses,
  tagIconClasses,
  tagLabelClasses,
} from "./Tag.classes";
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
        <span {...icon} className={clsx(tagIconClasses(size), icon.className)}>
          {icon.children}
        </span>
      ) : null}
      {Children.count(content) > 0 ? (
        <span className={tagLabelClasses}>{content}</span>
      ) : null}
      {closable ? (
        <button
          type="button"
          className={tagCloseClasses}
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
