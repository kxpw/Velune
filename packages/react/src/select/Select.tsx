import {
  isSelectOptionGroup,
  type SelectFlatOption,
  type SelectOption,
} from "./Select.options";
import type { FocusEvent, ForwardedRef, KeyboardEvent, ReactNode } from "react";
import {
  forwardRef,
  lazy,
  Suspense,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useControllableState } from "@velune/hooks";
import { clsx } from "clsx";
import {
  selectCheckIconClasses,
  selectCheckLeadingClasses,
  selectCheckTrailingClasses,
  selectClasses,
  selectControlClasses,
  selectDisabledTextClasses,
  selectEmptyClasses,
  selectFieldFullWidthClasses,
  selectGroupClasses,
  selectGroupLabelClasses,
  selectIndicatorClasses,
  selectIndicatorIconClasses,
  selectLabelCursorClasses,
  selectListboxClasses,
  selectNativeClasses,
  selectOptionClasses,
  selectOptionLabelClasses,
  selectPanelClasses,
  selectSearchBarClasses,
  selectSearchClasses,
  selectSearchIconClasses,
  selectSearchLeadingClasses,
  selectTriggerClasses,
  selectValueClasses,
} from "./Select.classes";
import {
  createCompoundSlot,
  omitCompoundSlotProps,
} from "../shared/compound-slot";
import { useComposedRefs } from "../shared/compose-refs";
import {
  findEnabledIndex,
  type LinearNavigationIntent,
} from "../shared/keyboard-navigation";
import { inputFieldClasses } from "../shared/input-tailwind-classes";
import { Portal } from "../shared/portal";
import {
  floatingLayerStyle,
  useFloatingPosition,
} from "../shared/use-floating-position";
import { useDismissibleFloating } from "../shared/use-dismissible-floating";
import { ListboxCheckIcon, ListboxChevronIcon } from "../shared/listbox-icons";
import { FieldChrome, getFieldDescribedBy } from "../shared/field-chrome";
import { SearchIcon } from "../shared/icons";
import {
  collectSelectComposition,
  equalValues,
  filterOptionItems,
  flattenOptions,
  labelToText,
  normalizeValue,
  optionSearchText,
  renderVirtualFallback,
  SELECT_VIRTUALIZATION_THRESHOLD,
  selectionStrategies,
} from "./Select.utils";
import type {
  SelectContentProps,
  SelectDescriptionProps,
  SelectEmptyProps,
  SelectErrorMessageProps,
  SelectGroupLabelProps,
  SelectGroupProps,
  SelectItemProps,
  SelectLabelProps,
  SelectNoMatchesProps,
  SelectProps,
  SelectTriggerProps,
  SelectValue,
} from "./Select.types";

const LazySelectVirtualList = lazy(async () => {
  const module = await import("./SelectVirtualList");
  return { default: module.SelectVirtualList };
});

function SelectImpl(
  {
    children,
    value,
    defaultValue,
    onValueChange,
    onSearch,
    searchPlaceholder = "Search…",
    dir = "ltr",
    size = "md",
    multiple = false,
    searchable = false,
    portal = true,
    invalid = false,
    disabled = false,
    fullWidth = false,
    required = false,
    name,
    form,
    autoComplete,
    className,
    id,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    onKeyDown,
    onBlur,
    ...props
  }: SelectProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const composition = useMemo(
    () => collectSelectComposition(children),
    [children],
  );
  const {
    options,
    label,
    description,
    errorMessage,
    trigger,
    content,
    empty,
    noMatches,
  } = composition;
  const placeholder = trigger?.placeholder ?? "Select an option";
  const reactId = useId();
  const listboxId = `${reactId}-listbox`;
  const searchId = `${reactId}-search`;
  const {
    controlId: fieldId,
    labelId,
    descriptionId,
    errorId,
    describedBy,
  } = getFieldDescribedBy({
    id,
    reactId,
    idSuffix: "select",
    hasDescription: Boolean(description?.children),
    hasError: Boolean(errorMessage?.children),
  });
  const searchRef = useRef<HTMLInputElement | null>(null);
  const listboxRef = useRef<HTMLDivElement | null>(null);
  const nativeSelectRef = useRef<HTMLSelectElement | null>(null);
  const initialValueRef = useRef(defaultValue);
  const typeaheadRef = useRef({ query: "", timestamp: 0 });

  const isControlled = value !== undefined;
  const [resolvedValue, setValueState] = useControllableState<
    SelectValue | SelectValue[] | undefined
  >({
    value,
    defaultValue,
  });
  const [stateOpen, setOpen] = useState(false);
  const open = stateOpen && !disabled;
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const { triggerRef, floatingRef, setTriggerNode, setFloatingNode } =
    useFloatingPosition({
      open,
      placement: "bottom-start",
      offset: 4,
      flip: true,
      onPositioned: () => {
        if (searchable) {
          searchRef.current?.focus();
        }
      },
    });

  const selectedValues = useMemo(
    () => normalizeValue(resolvedValue),
    [resolvedValue],
  );
  const selectedValueSet = useMemo(
    () => new Set(selectedValues),
    [selectedValues],
  );
  const selectionStrategy =
    selectionStrategies[multiple ? "multiple" : "single"];
  const isInvalid = invalid || Boolean(errorMessage?.children);

  const hasNativeControl = Boolean(name || required);
  const skipLocalFilter = Boolean(onSearch) || !searchable;

  const flattenedOptions = useMemo(() => flattenOptions(options), [options]);
  const allOptions = flattenedOptions.all;

  const filteredItems = useMemo(
    () => filterOptionItems(options, query, skipLocalFilter),
    [options, query, skipLocalFilter],
  );

  const { flat: filteredFlat } = useMemo(
    () =>
      filteredItems === options
        ? flattenedOptions
        : flattenOptions(filteredItems),
    [filteredItems, flattenedOptions, options],
  );
  const shouldVirtualize =
    filteredFlat.length >= SELECT_VIRTUALIZATION_THRESHOLD &&
    !filteredItems.some(isSelectOptionGroup);

  useEffect(() => {
    if (disabled && stateOpen) {
      setOpen(false);
      setQuery("");
    }
  }, [disabled, stateOpen]);

  useLayoutEffect(() => {
    if (!filteredFlat[activeIndex] || filteredFlat[activeIndex]?.disabled) {
      const firstEnabled = filteredFlat.findIndex((option) => !option.disabled);
      setActiveIndex(Math.max(0, firstEnabled));
    }
  }, [activeIndex, filteredFlat]);

  useEffect(() => {
    if (isControlled) {
      return;
    }
    const associatedForm = nativeSelectRef.current?.form;
    if (!associatedForm) {
      return;
    }
    const handleReset = () => setValueState(initialValueRef.current);
    associatedForm.addEventListener("reset", handleReset);
    return () => associatedForm.removeEventListener("reset", handleReset);
  }, [form, hasNativeControl, isControlled, setValueState]);

  useDismissibleFloating({
    open,
    onDismiss: () => {
      setOpen(false);
      setQuery("");
    },
    refs: [triggerRef, floatingRef],
  });

  const selectedLabels = useMemo(
    () =>
      allOptions
        .filter((option) => selectedValueSet.has(option.value))
        .map((option) => option.label),
    [allOptions, selectedValueSet],
  );

  const displayValue =
    selectedLabels.length > 0
      ? selectedLabels.reduce<ReactNode[]>((parts, part, index) => {
          if (index > 0) {
            parts.push(", ");
          }
          parts.push(part);
          return parts;
        }, [])
      : placeholder;

  const restoreTriggerFocus = () => {
    requestAnimationFrame(() => {
      triggerRef.current
        ?.querySelector<HTMLButtonElement>(".gs-select-trigger")
        ?.focus();
    });
  };

  const emitChange = (nextValues: SelectValue[]) => {
    if (equalValues(selectedValues, nextValues)) {
      return;
    }
    const nextValue = selectionStrategy.publicValue(nextValues);
    setValueState(nextValue);
    selectionStrategy.notify(onValueChange, nextValues);
    queueMicrotask(() => {
      nativeSelectRef.current?.dispatchEvent(
        new Event("change", { bubbles: true }),
      );
    });
  };

  const moveActive = (intent: LinearNavigationIntent) => {
    const nextIndex = findEnabledIndex(
      filteredFlat,
      activeIndex,
      intent,
      (option) => Boolean(option.disabled),
    );
    if (nextIndex >= 0) setActiveIndex(nextIndex);
  };

  // Standard listbox open behavior: highlight the selected option, or the
  // first/last enabled option when nothing is selected.
  const highlightInitialOption = (direction: 1 | -1) => {
    if (filteredFlat.length === 0) {
      return;
    }
    const selectedIdx = filteredFlat.findIndex(
      (option) => !option.disabled && selectedValueSet.has(option.value),
    );
    if (selectedIdx >= 0) {
      setActiveIndex(selectedIdx);
      return;
    }
    moveActive(direction === 1 ? "first" : "last");
  };

  const selectOption = (option: SelectOption) => {
    if (option.disabled) {
      return;
    }

    emitChange(selectionStrategy.nextValues(selectedValues, option.value));
    if (selectionStrategy.closeOnSelect) {
      setOpen(false);
      setQuery("");
      restoreTriggerFocus();
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled || event.defaultPrevented) {
      return;
    }

    if (event.key === "Enter" || (event.key === " " && !searchable)) {
      if (!open) {
        event.preventDefault();
        setOpen(true);
        highlightInitialOption(1);
        return;
      }
      // When searchable, space types into the search field.
      if (event.key === " " && searchable) {
        return;
      }
      event.preventDefault();
      const option = filteredFlat[activeIndex];
      if (option) {
        selectOption(option);
      }
      return;
    }

    if (event.key === "Escape" && open) {
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
      setQuery("");
      restoreTriggerFocus();
      return;
    }

    if (event.key === "Tab") {
      setOpen(false);
      setQuery("");
      return;
    }

    const navigationCommands: Partial<Record<string, () => void>> = {
      ArrowDown: () => (open ? moveActive("next") : highlightInitialOption(1)),
      ArrowUp: () =>
        open ? moveActive("previous") : highlightInitialOption(-1),
      Home: () => moveActive("first"),
      End: () => moveActive("last"),
    };
    const navigationCommand = navigationCommands[event.key];
    if (navigationCommand && (open || event.key.startsWith("Arrow"))) {
      event.preventDefault();
      if (!open) setOpen(true);
      navigationCommand();
      return;
    }

    if (
      event.key.length === 1 &&
      !searchable &&
      !event.metaKey &&
      !event.ctrlKey &&
      !event.altKey
    ) {
      const now = Date.now();
      const previous = typeaheadRef.current;
      const query =
        now - previous.timestamp > 700
          ? event.key.toLowerCase()
          : `${previous.query}${event.key.toLowerCase()}`;
      typeaheadRef.current = { query, timestamp: now };
      const searchQuery =
        query.length > 1 && Array.from(query).every((char) => char === query[0])
          ? query[0]!
          : query;
      const ordered = [
        ...filteredFlat.slice(activeIndex + 1),
        ...filteredFlat.slice(0, activeIndex + 1),
      ];
      const match = ordered.find(
        (option) =>
          !option.disabled && optionSearchText(option).startsWith(searchQuery),
      );
      const nextIndex = match ? filteredFlat.indexOf(match) : -1;
      if (nextIndex >= 0) {
        setActiveIndex(nextIndex);
        setOpen(true);
      }
    }
  };

  const handleControlKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    handleKeyDown(event);
  };

  const handleControlBlur = (event: FocusEvent<HTMLDivElement>) => {
    onBlur?.(event);
    if (event.defaultPrevented) {
      return;
    }
    const nextTarget = event.relatedTarget as Node | null;
    if (
      !event.currentTarget.contains(nextTarget) &&
      !floatingRef.current?.contains(nextTarget)
    ) {
      setOpen(false);
      setQuery("");
    }
  };

  const activeOption = filteredFlat[activeIndex];
  const getOptionId = (index: number) => `${listboxId}-option-${index}`;

  const hasFieldChrome =
    label?.children != null ||
    description?.children != null ||
    errorMessage?.children != null ||
    fullWidth;

  let flatIndex = -1;

  const renderOption = (option: SelectFlatOption, forcedIndex?: number) => {
    const index = forcedIndex ?? (flatIndex += 1);
    const selected = selectedValueSet.has(option.value);
    const optionSlot = (option.slotProps ?? {}) as SelectItemProps;
    const optionProps = omitCompoundSlotProps(optionSlot, [
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
        aria-setsize={shouldVirtualize ? filteredFlat.length : undefined}
        className={clsx(selectOptionClasses, optionSlot.className)}
        data-active={index === activeIndex ? "true" : undefined}
        data-selected={selected ? "true" : undefined}
        data-disabled={option.disabled ? "true" : undefined}
        onMouseDown={(event) => event.preventDefault()}
        onMouseEnter={() => setActiveIndex(index)}
        onClick={() => selectOption(option)}
      >
        {multiple ? (
          <span className={selectCheckLeadingClasses} aria-hidden="true">
            <ListboxCheckIcon className={selectCheckIconClasses} />
          </span>
        ) : null}
        <span className={selectOptionLabelClasses}>{option.label}</span>
        {!multiple && selected ? (
          <span className={selectCheckTrailingClasses} aria-hidden="true">
            <ListboxCheckIcon className={selectCheckIconClasses} />
          </span>
        ) : null}
      </div>
    );
  };

  const listContent = !open ? null : shouldVirtualize &&
    filteredFlat.length > 0 ? (
    <Suspense
      fallback={renderVirtualFallback(filteredFlat, activeIndex, renderOption)}
    >
      <LazySelectVirtualList
        options={filteredFlat}
        activeIndex={activeIndex}
        scrollRef={listboxRef}
        renderOption={renderOption}
      />
    </Suspense>
  ) : filteredFlat.length > 0 ? (
    filteredItems.map((item, itemIndex) => {
      if (isSelectOptionGroup(item)) {
        const groupSlot = (item.slotProps ?? {}) as SelectGroupProps;
        const groupProps = omitCompoundSlotProps(groupSlot, [
          "className",
          "children",
          "textValue",
        ]);
        const groupLabelProps = omitCompoundSlotProps(item.labelProps, [
          "className",
          "children",
        ]);
        return (
          <div
            {...groupProps}
            key={`group-${itemIndex}`}
            className={clsx(selectGroupClasses, groupSlot.className)}
            role="group"
            aria-label={labelToText(item.label) || undefined}
          >
            <div
              {...groupLabelProps}
              className={clsx(
                selectGroupLabelClasses,
                item.labelProps?.className,
              )}
              aria-hidden="true"
            >
              {item.label}
            </div>
            {item.options.map((option) =>
              renderOption({
                ...option,
                groupKey: `group-${itemIndex}`,
              }),
            )}
          </div>
        );
      }
      return renderOption(item);
    })
  ) : (
    <div
      {...(query.trim() ? noMatches : empty)}
      className={clsx(
        selectEmptyClasses,
        (query.trim() ? noMatches : empty)?.className,
      )}
    >
      {(query.trim() ? noMatches : empty)?.children ??
        (query.trim() ? "No matches" : "No options")}
    </div>
  );

  const contentProps = omitCompoundSlotProps(content, [
    "className",
    "children",
  ]);

  const panel = open ? (
    <div
      {...contentProps}
      ref={setFloatingNode}
      className={clsx(selectPanelClasses, content?.className)}
      data-gs-overlay-branch=""
      dir={dir}
      onKeyDown={handleKeyDown}
      style={{
        ...floatingLayerStyle,
        // At least as wide as the trigger; grow with option content so long
        // labels do not force a horizontal scrollbar inside the listbox.
        minInlineSize: "var(--gs-popover-trigger-width)",
        inlineSize: "max-content",
        maxInlineSize: "min(100vw - 1rem, 40rem)",
      }}
    >
      {searchable ? (
        <div className={selectSearchBarClasses}>
          <span className={selectSearchLeadingClasses} aria-hidden="true">
            <SearchIcon className={selectSearchIconClasses} />
          </span>
          <input
            ref={searchRef}
            id={searchId}
            type="search"
            className={selectSearchClasses}
            placeholder={searchPlaceholder}
            value={query}
            aria-label={searchPlaceholder}
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-activedescendant={
              activeOption ? getOptionId(activeIndex) : undefined
            }
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            onChange={(event) => {
              const nextQuery = event.currentTarget.value;
              setQuery(nextQuery);
              onSearch?.(nextQuery);
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault();
                event.stopPropagation();
                setOpen(false);
                setQuery("");
                restoreTriggerFocus();
              }
            }}
          />
        </div>
      ) : null}
      <div
        ref={listboxRef}
        id={listboxId}
        role="listbox"
        data-virtualized={shouldVirtualize ? "true" : undefined}
        aria-multiselectable={multiple || undefined}
        aria-label={
          labelToText(label?.children) ||
          ariaLabel ||
          labelToText(placeholder) ||
          "Options"
        }
        className={selectListboxClasses({ virtualized: shouldVirtualize })}
      >
        {listContent}
      </div>
    </div>
  ) : null;
  const composedTriggerRef = useComposedRefs(setTriggerNode, ref);
  const triggerProps = omitCompoundSlotProps(trigger, [
    "placeholder",
    "className",
    "children",
    "onClick",
  ]);

  const control = (
    <div
      {...(hasFieldChrome ? {} : props)}
      ref={hasFieldChrome ? setTriggerNode : composedTriggerRef}
      id={hasFieldChrome ? undefined : fieldId}
      className={clsx(
        selectClasses({ size, fullWidth, disabled }),
        !hasFieldChrome && className,
      )}
      data-size={size}
      data-open={open ? "true" : undefined}
      data-invalid={isInvalid ? "true" : undefined}
      data-disabled={disabled ? "true" : undefined}
      data-searchable={searchable ? "true" : undefined}
      data-full-width={fullWidth && !hasFieldChrome ? "true" : undefined}
      dir={dir}
      onBlur={handleControlBlur}
      onKeyDown={handleControlKeyDown}
    >
      <div
        className={selectControlClasses({
          size,
          invalid: isInvalid,
          disabled,
          open,
        })}
      >
        {hasNativeControl ? (
          <select
            ref={nativeSelectRef}
            className={selectNativeClasses}
            name={name}
            form={form}
            autoComplete={autoComplete}
            multiple={multiple}
            value={multiple ? selectedValues : (selectedValues[0] ?? "")}
            required={required}
            disabled={disabled}
            tabIndex={-1}
            aria-hidden="true"
            onChange={() => {}}
            onInvalid={() => {
              triggerRef.current
                ?.querySelector<HTMLButtonElement>(".gs-select-trigger")
                ?.focus();
            }}
          >
            {!multiple ? <option value="" /> : null}
            {allOptions.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {labelToText(option.label) || option.searchText || option.value}
              </option>
            ))}
          </select>
        ) : null}
        <button
          {...triggerProps}
          id={hasFieldChrome ? fieldId : undefined}
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-haspopup="listbox"
          aria-activedescendant={
            open && activeOption ? getOptionId(activeIndex) : undefined
          }
          aria-invalid={isInvalid || undefined}
          aria-required={required || undefined}
          aria-label={
            label?.children == null && ariaLabelledBy == null
              ? ariaLabel
              : undefined
          }
          aria-labelledby={
            ariaLabelledBy ?? (label?.children != null ? labelId : undefined)
          }
          aria-describedby={describedBy}
          disabled={disabled}
          className={clsx(
            selectTriggerClasses({ disabled }),
            trigger?.className,
          )}
          onClick={(event) => {
            trigger?.onClick?.(event);
            if (event.defaultPrevented) return;
            setOpen((next) => {
              const opening = !next;
              if (opening) {
                highlightInitialOption(1);
              } else {
                setQuery("");
              }
              return opening;
            });
          }}
        >
          <span
            className={selectValueClasses}
            data-placeholder={selectedLabels.length === 0 ? "true" : undefined}
          >
            {displayValue}
          </span>
        </button>
        <span
          className={selectIndicatorClasses({ size, open })}
          aria-hidden="true"
        >
          <ListboxChevronIcon className={selectIndicatorIconClasses} />
        </span>
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
      fullWidthClassName={selectFieldFullWidthClasses}
      className={className}
      size={size}
      disabled={disabled}
      invalid={isInvalid}
      dir={dir}
      label={
        label
          ? {
              ...label,
              id: labelId,
              htmlFor: fieldId,
              required,
              className: clsx(selectLabelCursorClasses, label.className),
              disabledClassName: selectDisabledTextClasses,
            }
          : undefined
      }
      description={
        description
          ? {
              ...description,
              id: descriptionId,
              disabledClassName: selectDisabledTextClasses,
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

const SelectRoot = forwardRef(SelectImpl);
SelectRoot.displayName = "Select";

const SelectLabel = createCompoundSlot<SelectLabelProps>("Select.Label");
const SelectDescription =
  createCompoundSlot<SelectDescriptionProps>("Select.Description");
const SelectErrorMessage = createCompoundSlot<SelectErrorMessageProps>(
  "Select.ErrorMessage",
);
const SelectTrigger = createCompoundSlot<SelectTriggerProps>("Select.Trigger");
const SelectContent = createCompoundSlot<SelectContentProps>("Select.Content");
const SelectItem = createCompoundSlot<SelectItemProps>("Select.Item");
const SelectGroup = createCompoundSlot<SelectGroupProps>("Select.Group");
const SelectGroupLabel =
  createCompoundSlot<SelectGroupLabelProps>("Select.GroupLabel");
const SelectEmpty = createCompoundSlot<SelectEmptyProps>("Select.Empty");
const SelectNoMatches =
  createCompoundSlot<SelectNoMatchesProps>("Select.NoMatches");

export const Select = Object.assign(SelectRoot, {
  Label: SelectLabel,
  Description: SelectDescription,
  ErrorMessage: SelectErrorMessage,
  Trigger: SelectTrigger,
  Content: SelectContent,
  Item: SelectItem,
  Group: SelectGroup,
  GroupLabel: SelectGroupLabel,
  Empty: SelectEmpty,
  NoMatches: SelectNoMatches,
});
