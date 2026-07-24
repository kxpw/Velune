import { clsx } from "clsx";
import type { ForwardedRef, ReactElement } from "react";
import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  useState,
} from "react";
import type { AvatarGroupProps, AvatarProps, AvatarSize } from "./Avatar.types";
import {
  avatarClasses,
  avatarFallbackClasses as fallbackClasses,
  avatarGroupClasses,
  avatarGroupItemClasses,
  avatarGroupOverlapClasses,
  avatarIconClasses,
  avatarImageClasses,
  avatarOverflowClasses,
} from "./Avatar.classes";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "";
  }
  if (parts.length === 1) {
    return parts[0]!.slice(0, 2).toUpperCase();
  }
  return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase();
}

function DefaultIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <circle cx="12" cy="9" r="3.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M5.5 19c1.4-3.2 3.8-4.8 6.5-4.8s5.1 1.6 6.5 4.8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function defaultOverflowLabel(count: number) {
  return `${count} more`;
}

function AvatarImpl(
  {
    size = "md",
    shape = "circle",
    src,
    alt,
    name,
    children,
    className,
    imgProps,
    "aria-label": ariaLabel,
    ...props
  }: AvatarProps,
  ref: ForwardedRef<HTMLSpanElement>,
) {
  const [failedSrc, setFailedSrc] = useState<string>();
  const {
    onError: onImageError,
    className: imageClassName,
    ...restImgProps
  } = imgProps ?? {};

  const showImage = Boolean(src) && failedSrc !== src;
  const initials = name ? getInitials(name) : "";
  const label = ariaLabel ?? alt ?? name ?? "Avatar";

  return (
    <span
      {...props}
      ref={ref}
      className={clsx(avatarClasses({ size, shape }), className)}
      data-size={size}
      data-shape={shape}
      role={showImage ? undefined : "img"}
      aria-label={showImage ? undefined : label}
    >
      {showImage ? (
        <img
          {...restImgProps}
          className={clsx(avatarImageClasses, imageClassName)}
          src={src}
          alt={label}
          draggable={false}
          onError={(event) => {
            onImageError?.(event);
            setFailedSrc(src);
          }}
        />
      ) : children != null && children !== false ? (
        <span className={fallbackClasses}>{children}</span>
      ) : initials ? (
        <span className={fallbackClasses} aria-hidden="true">
          {initials}
        </span>
      ) : (
        <span
          className={clsx(fallbackClasses, avatarIconClasses)}
          aria-hidden="true"
        >
          <DefaultIcon />
        </span>
      )}
    </span>
  );
}

const AvatarRoot = forwardRef(AvatarImpl);
AvatarRoot.displayName = "Avatar";

function AvatarGroupImpl(
  {
    size = "md",
    shape = "circle",
    max = 3,
    overflowLabel = defaultOverflowLabel,
    className,
    children,
    ...props
  }: AvatarGroupProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const items = Children.toArray(children).filter(
    isValidElement,
  ) as ReactElement<AvatarProps>[];
  const visible = items.slice(0, Math.max(0, max));
  const overflow = items.length - visible.length;

  return (
    <div
      {...props}
      ref={ref}
      className={clsx(avatarGroupClasses, className)}
      data-size={size}
      role="group"
    >
      {visible.map((child, index) =>
        cloneElement(child, {
          key: child.key ?? index,
          size: (child.props.size as AvatarSize | undefined) ?? size,
          shape: child.props.shape ?? shape,
          className: clsx(
            avatarGroupItemClasses,
            index > 0 && avatarGroupOverlapClasses,
            child.props.className,
          ),
        }),
      )}
      {overflow > 0 ? (
        <span
          className={clsx(
            avatarClasses({ size, shape }),
            avatarOverflowClasses,
            visible.length > 0 && avatarGroupOverlapClasses,
          )}
          data-size={size}
          data-shape={shape}
          role="img"
          aria-label={overflowLabel(overflow)}
        >
          <span className={fallbackClasses}>+{overflow}</span>
        </span>
      ) : null}
    </div>
  );
}

const AvatarGroup = forwardRef(AvatarGroupImpl);
AvatarGroup.displayName = "Avatar.Group";

export const Avatar = Object.assign(AvatarRoot, {
  Group: AvatarGroup,
});
