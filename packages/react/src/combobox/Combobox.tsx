import type {
  ChangeEvent,
  FocusEvent,
  ForwardedRef,
  KeyboardEvent,
  ReactNode,
} from "react";
import { forwardRef, useEffect, useId, useMemo, useRef, useState } from "react";
import { useControllableState } from "@velune/hooks";
import { clsx } from "clsx";
import type { InputSize } from "../input";
import {
  createCompoundSlot,
  dispatchCompoundSlots,
  omitCompoundSlotProps,
} from "../shared/compound-slot";
import { useComposedRefs } from "../shared/compose-refs";
import { findEnabledIndex } from "../shared/keyboard-navigation";
import {
  inputDescriptionClasses,
  inputErrorClasses,
  inputFieldClasses,
  inputLabelClasses,
  inputRequiredClasses,
} from "../shared/input-tailwind-classes";
import { popEscapeLayer, pushEscapeLayer } from "../shared/overlay-stack";
import { Portal } from "../shared/portal";
import { useFloatingPosition } from "../shared/use-floating-position";
import type {
  ComboboxDescriptionProps,
  ComboboxEmptyProps,
  ComboboxErrorMessageProps,
  ComboboxItemProps,
  ComboboxLabelProps,
  ComboboxNoMatchesProps,
  ComboboxProps,
  ComboboxValue,
} from "./Combobox.types";

type ComboboxOption = {
  value: ComboboxValue;
  label: ReactNode;
  disabled: boolean;
  searchText: string;
  slotProps: ComboboxItemProps;
};

type ComboboxComposition = {
  options: ComboboxOption[];
  label?: ComboboxLabelProps;
  description?: ComboboxDescriptionProps;
  errorMessage?: ComboboxErrorMessageProps;
  empty?: ComboboxEmptyProps;
  noMatches?: ComboboxNoMatchesProps;
};

function labelToText(label: ReactNode): string {
  return typeof label === "string" || typeof label === "number"
    ? String(label)
    : "";
}

function collectComboboxComposition(children: ReactNode): ComboboxComposition {
  const composition: ComboboxComposition = { options: [] };
  dispatchCompoundSlots(children, {
    "Combobox.Label": (child) => {
      composition.label = child.props as ComboboxLabelProps;
    },
    "Combobox.Description": (child) => {
      composition.description = child.props as ComboboxDescriptionProps;
    },
    "Combobox.ErrorMessage": (child) => {
      composition.errorMessage = child.props as ComboboxErrorMessageProps;
    },
    "Combobox.Empty": (child) => {
      composition.empty = child.props as ComboboxEmptyProps;
    },
    "Combobox.NoMatches": (child) => {
      composition.noMatches = child.props as ComboboxNoMatchesProps;
    },
    "Combobox.Item": (child) => {
      const props = child.props as ComboboxItemProps;
      composition.options.push({
        value: props.value,
        label: props.children,
        disabled: Boolean(props.disabled),
        searchText: (
          props.textValue ?? labelToText(props.children)
        ).toLowerCase(),
        slotProps: props,
      });
    },
  });
  return composition;
}

const comboboxControlSizeClasses: Record<InputSize, string> = {
  sm: "h-[max(var(--input-height-sm),var(--control-hit-target))] min-h-[max(var(--input-height-sm),var(--control-hit-target))] gap-gs-input-gap-sm px-2 text-gs-input-font-size-sm",
  md: "h-[max(var(--input-height-md),var(--control-hit-target))] min-h-[max(var(--input-height-md),var(--control-hit-target))] gap-gs-input-gap px-3 text-gs-input-font-size",
  lg: "h-[max(var(--input-height-lg),var(--control-hit-target))] min-h-[max(var(--input-height-lg),var(--control-hit-target))] gap-gs-input-gap px-4 text-gs-input-font-size-lg",
};

const comboboxIconSizeClasses: Record<InputSize, string> = {
  sm: "size-gs-input-icon-size-sm",
  md: "size-gs-input-icon-size",
  lg: "size-gs-input-icon-size-lg",
};

function CheckIcon() {
  return (
    <svg
      className="block size-full"
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

function ChevronIcon() {
  return (
    <svg
      className="block size-full"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M6 9L12 15L18 9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ComboboxImpl(
  {
    children,
    value,
    defaultValue,
    onValueChange,
    onInputChange,
    placeholder,
    size = "md",
    portal = true,
    invalid = false,
    disabled = false,
    fullWidth = false,
    required = false,
    name,
    form,
    className,
    id,
    "aria-label": ariaLabel,
    onKeyDown,
    onBlur,
    ...props
  }: ComboboxProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const composition = useMemo(
    () => collectComboboxComposition(children),
    [children],
  );
  const { options, label, description, errorMessage, empty, noMatches } =
    composition;

  const reactId = useId();
  const fieldId = id ?? `${reactId}-combobox`;
  const listboxId = `${reactId}-listbox`;
  const labelId = `${reactId}-label`;
  const descriptionId = `${reactId}-description`;
  const errorId = `${reactId}-error`;

  const inputRef = useRef<HTMLInputElement | null>(null);
  const [resolvedValue, setValueState] = useControllableState<
    ComboboxValue | undefined
  >({ value, defaultValue });
  const [stateOpen, setOpen] = useState(false);
  const open = stateOpen && !disabled;
  // `query` is null while the user is not filtering; the input then mirrors
  // the selected option's label.
  const [query, setQuery] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(-1);

  const {
    triggerRef,
    floatingRef,
    setTriggerNode,
    setFloatingNode,
    coords,
    ready,
  } = useFloatingPosition({
    open,
    placement: "bottom-start",
    offset: 4,
    flip: true,
  });

  const selectedOption = useMemo(
    () => options.find((option) => option.value === resolvedValue),
    [options, resolvedValue],
  );
  const isInvalid = invalid || Boolean(errorMessage?.children);

  const filteredOptions = useMemo(() => {
    const normalized = query?.trim().toLowerCase() ?? "";
    if (normalized.length === 0) {
      return options;
    }
    return options.filter((option) => option.searchText.includes(normalized));
  }, [options, query]);

  const displayValue = query ?? labelToText(selectedOption?.label) ?? "";

  useEffect(() => {
    if (disabled && stateOpen) {
      setOpen(false);
      setQuery(null);
    }
  }, [disabled, stateOpen]);

  useEffect(() => {
    if (!open) {
      return;
    }

    // Register as the escape layer so a containing Modal/Drawer does not
    // also close on the same Escape press.
    const escapeLayer = pushEscapeLayer();

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (
        !target ||
        triggerRef.current?.contains(target) ||
        floatingRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
      setQuery(null);
    };

    document.addEventListener("pointerdown", handlePointerDown, true);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
      popEscapeLayer(escapeLayer);
    };
  }, [floatingRef, open, triggerRef]);

  const openList = () => {
    if (open) {
      return;
    }
    setOpen(true);
    const selectedIdx = filteredOptions.findIndex(
      (option) => !option.disabled && option.value === resolvedValue,
    );
    setActiveIndex(
      selectedIdx >= 0
        ? selectedIdx
        : filteredOptions.findIndex((option) => !option.disabled),
    );
  };

  const closeList = () => {
    setOpen(false);
    setQuery(null);
  };

  const selectOption = (option: ComboboxOption) => {
    if (option.disabled) {
      return;
    }
    setValueState(option.value);
    if (option.value !== resolvedValue) {
      onValueChange?.(option.value);
    }
    closeList();
  };

  const moveActive = (intent: "first" | "last" | "next" | "previous") => {
    const nextIndex = findEnabledIndex(
      filteredOptions,
      activeIndex,
      intent,
      (option) => option.disabled,
    );
    if (nextIndex >= 0) {
      setActiveIndex(nextIndex);
    }
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextQuery = event.currentTarget.value;
    setQuery(nextQuery);
    onInputChange?.(nextQuery);
    if (!open) {
      setOpen(true);
    }
    setActiveIndex(0);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (disabled || event.defaultPrevented) {
      return;
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        openList();
        return;
      }
      moveActive(event.key === "ArrowDown" ? "next" : "previous");
      return;
    }

    if ((event.key === "Home" || event.key === "End") && open) {
      event.preventDefault();
      moveActive(event.key === "Home" ? "first" : "last");
      return;
    }

    if (event.key === "Enter" && open) {
      event.preventDefault();
      const option = filteredOptions[activeIndex];
      if (option) {
        selectOption(option);
      }
      return;
    }

    if (event.key === "Escape" && open) {
      event.preventDefault();
      event.stopPropagation();
      closeList();
      return;
    }

    if (event.key === "Tab") {
      closeList();
    }
  };

  const handleControlKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event as unknown as KeyboardEvent<HTMLDivElement>);
    handleKeyDown(event);
  };

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    onBlur?.(event);
    if (event.defaultPrevented) {
      return;
    }
    const nextTarget = event.relatedTarget as Node | null;
    if (
      !event.currentTarget.contains(nextTarget) &&
      !floatingRef.current?.contains(nextTarget)
    ) {
      closeList();
    }
  };

  useEffect(() => {
    if (!open) {
      return;
    }
    if (activeIndex >= filteredOptions.length) {
      const firstEnabled = filteredOptions.findIndex(
        (option) => !option.disabled,
      );
      setActiveIndex(firstEnabled);
    }
  }, [activeIndex, filteredOptions, open]);

  const activeOption = filteredOptions[activeIndex];
  const getOptionId = (index: number) => `${listboxId}-option-${index}`;
  const describedBy = [
    description?.children ? descriptionId : null,
    errorMessage?.children ? errorId : null,
  ]
    .filter(Boolean)
    .join(" ");

  const hasFieldChrome =
    label?.children != null ||
    description?.children != null ||
    errorMessage?.children != null ||
    fullWidth;

  const panel = open ? (
    <div
      ref={setFloatingNode}
      className="gs-combobox-panel z-gs-select grid overflow-hidden rounded-gs-xs border border-gs-surface-border bg-gs-surface-raised bg-gs-surface-highlight shadow-gs-select-list-shadow data-[ready=true]:animate-gs-float-in data-[placement^=top]:[--gs-float-from:0_var(--space-1)] motion-reduce:animate-none [[data-reduced-motion=true]_&]:animate-none"
      data-gs-overlay-branch=""
      data-ready={ready ? "true" : undefined}
      data-placement={coords.placement}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        inlineSize: triggerRef.current?.offsetWidth,
        transform: `translate3d(${coords.x}px, ${coords.y}px, 0)`,
        visibility: ready ? "visible" : "hidden",
      }}
    >
      <div
        id={listboxId}
        role="listbox"
        aria-label={
          labelToText(label?.children) || ariaLabel || placeholder || "Options"
        }
        className="gs-combobox-listbox grid max-h-gs-select-list-max-height overflow-auto overscroll-contain p-1"
      >
        {filteredOptions.length > 0 ? (
          filteredOptions.map((option, index) => {
            const selected = option.value === resolvedValue;
            const optionProps = omitCompoundSlotProps(option.slotProps, [
              "className",
              "children",
              "value",
              "disabled",
              "textValue",
            ]);
            return (
              <div
                {...optionProps}
                id={getOptionId(index)}
                key={option.value}
                role="option"
                aria-selected={selected}
                aria-disabled={option.disabled || undefined}
                className={clsx(
                  "gs-combobox-option flex min-h-gs-control-hit-target cursor-pointer items-center gap-2 rounded-gs-select-option-radius px-3 py-2 font-normal text-gs-text transition-colors duration-200 ease-gs-standard data-[active=true]:bg-gs-surface-mist data-[selected=true]:text-gs-border-focus data-[active=true]:data-[selected=true]:bg-gs-focus-muted data-[disabled=true]:cursor-not-allowed data-[disabled=true]:text-gs-text-disabled motion-reduce:transition-none [[data-reduced-motion=true]_&]:transition-none",
                  option.slotProps.className,
                )}
                data-active={index === activeIndex ? "true" : undefined}
                data-selected={selected ? "true" : undefined}
                data-disabled={option.disabled ? "true" : undefined}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => selectOption(option)}
              >
                <span className="gs-combobox-option-label min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
                  {option.label}
                </span>
                {selected ? (
                  <span
                    className="gs-combobox-check ms-auto inline-flex size-4 shrink-0 items-center justify-center text-current"
                    aria-hidden="true"
                  >
                    <CheckIcon />
                  </span>
                ) : null}
              </div>
            );
          })
        ) : (
          // Match Select's vocabulary: NoMatches for a fruitless filter
          // query, Empty when there are no options at all.
          <div
            {...(query?.trim() ? (noMatches ?? empty) : empty)}
            className={clsx(
              "gs-combobox-empty min-h-gs-control-hit-target rounded-gs-select-option-radius px-3 py-2 text-gs-input-placeholder",
              (query?.trim() ? (noMatches ?? empty) : empty)?.className,
            )}
          >
            {(query?.trim() ? (noMatches ?? empty) : empty)?.children ??
              "No matches"}
          </div>
        )}
      </div>
    </div>
  ) : null;

  const composedControlRef = useComposedRefs(setTriggerNode, ref);

  const control = (
    <div
      {...(hasFieldChrome ? {} : props)}
      ref={hasFieldChrome ? setTriggerNode : composedControlRef}
      className={clsx(
        "gs-combobox group/combobox relative inline-flex min-w-[calc(var(--space-20)*2.5)] max-w-full align-top text-gs-input-color",
        fullWidth && "flex w-full",
        disabled && "cursor-not-allowed opacity-gs-disabled",
        !hasFieldChrome && className,
      )}
      data-size={size}
      data-open={open ? "true" : undefined}
      data-invalid={isInvalid ? "true" : undefined}
      data-disabled={disabled ? "true" : undefined}
      data-full-width={fullWidth && !hasFieldChrome ? "true" : undefined}
      onBlur={handleBlur}
    >
      <div
        className={clsx(
          "gs-combobox-control inline-flex w-full items-center box-border rounded-gs-xs border border-gs-default bg-gs-surface bg-gs-surface-highlight shadow-gs-surface-sheen transition-[background-color,border-color,box-shadow,opacity] duration-200 ease-gs-standard focus-within:border-gs-focus focus-within:bg-gs-surface-raised focus-within:shadow-gs-input-focus-border has-[:focus-visible]:shadow-gs-input-surface-focus motion-reduce:transition-none [[data-reduced-motion=true]_&]:transition-none [[data-high-contrast=true]_&]:border [[data-high-contrast=true]_&]:border-gs-input-border [[data-high-contrast=true]_&]:focus-within:border-gs-focus",
          comboboxControlSizeClasses[size],
          isInvalid
            ? "border-gs-error bg-gs-error-subtle focus-within:border-gs-error focus-within:bg-gs-error-subtle focus-within:shadow-gs-input-invalid-border has-[:focus-visible]:shadow-gs-input-invalid-focus [[data-high-contrast=true]_&]:border-gs-error"
            : !disabled &&
                "group-hover/combobox:border-gs-strong group-hover/combobox:bg-gs-surface-muted",
        )}
      >
        {name ? (
          <input
            type="hidden"
            name={name}
            {...(form !== undefined ? { form } : {})}
            value={resolvedValue ?? ""}
          />
        ) : null}
        <input
          ref={inputRef}
          id={fieldId}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          aria-activedescendant={
            open && activeOption ? getOptionId(activeIndex) : undefined
          }
          aria-invalid={isInvalid || undefined}
          aria-required={required || undefined}
          aria-label={label?.children == null ? ariaLabel : undefined}
          aria-labelledby={label?.children != null ? labelId : undefined}
          aria-describedby={describedBy || undefined}
          className={clsx(
            "gs-combobox-input m-0 min-w-0 flex-1 border-0 bg-transparent p-0 font-inherit leading-[1.25] text-inherit caret-gs-border-focus outline-none placeholder:text-gs-input-placeholder",
            disabled && "cursor-not-allowed",
          )}
          placeholder={placeholder}
          value={displayValue}
          disabled={disabled}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          onChange={handleInputChange}
          onClick={openList}
          onKeyDown={handleControlKeyDown}
        />
        <button
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          disabled={disabled}
          className={clsx(
            "gs-combobox-indicator inline-flex shrink-0 cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-gs-text-secondary transition-transform duration-200 ease-gs-standard motion-reduce:transition-none [[data-reduced-motion=true]_&]:transition-none",
            comboboxIconSizeClasses[size],
            open && "rotate-180",
            disabled && "cursor-not-allowed",
          )}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            if (open) {
              closeList();
            } else {
              inputRef.current?.focus();
              openList();
            }
          }}
        >
          <ChevronIcon />
        </button>
      </div>
    </div>
  );

  if (!hasFieldChrome) {
    return (
      <>
        {control}
        {panel ? <Portal disabled={!portal}>{panel}</Portal> : null}
      </>
    );
  }

  return (
    <div
      {...props}
      ref={ref}
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
            disabled && "text-gs-text-disabled",
            label.className,
          )}
          id={labelId}
          htmlFor={fieldId}
        >
          {label.children}
          {required ? (
            <span className={inputRequiredClasses} aria-hidden="true">
              *
            </span>
          ) : null}
        </label>
      ) : null}
      {control}
      {panel ? <Portal disabled={!portal}>{panel}</Portal> : null}
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
            disabled && "text-gs-text-disabled",
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

const ComboboxRoot = forwardRef(ComboboxImpl);
ComboboxRoot.displayName = "Combobox";

const ComboboxLabel = createCompoundSlot<ComboboxLabelProps>("Combobox.Label");
const ComboboxDescription = createCompoundSlot<ComboboxDescriptionProps>(
  "Combobox.Description",
);
const ComboboxErrorMessage = createCompoundSlot<ComboboxErrorMessageProps>(
  "Combobox.ErrorMessage",
);
const ComboboxItem = createCompoundSlot<ComboboxItemProps>("Combobox.Item");
const ComboboxEmpty = createCompoundSlot<ComboboxEmptyProps>("Combobox.Empty");
const ComboboxNoMatches =
  createCompoundSlot<ComboboxNoMatchesProps>("Combobox.NoMatches");

export const Combobox = Object.assign(ComboboxRoot, {
  Label: ComboboxLabel,
  Description: ComboboxDescription,
  ErrorMessage: ComboboxErrorMessage,
  Item: ComboboxItem,
  Empty: ComboboxEmpty,
  NoMatches: ComboboxNoMatches,
});
