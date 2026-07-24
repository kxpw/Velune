import type { ButtonHTMLAttributes, ForwardedRef } from "react";
import { forwardRef } from "react";
import { clsx } from "clsx";
import { toastActionClasses } from "./Toast.classes";

export type ToastActionProps = ButtonHTMLAttributes<HTMLButtonElement>;

function ToastActionImpl(
  { className, type = "button", ...props }: ToastActionProps,
  ref: ForwardedRef<HTMLButtonElement>,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={clsx(toastActionClasses, className)}
      {...props}
    />
  );
}

/** Presentational action control used by toasts and custom toast UIs. */
export const ToastAction = forwardRef(ToastActionImpl);
ToastAction.displayName = "ToastProvider.Action";
