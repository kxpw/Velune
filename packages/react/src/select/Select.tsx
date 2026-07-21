import type {
  SelectFlatOption,
  SelectOption,
  SelectOptionGroup,
  SelectOptionItem,
} from "./Select.options";
import { isSelectOptionGroup } from "./Select.options";
import type { FocusEvent, ForwardedRef, KeyboardEvent, ReactNode } from "react";
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
import type { InputSize } from "../input";
import {
  createCompoundSlot,
  dispatchCompoundSlots,
  omitCompoundSlotProps,
} from "../shared/compound-slot";
import { useComposedRefs } from "../shared/compose-refs";
import {
  findEnabledIndex,
  type LinearNavigationIntent,
} from "../shared/keyboard-navigation";
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
  SelectMultipleProps,
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
  SelectSingleProps,
  SelectTriggerProps,
  SelectValue,
} from "./Select.types";

const SELECT_VIRTUALIZATION_THRESHOLD = 100;
const SELECT_VIRTUAL_FALLBACK_SIZE = 12;

const LazySelectVirtualList = lazy(async () => {
  const module = await import("./SelectVirtualList");
  return { default: module.SelectVirtualList };
});

const EMPTY_VALUES: SelectValue[] = [];

type SelectComposition = {
  options: SelectOptionItem[];
  label?: SelectLabelProps;
  description?: SelectDescriptionProps;
  errorMessage?: SelectErrorMessageProps;
  trigger?: SelectTriggerProps;
  content?: SelectContentProps;
  empty?: SelectEmptyProps;
  noMatches?: SelectNoMatchesProps;
};

function collectSelectItems(children: ReactNode): SelectOptionItem[] {
  const items: SelectOptionItem[] = [];
  dispatchCompoundSlots(children, {
    "Select.Item": (child) => {
      const props = child.props as SelectItemProps;
      items.push({
        value: props.value,
        label: props.children,
        disabled: props.disabled,
        searchText: props.textValue,
        slotProps: props,
      });
    },
    "Select.Group": (child) => {
      const props = child.props as SelectGroupProps;
      let label: ReactNode;
      let labelProps: SelectGroupLabelProps | undefined;
      const options: SelectOption[] = [];
      dispatchCompoundSlots(props.children, {
        "Select.GroupLabel": (groupChild) => {
          labelProps = groupChild.props as SelectGroupLabelProps;
          label = labelProps.children;
        },
        "Select.Item": (groupChild) => {
          const item = groupChild.props as SelectItemProps;
          options.push({
            value: item.value,
            label: item.children,
            disabled: item.disabled,
            searchText: item.textValue,
            slotProps: item,
          });
        },
      });
      items.push({
        label: label ?? "",
        options,
        searchText: props.textValue,
        slotProps: props,
        labelProps,
      });
    },
  });
  return items;
}

function collectSelectComposition(children: ReactNode): SelectComposition {
  const composition: SelectComposition = { options: [] };

  dispatchCompoundSlots(children, {
    "Select.Label": (child) => {
      composition.label = child.props as SelectLabelProps;
    },
    "Select.Description": (child) => {
      composition.description = child.props as SelectDescriptionProps;
    },
    "Select.ErrorMessage": (child) => {
      composition.errorMessage = child.props as SelectErrorMessageProps;
    },
    "Select.Trigger": (child) => {
      composition.trigger = child.props as SelectTriggerProps;
    },
    "Select.Empty": (child) => {
      composition.empty = child.props as SelectEmptyProps;
    },
    "Select.NoMatches": (child) => {
      composition.noMatches = child.props as SelectNoMatchesProps;
    },
    "Select.Content": (child) => {
      composition.content = child.props as SelectContentProps;
      composition.options.push(
        ...collectSelectItems((child.props as SelectContentProps).children),
      );
    },
    "Select.Item": (child) => {
      composition.options.push(...collectSelectItems(child));
    },
    "Select.Group": (child) => {
      composition.options.push(...collectSelectItems(child));
    },
  });
  return composition;
}

const selectSizeClasses: Record<InputSize, string> = {
  sm: "text-gs-input-font-size-sm",
  md: "text-gs-input-font-size",
  lg: "text-gs-input-font-size-lg",
};

const selectControlSizeClasses: Record<InputSize, string> = {
  sm: "h-[max(var(--input-height-sm),var(--control-hit-target))] min-h-[max(var(--input-height-sm),var(--control-hit-target))] gap-gs-input-gap-sm px-2",
  md: "h-[max(var(--input-height-md),var(--control-hit-target))] min-h-[max(var(--input-height-md),var(--control-hit-target))] gap-gs-input-gap px-3",
  lg: "h-[max(var(--input-height-lg),var(--control-hit-target))] min-h-[max(var(--input-height-lg),var(--control-hit-target))] gap-gs-input-gap px-4",
};

const selectIconSizeClasses: Record<InputSize, string> = {
  sm: "size-gs-input-icon-size-sm",
  md: "size-gs-input-icon-size",
  lg: "size-gs-input-icon-size-lg",
};

function labelToText(label: ReactNode): string {
  return typeof label === "string" || typeof label === "number"
    ? String(label)
    : "";
}

function optionSearchText(option: SelectOption): string {
  return (option.searchText ?? labelToText(option.label)).toLowerCase();
}

function groupSearchText(group: SelectOptionGroup): string {
  return (group.searchText ?? labelToText(group.label)).toLowerCase();
}

function normalizeValue(
  value: SelectValue | SelectValue[] | undefined,
): SelectValue[] {
  if (Array.isArray(value)) {
    return value;
  }
  if (value) {
    return [value];
  }
  return EMPTY_VALUES;
}

function equalValues(a: SelectValue[], b: SelectValue[]): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

type SelectionChangeHandler =
  | SelectSingleProps["onValueChange"]
  | SelectMultipleProps["onValueChange"];

type SelectionStrategy = {
  nextValues: (current: SelectValue[], value: SelectValue) => SelectValue[];
  publicValue: (values: SelectValue[]) => SelectValue | SelectValue[];
  notify: (handler: SelectionChangeHandler, values: SelectValue[]) => void;
  closeOnSelect: boolean;
};

const selectionStrategies: Record<"single" | "multiple", SelectionStrategy> = {
  single: {
    nextValues: (_current, value) => [value],
    publicValue: (values) => values[0] ?? "",
    notify: (handler, values) =>
      (handler as SelectSingleProps["onValueChange"])?.(values[0] ?? ""),
    closeOnSelect: true,
  },
  multiple: {
    nextValues: (current, value) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    publicValue: (values) => values,
    notify: (handler, values) =>
      (handler as SelectMultipleProps["onValueChange"])?.(values),
    closeOnSelect: false,
  },
};

function flattenOptions(items: SelectOptionItem[]): {
  flat: SelectFlatOption[];
  all: SelectOption[];
} {
  const flat: SelectFlatOption[] = [];
  const all: SelectOption[] = [];

  items.forEach((item, groupIndex) => {
    if (isSelectOptionGroup(item)) {
      const groupKey = `group-${groupIndex}`;
      item.options.forEach((option) => {
        const next = { ...option, groupKey };
        flat.push(next);
        all.push(option);
      });
      return;
    }
    flat.push(item);
    all.push(item);
  });

  return { flat, all };
}

function filterOptionItems(
  items: SelectOptionItem[],
  query: string,
  skipLocalFilter: boolean,
): SelectOptionItem[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (skipLocalFilter || normalizedQuery.length === 0) {
    return items;
  }

  const result: SelectOptionItem[] = [];

  for (const item of items) {
    if (isSelectOptionGroup(item)) {
      const groupMatches = groupSearchText(item).includes(normalizedQuery);
      const matchedOptions = groupMatches
        ? item.options
        : item.options.filter((option) =>
            optionSearchText(option).includes(normalizedQuery),
          );
      if (matchedOptions.length > 0) {
        result.push({ ...item, options: matchedOptions });
      }
      continue;
    }

    if (optionSearchText(item).includes(normalizedQuery)) {
      result.push(item);
    }
  }

  return result;
}

function renderVirtualFallback(
  options: readonly SelectFlatOption[],
  activeIndex: number,
  renderOption: (option: SelectFlatOption, index: number) => ReactNode,
) {
  const maxStart = Math.max(0, options.length - SELECT_VIRTUAL_FALLBACK_SIZE);
  const start = Math.min(
    maxStart,
    Math.max(0, activeIndex - Math.floor(SELECT_VIRTUAL_FALLBACK_SIZE / 2)),
  );
  return (
    <div className="gs-select-virtual-fallback grid">
      {options
        .slice(start, start + SELECT_VIRTUAL_FALLBACK_SIZE)
        .map((option, offset) => renderOption(option, start + offset))}
    </div>
  );
}

function ChevronIcon() {
  return (
    <svg
      className="gs-select-indicator-icon block size-full"
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

function CheckIcon() {
  return (
    <svg
      className="gs-select-check-icon block size-full opacity-0"
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

function SearchIcon() {
  return (
    <svg
      className="gs-select-search-icon block size-gs-input-icon-size"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="2" />
      <path
        d="M16 16L20.5 20.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

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
  const labelId = `${reactId}-label`;
  const descriptionId = `${reactId}-description`;
  const errorId = `${reactId}-error`;
  const searchId = `${reactId}-search`;
  const fieldId = id ?? `${reactId}-select`;
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

  useEffect(() => {
    if (open && searchable && ready) {
      searchRef.current?.focus();
    }
  }, [open, ready, searchable]);
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

  useEffect(() => {
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
      setQuery("");
    };

    document.addEventListener("pointerdown", handlePointerDown, true);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
      popEscapeLayer(escapeLayer);
    };
  }, [floatingRef, open, triggerRef]);

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
        className={clsx(
          "gs-select-option flex min-h-gs-control-hit-target cursor-pointer items-center gap-2 rounded-gs-select-option-radius px-3 py-2 font-normal text-gs-text transition-colors duration-200 ease-gs-standard data-[active=true]:bg-gs-surface-mist data-[selected=true]:text-gs-border-focus data-[active=true]:data-[selected=true]:bg-gs-focus-muted data-[disabled=true]:cursor-not-allowed data-[disabled=true]:text-gs-text-disabled motion-reduce:transition-none [[data-reduced-motion=true]_&]:transition-none",
          optionSlot.className,
        )}
        data-active={index === activeIndex ? "true" : undefined}
        data-selected={selected ? "true" : undefined}
        data-disabled={option.disabled ? "true" : undefined}
        onMouseDown={(event) => event.preventDefault()}
        onMouseEnter={() => setActiveIndex(index)}
        onClick={() => selectOption(option)}
      >
        {multiple ? (
          <span
            className="gs-select-check inline-flex size-4 shrink-0 items-center justify-center text-current [.gs-select-option[data-selected=true]_&_.gs-select-check-icon]:opacity-100"
            aria-hidden="true"
          >
            <CheckIcon />
          </span>
        ) : null}
        <span className="gs-select-option-label min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
          {option.label}
        </span>
        {!multiple && selected ? (
          <span
            className="gs-select-check ms-auto inline-flex size-4 shrink-0 items-center justify-center text-current [.gs-select-option[data-selected=true]_&_.gs-select-check-icon]:opacity-100"
            aria-hidden="true"
          >
            <CheckIcon />
          </span>
        ) : null}
      </div>
    );
  };

  const listContent =
    shouldVirtualize && filteredFlat.length > 0 ? (
      <Suspense
        fallback={renderVirtualFallback(
          filteredFlat,
          activeIndex,
          renderOption,
        )}
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
              className={clsx(
                "gs-select-group grid gap-0 [&+.gs-select-group]:mt-1 [&+.gs-select-group]:border-t [&+.gs-select-group]:border-[color-mix(in_oklab,var(--color-border-default)_55%,transparent)] [&+.gs-select-group]:pt-1",
                groupSlot.className,
              )}
              role="group"
              aria-label={labelToText(item.label) || undefined}
            >
              <div
                {...groupLabelProps}
                className={clsx(
                  "gs-select-group-label select-none px-3 pb-1 pt-2 text-xs font-medium leading-[1.2] tracking-normal text-gs-text-secondary uppercase",
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
          "gs-select-empty min-h-gs-control-hit-target rounded-gs-select-option-radius px-3 py-2 text-gs-input-placeholder",
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
      className={clsx(
        "gs-select-panel z-gs-select grid overflow-hidden rounded-gs-xs border border-gs-surface-border bg-gs-surface-raised bg-gs-surface-highlight shadow-gs-select-list-shadow data-[ready=true]:animate-gs-float-in data-[placement^=top]:[--gs-float-from:0_var(--space-1)] motion-reduce:animate-none [[data-reduced-motion=true]_&]:animate-none",
        content?.className,
      )}
      data-gs-overlay-branch=""
      data-ready={ready ? "true" : undefined}
      data-placement={coords.placement}
      dir={dir}
      onKeyDown={handleKeyDown}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        inlineSize: triggerRef.current?.offsetWidth,
        transform: `translate3d(${coords.x}px, ${coords.y}px, 0)`,
        visibility: ready ? "visible" : "hidden",
      }}
    >
      {searchable ? (
        <div className="gs-select-search-bar flex items-center gap-2 border-b border-[color-mix(in_oklab,var(--color-border-default)_70%,transparent)] bg-gs-surface-raised px-3 py-2">
          <span
            className="gs-select-search-leading inline-flex shrink-0 text-gs-text-secondary"
            aria-hidden="true"
          >
            <SearchIcon />
          </span>
          <input
            ref={searchRef}
            id={searchId}
            type="search"
            className="gs-select-search m-0 min-w-0 flex-1 border-0 bg-transparent p-0 font-inherit text-sm leading-[1.25] text-gs-input-color outline-none placeholder:text-gs-input-placeholder [&[type=search]::-webkit-search-decoration]:hidden [&[type=search]::-webkit-search-decoration]:appearance-none [&[type=search]::-webkit-search-cancel-button]:hidden [&[type=search]::-webkit-search-cancel-button]:appearance-none"
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
        className={clsx(
          "gs-select-listbox max-h-gs-select-list-max-height overflow-auto overscroll-contain p-1",
          shouldVirtualize ? "block" : "grid",
        )}
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
        "gs-select group/select relative inline-flex min-w-[calc(var(--space-20)*2.5)] max-w-full align-top text-gs-input-color",
        selectSizeClasses[size],
        fullWidth && "flex w-full",
        disabled && "cursor-not-allowed opacity-gs-disabled",
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
        className={clsx(
          "gs-select-control inline-flex w-full items-center box-border rounded-gs-xs border border-gs-default bg-gs-surface bg-gs-surface-highlight shadow-gs-surface-sheen transition-[background-color,border-color,box-shadow,opacity] duration-200 ease-gs-standard focus-within:border-gs-focus focus-within:bg-gs-surface-raised focus-within:shadow-gs-input-focus-border has-[:focus-visible]:shadow-gs-input-surface-focus motion-reduce:transition-none [[data-reduced-motion=true]_&]:transition-none [[data-high-contrast=true]_&]:border [[data-high-contrast=true]_&]:border-gs-input-border [[data-high-contrast=true]_&]:focus-within:border-gs-focus",
          selectControlSizeClasses[size],
          isInvalid
            ? "border-gs-error bg-gs-error-subtle focus-within:border-gs-error focus-within:bg-gs-error-subtle focus-within:shadow-gs-input-invalid-border has-[:focus-visible]:shadow-gs-input-invalid-focus [[data-high-contrast=true]_&]:border-gs-error"
            : !disabled &&
                "group-hover/select:border-gs-strong group-hover/select:bg-gs-surface-muted",
          open &&
            (isInvalid
              ? "border-gs-error bg-gs-error-subtle shadow-gs-input-invalid-border"
              : "border-gs-focus bg-gs-surface-raised shadow-gs-input-focus-border"),
        )}
      >
        {hasNativeControl ? (
          <select
            ref={nativeSelectRef}
            className="gs-select-native absolute -m-gs-control-border-width size-gs-control-border-width overflow-hidden whitespace-nowrap border-0 p-0 [clip:rect(0,0,0,0)] [clip-path:inset(50%)]"
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
          aria-describedby={describedBy || undefined}
          disabled={disabled}
          className={clsx(
            "gs-select-trigger m-0 inline-flex min-h-full min-w-0 flex-1 cursor-pointer items-center border-0 bg-transparent p-0 text-start font-inherit leading-[1.25] text-inherit outline-none",
            disabled && "cursor-not-allowed",
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
            className="gs-select-value block overflow-hidden text-ellipsis whitespace-nowrap data-[placeholder=true]:text-gs-input-placeholder"
            data-placeholder={selectedLabels.length === 0 ? "true" : undefined}
          >
            {displayValue}
          </span>
        </button>
        <span
          className={clsx(
            "gs-select-indicator pointer-events-none inline-flex shrink-0 items-center justify-center text-gs-text-secondary transition-transform duration-200 ease-gs-standard motion-reduce:transition-none [[data-reduced-motion=true]_&]:transition-none",
            selectIconSizeClasses[size],
            open && "rotate-180",
          )}
          aria-hidden="true"
        >
          <ChevronIcon />
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
    <div
      {...props}
      ref={ref}
      className={clsx(inputFieldClasses, fullWidth && "grid w-full", className)}
      data-size={size}
      data-full-width={fullWidth ? "true" : undefined}
      data-disabled={disabled ? "true" : undefined}
      data-invalid={isInvalid ? "true" : undefined}
      dir={dir}
    >
      {label?.children != null && label.children !== false ? (
        <label
          {...label}
          className={clsx(
            inputLabelClasses,
            "cursor-default",
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
