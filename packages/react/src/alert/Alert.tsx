import type { ForwardedRef, ReactNode } from "react";
import { forwardRef } from "react";
import { useControllableState } from "@velune/hooks";
import { clsx } from "clsx";
import type {
  AlertDescriptionProps,
  AlertProps,
  AlertTitleProps,
  AlertTone,
} from "./Alert.types";

const toneClasses: Record<AlertTone, string> = {
  neutral: "border-gs-default bg-gs-surface-mist text-gs-text",
  info: "border-gs-info bg-gs-info-subtle text-gs-text",
  success: "border-gs-success bg-gs-success-subtle text-gs-text",
  warning: "border-gs-warning bg-gs-warning-subtle text-gs-text",
  error: "border-gs-error bg-gs-error-subtle text-gs-text",
};

const toneIconClasses: Record<AlertTone, string> = {
  neutral: "text-gs-text-secondary",
  info: "text-gs-info",
  success: "text-gs-success",
  warning: "text-gs-warning",
  error: "text-gs-error",
};

function InfoIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
      <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M8 7.5V11M8 5.25V5.4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SuccessIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
      <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M5.5 8.25L7.25 10L10.5 6.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M8 2.75L14.25 13.25H1.75L8 2.75Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M8 7V9.25M8 11V11.15"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
      <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M6 6L10 10M10 6L6 10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

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

const toneIcons: Record<AlertTone, ReactNode> = {
  neutral: <InfoIcon />,
  info: <InfoIcon />,
  success: <SuccessIcon />,
  warning: <WarningIcon />,
  error: <ErrorIcon />,
};

function AlertImpl(
  {
    tone = "info",
    icon,
    closable = false,
    open: openProp,
    defaultOpen = true,
    onOpenChange,
    onClose,
    closeLabel = "Dismiss",
    role,
    className,
    children,
    ...props
  }: AlertProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const [open, setOpen] = useControllableState({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });

  if (!open) {
    return null;
  }

  const resolvedRole =
    role ?? (tone === "error" || tone === "warning" ? "alert" : "status");
  const resolvedIcon = icon === undefined ? toneIcons[tone] : icon;

  return (
    <div
      ref={ref}
      {...props}
      role={resolvedRole}
      className={clsx(
        "gs-alert flex min-w-0 items-start gap-3 rounded-gs-md border p-4 font-inherit text-sm leading-gs-body",
        toneClasses[tone],
        className,
      )}
      data-tone={tone}
    >
      {resolvedIcon != null ? (
        <span
          className={clsx(
            "gs-alert-icon mt-0.5 inline-flex size-4 shrink-0 items-center justify-center [&>*]:block [&>*]:size-full",
            toneIconClasses[tone],
          )}
          aria-hidden="true"
        >
          {resolvedIcon}
        </span>
      ) : null}
      <div className="gs-alert-content grid min-w-0 flex-auto gap-1">
        {children}
      </div>
      {closable ? (
        <button
          type="button"
          className="gs-alert-close -m-2 ms-0 inline-flex size-gs-control-hit-target shrink-0 cursor-pointer items-center justify-center rounded-gs-sm border-0 bg-transparent p-0 text-gs-text-secondary transition-[background-color,color,box-shadow,transform] duration-150 ease-gs-standard active:scale-95 hover:bg-gs-current-subtle hover:text-gs-text focus-visible:outline-none focus-visible:shadow-gs-button-focus-border motion-reduce:transition-none motion-reduce:active:scale-100 [[data-reduced-motion=true]_&]:transition-none [[data-reduced-motion=true]_&]:active:scale-100 [&_svg]:block [&_svg]:size-3.5"
          aria-label={closeLabel}
          onClick={() => {
            setOpen(false);
            onClose?.();
          }}
        >
          <CloseIcon />
        </button>
      ) : null}
    </div>
  );
}

const AlertRoot = forwardRef(AlertImpl);
AlertRoot.displayName = "Alert";

function AlertTitleImpl(
  { className, ...props }: AlertTitleProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  return (
    <div
      ref={ref}
      {...props}
      className={clsx(
        "gs-alert-title font-medium leading-gs-normal text-gs-text",
        className,
      )}
    />
  );
}

const AlertTitle = forwardRef(AlertTitleImpl);
AlertTitle.displayName = "Alert.Title";

function AlertDescriptionImpl(
  { className, ...props }: AlertDescriptionProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  return (
    <div
      ref={ref}
      {...props}
      className={clsx(
        "gs-alert-description leading-gs-body text-gs-text-secondary",
        className,
      )}
    />
  );
}

const AlertDescription = forwardRef(AlertDescriptionImpl);
AlertDescription.displayName = "Alert.Description";

export const Alert = Object.assign(AlertRoot, {
  Title: AlertTitle,
  Description: AlertDescription,
});
