import type {
  ChangeEvent,
  ComponentType,
  FocusEvent,
  ForwardedRef,
  KeyboardEvent,
  ReactNode,
} from "react";
import {
  forwardRef,
  lazy,
  Suspense,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { useControllableState } from "@velune/hooks";
import { clsx } from "clsx";
import {
  createCompoundSlot,
  dispatchCompoundSlots,
  omitCompoundSlotProps,
} from "../shared/compound-slot";
import { useComposedRefs } from "../shared/compose-refs";
import { findEnabledIndex } from "../shared/keyboard-navigation";
import { inputFieldClasses } from "../shared/input-tailwind-classes";
import { Portal } from "../shared/portal";
import {
  floatingLayerStyle,
  useFloatingPosition,
} from "../shared/use-floating-position";
import { useDismissibleFloating } from "../shared/use-dismissible-floating";
import { ListboxCheckIcon, ListboxChevronIcon } from "../shared/listbox-icons";
import { FieldChrome, getFieldDescribedBy } from "../shared/field-chrome";
import {
  LISTBOX_VIRTUALIZATION_THRESHOLD,
  renderListboxVirtualFallback,
} from "../shared/listbox-virtual";
import {
  comboboxCheckClasses,
  comboboxClasses,
  comboboxControlClasses,
  comboboxDisabledTextClasses,
  comboboxEmptyClasses,
  comboboxFieldFullWidthClasses,
  comboboxIconSvgClasses,
  comboboxIndicatorClasses,
  comboboxInputClasses,
  comboboxListboxClasses,
  comboboxOptionClasses,
  comboboxOptionLabelClasses,
  comboboxPanelClasses,
  comboboxVirtualFallbackClasses,
} from "./Combobox.classes";
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
import type { ComboboxVirtualListProps } from "./ComboboxVirtualList";

type ComboboxOption = {
  value: ComboboxValue;
  label: ReactNode;
  disabled: boolean;
  searchText: string;
  slotProps: ComboboxItemProps;
};

const LazyComboboxVirtualList = lazy(async () => {
  const module = await import("./ComboboxVirtualList");
  return {
    default: module.ComboboxVirtualList as ComponentType<
      ComboboxVirtualListProps<ComboboxOption>
    >,
  };
});

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
  const listboxId = `${reactId}-listbox`;
  const {
    controlId: fieldId,
    labelId,
    descriptionId,
    errorId,
    describedBy,
  } = getFieldDescribedBy({
    id,
    reactId,
    idSuffix: "combobox",
    hasDescription: Boolean(description?.children),
    hasError: Boolean(errorMessage?.children),
  });

  const inputRef = useRef<HTMLInputElement | null>(null);
  const listboxRef = useRef<HTMLDivElement | null>(null);
  const [resolvedValue, setValueState] = useControllableState<
    ComboboxValue | undefined
  >({ value, defaultValue });
  const [stateOpen, setOpen] = useState(false);
  const open = stateOpen && !disabled;
  // `query` is null while the user is not filtering; the input then mirrors
  // the selected option's label.
  const [query, setQuery] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(-1);

  const { triggerRef, floatingRef, setTriggerNode, setFloatingNode } =
    useFloatingPosition({
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

  useDismissibleFloating({
    open,
    onDismiss: () => {
      setOpen(false);
      setQuery(null);
    },
    refs: [triggerRef, floatingRef],
  });

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
  const shouldVirtualize =
    filteredOptions.length >= LISTBOX_VIRTUALIZATION_THRESHOLD;

  const hasFieldChrome =
    label?.children != null ||
    description?.children != null ||
    errorMessage?.children != null ||
    fullWidth;

  const renderOption = (option: ComboboxOption, index: number) => {
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
        aria-posinset={shouldVirtualize ? index + 1 : undefined}
        aria-setsize={shouldVirtualize ? filteredOptions.length : undefined}
        className={clsx(comboboxOptionClasses, option.slotProps.className)}
        data-active={index === activeIndex ? "true" : undefined}
        data-selected={selected ? "true" : undefined}
        data-disabled={option.disabled ? "true" : undefined}
        onMouseDown={(event) => event.preventDefault()}
        onMouseEnter={() => setActiveIndex(index)}
        onClick={() => selectOption(option)}
      >
        <span className={comboboxOptionLabelClasses}>{option.label}</span>
        {selected ? (
          <span className={comboboxCheckClasses} aria-hidden="true">
            <ListboxCheckIcon className={comboboxIconSvgClasses} />
          </span>
        ) : null}
      </div>
    );
  };

  const listContent =
    filteredOptions.length > 0 ? (
      shouldVirtualize ? (
        <Suspense
          fallback={renderListboxVirtualFallback(
            filteredOptions,
            activeIndex,
            renderOption,
            comboboxVirtualFallbackClasses,
          )}
        >
          <LazyComboboxVirtualList
            options={filteredOptions}
            activeIndex={activeIndex}
            scrollRef={listboxRef}
            renderOption={renderOption}
          />
        </Suspense>
      ) : (
        filteredOptions.map((option, index) => renderOption(option, index))
      )
    ) : (
      // Match Select's vocabulary: NoMatches for a fruitless filter
      // query, Empty when there are no options at all.
      <div
        {...(query?.trim() ? (noMatches ?? empty) : empty)}
        className={clsx(
          comboboxEmptyClasses,
          (query?.trim() ? (noMatches ?? empty) : empty)?.className,
        )}
      >
        {(query?.trim() ? (noMatches ?? empty) : empty)?.children ??
          "No matches"}
      </div>
    );

  const panel = open ? (
    <div
      ref={setFloatingNode}
      className={comboboxPanelClasses}
      data-gs-overlay-branch=""
      style={{
        ...floatingLayerStyle,
        minInlineSize: "var(--gs-popover-trigger-width)",
        inlineSize: "max-content",
        maxInlineSize: "min(100vw - 1rem, 40rem)",
      }}
    >
      <div
        ref={listboxRef}
        id={listboxId}
        role="listbox"
        aria-label={
          labelToText(label?.children) || ariaLabel || placeholder || "Options"
        }
        data-virtualized={shouldVirtualize ? "true" : undefined}
        className={comboboxListboxClasses({ virtualized: shouldVirtualize })}
      >
        {listContent}
      </div>
    </div>
  ) : null;

  const composedControlRef = useComposedRefs(setTriggerNode, ref);

  const control = (
    <div
      {...(hasFieldChrome ? {} : props)}
      ref={hasFieldChrome ? setTriggerNode : composedControlRef}
      className={clsx(
        comboboxClasses({ fullWidth, disabled }),
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
        className={comboboxControlClasses({
          size,
          invalid: isInvalid,
          disabled,
        })}
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
          className={comboboxInputClasses({ disabled })}
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
          className={comboboxIndicatorClasses({ size, open, disabled })}
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
          <ListboxChevronIcon className={comboboxIconSvgClasses} />
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
    <FieldChrome
      {...props}
      ref={ref}
      fieldClassName={inputFieldClasses}
      fullWidth={fullWidth}
      fullWidthClassName={comboboxFieldFullWidthClasses}
      className={className}
      size={size}
      disabled={disabled}
      invalid={isInvalid}
      label={
        label
          ? {
              ...label,
              id: labelId,
              htmlFor: fieldId,
              required,
              disabledClassName: comboboxDisabledTextClasses,
            }
          : undefined
      }
      description={
        description
          ? {
              ...description,
              id: descriptionId,
              disabledClassName: comboboxDisabledTextClasses,
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
      afterControl={panel ? <Portal disabled={!portal}>{panel}</Portal> : null}
    >
      {control}
    </FieldChrome>
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
