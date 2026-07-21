import type {
  ChangeEvent,
  CSSProperties,
  ForwardedRef,
  FormEvent,
  ReactNode,
} from "react";
import { forwardRef, useCallback, useId, useLayoutEffect, useRef } from "react";
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
import type { InputSize } from "../input";
import type {
  TextAreaAutosize,
  TextAreaDescriptionProps,
  TextAreaErrorMessageProps,
  TextAreaLabelProps,
  TextAreaProps,
  TextAreaResize,
} from "./TextArea.types";

type TextAreaComposition = {
  label?: TextAreaLabelProps;
  description?: TextAreaDescriptionProps;
  errorMessage?: TextAreaErrorMessageProps;
};

function collectTextAreaComposition(children: ReactNode): TextAreaComposition {
  const composition: TextAreaComposition = {};

  dispatchCompoundSlots(children, {
    "TextArea.Label": (child) => {
      composition.label = child.props as TextAreaLabelProps;
    },
    "TextArea.Description": (child) => {
      composition.description = child.props as TextAreaDescriptionProps;
    },
    "TextArea.ErrorMessage": (child) => {
      composition.errorMessage = child.props as TextAreaErrorMessageProps;
    },
  });

  return composition;
}

const textAreaResizeClasses: Record<TextAreaResize, string> = {
  none: "resize-none",
  vertical: "resize-y",
  horizontal: "resize-x",
  both: "resize",
};

const textAreaShellSizeClasses: Record<InputSize, string> = {
  sm: "[--gs-textarea-pad-y:var(--input-padding-y-sm)] [--gs-textarea-pad-x:var(--space-2)] [--gs-textarea-font:var(--input-font-size-sm)]",
  md: "[--gs-textarea-pad-y:var(--input-padding-y)] [--gs-textarea-pad-x:var(--space-3)] [--gs-textarea-font:var(--input-font-size)]",
  lg: "[--gs-textarea-pad-y:var(--input-padding-y-lg)] [--gs-textarea-pad-x:var(--space-4)] [--gs-textarea-font:var(--input-font-size-lg)]",
};

function resolveAutosize(autosize: TextAreaAutosize | undefined): {
  enabled: boolean;
  minRows: number;
  maxRows: number;
} {
  if (!autosize) {
    return { enabled: false, minRows: 3, maxRows: 12 };
  }
  if (autosize === true) {
    return { enabled: true, minRows: 3, maxRows: 12 };
  }
  return {
    enabled: true,
    minRows: autosize.minRows ?? 3,
    maxRows: autosize.maxRows ?? 12,
  };
}

function assignRef<T>(ref: ForwardedRef<T>, value: T | null) {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref) {
    ref.current = value;
  }
}

function resizeTextArea(
  node: HTMLTextAreaElement,
  minRows: number,
  maxRows: number,
) {
  const styles = window.getComputedStyle(node);
  const lineHeight = Number.parseFloat(styles.lineHeight) || 20;
  const paddingTop = Number.parseFloat(styles.paddingTop) || 0;
  const paddingBottom = Number.parseFloat(styles.paddingBottom) || 0;
  const borderTop = Number.parseFloat(styles.borderTopWidth) || 0;
  const borderBottom = Number.parseFloat(styles.borderBottomWidth) || 0;
  const minHeight = lineHeight * minRows + paddingTop + paddingBottom;
  const maxHeight = lineHeight * maxRows + paddingTop + paddingBottom;

  node.style.height = "auto";
  const next = Math.min(
    Math.max(node.scrollHeight + borderTop + borderBottom, minHeight),
    maxHeight,
  );
  node.style.height = `${next}px`;
  node.style.overflowY = node.scrollHeight > maxHeight ? "auto" : "hidden";
}

function TextAreaImpl(
  {
    children,
    className,
    id,
    size = "md",
    autosize = false,
    resize = "vertical",
    showCount = false,
    invalid = false,
    fullWidth = false,
    disabled,
    readOnly,
    required,
    rows,
    value,
    defaultValue,
    maxLength,
    onChange,
    onInput,
    "aria-describedby": ariaDescribedBy,
    "aria-invalid": ariaInvalid,
    style,
    ...props
  }: TextAreaProps,
  ref: ForwardedRef<HTMLTextAreaElement>,
) {
  const { label, description, errorMessage } =
    collectTextAreaComposition(children);
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const descriptionId = `${inputId}-description`;
  const errorId = `${inputId}-error`;
  const localRef = useRef<HTMLTextAreaElement | null>(null);

  const isControlled = value !== undefined;
  const initialValueRef = useRef(
    defaultValue == null ? "" : String(defaultValue),
  );
  const [currentValue, setCurrentValue] = useControllableState({
    value: isControlled ? String(value ?? "") : undefined,
    defaultValue: initialValueRef.current,
  });
  const autosizeConfig = resolveAutosize(autosize);
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

  const setRefs = useCallback(
    (node: HTMLTextAreaElement | null) => {
      localRef.current = node;
      assignRef(ref, node);
    },
    [ref],
  );

  useLayoutEffect(() => {
    if (!autosizeConfig.enabled || !localRef.current) {
      return;
    }
    resizeTextArea(
      localRef.current,
      autosizeConfig.minRows,
      autosizeConfig.maxRows,
    );
  }, [
    autosizeConfig.enabled,
    autosizeConfig.maxRows,
    autosizeConfig.minRows,
    currentValue,
  ]);

  useLayoutEffect(() => {
    const form = localRef.current?.form;
    if (!form || isControlled) {
      return;
    }
    const handleReset = () => setCurrentValue(initialValueRef.current);
    form.addEventListener("reset", handleReset);
    return () => form.removeEventListener("reset", handleReset);
  }, [isControlled, props.form, setCurrentValue]);

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentValue(event.currentTarget.value);
    onChange?.(event);
  };

  const handleInput = (event: FormEvent<HTMLTextAreaElement>) => {
    if (autosizeConfig.enabled) {
      resizeTextArea(
        event.currentTarget,
        autosizeConfig.minRows,
        autosizeConfig.maxRows,
      );
    }
    onInput?.(event);
  };

  const count = currentValue.length;
  const overLimit = typeof maxLength === "number" && count > maxLength;
  const hasFieldChrome =
    label?.children != null ||
    description?.children != null ||
    errorMessage?.children != null ||
    fullWidth;

  const shellStyle = {
    ["--gs-textarea-min-rows" as string]: String(autosizeConfig.minRows),
    ["--gs-textarea-max-rows" as string]: String(autosizeConfig.maxRows),
  } as CSSProperties;

  const shell = (
    <span
      className={clsx(
        "gs-textarea-shell inline-grid max-w-full gap-2 box-border rounded-gs-xs border border-gs-default bg-gs-surface bg-gs-surface-highlight px-gs-textarea-pad-x py-gs-textarea-pad-y text-gs-textarea-font font-gs-input-font-weight leading-gs-normal text-gs-input-color shadow-gs-surface-sheen transition-[background-color,border-color,box-shadow,opacity] duration-200 ease-gs-standard focus-within:border-gs-focus focus-within:bg-gs-surface-raised focus-within:shadow-gs-input-focus-border has-[.gs-textarea:focus-visible]:shadow-gs-input-surface-focus motion-reduce:transition-none [[data-reduced-motion=true]_&]:transition-none [[data-high-contrast=true]_&]:border [[data-high-contrast=true]_&]:border-gs-input-border [[data-high-contrast=true]_&]:focus-within:border-gs-focus",
        textAreaShellSizeClasses[size],
        fullWidth && "grid w-full",
        isInvalid
          ? "border-gs-error bg-gs-error-subtle focus-within:border-gs-error focus-within:bg-gs-error-subtle focus-within:shadow-gs-input-invalid-border has-[.gs-textarea:focus-visible]:shadow-gs-input-invalid-focus [[data-high-contrast=true]_&]:border-gs-error"
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
      data-autosize={autosizeConfig.enabled ? "true" : undefined}
      data-invalid={isInvalid ? "true" : undefined}
      data-disabled={disabled ? "true" : undefined}
      data-readonly={readOnly ? "true" : undefined}
      data-full-width={fullWidth && !hasFieldChrome ? "true" : undefined}
      style={shellStyle}
    >
      <textarea
        ref={setRefs}
        id={inputId}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        rows={rows ?? autosizeConfig.minRows}
        value={currentValue}
        maxLength={maxLength}
        aria-invalid={isInvalid || undefined}
        aria-describedby={describedBy || undefined}
        className={clsx(
          "gs-textarea m-0 block min-h-[calc(1em*var(--line-height-normal)*var(--gs-textarea-min-rows))] w-full min-w-20 appearance-none box-border border-0 bg-transparent p-0 font-inherit leading-inherit text-inherit caret-gs-border-focus outline-none placeholder:text-gs-input-placeholder placeholder:opacity-100 selection:bg-gs-input-selection selection:text-gs-input-color disabled:cursor-not-allowed disabled:resize-none disabled:[-webkit-text-fill-color:currentcolor] read-only:cursor-default",
          textAreaResizeClasses[resize],
          autosizeConfig.enabled &&
            "max-h-[calc(1em*var(--line-height-normal)*var(--gs-textarea-max-rows))] resize-none overflow-y-auto field-sizing-content",
        )}
        style={style}
        onChange={handleChange}
        onInput={handleInput}
        {...props}
      />
      {showCount ? (
        <span className="gs-textarea-footer flex min-h-gs-font-size-xs items-center justify-end gap-2">
          <span
            className="gs-textarea-count select-none text-xs leading-none text-gs-text-secondary tabular-nums data-[over=true]:text-gs-error"
            data-over={overLimit ? "true" : undefined}
          >
            {count}
            {typeof maxLength === "number" ? `/${maxLength}` : null}
          </span>
        </span>
      ) : null}
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

const TextAreaRoot = forwardRef(TextAreaImpl);
TextAreaRoot.displayName = "TextArea";

const TextAreaLabel = createCompoundSlot<TextAreaLabelProps>("TextArea.Label");
const TextAreaDescription = createCompoundSlot<TextAreaDescriptionProps>(
  "TextArea.Description",
);
const TextAreaErrorMessage = createCompoundSlot<TextAreaErrorMessageProps>(
  "TextArea.ErrorMessage",
);

export const TextArea = Object.assign(TextAreaRoot, {
  Label: TextAreaLabel,
  Description: TextAreaDescription,
  ErrorMessage: TextAreaErrorMessage,
});
