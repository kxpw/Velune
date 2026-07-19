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
          className="gs-switch-native sr-only"
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
          "gs-switch group m-0 inline-flex min-h-gs-control-hit-target min-w-gs-control-hit-target max-w-full touch-manipulation select-none items-start gap-gs-switch-gap border-0 bg-transparent p-0 text-start font-inherit text-gs-switch-font-size font-normal leading-gs-normal text-gs-text outline-none [-webkit-tap-highlight-color:transparent]",
          size === "sm" && "text-gs-switch-font-size-sm",
          isDisabled
            ? "cursor-not-allowed opacity-gs-disabled"
            : "cursor-pointer",
          loading && "cursor-progress",
          className,
        )}
        data-size={size}
        data-checked={currentChecked ? "true" : undefined}
        data-loading={loading ? "true" : undefined}
        data-disabled={isDisabled ? "true" : undefined}
        onClick={handleClick}
      >
        <span
          className={clsx(
            "gs-switch-track inline-flex shrink-0 self-start items-center rounded-full bg-gs-switch-bg p-gs-switch-pad [--gs-switch-track-w:var(--switch-track-width)] [--gs-switch-track-h:var(--switch-track-height)] [--gs-switch-thumb:var(--switch-thumb-size)] [--gs-switch-pad:var(--switch-padding)] [--gs-switch-travel:calc(var(--gs-switch-track-w)-var(--gs-switch-thumb)-(var(--gs-switch-pad)*2))] h-gs-switch-track-h w-gs-switch-track-w mt-[calc((1lh-var(--gs-switch-track-h))/2)] transition-colors duration-200 ease-gs-standard motion-reduce:transition-none [[data-reduced-motion=true]_&]:transition-none",
            size === "sm" &&
              "[--gs-switch-track-w:var(--switch-track-width-sm)] [--gs-switch-track-h:var(--switch-track-height-sm)] [--gs-switch-thumb:var(--switch-thumb-size-sm)] [--gs-switch-pad:var(--switch-padding-sm)]",
            currentChecked
              ? isDisabled
                ? "bg-gs-switch-bg-checked"
                : "bg-gs-switch-bg-checked group-hover:bg-gs-switch-bg-checked-hover"
              : !isDisabled && "group-hover:bg-gs-switch-bg-hover",
            currentChecked
              ? "group-focus-visible:bg-gs-switch-bg-checked-hover"
              : "group-focus-visible:bg-gs-switch-bg-hover",
            "group-focus-visible:outline group-focus-visible:outline-2 group-focus-visible:outline-gs-input-focus-ring-color group-focus-visible:outline-offset-4",
          )}
          aria-hidden="true"
        >
          <span
            className={clsx(
              "gs-switch-thumb block size-gs-switch-thumb rounded-full bg-gs-switch-thumb shadow-gs-xs transition-transform duration-200 ease-gs-glide motion-reduce:transition-none [[data-reduced-motion=true]_&]:transition-none",
              currentChecked ? "translate-x-gs-switch-travel" : "translate-x-0",
            )}
          >
            {loading ? (
              <span
                className={clsx(
                  "gs-switch-spinner m-auto block size-7/10 animate-gs-spinner rounded-full border border-[color-mix(in_oklab,var(--color-text)_20%,transparent)] border-t-gs-text-secondary motion-reduce:animate-none [[data-reduced-motion=true]_&]:animate-none",
                  currentChecked &&
                    "border-[color-mix(in_oklab,var(--switch-thumb)_35%,transparent)] border-t-gs-switch-thumb",
                )}
              />
            ) : null}
          </span>
        </span>
        {hasCopy || hasDescription ? (
          <span className="gs-switch-copy grid min-w-0 gap-1 text-size-inherit leading-inherit">
            {hasCopy ? (
              <span
                id={labelId}
                className={clsx(
                  "gs-switch-label block min-w-0 text-size-inherit leading-inherit",
                  isDisabled ? "text-gs-text-disabled" : "text-gs-text",
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
                  "gs-switch-description text-xs font-normal leading-gs-normal",
                  isDisabled
                    ? "text-gs-text-disabled"
                    : "text-gs-text-secondary",
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
