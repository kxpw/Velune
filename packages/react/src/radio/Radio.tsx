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

const radioSizeClasses: Record<RadioSize, string> = {
  sm: "gap-gs-radio-gap-sm text-gs-radio-font-size-sm",
  md: "gap-gs-radio-gap text-gs-radio-font-size",
  lg: "gap-gs-radio-gap text-gs-radio-font-size-lg",
};

const radioBoxSizeClasses: Record<RadioSize, string> = {
  sm: "[--gs-radio-box:var(--radio-size-sm)]",
  md: "[--gs-radio-box:var(--radio-size)]",
  lg: "[--gs-radio-box:var(--radio-size-lg)]",
};

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
        "gs-radio group/radio relative -mx-gs-radio-hit-x -my-gs-radio-hit-y inline-flex min-h-gs-control-hit-target min-w-gs-control-hit-target max-w-full touch-manipulation select-none items-start box-border rounded-gs-md px-gs-radio-hit-x py-gs-radio-hit-y font-inherit font-normal leading-gs-normal text-gs-text [-webkit-tap-highlight-color:transparent]",
        radioSizeClasses[resolvedSize],
        resolvedDisabled
          ? "cursor-not-allowed opacity-gs-disabled"
          : "cursor-pointer",
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
        className="gs-radio-input peer pointer-events-none absolute m-0 size-0 opacity-0"
        onChange={handleChange}
      />
      <span
        className={clsx(
          "gs-radio-control relative mt-[calc((1lh-var(--gs-radio-box))/2)] inline-grid size-gs-radio-box shrink-0 place-items-center self-start box-border rounded-full border border-gs-control-border bg-gs-radio-bg text-gs-radio-dot-color shadow-none transition-[background-color,border-color,box-shadow,color] duration-200 ease-gs-standard peer-checked:[&_.gs-radio-dot]:scale-100 peer-checked:[&_.gs-radio-dot]:opacity-100 peer-focus-visible:outline-2 peer-focus-visible:outline-gs-input-focus-ring-color peer-focus-visible:outline-offset-4 motion-reduce:transition-none [[data-reduced-motion=true]_&]:transition-none [[data-high-contrast=true]_&]:border-gs-control-border [[data-high-contrast=true]_&]:border [[data-high-contrast=true]_&]:peer-focus-visible:outline-gs-border-focus",
          radioBoxSizeClasses[resolvedSize],
          isInvalid
            ? "border-gs-radio-ring-invalid bg-gs-radio-bg-invalid peer-checked:border-gs-radio-ring-invalid peer-checked:bg-gs-radio-ring-invalid peer-checked:text-gs-radio-dot-color-invalid peer-focus-visible:bg-gs-error-muted peer-focus-visible:outline-gs-input-focus-ring-color-invalid peer-checked:peer-focus-visible:border-gs-radio-ring-invalid peer-checked:peer-focus-visible:bg-gs-radio-ring-invalid peer-checked:peer-focus-visible:text-gs-radio-dot-color-invalid"
            : "peer-checked:border-gs-radio-bg-checked peer-checked:bg-gs-radio-bg-checked peer-checked:text-gs-radio-dot-color peer-focus-visible:bg-gs-radio-bg-hover peer-checked:peer-focus-visible:border-gs-radio-bg-checked-hover peer-checked:peer-focus-visible:bg-gs-radio-bg-checked-hover peer-checked:peer-focus-visible:text-gs-radio-dot-color-hover [[data-high-contrast=true]_&]:peer-checked:border-gs-radio-bg-checked",
          !resolvedDisabled &&
            !isInvalid &&
            "group-hover/radio:peer-not-checked:bg-gs-radio-bg-hover group-active/radio:peer-not-checked:bg-gs-radio-bg-active group-hover/radio:peer-checked:border-gs-radio-bg-checked-hover group-hover/radio:peer-checked:bg-gs-radio-bg-checked-hover group-hover/radio:peer-checked:text-gs-radio-dot-color-hover group-active/radio:peer-checked:border-gs-radio-bg-checked-active group-active/radio:peer-checked:bg-gs-radio-bg-checked-active group-active/radio:peer-checked:text-gs-radio-dot-color-hover",
        )}
        aria-hidden="true"
      >
        <span className="gs-radio-dot pointer-events-none block size-gs-radio-dot-size scale-20 rounded-full bg-current opacity-0 transition-[opacity,transform] duration-200 ease-gs-decelerate motion-reduce:transition-none [[data-reduced-motion=true]_&]:transition-none" />
      </span>
      {hasCopy || hasDescription ? (
        <span className="gs-radio-copy grid min-w-0 gap-1 text-size-inherit leading-inherit">
          {hasCopy ? (
            <span
              id={labelId}
              className={clsx(
                "gs-radio-label block min-w-0 text-size-inherit font-normal leading-inherit text-gs-text",
                resolvedDisabled && "text-gs-text-disabled",
              )}
            >
              {labelContent}
            </span>
          ) : null}
          {hasDescription ? (
            <span
              {...description}
              id={descriptionId}
              className={clsx(
                "gs-radio-description text-gs-radio-description-size font-normal leading-gs-normal text-gs-text-secondary",
                resolvedDisabled && "text-gs-text-disabled",
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
      className={clsx(
        "gs-radio-group flex flex-wrap gap-1 data-[orientation=vertical]:flex-col data-[orientation=vertical]:flex-nowrap data-[orientation=vertical]:items-start data-[orientation=horizontal]:flex-row data-[orientation=horizontal]:items-start data-[orientation=horizontal]:gap-x-gs-space-4 data-[orientation=horizontal]:gap-y-gs-space-1 data-[disabled=true]:opacity-gs-disabled data-[disabled=true]:[&_.gs-radio[data-disabled=true]]:opacity-100",
        className,
      )}
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
        className={clsx("gs-radio-group-field grid max-w-full gap-2")}
        data-disabled={disabled ? "true" : undefined}
        data-invalid={isInvalid ? "true" : undefined}
      >
        {label?.children != null && label.children !== false ? (
          <div
            {...label}
            className={clsx(
              "gs-radio-group-label m-0 inline-flex items-baseline gap-1 text-sm font-medium leading-gs-normal text-gs-text",
              label.className,
            )}
            id={labelId}
          >
            {label.children}
            {required ? (
              <span
                className="gs-radio-group-required font-medium text-gs-error"
                aria-hidden="true"
              >
                *
              </span>
            ) : null}
          </div>
        ) : null}
        {group}
        {errorMessage?.children ? (
          <p
            {...errorMessage}
            className={clsx(
              "gs-radio-group-error m-0 text-xs leading-gs-normal text-gs-error",
              errorMessage.className,
            )}
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
              "gs-radio-group-description m-0 text-xs leading-gs-normal text-gs-text-secondary",
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
