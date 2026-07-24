import type { ChangeEvent, ForwardedRef, ReactNode } from "react";
import {
  Children,
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useId,
  useCallback,
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react";
import { useControllableState } from "@velune/hooks";
import { clsx } from "clsx";
import {
  createCompoundSlot,
  dispatchCompoundSlots,
} from "../shared/compound-slot";
import type {
  CheckboxDescriptionProps,
  CheckboxGroupDescriptionProps,
  CheckboxGroupErrorMessageProps,
  CheckboxGroupLabelProps,
  CheckboxGroupProps,
  CheckboxProps,
  CheckboxSize,
  CheckboxValue,
} from "./Checkbox.types";
import {
  checkboxClasses,
  checkboxControlClasses,
  checkboxCopyClasses,
  checkboxDescriptionClasses,
  checkboxGroupClasses,
  checkboxGroupDescriptionClasses,
  checkboxGroupErrorClasses,
  checkboxGroupFieldClasses,
  checkboxGroupLabelClasses,
  checkboxInputClasses,
  checkboxLabelClasses,
  checkboxMarkClasses,
  checkboxRequiredClasses,
} from "./Checkbox.classes";
import { useComposedRefs } from "../shared/compose-refs";
import {
  subscribeToNothing,
  undefinedSnapshot,
  useSelectionStore,
} from "../shared/use-selection-store";

type CheckboxGroupContextValue = {
  setValue: (value: CheckboxValue, checked: boolean) => void;
  subscribe: (listener: () => void) => () => void;
  getValue: () => CheckboxValue[];
  size: CheckboxSize | undefined;
  name: string | undefined;
  form: string | undefined;
  disabled: boolean | undefined;
  invalid: boolean | undefined;
};

const CheckboxGroupContext = createContext<CheckboxGroupContextValue | null>(
  null,
);

function collectCheckboxContent(children: ReactNode): {
  label: ReactNode;
  description?: CheckboxDescriptionProps | undefined;
} {
  const label: ReactNode[] = [];
  let description: CheckboxDescriptionProps | undefined;
  dispatchCompoundSlots(
    children,
    {
      "Checkbox.Description": (child) => {
        description = child.props as CheckboxDescriptionProps;
      },
    },
    (child) => label.push(child),
  );
  return { label, description };
}

function collectCheckboxGroupContent(children: ReactNode): {
  options: ReactNode;
  label?: CheckboxGroupLabelProps;
  description?: CheckboxGroupDescriptionProps;
  errorMessage?: CheckboxGroupErrorMessageProps;
} {
  const composition: {
    options: ReactNode[];
    label?: CheckboxGroupLabelProps;
    description?: CheckboxGroupDescriptionProps;
    errorMessage?: CheckboxGroupErrorMessageProps;
  } = { options: [] };
  dispatchCompoundSlots(
    children,
    {
      "Checkbox.GroupLabel": (child) => {
        composition.label = child.props as CheckboxGroupLabelProps;
      },
      "Checkbox.GroupDescription": (child) => {
        composition.description = child.props as CheckboxGroupDescriptionProps;
      },
      "Checkbox.GroupErrorMessage": (child) => {
        composition.errorMessage =
          child.props as CheckboxGroupErrorMessageProps;
      },
    },
    (child) => composition.options.push(child),
  );
  return composition;
}

function CheckMark() {
  return (
    <svg
      className={clsx(checkboxMarkClasses, "gs-on-primary-check")}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M3.25 8.25L6.5 11.4L12.75 4.6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DashMark() {
  return (
    <svg
      className={clsx(checkboxMarkClasses, "gs-on-primary-dash absolute")}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M4 8H12"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
      />
    </svg>
  );
}

function resolveDataState(
  indeterminate: boolean,
  checked: boolean | undefined,
): "checked" | "unchecked" | "indeterminate" {
  if (indeterminate) {
    return "indeterminate";
  }
  if (checked) {
    return "checked";
  }
  return "unchecked";
}

function CheckboxImpl(
  {
    value,
    size,
    indeterminate = false,
    className,
    children,
    checked,
    defaultChecked,
    disabled,
    required,
    name,
    form,
    onChange,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    "aria-describedby": ariaDescribedBy,
    "aria-invalid": ariaInvalid,
    ...props
  }: CheckboxProps,
  ref: ForwardedRef<HTMLInputElement>,
) {
  const { label: labelContent, description } = collectCheckboxContent(children);
  const group = useContext(CheckboxGroupContext);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const generatedLabelId = useId();
  const generatedDescriptionId = useId();
  const composedRef = useComposedRefs(inputRef, ref);
  const resolvedSize = size ?? group?.size ?? "md";
  const resolvedDisabled = Boolean(disabled || group?.disabled);
  const resolvedName = name ?? group?.name;
  const resolvedForm = form ?? group?.form;
  const groupChecked = useSyncExternalStore(
    group?.subscribe ?? subscribeToNothing,
    value !== undefined && group
      ? () => group.getValue().includes(value)
      : undefinedSnapshot,
    value !== undefined && group
      ? () => group.getValue().includes(value)
      : undefinedSnapshot,
  );
  const isChecked = groupChecked ?? checked;
  const isInvalid =
    ariaInvalid === true || ariaInvalid === "true" || Boolean(group?.invalid);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate, isChecked]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (group && value !== undefined) {
      group.setValue(value, event.currentTarget.checked);
    }
    onChange?.(event);
  };

  const hasCopy = Children.count(labelContent) > 0;
  const hasDescription =
    description?.children != null && description.children !== false;
  const labelId = hasCopy ? generatedLabelId : undefined;
  const descriptionId = hasDescription
    ? description.id || generatedDescriptionId
    : undefined;
  const describedBy = [ariaDescribedBy, descriptionId]
    .filter(Boolean)
    .join(" ");
  const resolvedLabelledBy =
    ariaLabelledBy ?? (ariaLabel === undefined ? labelId : undefined);
  const dataState = resolveDataState(indeterminate, isChecked);

  return (
    <label
      className={clsx(
        checkboxClasses({ size: resolvedSize, disabled: resolvedDisabled }),
        className,
      )}
      data-size={resolvedSize}
      data-state={dataState}
      data-disabled={resolvedDisabled ? "true" : undefined}
      data-invalid={isInvalid ? "true" : undefined}
    >
      <input
        {...props}
        ref={composedRef}
        type="checkbox"
        value={value}
        name={resolvedName}
        form={resolvedForm}
        checked={group ? groupChecked : checked}
        defaultChecked={group ? undefined : defaultChecked}
        disabled={resolvedDisabled}
        required={required}
        data-indeterminate={indeterminate ? "true" : undefined}
        aria-checked={indeterminate ? "mixed" : isChecked}
        aria-label={ariaLabel}
        aria-labelledby={resolvedLabelledBy}
        aria-describedby={describedBy || undefined}
        aria-invalid={ariaInvalid ?? (isInvalid || undefined)}
        className={checkboxInputClasses}
        onChange={handleChange}
      />
      <span
        className={checkboxControlClasses({
          size: resolvedSize,
          indeterminate,
          invalid: isInvalid,
          disabled: resolvedDisabled,
        })}
        aria-hidden="true"
      >
        <CheckMark />
        <DashMark />
      </span>
      {hasCopy || hasDescription ? (
        <span className={checkboxCopyClasses}>
          {hasCopy ? (
            <span
              id={labelId}
              className={checkboxLabelClasses(resolvedDisabled)}
            >
              {labelContent}
              {required ? (
                <span className={checkboxRequiredClasses} aria-hidden="true">
                  *
                </span>
              ) : null}
            </span>
          ) : null}
          {hasDescription ? (
            <span
              {...description}
              id={descriptionId}
              className={clsx(
                checkboxDescriptionClasses(resolvedDisabled),
                description?.className,
              )}
            >
              {description?.children}
            </span>
          ) : null}
        </span>
      ) : null}
    </label>
  );
}

function CheckboxGroupImpl(
  {
    value,
    defaultValue,
    onValueChange,
    name,
    form,
    size,
    orientation = "vertical",
    disabled,
    className,
    children,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    "aria-describedby": ariaDescribedBy,
    "aria-invalid": ariaInvalid,
    ...props
  }: CheckboxGroupProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const { options, label, description, errorMessage } =
    collectCheckboxGroupContent(children);
  const labelId = useId();
  const descriptionId = useId();
  const errorId = useId();
  const groupRef = useRef<HTMLDivElement | null>(null);
  const composedRef = useComposedRefs(groupRef, ref);
  const initialValueRef = useRef(defaultValue ?? []);
  const isControlled = value !== undefined;
  const [currentValue, setValueState] = useControllableState<CheckboxValue[]>({
    value,
    defaultValue: initialValueRef.current,
  });
  const selectionStore = useSelectionStore(currentValue);
  const isInvalid =
    ariaInvalid === true ||
    ariaInvalid === "true" ||
    Boolean(errorMessage?.children);

  useEffect(() => {
    if (isControlled) {
      return;
    }
    const associatedForm = form
      ? document.getElementById(form)
      : groupRef.current?.closest("form");
    if (!(associatedForm instanceof HTMLFormElement)) {
      return;
    }
    const handleReset = () => setValueState(initialValueRef.current);
    associatedForm.addEventListener("reset", handleReset);
    return () => associatedForm.removeEventListener("reset", handleReset);
  }, [form, isControlled, setValueState]);

  const setGroupValue = useCallback(
    (nextValue: CheckboxValue, checkedNext: boolean) => {
      const previousValues = selectionStore.getSnapshot();
      const includesValue = previousValues.includes(nextValue);
      if (includesValue === checkedNext) {
        return;
      }
      const nextValues = checkedNext
        ? [...previousValues, nextValue]
        : previousValues.filter((item) => item !== nextValue);
      selectionStore.setSnapshot(nextValues, !isControlled);
      setValueState(nextValues);
      onValueChange?.(nextValues);
    },
    [isControlled, onValueChange, selectionStore, setValueState],
  );

  const contextValue = useMemo<CheckboxGroupContextValue>(() => {
    return {
      setValue: setGroupValue,
      subscribe: selectionStore.subscribe,
      getValue: selectionStore.getSnapshot,
      size,
      name,
      form,
      disabled,
      invalid: isInvalid || undefined,
    };
  }, [disabled, form, isInvalid, name, selectionStore, setGroupValue, size]);

  const labelledBy =
    ariaLabelledBy ??
    (ariaLabel === undefined && label?.children != null ? labelId : undefined);
  const describedBy = [
    ariaDescribedBy,
    description?.children ? descriptionId : null,
    errorMessage?.children ? errorId : null,
  ]
    .filter(Boolean)
    .join(" ");

  const group = (
    <div
      {...props}
      ref={composedRef}
      className={clsx(checkboxGroupClasses, className)}
      data-orientation={orientation}
      data-disabled={disabled ? "true" : undefined}
      data-invalid={isInvalid ? "true" : undefined}
      role="group"
      aria-label={ariaLabel}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy || undefined}
      aria-invalid={isInvalid || undefined}
    >
      {options}
    </div>
  );

  if (
    label?.children == null &&
    description?.children == null &&
    errorMessage?.children == null
  ) {
    return (
      <CheckboxGroupContext.Provider value={contextValue}>
        {group}
      </CheckboxGroupContext.Provider>
    );
  }

  return (
    <CheckboxGroupContext.Provider value={contextValue}>
      <div
        className={checkboxGroupFieldClasses}
        data-disabled={disabled ? "true" : undefined}
        data-invalid={isInvalid ? "true" : undefined}
      >
        {label?.children != null && label.children !== false ? (
          <div
            {...label}
            className={clsx(checkboxGroupLabelClasses, label.className)}
            id={labelId}
          >
            {label.children}
          </div>
        ) : null}
        {group}
        {errorMessage?.children ? (
          <p
            {...errorMessage}
            className={clsx(checkboxGroupErrorClasses, errorMessage.className)}
            id={errorId}
            role="alert"
          >
            {errorMessage.children}
          </p>
        ) : null}
        {description?.children ? (
          <p
            {...description}
            className={clsx(
              checkboxGroupDescriptionClasses,
              description.className,
            )}
            id={descriptionId}
          >
            {description.children}
          </p>
        ) : null}
      </div>
    </CheckboxGroupContext.Provider>
  );
}

const CheckboxGroup = forwardRef(CheckboxGroupImpl);
CheckboxGroup.displayName = "Checkbox.Group";

const CheckboxDescription = createCompoundSlot<CheckboxDescriptionProps>(
  "Checkbox.Description",
);
const CheckboxGroupLabel = createCompoundSlot<CheckboxGroupLabelProps>(
  "Checkbox.GroupLabel",
);
const CheckboxGroupDescription =
  createCompoundSlot<CheckboxGroupDescriptionProps>(
    "Checkbox.GroupDescription",
  );
const CheckboxGroupErrorMessage =
  createCompoundSlot<CheckboxGroupErrorMessageProps>(
    "Checkbox.GroupErrorMessage",
  );

const CheckboxGroupRoot = Object.assign(CheckboxGroup, {
  Label: CheckboxGroupLabel,
  Description: CheckboxGroupDescription,
  ErrorMessage: CheckboxGroupErrorMessage,
});

export const Checkbox = Object.assign(forwardRef(CheckboxImpl), {
  Group: CheckboxGroupRoot,
  Description: CheckboxDescription,
});
Checkbox.displayName = "Checkbox";
