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
  inputFieldClasses,
  inputLabelSizeClasses,
} from "../shared/input-tailwind-classes";
import { FieldChrome, getFieldDescribedBy } from "../shared/field-chrome";
import type {
  TextAreaAutosize,
  TextAreaDescriptionProps,
  TextAreaErrorMessageProps,
  TextAreaLabelProps,
  TextAreaProps,
} from "./TextArea.types";
import {
  textAreaControlClasses,
  textAreaCountClasses,
  textAreaDisabledTextClasses,
  textAreaFieldFullWidthClasses,
  textAreaFooterClasses,
  textAreaShellClasses,
} from "./TextArea.classes";

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
  const {
    controlId: inputId,
    labelId,
    descriptionId,
    errorId,
    describedBy,
  } = getFieldDescribedBy({
    id: id ?? generatedId,
    reactId: generatedId,
    ariaDescribedBy,
    hasDescription: Boolean(description?.children),
    hasError: Boolean(errorMessage?.children),
  });
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
        textAreaShellClasses({
          size,
          invalid: isInvalid,
          disabled: Boolean(disabled),
          readOnly: Boolean(readOnly),
          fullWidth: Boolean(fullWidth),
        }),
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
        className={textAreaControlClasses({
          resize,
          autosize: autosizeConfig.enabled,
        })}
        style={style}
        onChange={handleChange}
        onInput={handleInput}
        {...props}
      />
      {showCount ? (
        <span className={textAreaFooterClasses}>
          <span
            className={textAreaCountClasses}
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
    <FieldChrome
      className={className}
      fieldClassName={inputFieldClasses}
      fullWidth={fullWidth}
      fullWidthClassName={textAreaFieldFullWidthClasses}
      size={size}
      disabled={Boolean(disabled)}
      invalid={isInvalid}
      label={
        label
          ? {
              ...label,
              id: labelId,
              htmlFor: inputId,
              required,
              sizeClassName: inputLabelSizeClasses[size],
              disabledClassName: textAreaDisabledTextClasses,
            }
          : undefined
      }
      description={
        description
          ? {
              ...description,
              id: descriptionId,
              disabledClassName: textAreaDisabledTextClasses,
            }
          : undefined
      }
      errorMessage={
        errorMessage
          ? {
              ...errorMessage,
              id: errorId,
            }
          : undefined
      }
    >
      {shell}
    </FieldChrome>
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
