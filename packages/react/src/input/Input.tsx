import type {
  ChangeEvent,
  ForwardedRef,
  MouseEvent as ReactMouseEvent,
  ReactNode,
} from "react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { clsx } from "clsx";
import { useControllableState } from "@velune/hooks";
import {
  createCompoundSlot,
  dispatchCompoundSlots,
} from "../shared/compound-slot";
import {
  inputDescriptionClasses,
  inputErrorClasses,
  inputFieldClasses,
  inputLabelClasses,
  inputLabelSizeClasses,
  inputRequiredClasses,
} from "../shared/input-tailwind-classes";
import type {
  InputDescriptionProps,
  InputErrorMessageProps,
  InputLabelProps,
  InputPrefixProps,
  InputProps,
  InputSize,
  InputSuffixProps,
} from "./Input.types";

type InputComposition = {
  label?: InputLabelProps;
  prefix?: InputPrefixProps;
  suffix?: InputSuffixProps;
  description?: InputDescriptionProps;
  errorMessage?: InputErrorMessageProps;
};

function collectInputComposition(children: ReactNode): InputComposition {
  const composition: InputComposition = {};

  dispatchCompoundSlots(children, {
    "Input.Label": (child) => {
      composition.label = child.props as InputLabelProps;
    },
    "Input.Prefix": (child) => {
      composition.prefix = child.props as InputPrefixProps;
    },
    "Input.Suffix": (child) => {
      composition.suffix = child.props as InputSuffixProps;
    },
    "Input.Description": (child) => {
      composition.description = child.props as InputDescriptionProps;
    },
    "Input.ErrorMessage": (child) => {
      composition.errorMessage = child.props as InputErrorMessageProps;
    },
  });

  return composition;
}

const inputShellSizeClasses: Record<InputSize, string> = {
  sm: "[--gs-input-box:var(--input-height-sm)] [--gs-input-pad-y:var(--input-padding-y-sm)] [--gs-input-pad-x:var(--space-2)] [--gs-input-font:var(--input-font-size-sm)] [--gs-input-icon:var(--input-icon-size-sm)] [--gs-input-action:var(--input-action-size-sm)] [--gs-input-gap:var(--input-gap-sm)]",
  md: "[--gs-input-box:var(--input-height-md)] [--gs-input-pad-y:var(--input-padding-y)] [--gs-input-pad-x:var(--space-3)] [--gs-input-font:var(--input-font-size)] [--gs-input-icon:var(--input-icon-size)] [--gs-input-action:var(--input-action-size)] [--gs-input-gap:var(--input-gap)]",
  lg: "[--gs-input-box:var(--input-height-lg)] [--gs-input-pad-y:var(--input-padding-y-lg)] [--gs-input-pad-x:var(--space-4)] [--gs-input-font:var(--input-font-size-lg)] [--gs-input-icon:var(--input-icon-size-lg)] [--gs-input-action:var(--input-action-size-lg)] [--gs-input-gap:var(--input-gap)]",
};

const inputActionClasses =
  "gs-input-action m-0 inline-flex size-gs-input-action cursor-pointer items-center justify-center box-border rounded-gs-xs border-0 bg-transparent p-0 font-inherit leading-none text-gs-text-secondary transition-[color,background-color,opacity] duration-200 ease-gs-standard hover:not-disabled:bg-gs-action-hover hover:not-disabled:text-gs-text active:not-disabled:bg-gs-action-active focus-visible:pointer-events-auto focus-visible:opacity-100 focus-visible:bg-gs-action-active focus-visible:text-gs-text focus-visible:outline-none focus-visible:shadow-gs-input-focus disabled:cursor-not-allowed disabled:opacity-gs-disabled motion-reduce:transition-none [[data-reduced-motion=true]_&]:transition-none";

function CloseIcon() {
  return (
    <svg
      className="gs-input-action-icon block size-gs-input-icon shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M7 7L17 17M17 7L7 17"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg
      className="gs-input-action-icon block size-gs-input-icon shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M2.5 12S6 6.5 12 6.5 21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      className="gs-input-action-icon block size-gs-input-icon shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M4 4L20 20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M10.1 10.2A3 3 0 0 0 12 15a3 3 0 0 0 2.2-.9M7.2 7.4C5.1 8.6 3.5 10.4 2.5 12c0 0 3.5 5.5 9.5 5.5 1.4 0 2.7-.3 3.8-.7M14 6.8C13.4 6.6 12.7 6.5 12 6.5 6 6.5 2.5 12 2.5 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function wrapAffix(
  slot: InputPrefixProps | InputSuffixProps | undefined,
  side: "start" | "end",
) {
  if (slot == null || slot.children == null || slot.children === false) {
    return null;
  }
  const { className, children, ...props } = slot;
  return (
    <span
      {...props}
      className={clsx(
        "gs-input-affix inline-flex max-w-[36%] shrink-0 items-center overflow-hidden text-ellipsis whitespace-nowrap text-size-inherit leading-none text-gs-text-secondary tabular-nums data-[side=start]:me-[calc(var(--gs-input-gap)*-0.25)] [&>svg]:block [&>svg]:size-gs-input-icon [&>svg]:shrink-0",
        className,
      )}
      data-side={side}
    >
      {children}
    </span>
  );
}

function InputImpl(
  {
    children,
    className,
    id,
    type = "text",
    size = "md",
    clearable = false,
    clearLabel = "Clear input",
    showPasswordLabel = "Show password",
    hidePasswordLabel = "Hide password",
    invalid = false,
    fullWidth = false,
    disabled,
    readOnly,
    required,
    value,
    defaultValue,
    onChange,
    "aria-describedby": ariaDescribedBy,
    "aria-invalid": ariaInvalid,
    ...props
  }: InputProps,
  ref: ForwardedRef<HTMLInputElement>,
) {
  const { label, prefix, suffix, description, errorMessage } =
    collectInputComposition(children);
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const descriptionId = `${inputId}-description`;
  const errorId = `${inputId}-error`;

  const isControlled = value !== undefined;
  const initialValueRef = useRef(
    defaultValue == null ? "" : String(defaultValue),
  );
  const [currentValue, setCurrentValue] = useControllableState({
    value: isControlled ? String(value ?? "") : undefined,
    defaultValue: initialValueRef.current,
  });
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const setRefs = useCallback(
    (node: HTMLInputElement | null) => {
      inputRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  const isPassword = type === "password";
  const inputType = isPassword && passwordVisible ? "text" : type;
  const isInvalid =
    invalid ||
    ariaInvalid === true ||
    ariaInvalid === "true" ||
    Boolean(errorMessage?.children);

  const describedBy = [
    ariaDescribedBy,
    description?.children ? descriptionId : null,
    errorMessage?.children ? errorId : null,
  ]
    .filter(Boolean)
    .join(" ");

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setCurrentValue(event.currentTarget.value);
    onChange?.(event);
  };

  useEffect(() => {
    const form = inputRef.current?.form;
    if (!form || isControlled) {
      return;
    }
    const handleReset = () => setCurrentValue(initialValueRef.current);
    form.addEventListener("reset", handleReset);
    return () => form.removeEventListener("reset", handleReset);
  }, [isControlled, props.form, setCurrentValue]);

  const clearInput = (input: HTMLInputElement) => {
    Object.getOwnPropertyDescriptor(
      Object.getPrototypeOf(input) as object,
      "value",
    )!.set!.call(input, "");
    input.dispatchEvent(new Event("input", { bubbles: true }));
  };

  const canClear =
    clearable && currentValue.length > 0 && !disabled && !readOnly;
  const hasTrailingActions = canClear || isPassword;

  const preventBlur = (event: ReactMouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const hasFieldChrome =
    label?.children != null ||
    description?.children != null ||
    errorMessage?.children != null ||
    fullWidth;

  const shell = (
    <span
      className={clsx(
        "gs-input-shell group/input-shell inline-flex h-[max(var(--gs-input-box),var(--control-hit-target))] min-h-[max(var(--gs-input-box),var(--control-hit-target))] min-w-gs-control-hit-target max-w-full items-center gap-gs-local-input-gap box-border rounded-gs-xs border border-gs-default bg-gs-surface bg-gs-surface-highlight px-gs-input-pad-x py-gs-input-pad-y align-middle text-gs-input-font font-gs-input-font-weight leading-[1.25] text-gs-input-color shadow-gs-surface-sheen transition-[background-color,border-color,box-shadow,opacity] duration-200 ease-gs-standard focus-within:border-gs-focus focus-within:bg-gs-surface-raised focus-within:shadow-gs-input-focus-border has-[.gs-input:focus-visible]:shadow-gs-input-surface-focus motion-reduce:transition-none [[data-reduced-motion=true]_&]:transition-none [[data-high-contrast=true]_&]:border [[data-high-contrast=true]_&]:border-gs-input-border [[data-high-contrast=true]_&]:focus-within:border-gs-focus",
        inputShellSizeClasses[size],
        hasTrailingActions && "pe-1",
        fullWidth && "flex w-full",
        isInvalid
          ? "border-gs-error bg-gs-error-subtle focus-within:border-gs-error focus-within:bg-gs-error-subtle focus-within:shadow-gs-input-invalid-border has-[.gs-input:focus-visible]:shadow-gs-input-invalid-focus [[data-high-contrast=true]_&]:border-gs-error"
          : !disabled &&
              !readOnly &&
              "hover:not-focus-within:border-gs-strong hover:not-focus-within:bg-gs-surface-muted",
        isInvalid &&
          !disabled &&
          "hover:not-focus-within:border-gs-error hover:not-focus-within:bg-gs-error-tint",
        disabled
          ? "cursor-not-allowed opacity-gs-disabled"
          : readOnly && "cursor-default",
        !hasFieldChrome && className,
      )}
      data-size={size}
      data-invalid={isInvalid ? "true" : undefined}
      data-disabled={disabled ? "true" : undefined}
      data-readonly={readOnly ? "true" : undefined}
      data-full-width={fullWidth && !hasFieldChrome ? "true" : undefined}
      data-has-prefix={prefix?.children != null ? "true" : undefined}
      data-has-suffix={suffix?.children != null ? "true" : undefined}
      data-has-actions={hasTrailingActions ? "true" : undefined}
    >
      {wrapAffix(prefix, "start")}
      <input
        ref={setRefs}
        id={inputId}
        type={inputType}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        value={currentValue}
        aria-invalid={isInvalid || undefined}
        aria-describedby={describedBy || undefined}
        className="gs-input m-0 w-full min-w-0 flex-auto appearance-none overflow-hidden text-ellipsis border-0 bg-transparent p-0 font-inherit leading-inherit tracking-inherit text-inherit caret-gs-border-focus outline-none placeholder:text-gs-input-placeholder placeholder:opacity-100 selection:bg-gs-input-selection selection:text-gs-input-color autofill:caret-gs-border-focus autofill:shadow-gs-input-autofill autofill:[-webkit-text-fill-color:var(--input-color)] autofill:[transition:background-color_99999s_ease-in-out_0s] disabled:cursor-not-allowed disabled:[-webkit-text-fill-color:currentcolor] read-only:cursor-default [&[type=number]]:appearance-textfield [&[type=number]]:tabular-nums [&[type=number]::-webkit-inner-spin-button]:m-0 [&[type=number]::-webkit-inner-spin-button]:appearance-none [&[type=number]::-webkit-outer-spin-button]:m-0 [&[type=number]::-webkit-outer-spin-button]:appearance-none [&[type=search]::-webkit-search-decoration]:hidden [&[type=search]::-webkit-search-decoration]:appearance-none [&[type=search]::-webkit-search-cancel-button]:hidden [&[type=search]::-webkit-search-cancel-button]:appearance-none [&[type=search]::-webkit-search-results-button]:hidden [&[type=search]::-webkit-search-results-button]:appearance-none [&[type=search]::-webkit-search-results-decoration]:hidden [&[type=search]::-webkit-search-results-decoration]:appearance-none"
        onChange={handleChange}
        {...props}
      />
      {hasTrailingActions ? (
        <span className="gs-input-actions inline-flex shrink-0 items-center gap-gs-input-action-gap leading-none text-gs-text-secondary">
          {canClear ? (
            <button
              type="button"
              className={clsx(
                inputActionClasses,
                "pointer-events-none opacity-0 group-hover/input-shell:pointer-events-auto group-hover/input-shell:opacity-100 group-focus-within/input-shell:pointer-events-auto group-focus-within/input-shell:opacity-100 [@media(hover:none)]:pointer-events-auto [@media(hover:none)]:opacity-100",
              )}
              data-action="clear"
              aria-label={clearLabel}
              disabled={disabled}
              onMouseDown={preventBlur}
              onClick={(event) =>
                clearInput(
                  event.currentTarget.parentElement!
                    .previousElementSibling as HTMLInputElement,
                )
              }
            >
              <CloseIcon />
            </button>
          ) : null}
          {isPassword ? (
            <button
              type="button"
              className={inputActionClasses}
              data-action="password"
              aria-label={
                passwordVisible ? hidePasswordLabel : showPasswordLabel
              }
              aria-pressed={passwordVisible}
              disabled={disabled}
              onMouseDown={preventBlur}
              onClick={() => setPasswordVisible((next) => !next)}
            >
              {passwordVisible ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          ) : null}
        </span>
      ) : null}
      {wrapAffix(suffix, "end")}
    </span>
  );

  if (!hasFieldChrome) {
    return shell;
  }

  return (
    <div
      className={clsx(inputFieldClasses, fullWidth && "grid w-full", className)}
      data-size={size}
      data-full-width={fullWidth ? "true" : undefined}
      data-disabled={disabled ? "true" : undefined}
      data-invalid={isInvalid ? "true" : undefined}
    >
      {label?.children != null && label.children !== false ? (
        <label
          {...label}
          className={clsx(
            inputLabelClasses,
            inputLabelSizeClasses[size],
            disabled && "cursor-not-allowed text-gs-text-disabled",
            label.className,
          )}
          htmlFor={inputId}
        >
          {label.children}
          {required ? (
            <span className={inputRequiredClasses} aria-hidden="true">
              *
            </span>
          ) : null}
        </label>
      ) : null}
      {shell}
      {errorMessage?.children ? (
        <span
          {...errorMessage}
          className={clsx(inputErrorClasses, errorMessage.className)}
          id={errorId}
          role="alert"
        >
          {errorMessage.children}
        </span>
      ) : null}
      {description?.children ? (
        <span
          {...description}
          className={clsx(
            inputDescriptionClasses,
            disabled && "cursor-not-allowed text-gs-text-disabled",
            description.className,
          )}
          id={descriptionId}
        >
          {description.children}
        </span>
      ) : null}
    </div>
  );
}

const InputRoot = forwardRef(InputImpl);
InputRoot.displayName = "Input";

const InputLabel = createCompoundSlot<InputLabelProps>("Input.Label");
const InputPrefix = createCompoundSlot<InputPrefixProps>("Input.Prefix");
const InputSuffix = createCompoundSlot<InputSuffixProps>("Input.Suffix");
const InputDescription =
  createCompoundSlot<InputDescriptionProps>("Input.Description");
const InputErrorMessage =
  createCompoundSlot<InputErrorMessageProps>("Input.ErrorMessage");

export const Input = Object.assign(InputRoot, {
  Label: InputLabel,
  Prefix: InputPrefix,
  Suffix: InputSuffix,
  Description: InputDescription,
  ErrorMessage: InputErrorMessage,
});
