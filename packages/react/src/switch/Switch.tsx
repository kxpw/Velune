import type { ForwardedRef, MouseEvent, ReactNode } from "react";
import { Children, forwardRef, useEffect, useId, useRef } from "react";
import { useControllableState } from "@velune/hooks";
import { clsx } from "clsx";
import { useComposedRefs } from "../shared/compose-refs";
import {
  createCompoundSlot,
  dispatchCompoundSlots,
} from "../shared/compound-slot";
import type { SwitchDescriptionProps, SwitchProps } from "./Switch.types";
import {
  switchClasses,
  switchCopyClasses,
  switchDescriptionClasses,
  switchLabelClasses,
  switchNativeClasses,
  switchSpinnerClasses,
  switchThumbClasses,
  switchTrackClasses,
} from "./Switch.classes";

function collectSwitchContent(children: ReactNode): {
  label: ReactNode;
  description?: SwitchDescriptionProps | undefined;
} {
  const label: ReactNode[] = [];
  let description: SwitchDescriptionProps | undefined;
  dispatchCompoundSlots(
    children,
    {
      "Switch.Description": (child) => {
        description = child.props as SwitchDescriptionProps;
      },
    },
    (child) => label.push(child),
  );
  return { label, description };
}

function SwitchImpl(
  {
    checked,
    defaultChecked = false,
    onCheckedChange,
    onClick,
    name,
    value = "on",
    required,
    form,
    size = "md",
    loading = false,
    disabled,
    className,
    children,
    id,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    "aria-describedby": ariaDescribedBy,
    ...props
  }: SwitchProps,
  ref: ForwardedRef<HTMLButtonElement>,
) {
  const { label: labelContent, description } = collectSwitchContent(children);
  const generatedLabelId = useId();
  const generatedDescriptionId = useId();
  const isControlled = checked !== undefined;
  const [currentChecked, setCheckedState] = useControllableState({
    value: checked,
    defaultValue: defaultChecked,
  });
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const nativeInputRef = useRef<HTMLInputElement | null>(null);
  const initialCheckedRef = useRef(defaultChecked);
  const isDisabled = Boolean(disabled || loading);
  const hasNativeControl = Boolean(name || required);

  useEffect(() => {
    if (isControlled) {
      return;
    }
    const associatedForm = nativeInputRef.current?.form;
    if (!associatedForm) {
      return;
    }
    const handleReset = () => setCheckedState(initialCheckedRef.current);
    associatedForm.addEventListener("reset", handleReset);
    return () => associatedForm.removeEventListener("reset", handleReset);
  }, [form, hasNativeControl, isControlled, setCheckedState]);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) {
      return;
    }
    if (isDisabled) {
      return;
    }
    const nextChecked = !currentChecked;
    setCheckedState(nextChecked);
    onCheckedChange?.(nextChecked);
    queueMicrotask(() => {
      nativeInputRef.current?.dispatchEvent(
        new Event("change", { bubbles: true }),
      );
    });
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

  const composedRef = useComposedRefs(buttonRef, ref);

  return (
    <>
      {hasNativeControl ? (
        <input
          ref={nativeInputRef}
          className={switchNativeClasses}
          type="checkbox"
          name={name}
          value={value}
          checked={currentChecked}
          required={required}
          disabled={isDisabled}
          form={form}
          tabIndex={-1}
          aria-hidden="true"
          readOnly
          onInvalid={() => buttonRef.current?.focus()}
        />
      ) : null}
      <button
        {...props}
        ref={composedRef}
        id={id}
        type="button"
        role="switch"
        aria-checked={currentChecked}
        aria-label={ariaLabel}
        aria-labelledby={resolvedLabelledBy}
        aria-describedby={describedBy || undefined}
        aria-busy={loading || undefined}
        aria-required={required || undefined}
        disabled={isDisabled}
        className={clsx(
          switchClasses({ size, disabled: isDisabled, loading }),
          className,
        )}
        data-size={size}
        data-checked={currentChecked ? "true" : undefined}
        data-loading={loading ? "true" : undefined}
        data-disabled={isDisabled ? "true" : undefined}
        onClick={handleClick}
      >
        <span
          className={switchTrackClasses({
            size,
            checked: currentChecked,
            disabled: isDisabled,
          })}
          aria-hidden="true"
        >
          <span className={switchThumbClasses(currentChecked)}>
            {loading ? (
              <span className={switchSpinnerClasses(currentChecked)} />
            ) : null}
          </span>
        </span>
        {hasCopy || hasDescription ? (
          <span className={switchCopyClasses}>
            {hasCopy ? (
              <span id={labelId} className={switchLabelClasses(isDisabled)}>
                {labelContent}
              </span>
            ) : null}
            {hasDescription ? (
              <span
                {...description}
                id={descriptionId}
                className={clsx(
                  switchDescriptionClasses(isDisabled),
                  description?.className,
                )}
              >
                {description?.children}
              </span>
            ) : null}
          </span>
        ) : null}
      </button>
    </>
  );
}

const SwitchRoot = forwardRef(SwitchImpl);
SwitchRoot.displayName = "Switch";

const SwitchDescription =
  createCompoundSlot<SwitchDescriptionProps>("Switch.Description");

export const Switch = Object.assign(SwitchRoot, {
  Description: SwitchDescription,
});
