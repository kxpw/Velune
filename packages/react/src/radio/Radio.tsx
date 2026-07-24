import type {
  ChangeEvent,
  ForwardedRef,
  KeyboardEvent,
  ReactNode,
} from "react";
import {
  Children,
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react";
import { useControllableState } from "@velune/hooks";
import { clsx } from "clsx";
import {
  getLinearNavigationIndex,
  resolveLinearNavigation,
  type LinearNavigationIntent,
} from "../shared/keyboard-navigation";
import {
  createCompoundSlot,
  dispatchCompoundSlots,
} from "../shared/compound-slot";
import { useComposedRefs } from "../shared/compose-refs";
import {
  radioClasses,
  radioControlClasses,
  radioCopyClasses,
  radioDescriptionClasses,
  radioDotClasses,
  radioGroupClasses,
  radioGroupDescriptionClasses,
  radioGroupErrorClasses,
  radioGroupFieldClasses,
  radioGroupLabelClasses,
  radioGroupRequiredClasses,
  radioInputClasses,
  radioLabelClasses,
} from "./Radio.classes";
import type {
  RadioDescriptionProps,
  RadioGroupDescriptionProps,
  RadioGroupErrorMessageProps,
  RadioGroupLabelProps,
  RadioGroupProps,
  RadioProps,
  RadioSize,
  RadioValue,
} from "./Radio.types";
import {
  subscribeToNothing,
  undefinedSnapshot,
  useSelectionStore,
} from "../shared/use-selection-store";

type RadioGroupContextValue = {
  name: string;
  setValue: (value: RadioValue) => void;
  subscribe: (listener: () => void) => () => void;
  getValue: () => RadioValue | undefined;
  size?: RadioSize;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
  form?: string;
};

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

function collectRadioContent(children: ReactNode): {
  label: ReactNode;
  description?: RadioDescriptionProps | undefined;
} {
  const label: ReactNode[] = [];
  let description: RadioDescriptionProps | undefined;
  dispatchCompoundSlots(
    children,
    {
      "Radio.Description": (child) => {
        description = child.props as RadioDescriptionProps;
      },
    },
    (child) => label.push(child),
  );
  return { label, description };
}

function collectRadioGroupContent(children: ReactNode): {
  options: ReactNode;
  label?: RadioGroupLabelProps;
  description?: RadioGroupDescriptionProps;
  errorMessage?: RadioGroupErrorMessageProps;
} {
  const composition: {
    options: ReactNode[];
    label?: RadioGroupLabelProps;
    description?: RadioGroupDescriptionProps;
    errorMessage?: RadioGroupErrorMessageProps;
  } = { options: [] };
  dispatchCompoundSlots(
    children,
    {
      "Radio.GroupLabel": (child) => {
        composition.label = child.props as RadioGroupLabelProps;
      },
      "Radio.GroupDescription": (child) => {
        composition.description = child.props as RadioGroupDescriptionProps;
      },
      "Radio.GroupErrorMessage": (child) => {
        composition.errorMessage = child.props as RadioGroupErrorMessageProps;
      },
    },
    (child) => composition.options.push(child),
  );
  return composition;
}

function RadioImpl(
  {
    value,
    size,
    className,
    children,
    checked,
    defaultChecked,
    disabled,
    name,
    form,
    required,
    onChange,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    "aria-describedby": ariaDescribedBy,
    "aria-invalid": ariaInvalid,
    ...props
  }: RadioProps,
  ref: ForwardedRef<HTMLInputElement>,
) {
  const { label: labelContent, description } = collectRadioContent(children);
  const group = useContext(RadioGroupContext);
  const generatedLabelId = useId();
  const generatedDescriptionId = useId();
  const resolvedSize = size ?? group?.size ?? "md";
  const resolvedDisabled = Boolean(disabled || group?.disabled);
  const resolvedName = name ?? group?.name;
  const resolvedForm = form ?? group?.form;
  const resolvedRequired = Boolean(required || group?.required);
  const groupChecked = useSyncExternalStore(
    group?.subscribe ?? subscribeToNothing,
    group && value !== undefined
      ? () => group.getValue() === value
      : undefinedSnapshot,
    group && value !== undefined
      ? () => group.getValue() === value
      : undefinedSnapshot,
  );
  const isChecked = groupChecked ?? checked;
  const isInvalid =
    ariaInvalid === true || ariaInvalid === "true" || Boolean(group?.invalid);
  const dataState = isChecked ? "checked" : "unchecked";

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

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (group && value !== undefined && event.currentTarget.checked) {
      group.setValue(value);
    }
    onChange?.(event);
  };

  return (
    <label
      className={clsx(
        radioClasses({ size: resolvedSize, disabled: resolvedDisabled }),
        className,
      )}
      data-size={resolvedSize}
      data-state={dataState}
      data-disabled={resolvedDisabled ? "true" : undefined}
      data-invalid={isInvalid ? "true" : undefined}
    >
      <input
        {...props}
        ref={ref}
        type="radio"
        name={resolvedName}
        form={resolvedForm}
        value={value}
        checked={group ? groupChecked : checked}
        defaultChecked={group ? undefined : defaultChecked}
        disabled={resolvedDisabled}
        required={resolvedRequired}
        aria-checked={undefined}
        aria-label={ariaLabel}
        aria-labelledby={resolvedLabelledBy}
        aria-describedby={describedBy || undefined}
        aria-invalid={isInvalid || undefined}
        className={radioInputClasses}
        onChange={handleChange}
      />
      <span
        className={radioControlClasses({
          size: resolvedSize,
          invalid: isInvalid,
          disabled: resolvedDisabled,
        })}
        aria-hidden="true"
      >
        <span className={radioDotClasses} />
      </span>
      {hasCopy || hasDescription ? (
        <span className={radioCopyClasses}>
          {hasCopy ? (
            <span id={labelId} className={radioLabelClasses(resolvedDisabled)}>
              {labelContent}
            </span>
          ) : null}
          {hasDescription ? (
            <span
              {...description}
              id={descriptionId}
              className={clsx(
                radioDescriptionClasses(resolvedDisabled),
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

function RadioGroupImpl(
  {
    name,
    form,
    value,
    defaultValue,
    onValueChange,
    size,
    orientation = "vertical",
    dir = "ltr",
    loop = true,
    disabled,
    required,
    className,
    children,
    onKeyDown,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    "aria-describedby": ariaDescribedBy,
    "aria-invalid": ariaInvalid,
    ...props
  }: RadioGroupProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const { options, label, description, errorMessage } =
    collectRadioGroupContent(children);
  const generatedName = useId();
  const labelId = useId();
  const descriptionId = useId();
  const errorId = useId();
  const groupRef = useRef<HTMLDivElement | null>(null);
  const composedGroupRef = useComposedRefs(groupRef, ref);
  const initialValueRef = useRef(defaultValue);
  const isControlled = value !== undefined;
  const [currentValue, setValueState] = useControllableState<
    RadioValue | undefined
  >({
    value,
    defaultValue,
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

  const setValue = useCallback(
    (nextValue: RadioValue) => {
      if (!isControlled) {
        selectionStore.setSnapshot(nextValue, true);
      }
      setValueState(nextValue);
      onValueChange?.(nextValue);
    },
    [isControlled, onValueChange, selectionStore, setValueState],
  );

  const contextValue = useMemo<RadioGroupContextValue>(() => {
    const next: RadioGroupContextValue = {
      name: name ?? generatedName,
      setValue,
      subscribe: selectionStore.subscribe,
      getValue: selectionStore.getSnapshot,
    };
    if (form !== undefined) {
      next.form = form;
    }
    if (size !== undefined) {
      next.size = size;
    }
    if (disabled !== undefined) {
      next.disabled = disabled;
    }
    if (required !== undefined) {
      next.required = required;
    }
    if (isInvalid) {
      next.invalid = true;
    }
    return next;
  }, [
    disabled,
    form,
    generatedName,
    isInvalid,
    name,
    required,
    selectionStore,
    setValue,
    size,
  ]);

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

  /** Keep native radio behavior within the group's orientation and direction. */
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (
      disabled ||
      event.defaultPrevented ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey
    ) {
      return;
    }

    const active = document.activeElement;
    if (
      !(active instanceof HTMLInputElement) ||
      active.type !== "radio" ||
      event.target !== active ||
      !groupRef.current?.contains(active)
    ) {
      return;
    }

    const intent =
      event.key === "PageUp"
        ? "first"
        : event.key === "PageDown"
          ? "last"
          : resolveLinearNavigation(event.key, orientation, dir);
    const isArrowKey = [
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
    ].includes(event.key);

    if (!intent) {
      // Native radios respond to every arrow key. Prevent cross-axis movement
      // so the public orientation remains authoritative.
      if (isArrowKey) {
        event.preventDefault();
      }
      return;
    }

    event.preventDefault();
    const enabledRadios = Array.from(
      groupRef.current.querySelectorAll<HTMLInputElement>(
        'input[type="radio"]:not(:disabled)',
      ),
    );
    const currentIndex = enabledRadios.indexOf(active);
    if (currentIndex < 0) {
      return;
    }

    const targetIndex = getLinearNavigationIndex(
      currentIndex,
      enabledRadios.length,
      intent as LinearNavigationIntent,
      loop,
    );

    const target =
      targetIndex === null ? undefined : enabledRadios[targetIndex];
    if (!target || target === active) {
      return;
    }

    target.focus();
    target.click();
  };

  const group = (
    <div
      {...props}
      ref={composedGroupRef}
      className={clsx(radioGroupClasses, className)}
      data-orientation={orientation}
      data-disabled={disabled ? "true" : undefined}
      data-invalid={isInvalid ? "true" : undefined}
      role="radiogroup"
      aria-label={ariaLabel}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy || undefined}
      aria-required={required || undefined}
      aria-orientation={orientation}
      aria-disabled={disabled || undefined}
      aria-invalid={isInvalid || undefined}
      dir={dir}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        handleKeyDown(event);
      }}
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
      <RadioGroupContext.Provider value={contextValue}>
        {group}
      </RadioGroupContext.Provider>
    );
  }

  return (
    <RadioGroupContext.Provider value={contextValue}>
      <div
        className={clsx(radioGroupFieldClasses)}
        data-disabled={disabled ? "true" : undefined}
        data-invalid={isInvalid ? "true" : undefined}
      >
        {label?.children != null && label.children !== false ? (
          <div
            {...label}
            className={clsx(radioGroupLabelClasses, label.className)}
            id={labelId}
          >
            {label.children}
            {required ? (
              <span className={radioGroupRequiredClasses} aria-hidden="true">
                *
              </span>
            ) : null}
          </div>
        ) : null}
        {group}
        {errorMessage?.children ? (
          <p
            {...errorMessage}
            className={clsx(radioGroupErrorClasses, errorMessage.className)}
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
              radioGroupDescriptionClasses,
              description.className,
            )}
            id={descriptionId}
          >
            {description.children}
          </p>
        ) : null}
      </div>
    </RadioGroupContext.Provider>
  );
}

const RadioGroup = forwardRef(RadioGroupImpl);
RadioGroup.displayName = "Radio.Group";

const RadioDescription =
  createCompoundSlot<RadioDescriptionProps>("Radio.Description");
const RadioGroupLabel =
  createCompoundSlot<RadioGroupLabelProps>("Radio.GroupLabel");
const RadioGroupDescription = createCompoundSlot<RadioGroupDescriptionProps>(
  "Radio.GroupDescription",
);
const RadioGroupErrorMessage = createCompoundSlot<RadioGroupErrorMessageProps>(
  "Radio.GroupErrorMessage",
);

const RadioGroupRoot = Object.assign(RadioGroup, {
  Label: RadioGroupLabel,
  Description: RadioGroupDescription,
  ErrorMessage: RadioGroupErrorMessage,
});

export const Radio = Object.assign(forwardRef(RadioImpl), {
  Group: RadioGroupRoot,
  Description: RadioDescription,
});
Radio.displayName = "Radio";
