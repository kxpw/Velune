import type { ForwardedRef } from "react";
import { forwardRef } from "react";
import { useControllableState } from "@velune/hooks";
import { clsx } from "clsx";
import type {
  AlertActionProps,
  AlertDescriptionProps,
  AlertProps,
  AlertTitleProps,
} from "./Alert.types";
import {
  alertActionClasses,
  alertClasses,
  alertCloseClasses,
  alertContentClasses,
  alertDescriptionClasses,
  alertIconClasses,
  alertTitleClasses,
} from "./Alert.classes";
import { FeedbackCloseIcon, feedbackToneIcons } from "../shared/feedback-icons";

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
  const resolvedIcon = icon === undefined ? feedbackToneIcons[tone] : icon;

  return (
    <div
      ref={ref}
      {...props}
      role={resolvedRole}
      className={clsx(alertClasses({ tone }), className)}
      data-tone={tone}
    >
      {resolvedIcon != null ? (
        <span className={alertIconClasses} aria-hidden="true">
          {resolvedIcon}
        </span>
      ) : null}
      <div className={alertContentClasses}>{children}</div>
      {closable ? (
        <button
          type="button"
          className={alertCloseClasses}
          aria-label={closeLabel}
          onClick={() => {
            setOpen(false);
            onClose?.();
          }}
        >
          <FeedbackCloseIcon />
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
    <div ref={ref} {...props} className={clsx(alertTitleClasses, className)} />
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
      className={clsx(alertDescriptionClasses, className)}
    />
  );
}

const AlertDescription = forwardRef(AlertDescriptionImpl);
AlertDescription.displayName = "Alert.Description";

function AlertActionImpl(
  { className, ...props }: AlertActionProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  return (
    <div ref={ref} {...props} className={clsx(alertActionClasses, className)} />
  );
}

const AlertAction = forwardRef(AlertActionImpl);
AlertAction.displayName = "Alert.Action";

export const Alert = Object.assign(AlertRoot, {
  Title: AlertTitle,
  Description: AlertDescription,
  Action: AlertAction,
});
