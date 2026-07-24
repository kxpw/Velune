import type {
  ForwardedRef,
  HTMLAttributes,
  LabelHTMLAttributes,
  ReactNode,
} from "react";
import { forwardRef } from "react";
import { clsx } from "clsx";
import {
  inputDescriptionClasses,
  inputErrorClasses,
  inputLabelClasses,
  inputRequiredClasses,
} from "./input-tailwind-classes";

export function joinDescribedBy(
  ...parts: Array<string | false | null | undefined>
): string | undefined {
  const value = parts.filter(Boolean).join(" ");
  return value || undefined;
}

export type FieldDescribedByOptions = {
  id?: string | undefined;
  reactId: string;
  /** Suffix when `id` is omitted. */
  idSuffix?: string | undefined;
  ariaDescribedBy?: string | undefined;
  hasDescription: boolean;
  hasError: boolean;
  /** Include description before error in aria-describedby (default true). */
  descriptionBeforeError?: boolean | undefined;
};

export type FieldDescribedBy = {
  controlId: string;
  labelId: string;
  descriptionId: string;
  errorId: string;
  describedBy: string | undefined;
};

/** Shared control/label/description/error id + aria-describedby wiring. */
export function getFieldDescribedBy({
  id,
  reactId,
  idSuffix = "field",
  ariaDescribedBy,
  hasDescription,
  hasError,
  descriptionBeforeError = true,
}: FieldDescribedByOptions): FieldDescribedBy {
  const controlId = id ?? `${reactId}-${idSuffix}`;
  const labelId = `${reactId}-label`;
  const descriptionId = `${reactId}-description`;
  const errorId = `${reactId}-error`;
  const describedBy = joinDescribedBy(
    ariaDescribedBy,
    descriptionBeforeError
      ? hasDescription && descriptionId
      : hasError && errorId,
    descriptionBeforeError
      ? hasError && errorId
      : hasDescription && descriptionId,
  );

  return { controlId, labelId, descriptionId, errorId, describedBy };
}

export type FieldLabelProps = LabelHTMLAttributes<HTMLLabelElement> & {
  required?: boolean | undefined;
  disabled?: boolean | undefined;
  disabledClassName?: string | undefined;
  sizeClassName?: string | undefined;
};

/** Shared field label with optional required marker. */
export function FieldLabel({
  required = false,
  disabled = false,
  disabledClassName,
  sizeClassName,
  className,
  children,
  ...props
}: FieldLabelProps) {
  if (children == null || children === false) {
    return null;
  }

  return (
    <label
      {...props}
      className={clsx(
        inputLabelClasses,
        sizeClassName,
        disabled && disabledClassName,
        className,
      )}
    >
      {children}
      {required ? (
        <span className={inputRequiredClasses} aria-hidden="true">
          *
        </span>
      ) : null}
    </label>
  );
}

export type FieldDescriptionProps = HTMLAttributes<HTMLElement> & {
  disabled?: boolean | undefined;
  disabledClassName?: string | undefined;
  as?: "span" | "div";
};

/** Shared field description copy. */
export function FieldDescription({
  disabled = false,
  disabledClassName,
  className,
  children,
  as: Component = "span",
  ...props
}: FieldDescriptionProps) {
  if (!children) {
    return null;
  }

  return (
    <Component
      {...props}
      className={clsx(
        inputDescriptionClasses,
        disabled && disabledClassName,
        className,
      )}
    >
      {children}
    </Component>
  );
}

export type FieldErrorProps = HTMLAttributes<HTMLElement> & {
  as?: "span" | "div";
};

/** Shared field error message. */
export function FieldError({
  className,
  children,
  as: Component = "span",
  ...props
}: FieldErrorProps) {
  if (!children) {
    return null;
  }

  return (
    <Component
      {...props}
      className={clsx(inputErrorClasses, className)}
      role="alert"
    >
      {children}
    </Component>
  );
}

export type FieldChromeProps = {
  className?: string | undefined;
  fieldClassName?: string | undefined;
  fullWidth?: boolean | undefined;
  fullWidthClassName?: string | undefined;
  disabled?: boolean | undefined;
  invalid?: boolean | undefined;
  size?: string | undefined;
  dir?: string | undefined;
  label?: FieldLabelProps | undefined;
  description?: FieldDescriptionProps | undefined;
  errorMessage?: FieldErrorProps | undefined;
  /** Rendered after the control (e.g. Select portal panel). */
  afterControl?: ReactNode;
  /** Rendered after description/error (e.g. DatePicker calendar portal). */
  afterMessages?: ReactNode;
  /** `error-first` matches Input/Select; `description-first` matches DatePicker. */
  messageOrder?: "error-first" | "description-first";
  descriptionAs?: "span" | "div";
  errorAs?: "span" | "div";
  children: ReactNode;
} & Omit<HTMLAttributes<HTMLDivElement>, "children">;

/**
 * Shared field layout: label, control, optional after-control slot, then
 * description/error messages.
 */
export const FieldChrome = forwardRef(function FieldChrome(
  {
    className,
    fieldClassName,
    fullWidth = false,
    fullWidthClassName,
    disabled = false,
    invalid = false,
    size,
    dir,
    label,
    description,
    errorMessage,
    afterControl,
    afterMessages,
    messageOrder = "error-first",
    descriptionAs = "span",
    errorAs = "span",
    children,
    ...props
  }: FieldChromeProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const descriptionNode = description ? (
    <FieldDescription {...description} as={descriptionAs} disabled={disabled} />
  ) : null;
  const errorNode = errorMessage ? (
    <FieldError {...errorMessage} as={errorAs} />
  ) : null;

  return (
    <div
      {...props}
      ref={ref}
      className={clsx(
        fieldClassName,
        fullWidth && fullWidthClassName,
        className,
      )}
      data-size={size}
      data-full-width={fullWidth ? "true" : undefined}
      data-disabled={disabled ? "true" : undefined}
      data-invalid={invalid ? "true" : undefined}
      dir={dir}
    >
      {label ? <FieldLabel {...label} disabled={disabled} /> : null}
      {children}
      {afterControl}
      {messageOrder === "error-first" ? (
        <>
          {errorNode}
          {descriptionNode}
        </>
      ) : (
        <>
          {descriptionNode}
          {errorNode}
        </>
      )}
      {afterMessages}
    </div>
  );
});
