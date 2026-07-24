import type {
  ForwardedRef,
  KeyboardEvent as ReactKeyboardEvent,
  ReactNode,
} from "react";
import {
  forwardRef,
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
import { inputLabelSizeClasses } from "../shared/input-tailwind-classes";
import { Portal } from "../shared/portal";
import type { Placement } from "../shared/position";
import {
  floatingLayerStyle,
  useFloatingPosition,
} from "../shared/use-floating-position";
import { useDismissibleFloating } from "../shared/use-dismissible-floating";
import { FieldChrome, getFieldDescribedBy } from "../shared/field-chrome";
import { useLatestRef } from "../shared/use-latest-ref";
import { CalendarHeader, CalendarWeekdays } from "./CalendarChrome";
import {
  DatePickerCalendarFooter,
  DatePickerWeek,
  type DatePickerDayMetadata,
} from "./DatePickerCalendar";
import { serializeDate } from "./date-picker-utils";
import { resolveDatePickerKeyboardCommand } from "./date-picker-keyboard";
import {
  datePickerButtonClasses,
  datePickerClasses,
  datePickerClearClasses,
  datePickerDisabledLabelClasses,
  datePickerDisabledTextClasses,
  datePickerGridClasses,
  datePickerIconClasses,
  datePickerNativeClasses,
  datePickerNavClasses,
  datePickerPanelClasses,
  datePickerTriggerClasses,
  datePickerValueClasses,
} from "./DatePicker.classes";
import type {
  DatePickerDescriptionProps,
  DatePickerErrorMessageProps,
  DatePickerLabelProps,
  DatePickerProps,
} from "./DatePicker.types";
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
import { CalendarIcon, CloseIcon } from "../shared/icons";

const LONG_DATE_FORMAT: Intl.DateTimeFormatOptions = {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
};

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
  const panelId = `${reactId}-panel`;
  const {
    controlId: fieldId,
    labelId,
    descriptionId,
    errorId,
    describedBy,
  } = getFieldDescribedBy({
    id,
    reactId,
    idSuffix: "datepicker",
    hasDescription: Boolean(description?.children),
    hasError: Boolean(errorMessage?.children),
  });

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

  const triggerButtonRef = useRef<HTMLButtonElement | null>(null);
  const nativeInputRef = useRef<HTMLInputElement | null>(null);
  const dayRefs = useRef(new Map<string, HTMLButtonElement>());
  // Set when keyboard navigation should move DOM focus after re-render;
  // month-nav clicks must not steal focus from the nav buttons.
  const shouldFocusDayRef = useRef(false);
  const positionedRef = useRef(false);
  const focusDateRef = useRef(focusDate);
  focusDateRef.current = focusDate;

  const tryFocusDay = useCallback(() => {
    if (!shouldFocusDayRef.current) {
      return;
    }
    const day = dayRefs.current.get(serializeDate(focusDateRef.current));
    if (!day) {
      return;
    }
    shouldFocusDayRef.current = false;
    day.focus();
  }, []);

  const { setTriggerNode, setFloatingNode } = useFloatingPosition({
    open,
    placement: "bottom-start" as Placement,
    offset: 8,
    flip: true,
    onPositioned: () => {
      positionedRef.current = true;
      tryFocusDay();
    },
  });

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
    if (!open) {
      positionedRef.current = false;
      return;
    }
    if (positionedRef.current) {
      tryFocusDay();
    }
  }, [focusDate, open, tryFocusDay, viewMonth]);

  const closeAndRestoreFocus = useCallback(() => {
    setOpenRef.current(false);
    requestAnimationFrame(() => triggerButtonRef.current?.focus());
  }, [setOpenRef]);

  useDismissibleFloating({
    open,
    closeOnEscape: true,
    getContainNodes: () => [
      document.getElementById(fieldId)?.closest(".gs-datepicker"),
      document.getElementById(panelId),
    ],
    onDismiss: (reason) => {
      if (reason === "outside") {
        setOpenRef.current(false);
      } else {
        closeAndRestoreFocus();
      }
    },
  });

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
    <FieldChrome
      {...props}
      ref={ref}
      fieldClassName={datePickerClasses({ fullWidth })}
      className={className}
      size={size}
      fullWidth={fullWidth}
      disabled={disabled}
      invalid={isInvalid}
      dir={dir}
      data-open={open ? "true" : undefined}
      messageOrder="description-first"
      descriptionAs="div"
      errorAs="div"
      label={
        label
          ? {
              ...label,
              htmlFor: fieldId,
              id: labelId,
              required,
              sizeClassName: inputLabelSizeClasses[size],
              disabledClassName: datePickerDisabledLabelClasses,
            }
          : undefined
      }
      description={
        description
          ? {
              ...description,
              id: descriptionId,
              disabledClassName: datePickerDisabledTextClasses,
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
      afterMessages={
        open ? (
          <Portal>
            <div
              ref={setFloatingNode}
              id={panelId}
              role="dialog"
              data-gs-overlay-branch=""
              aria-modal="false"
              aria-label={monthLabel}
              className={datePickerPanelClasses}
              dir={dir}
              style={floatingLayerStyle}
            >
              <CalendarHeader
                monthLabel={monthLabel}
                previousMonthLabel={previousMonthLabel}
                nextMonthLabel={nextMonthLabel}
                dir={dir}
                onChangeMonth={goToMonth}
                monthLabelClassName="gs-datepicker-month-label"
                navButtonClassName={datePickerNavClasses}
              />

              <CalendarWeekdays weekdays={weekdays} />

              <div
                className={datePickerGridClasses}
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
        ) : null
      }
    >
      <div
        ref={setTriggerNode}
        className={datePickerTriggerClasses({
          size,
          fullWidth,
          invalid: isInvalid,
        })}
        data-size={size}
        data-invalid={isInvalid ? "true" : undefined}
        data-disabled={disabled ? "true" : undefined}
      >
        <button
          ref={triggerButtonRef}
          id={fieldId}
          type="button"
          className={datePickerButtonClasses({ size, invalid: isInvalid })}
          disabled={disabled}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={open ? panelId : undefined}
          aria-invalid={isInvalid || undefined}
          aria-required={required || undefined}
          aria-describedby={describedBy}
          aria-labelledby={label?.children != null ? labelId : undefined}
          onClick={() => setOpen(!open)}
        >
          <span
            className={datePickerValueClasses}
            data-placeholder={!displayValue ? "true" : undefined}
          >
            {displayValue || placeholder}
          </span>
          <span className={datePickerIconClasses} aria-hidden="true">
            <CalendarIcon />
          </span>
        </button>
        {clearable && selected && !disabled && !readOnly ? (
          <button
            type="button"
            className={datePickerClearClasses}
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
          className={datePickerNativeClasses}
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
    </FieldChrome>
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
