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
  CheckboxGroupProps,
  CheckboxProps,
  CheckboxSize,
  CheckboxValue,
} from "./Checkbox.types";
import { useComposedRefs } from "../shared/compose-refs";
import {
  subscribeToNothing,
  undefinedSnapshot,
  useSelectionStore,
} from "../shared/use-selection-store";

const checkboxSizeClasses: Record<CheckboxSize, string> = {
  sm: "gap-gs-checkbox-gap-sm text-gs-checkbox-font-size-sm",
  md: "gap-gs-checkbox-gap text-gs-checkbox-font-size",
  lg: "gap-gs-checkbox-gap text-gs-checkbox-font-size-lg",
};

const checkboxBoxSizeClasses: Record<CheckboxSize, string> = {
  sm: "[--gs-checkbox-box:var(--checkbox-size-sm)]",
  md: "[--gs-checkbox-box:var(--checkbox-size)]",
  lg: "[--gs-checkbox-box:var(--checkbox-size-lg)]",
};

const checkboxMarkClasses =
  "gs-checkbox-mark pointer-events-none block size-gs-checkbox-mark-size scale-65 text-current opacity-0 transition-[opacity,transform] duration-200 ease-gs-decelerate motion-reduce:transition-none [[data-reduced-motion=true]_&]:transition-none";

type CheckboxGroupContextValue = {
  setValue: (value: CheckboxValue, checked: boolean) => void;
  subscribe: (listener: () => void) => () => void;
  getValue: () => CheckboxValue[];
  size: CheckboxSize | undefined;
  name: string | undefined;
  form: string | undefined;
  disabled: boolean | undefined;
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

function CheckMark() {
  return (
    <svg
      className={clsx(checkboxMarkClasses, "gs-checkbox-mark-check")}
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
      className={clsx(checkboxMarkClasses, "gs-checkbox-mark-dash absolute")}
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
  const isInvalid = ariaInvalid === true || ariaInvalid === "true";

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
        "gs-checkbox group/checkbox relative -mx-gs-checkbox-hit-x -my-gs-checkbox-hit-y inline-flex min-h-gs-control-hit-target min-w-gs-control-hit-target max-w-full touch-manipulation select-none items-start box-border rounded-gs-checkbox-radius px-gs-checkbox-hit-x py-gs-checkbox-hit-y font-inherit font-normal leading-gs-normal text-gs-text [-webkit-tap-highlight-color:transparent]",
        checkboxSizeClasses[resolvedSize],
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
        aria-invalid={ariaInvalid}
        className="gs-checkbox-input peer pointer-events-none absolute m-0 size-0 opacity-0"
        onChange={handleChange}
      />
      <span
        className={clsx(
          "gs-checkbox-control relative mt-[calc((1lh-var(--gs-checkbox-box))/2)] inline-grid size-gs-checkbox-box shrink-0 place-items-center self-start box-border rounded-gs-checkbox-radius border border-gs-control-border bg-gs-checkbox-bg text-gs-checkbox-mark transition-[background-color,border-color,box-shadow] duration-200 ease-gs-standard peer-checked:[&_.gs-checkbox-mark-check]:scale-100 peer-checked:[&_.gs-checkbox-mark-check]:opacity-100 peer-focus-visible:outline-2 peer-focus-visible:outline-gs-input-focus-ring-color peer-focus-visible:outline-offset-4 motion-reduce:transition-none [[data-reduced-motion=true]_&]:transition-none [[data-high-contrast=true]_&]:border-gs-control-border [[data-high-contrast=true]_&]:border",
          checkboxBoxSizeClasses[resolvedSize],
          indeterminate &&
            "[&_.gs-checkbox-mark-check]:scale-65 [&_.gs-checkbox-mark-check]:opacity-0 [&_.gs-checkbox-mark-dash]:scale-100 [&_.gs-checkbox-mark-dash]:opacity-100",
          isInvalid
            ? "bg-gs-checkbox-bg-invalid peer-checked:border-transparent peer-checked:bg-gs-error peer-data-[indeterminate=true]:border-transparent peer-data-[indeterminate=true]:bg-gs-error peer-focus-visible:bg-gs-error-muted-strong peer-focus-visible:outline-gs-input-focus-ring-color-invalid peer-checked:peer-focus-visible:bg-gs-error peer-data-[indeterminate=true]:peer-focus-visible:bg-gs-error [[data-high-contrast=true]_&]:peer-checked:border-gs-error [[data-high-contrast=true]_&]:peer-data-[indeterminate=true]:border-gs-error"
            : "peer-checked:border-transparent peer-checked:bg-gs-checkbox-bg-checked peer-data-[indeterminate=true]:border-transparent peer-data-[indeterminate=true]:bg-gs-checkbox-bg-checked peer-focus-visible:bg-gs-checkbox-bg-hover peer-checked:peer-focus-visible:bg-gs-checkbox-bg-checked-hover peer-data-[indeterminate=true]:peer-focus-visible:bg-gs-checkbox-bg-checked-hover [[data-high-contrast=true]_&]:peer-checked:border-gs-checkbox-bg-checked [[data-high-contrast=true]_&]:peer-data-[indeterminate=true]:border-gs-checkbox-bg-checked",
          !resolvedDisabled &&
            (isInvalid
              ? ""
              : "group-hover/checkbox:peer-not-checked:peer-not-data-[indeterminate=true]:bg-gs-checkbox-bg-hover group-active/checkbox:peer-not-checked:peer-not-data-[indeterminate=true]:bg-gs-checkbox-bg-active group-hover/checkbox:peer-checked:bg-gs-checkbox-bg-checked-hover group-hover/checkbox:peer-data-[indeterminate=true]:bg-gs-checkbox-bg-checked-hover group-active/checkbox:peer-checked:bg-gs-checkbox-bg-checked-active group-active/checkbox:peer-data-[indeterminate=true]:bg-gs-checkbox-bg-checked-active"),
        )}
        aria-hidden="true"
      >
        <CheckMark />
        <DashMark />
      </span>
      {hasCopy || hasDescription ? (
        <span className="gs-checkbox-copy grid min-w-0 gap-1 text-size-inherit leading-inherit">
          {hasCopy ? (
            <span
              id={labelId}
              className={clsx(
                "gs-checkbox-label block min-w-0 text-size-inherit font-normal leading-inherit text-gs-text",
                resolvedDisabled && "text-gs-text-disabled",
              )}
            >
              {labelContent}
              {required ? (
                <span
                  className="gs-checkbox-required ms-1 text-gs-error"
                  aria-hidden="true"
                >
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
                "gs-checkbox-description text-gs-checkbox-description-size leading-gs-normal text-gs-text-secondary",
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
    ...props
  }: CheckboxGroupProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const groupRef = useRef<HTMLDivElement | null>(null);
  const composedRef = useComposedRefs(groupRef, ref);
  const initialValueRef = useRef(defaultValue ?? []);
  const isControlled = value !== undefined;
  const [currentValue, setValueState] = useControllableState<CheckboxValue[]>({
    value,
    defaultValue: initialValueRef.current,
  });
  const selectionStore = useSelectionStore(currentValue);

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
    };
  }, [disabled, form, name, selectionStore, setGroupValue, size]);

  return (
    <CheckboxGroupContext.Provider value={contextValue}>
      <div
        {...props}
        ref={composedRef}
        className={clsx(
          "gs-checkbox-group flex flex-wrap gap-1 data-[orientation=vertical]:flex-col data-[orientation=vertical]:flex-nowrap data-[orientation=vertical]:items-start data-[orientation=horizontal]:flex-row data-[orientation=horizontal]:items-center data-[orientation=horizontal]:gap-x-gs-space-3 data-[orientation=horizontal]:gap-y-gs-space-1",
          className,
        )}
        data-orientation={orientation}
        data-disabled={disabled ? "true" : undefined}
        role="group"
      >
        {children}
      </div>
    </CheckboxGroupContext.Provider>
  );
}

const CheckboxGroup = forwardRef(CheckboxGroupImpl);

const CheckboxDescription = createCompoundSlot<CheckboxDescriptionProps>(
  "Checkbox.Description",
);

export const Checkbox = Object.assign(forwardRef(CheckboxImpl), {
  Group: CheckboxGroup,
  Description: CheckboxDescription,
});
Checkbox.displayName = "Checkbox";
