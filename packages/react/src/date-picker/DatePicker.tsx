import type {
  ForwardedRef,
  KeyboardEvent as ReactKeyboardEvent,
  ReactNode,
} from "react";
import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { useControllableState } from "@velune/hooks";
import {
  collectCompoundSlotProps,
  createCompoundSlot,
} from "../shared/compound-slot";
import { clsx } from "clsx";
import {
  inputDescriptionClasses,
  inputErrorClasses,
  inputLabelClasses,
  inputLabelSizeClasses,
  inputRequiredClasses,
} from "../shared/input-tailwind-classes";
import {
  isTopEscapeLayer,
  popEscapeLayer,
  pushEscapeLayer,
} from "../shared/overlay-stack";
import { Portal } from "../shared/portal";
import type { Placement } from "../shared/position";
import { useFloatingPosition } from "../shared/use-floating-position";
import { useLatestRef } from "../shared/use-latest-ref";
import type {
  DatePickerDescriptionProps,
  DatePickerErrorMessageProps,
  DatePickerLabelProps,
  DatePickerProps,
} from "./DatePicker.types";
import { serializeDate } from "./date-picker-utils";
import { resolveDatePickerKeyboardCommand } from "./date-picker-keyboard";
import {
  addMonths,
  clampDate,
  dateInputKey,
  formatDisplayDate,
  formatMonthLabel,
  getDateTimeFormatter,
  getMonthMatrix,
  getWeekdayLabels,
  isDateDisabled,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  toDateValue,
} from "./date-utils";

const datePickerTriggerSizeClasses = {
  sm: "[--gs-dp-box:var(--input-height-sm)]",
  md: "[--gs-dp-box:var(--input-height-md)]",
  lg: "[--gs-dp-box:var(--input-height-lg)]",
} as const;

const datePickerButtonSizeClasses = {
  sm: "px-2 text-gs-input-font-size-sm",
  md: "px-3 text-gs-input-font-size",
  lg: "px-4 text-gs-input-font-size-lg",
} as const;

const datePickerIconButtonClasses =
  "m-0 inline-flex size-gs-control-hit-target shrink-0 cursor-pointer items-center justify-center rounded-gs-sm border-0 bg-transparent p-0 text-gs-text-secondary hover:bg-gs-datepicker-day-bg-hover hover:text-gs-text focus-visible:outline-none focus-visible:shadow-gs-input-focus [&_svg]:block [&_svg]:size-4";

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <rect
        x="3.5"
        y="5"
        width="17"
        height="15"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path
        d="M3.5 9.5H20.5M8 3.5V6.5M16 3.5V6.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Chevron({ direction }: { direction: "prev" | "next" }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
      {direction === "prev" ? (
        <path
          d="M10 3.5L5.5 8L10 12.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M6 3.5L10.5 8L6 12.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M4 4L12 12M12 4L4 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

const LONG_DATE_FORMAT: Intl.DateTimeFormatOptions = {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
};

type DatePickerDayMetadata = {
  date: Date;
  key: string;
  outside: boolean;
  today: boolean;
  disabled: boolean;
  label: string;
  setRef: (node: HTMLButtonElement | null) => void;
};

type DatePickerDayProps = {
  metadata: DatePickerDayMetadata;
  selected: boolean;
  focused: boolean;
  tabStop: boolean;
  onSelect: (date: Date) => void;
  onFocus: (date: Date) => void;
};

const DatePickerDay = memo(function DatePickerDay({
  metadata,
  selected,
  focused,
  tabStop,
  onSelect,
  onFocus,
}: DatePickerDayProps) {
  const { date } = metadata;

  return (
    <button
      ref={metadata.setRef}
      type="button"
      role="gridcell"
      className="gs-datepicker-day m-0 inline-flex w-full min-h-[max(var(--datepicker-cell-size),var(--control-hit-target))] cursor-pointer appearance-none items-center justify-center box-border rounded-gs-datepicker-cell-radius border-0 bg-transparent p-0 font-inherit text-gs-datepicker-cell-font-size font-normal text-gs-text hover:not-disabled:not-data-[selected=true]:bg-gs-datepicker-day-bg-hover data-[outside=true]:text-gs-datepicker-day-color-outside data-[today=true]:not-data-[selected=true]:bg-gs-datepicker-day-bg-today data-[selected=true]:bg-gs-datepicker-day-bg-selected data-[selected=true]:text-gs-datepicker-day-color-selected focus-visible:outline-none focus-visible:shadow-gs-input-focus data-[focused=true]:focus:outline-none data-[focused=true]:focus:shadow-gs-input-focus disabled:cursor-not-allowed disabled:text-gs-text-disabled"
      tabIndex={tabStop ? 0 : -1}
      disabled={metadata.disabled}
      aria-label={metadata.label}
      aria-selected={selected}
      data-outside={metadata.outside ? "true" : undefined}
      data-selected={selected ? "true" : undefined}
      data-today={metadata.today ? "true" : undefined}
      data-focused={focused ? "true" : undefined}
      onClick={() => onSelect(date)}
      onFocus={() => onFocus(date)}
    >
      {date.getDate()}
    </button>
  );
});

type DatePickerWeekProps = {
  days: readonly DatePickerDayMetadata[];
  selectedKey: string;
  focusedKey: string;
  tabStopKey: string;
  onSelect: (date: Date) => void;
  onFocus: (date: Date) => void;
};

const DatePickerWeek = memo(
  function DatePickerWeek({
    days,
    selectedKey,
    focusedKey,
    tabStopKey,
    onSelect,
    onFocus,
  }: DatePickerWeekProps) {
    return (
      <div
        className="gs-datepicker-row grid grid-cols-[repeat(7,minmax(var(--control-hit-target),1fr))] gap-1 max-[22.5rem]:gap-0"
        role="row"
      >
        {days.map((metadata) => (
          <DatePickerDay
            key={metadata.key}
            metadata={metadata}
            selected={metadata.key === selectedKey}
            focused={metadata.key === focusedKey}
            tabStop={metadata.key === tabStopKey}
            onSelect={onSelect}
            onFocus={onFocus}
          />
        ))}
      </div>
    );
  },
  (previous, next) => {
    if (
      previous.days !== next.days ||
      previous.onSelect !== next.onSelect ||
      previous.onFocus !== next.onFocus
    ) {
      return false;
    }

    return !next.days.some(({ key }) => {
      const wasSelected = key === previous.selectedKey;
      const isSelected = key === next.selectedKey;
      const wasFocused = key === previous.focusedKey;
      const isFocused = key === next.focusedKey;
      const wasTabStop = key === previous.tabStopKey;
      const isTabStop = key === next.tabStopKey;
      return (
        wasSelected !== isSelected ||
        wasFocused !== isFocused ||
        wasTabStop !== isTabStop
      );
    });
  },
);

const DatePickerCalendarHeader = memo(function DatePickerCalendarHeader({
  monthLabel,
  previousMonthLabel,
  nextMonthLabel,
  dir,
  onChangeMonth,
}: {
  monthLabel: string;
  previousMonthLabel: string;
  nextMonthLabel: string;
  dir: "ltr" | "rtl";
  onChangeMonth: (amount: number) => void;
}) {
  return (
    <div className="gs-datepicker-header mb-2 flex items-center gap-gs-datepicker-header-gap">
      <button
        type="button"
        className={clsx(datePickerIconButtonClasses, "gs-datepicker-nav")}
        aria-label={previousMonthLabel}
        onClick={() => onChangeMonth(-1)}
      >
        <Chevron direction={dir === "rtl" ? "next" : "prev"} />
      </button>
      <div className="gs-datepicker-month-label flex-auto text-center text-sm font-medium text-gs-text">
        {monthLabel}
      </div>
      <button
        type="button"
        className={clsx(datePickerIconButtonClasses, "gs-datepicker-nav")}
        aria-label={nextMonthLabel}
        onClick={() => onChangeMonth(1)}
      >
        <Chevron direction={dir === "rtl" ? "prev" : "next"} />
      </button>
    </div>
  );
});

const DatePickerWeekdayHeader = memo(function DatePickerWeekdayHeader({
  weekdays,
}: {
  weekdays: readonly string[];
}) {
  return (
    <div
      className="gs-datepicker-weekdays mb-1 grid grid-cols-[repeat(7,minmax(var(--control-hit-target),1fr))] gap-1 max-[22.5rem]:gap-0"
      aria-hidden="true"
    >
      {weekdays.map((day, index) => (
        <span
          key={`${day}-${index}`}
          className="gs-datepicker-weekday inline-flex min-h-6 items-center justify-center text-gs-datepicker-weekday-size font-medium text-gs-text-secondary"
        >
          {day}
        </span>
      ))}
    </div>
  );
});

const DatePickerCalendarFooter = memo(function DatePickerCalendarFooter({
  todayLabel,
  disabled,
  onSelectToday,
}: {
  todayLabel: string;
  disabled: boolean;
  onSelectToday: () => void;
}) {
  return (
    <div className="gs-datepicker-footer mt-2 flex justify-end pt-2">
      <button
        type="button"
        className="gs-datepicker-today m-0 min-h-gs-control-hit-target cursor-pointer appearance-none rounded-gs-sm border-0 bg-transparent px-2 py-1 font-inherit text-xs font-medium text-gs-border-focus hover:not-disabled:bg-gs-surface-mist focus-visible:outline-none focus-visible:shadow-gs-input-focus disabled:cursor-not-allowed disabled:text-gs-text-disabled"
        disabled={disabled}
        onClick={onSelectToday}
      >
        {todayLabel}
      </button>
    </div>
  );
});

type DatePickerComposition = {
  label?: DatePickerLabelProps;
  description?: DatePickerDescriptionProps;
  errorMessage?: DatePickerErrorMessageProps;
};

const datePickerSlotSchema = {
  "DatePicker.Label": "label",
  "DatePicker.Description": "description",
  "DatePicker.ErrorMessage": "errorMessage",
} as const satisfies Readonly<Record<string, keyof DatePickerComposition>>;

function collectDatePickerComposition(
  children: ReactNode,
): DatePickerComposition {
  return collectCompoundSlotProps<DatePickerComposition>(
    children,
    datePickerSlotSchema,
  );
}

function DatePickerImpl(
  {
    children,
    value,
    defaultValue = null,
    onValueChange,
    min,
    max,
    disabled = false,
    invalid = false,
    required = false,
    readOnly = false,
    placeholder = "Select date",
    todayLabel = "Today",
    previousMonthLabel = "Previous month",
    nextMonthLabel = "Next month",
    clearLabel = "Clear date",
    size = "md",
    fullWidth = false,
    clearable = false,
    locale,
    formatOptions,
    weekStartsOn = 0,
    dir = "ltr",
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    name,
    form,
    id,
    className,
    ...props
  }: DatePickerProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const { label, description, errorMessage } =
    collectDatePickerComposition(children);
  const reactId = useId();
  const fieldId = id ?? `${reactId}-datepicker`;
  const labelId = `${reactId}-label`;
  const descriptionId = `${reactId}-description`;
  const errorId = `${reactId}-error`;
  const panelId = `${reactId}-panel`;

  const resolvedLocale =
    locale ?? (typeof navigator !== "undefined" ? navigator.language : "en");

  const isValueControlled = value !== undefined;
  const initialValueRef = useRef(toDateValue(defaultValue));
  // Memos key on primitive date keys: inline `new Date()` props change
  // object identity every render and would otherwise reset keyboard focus.
  const valueKey = dateInputKey(value);
  const controlledValue = useMemo(
    () =>
      toDateValue(typeof valueKey === "number" ? new Date(valueKey) : valueKey),
    [valueKey],
  );
  const [selected, setSelectedState] = useControllableState<Date | null>({
    value: isValueControlled ? controlledValue : undefined,
    defaultValue: initialValueRef.current,
  });
  const serializedValue = serializeDate(selected);
  const hasNativeControl = Boolean(name || required);

  const [stateOpen, setStateOpen] = useControllableState({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const open = disabled || readOnly ? false : stateOpen;

  useEffect(() => {
    if ((disabled || readOnly) && stateOpen) {
      setStateOpen(false);
    }
  }, [disabled, readOnly, setStateOpen, stateOpen]);

  const minKey = dateInputKey(min);
  const maxKey = dateInputKey(max);
  const minDate = useMemo(
    () => toDateValue(typeof minKey === "number" ? new Date(minKey) : minKey),
    [minKey],
  );
  const maxDate = useMemo(
    () => toDateValue(typeof maxKey === "number" ? new Date(maxKey) : maxKey),
    [maxKey],
  );

  const [viewMonth, setViewMonth] = useState(() =>
    startOfMonth(selected ?? new Date()),
  );
  const [focusDate, setFocusDate] = useState(() =>
    clampDate(selected ?? new Date(), minDate, maxDate),
  );

  const { setTriggerNode, setFloatingNode, coords, ready } =
    useFloatingPosition({
      open,
      placement: "bottom-start" as Placement,
      offset: 8,
      flip: true,
    });

  const triggerButtonRef = useRef<HTMLButtonElement | null>(null);
  const nativeInputRef = useRef<HTMLInputElement | null>(null);
  const dayRefs = useRef(new Map<string, HTMLButtonElement>());
  // Set when keyboard navigation should move DOM focus after re-render;
  // month-nav clicks must not steal focus from the nav buttons.
  const shouldFocusDayRef = useRef(false);

  const setOpen = useCallback(
    (next: boolean) => {
      if (disabled || readOnly) {
        return;
      }
      if (next === open) {
        return;
      }
      setStateOpen(next);
    },
    [disabled, open, readOnly, setStateOpen],
  );
  const setOpenRef = useLatestRef(setOpen);

  const setSelected = useCallback(
    (next: Date | null) => {
      if (serializeDate(next) === serializedValue) {
        return;
      }
      setSelectedState(next);
      onValueChange?.(next);
      queueMicrotask(() => {
        nativeInputRef.current?.dispatchEvent(
          new Event("change", { bubbles: true }),
        );
      });
    },
    [onValueChange, serializedValue, setSelectedState],
  );
  const setSelectedRef = useLatestRef(setSelected);

  useEffect(() => {
    if (isValueControlled) {
      return;
    }
    const associatedForm = nativeInputRef.current?.form;
    if (!associatedForm) {
      return;
    }
    const handleReset = () => setSelectedState(initialValueRef.current);
    associatedForm.addEventListener("reset", handleReset);
    return () => associatedForm.removeEventListener("reset", handleReset);
  }, [form, hasNativeControl, isValueControlled, setSelectedState]);

  useEffect(() => {
    if (open) {
      const base = clampDate(selected ?? new Date(), minDate, maxDate);
      setViewMonth((current) =>
        isSameMonth(current, base) ? current : startOfMonth(base),
      );
      setFocusDate((current) => (isSameDay(current, base) ? current : base));
      shouldFocusDayRef.current = true;
    }
  }, [maxDate, minDate, open, selected]);

  useEffect(() => {
    if (!open || !ready || !shouldFocusDayRef.current) {
      return;
    }

    const day = dayRefs.current.get(serializeDate(focusDate));
    if (!day) {
      return;
    }
    shouldFocusDayRef.current = false;
    day.focus();
  }, [focusDate, open, ready, viewMonth]);

  const closeAndRestoreFocus = useCallback(() => {
    setOpenRef.current(false);
    requestAnimationFrame(() => triggerButtonRef.current?.focus());
  }, [setOpenRef]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const escapeLayer = pushEscapeLayer();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isTopEscapeLayer(escapeLayer)) {
        event.preventDefault();
        event.stopPropagation();
        closeAndRestoreFocus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      popEscapeLayer(escapeLayer);
    };
  }, [closeAndRestoreFocus, open]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) {
        return;
      }
      const trigger = document
        .getElementById(fieldId)
        ?.closest(".gs-datepicker");
      const panel = document.getElementById(panelId);
      if (trigger?.contains(target) || panel?.contains(target)) {
        return;
      }
      setOpenRef.current(false);
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    return () =>
      document.removeEventListener("pointerdown", onPointerDown, true);
  }, [fieldId, open, panelId, setOpenRef]);

  const weekdays = useMemo(
    () => getWeekdayLabels(resolvedLocale, weekStartsOn),
    [resolvedLocale, weekStartsOn],
  );
  const longDateFormatter = useMemo(
    () => getDateTimeFormatter(resolvedLocale, LONG_DATE_FORMAT),
    [resolvedLocale],
  );
  const days = useMemo(
    () => getMonthMatrix(viewMonth, weekStartsOn),
    [viewMonth, weekStartsOn],
  );

  const displayValue = selected
    ? formatDisplayDate(selected, resolvedLocale, formatOptions)
    : "";

  const isInvalid = invalid || Boolean(errorMessage?.children);
  const describedBy = [
    description?.children ? descriptionId : null,
    errorMessage?.children ? errorId : null,
  ]
    .filter(Boolean)
    .join(" ");

  const selectDay = useCallback(
    (date: Date) => {
      if (isDateDisabled(date, minDate, maxDate)) {
        return;
      }
      const next = startOfDay(date);
      setSelectedRef.current(next);
      setFocusDate(next);
      closeAndRestoreFocus();
    },
    [closeAndRestoreFocus, maxDate, minDate, setSelectedRef],
  );

  const moveFocus = useCallback(
    (next: Date) => {
      const clamped = clampDate(next, minDate, maxDate);
      const existing = dayRefs.current.get(serializeDate(clamped));
      if (existing) {
        existing.focus();
      } else {
        // Day is in another month; focus it once the new matrix renders.
        shouldFocusDayRef.current = true;
      }
      setFocusDate(clamped);
      if (!isSameMonth(clamped, viewMonth)) {
        setViewMonth(startOfMonth(clamped));
      }
    },
    [maxDate, minDate, viewMonth],
  );

  // Month navigation keeps the roving tab stop inside the visible month
  // without stealing DOM focus from the nav buttons.
  const goToMonth = useCallback(
    (amount: number) => {
      const nextMonth = startOfMonth(addMonths(viewMonth, amount));
      setViewMonth(nextMonth);
      setFocusDate((prev) => {
        const candidate = clampDate(addMonths(prev, amount), minDate, maxDate);
        return isSameMonth(candidate, nextMonth) ? candidate : nextMonth;
      });
    },
    [maxDate, minDate, viewMonth],
  );

  const handleGridKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (
        !(event.target instanceof HTMLButtonElement) ||
        event.target.getAttribute("role") !== "gridcell"
      ) {
        return;
      }
      const command = resolveDatePickerKeyboardCommand(focusDate, event.key, {
        direction: dir,
        shiftKey: event.shiftKey,
        weekStartsOn,
      });
      if (!command) return;
      event.preventDefault();
      if (command.type === "select") selectDay(focusDate);
      else moveFocus(command.target);
    },
    [dir, focusDate, moveFocus, selectDay, weekStartsOn],
  );

  const today = startOfDay(new Date());
  const todayKey = serializeDate(today);
  const todayTimestamp = today.getTime();
  const selectToday = useCallback(() => {
    const next = new Date(todayTimestamp);
    setViewMonth(startOfMonth(next));
    selectDay(next);
  }, [selectDay, todayTimestamp]);
  const todayDisabled = isDateDisabled(today, minDate, maxDate);

  // Exactly one grid cell must stay tabbable; if focusDate is outside the
  // rendered matrix, fall back to the first selectable day of the month.
  const focusDateKey = serializeDate(focusDate);
  const focusTimestamp = focusDate.getTime();
  const firstMatrixDay = days[0];
  const lastMatrixDay = days[days.length - 1];
  const focusInMatrix =
    firstMatrixDay !== undefined &&
    lastMatrixDay !== undefined &&
    focusTimestamp >= firstMatrixDay.getTime() &&
    focusTimestamp <= lastMatrixDay.getTime();
  const tabStopKey = focusInMatrix
    ? focusDateKey
    : serializeDate(
        days.find(
          (day) =>
            isSameMonth(day, viewMonth) &&
            !isDateDisabled(day, minDate, maxDate),
        ) ??
          days.find((day) => isSameMonth(day, viewMonth)) ??
          days[0] ??
          focusDate,
      );
  const monthLabel = formatMonthLabel(viewMonth, resolvedLocale);
  const dayMetadata = useMemo<readonly DatePickerDayMetadata[]>(
    () =>
      days.map((day) => {
        const key = serializeDate(day);
        return {
          date: day,
          key,
          outside: !isSameMonth(day, viewMonth),
          today: key === todayKey,
          disabled: isDateDisabled(day, minDate, maxDate),
          label: longDateFormatter.format(day),
          setRef: (node: HTMLButtonElement | null) => {
            if (node) {
              dayRefs.current.set(key, node);
            } else {
              dayRefs.current.delete(key);
            }
          },
        };
      }),
    [days, longDateFormatter, maxDate, minDate, todayKey, viewMonth],
  );
  const dayWeeks = useMemo(
    () =>
      Array.from({ length: 6 }, (_, week) =>
        dayMetadata.slice(week * 7, week * 7 + 7),
      ),
    [dayMetadata],
  );

  return (
    <div
      {...props}
      ref={ref}
      className={clsx(
        "gs-datepicker inline-grid max-w-full gap-gs-input-field-gap align-top font-inherit text-gs-text",
        fullWidth && "grid w-full",
        className,
      )}
      data-size={size}
      data-full-width={fullWidth ? "true" : undefined}
      data-invalid={isInvalid ? "true" : undefined}
      data-disabled={disabled ? "true" : undefined}
      data-open={open ? "true" : undefined}
      dir={dir}
    >
      {label?.children != null ? (
        <label
          {...label}
          className={clsx(
            inputLabelClasses,
            inputLabelSizeClasses[size],
            disabled && "cursor-not-allowed text-gs-text-disabled",
            label.className,
          )}
          htmlFor={fieldId}
          id={labelId}
        >
          {label.children}
          {required ? (
            <span className={inputRequiredClasses} aria-hidden="true">
              *
            </span>
          ) : null}
        </label>
      ) : null}

      <div
        ref={setTriggerNode}
        className={clsx(
          "gs-datepicker-trigger relative inline-flex h-[max(var(--gs-dp-box),var(--control-hit-target))] min-h-[max(var(--gs-dp-box),var(--control-hit-target))] min-w-gs-datepicker-trigger-min-width max-w-full items-center rounded-gs-xs border border-gs-default bg-gs-surface bg-gs-surface-highlight text-gs-input-color shadow-gs-surface-sheen transition-[background-color,border-color,box-shadow] duration-200 ease-gs-standard has-[.gs-datepicker-button:hover:not(:disabled)]:border-gs-strong has-[.gs-datepicker-button:focus-visible]:border-gs-focus has-[.gs-datepicker-button:focus-visible]:bg-gs-surface-raised motion-reduce:transition-none [[data-reduced-motion=true]_&]:transition-none [[data-high-contrast=true]_&]:border [[data-high-contrast=true]_&]:border-gs-input-border",
          datePickerTriggerSizeClasses[size],
          fullWidth && "w-full",
          isInvalid &&
            "border-gs-error has-[.gs-datepicker-button:hover:not(:disabled)]:border-gs-error has-[.gs-datepicker-button:focus-visible]:border-gs-error [[data-high-contrast=true]_&]:border-gs-error",
        )}
        data-size={size}
        data-invalid={isInvalid ? "true" : undefined}
        data-disabled={disabled ? "true" : undefined}
      >
        <button
          ref={triggerButtonRef}
          id={fieldId}
          type="button"
          className={clsx(
            "gs-datepicker-button m-0 inline-flex size-full flex-auto cursor-pointer appearance-none items-center justify-between gap-gs-input-gap rounded-inherit border-0 bg-transparent py-0 text-start font-inherit text-inherit hover:not-disabled:bg-gs-surface-muted focus-visible:outline-none focus-visible:shadow-gs-input-surface-focus disabled:cursor-not-allowed disabled:opacity-gs-disabled",
            datePickerButtonSizeClasses[size],
            isInvalid &&
              "bg-gs-error-subtle focus-visible:shadow-gs-input-invalid-focus",
          )}
          disabled={disabled}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={open ? panelId : undefined}
          aria-invalid={isInvalid || undefined}
          aria-required={required || undefined}
          aria-describedby={describedBy || undefined}
          aria-labelledby={label?.children != null ? labelId : undefined}
          onClick={() => setOpen(!open)}
        >
          <span
            className="gs-datepicker-value min-w-0 overflow-hidden text-ellipsis whitespace-nowrap data-[placeholder=true]:text-gs-input-placeholder"
            data-placeholder={!displayValue ? "true" : undefined}
          >
            {displayValue || placeholder}
          </span>
          <span
            className="gs-datepicker-icon inline-flex size-gs-input-icon-size shrink-0 text-gs-text-secondary [&_svg]:block [&_svg]:size-full"
            aria-hidden="true"
          >
            <CalendarIcon />
          </span>
        </button>
        {clearable && selected && !disabled && !readOnly ? (
          <button
            type="button"
            className="gs-datepicker-clear absolute end-8 m-0 inline-flex size-gs-control-hit-target cursor-pointer items-center justify-center rounded-gs-sm border-0 bg-transparent p-0 text-gs-text-secondary hover:bg-gs-action-hover hover:text-gs-text focus-visible:outline-none focus-visible:shadow-gs-input-focus [&_svg]:block [&_svg]:size-3"
            aria-label={clearLabel}
            onClick={(event) => {
              event.stopPropagation();
              setSelected(null);
            }}
          >
            <CloseIcon />
          </button>
        ) : null}
      </div>

      {hasNativeControl ? (
        <input
          ref={nativeInputRef}
          className="gs-datepicker-native pointer-events-none absolute -m-gs-control-border-width size-gs-control-border-width overflow-hidden whitespace-nowrap border-0 p-0 [clip:rect(0,0,0,0)] [clip-path:inset(50%)]"
          type="date"
          name={name}
          form={form}
          value={serializedValue}
          min={serializeDate(minDate)}
          max={serializeDate(maxDate)}
          required={required}
          disabled={disabled}
          readOnly={readOnly}
          tabIndex={-1}
          aria-hidden="true"
          onChange={() => {}}
          onInvalid={() => triggerButtonRef.current?.focus()}
        />
      ) : null}

      {description?.children != null ? (
        <div
          {...description}
          id={descriptionId}
          className={clsx(
            inputDescriptionClasses,
            disabled && "text-gs-text-disabled",
            description.className,
          )}
        >
          {description.children}
        </div>
      ) : null}
      {errorMessage?.children ? (
        <div
          {...errorMessage}
          id={errorId}
          className={clsx(inputErrorClasses, errorMessage.className)}
          role="alert"
        >
          {errorMessage.children}
        </div>
      ) : null}

      {open ? (
        <Portal>
          <div
            ref={setFloatingNode}
            id={panelId}
            role="dialog"
            data-gs-overlay-branch=""
            aria-modal="false"
            aria-label={monthLabel}
            className="gs-datepicker-panel z-gs-datepicker w-[min(var(--datepicker-panel-width),calc(100vw-var(--space-4)))] box-border rounded-gs-datepicker-panel-radius border border-gs-surface-border bg-gs-datepicker-panel-bg bg-gs-surface-highlight p-gs-datepicker-panel-padding font-inherit text-gs-text shadow-gs-datepicker-panel-shadow outline-none data-[ready=true]:animate-gs-datepicker-in max-[22.5rem]:w-[min(var(--datepicker-panel-width),calc(100vw-var(--space-2)))] max-[22.5rem]:px-0 motion-reduce:data-[ready=true]:animate-none [[data-reduced-motion=true]_&]:data-[ready=true]:animate-none"
            data-ready={ready ? "true" : undefined}
            dir={dir}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              transform: `translate3d(${coords.x}px, ${coords.y}px, 0)`,
              visibility: ready ? "visible" : "hidden",
            }}
          >
            <DatePickerCalendarHeader
              monthLabel={monthLabel}
              previousMonthLabel={previousMonthLabel}
              nextMonthLabel={nextMonthLabel}
              dir={dir}
              onChangeMonth={goToMonth}
            />

            <DatePickerWeekdayHeader weekdays={weekdays} />

            <div
              className="gs-datepicker-grid grid gap-1 outline-none"
              role="grid"
              onKeyDown={handleGridKeyDown}
            >
              {dayWeeks.map((week, index) => (
                <DatePickerWeek
                  key={index}
                  days={week}
                  selectedKey={serializedValue}
                  focusedKey={focusDateKey}
                  tabStopKey={tabStopKey}
                  onSelect={selectDay}
                  onFocus={setFocusDate}
                />
              ))}
            </div>

            <DatePickerCalendarFooter
              todayLabel={todayLabel}
              disabled={todayDisabled}
              onSelectToday={selectToday}
            />
          </div>
        </Portal>
      ) : null}
    </div>
  );
}

const DatePickerRoot = forwardRef(DatePickerImpl);
DatePickerRoot.displayName = "DatePicker";

const DatePickerLabel =
  createCompoundSlot<DatePickerLabelProps>("DatePicker.Label");
const DatePickerDescription = createCompoundSlot<DatePickerDescriptionProps>(
  "DatePicker.Description",
);
const DatePickerErrorMessage = createCompoundSlot<DatePickerErrorMessageProps>(
  "DatePicker.ErrorMessage",
);

export const DatePicker = Object.assign(DatePickerRoot, {
  Label: DatePickerLabel,
  Description: DatePickerDescription,
  ErrorMessage: DatePickerErrorMessage,
});
