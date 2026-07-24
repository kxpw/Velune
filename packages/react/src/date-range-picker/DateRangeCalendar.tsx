import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import type {
  DatePickerDirection,
  DatePickerWeekStartsOn,
} from "../date-picker";
import { resolveDatePickerKeyboardCommand } from "../date-picker/date-picker-keyboard";
import { serializeDate } from "../date-picker/date-picker-utils";
import {
  addMonths,
  clampDate,
  formatMonthLabel,
  getDateTimeFormatter,
  getMonthMatrix,
  getWeekdayLabels,
  isDateDisabled,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
} from "../date-picker/date-utils";
import {
  CalendarHeader,
  CalendarWeekdays,
} from "../date-picker/CalendarChrome";
import { calendarRangeHeaderPaddingClasses } from "../date-picker/calendar-classes";
import { Portal } from "../shared/portal";
import type { Placement } from "../shared/position";
import {
  floatingLayerStyle,
  useFloatingPosition,
} from "../shared/use-floating-position";
import {
  dateRangeCalendarDayClasses,
  dateRangeCalendarGridClasses,
  dateRangeCalendarNavButtonClasses,
  dateRangeCalendarPopoverClasses,
  dateRangeCalendarRowClasses,
  dateRangeCalendarWeekdayClasses,
  dateRangeCalendarWeekdaysClasses,
} from "./DateRangePicker.classes";

const LONG_DATE_FORMAT: Intl.DateTimeFormatOptions = {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
};

function sortRange(a: Date, b: Date): { start: Date; end: Date } {
  return a.getTime() <= b.getTime()
    ? { start: a, end: b }
    : { start: b, end: a };
}

function isBetween(date: Date, start: Date, end: Date): boolean {
  const time = startOfDay(date).getTime();
  return time > startOfDay(start).getTime() && time < startOfDay(end).getTime();
}

export type DateRangeCalendarProps = {
  anchorRef: { current: HTMLElement | null };
  panelId: string;
  value: { start: Date | null; end: Date | null };
  min: Date | null;
  max: Date | null;
  locale: string;
  weekStartsOn: DatePickerWeekStartsOn;
  dir: DatePickerDirection;
  previousMonthLabel: string;
  nextMonthLabel: string;
  onSelect: (
    range: { start: Date | null; end: Date | null },
    complete: boolean,
  ) => void;
};

export default function DateRangeCalendar({
  anchorRef,
  panelId,
  value,
  min,
  max,
  locale,
  weekStartsOn,
  dir,
  previousMonthLabel,
  nextMonthLabel,
  onSelect,
}: DateRangeCalendarProps) {
  const initialFocus = clampDate(value.start ?? new Date(), min, max);
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(initialFocus));
  const [focusDate, setFocusDate] = useState(initialFocus);
  const [rangeAnchor, setRangeAnchor] = useState<Date | null>(null);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const dayRefs = useRef(new Map<string, HTMLButtonElement>());
  const shouldFocusDayRef = useRef(true);
  const positionedRef = useRef(false);
  const focusDateRef = useRef(focusDate);
  focusDateRef.current = focusDate;

  const tryFocusDay = () => {
    if (!shouldFocusDayRef.current) return;
    const day = dayRefs.current.get(serializeDate(focusDateRef.current));
    if (!day) return;
    shouldFocusDayRef.current = false;
    day.focus();
  };

  const { setTriggerNode, setFloatingNode } = useFloatingPosition({
    open: true,
    placement: "bottom-start" as Placement,
    offset: 8,
    flip: true,
    onPositioned: () => {
      positionedRef.current = true;
      tryFocusDay();
    },
  });

  useEffect(() => {
    setTriggerNode(anchorRef.current);
  }, [anchorRef, setTriggerNode]);

  useEffect(() => {
    if (positionedRef.current) {
      tryFocusDay();
    }
  }, [focusDate, viewMonth]);

  const weekdays = useMemo(
    () => getWeekdayLabels(locale, weekStartsOn),
    [locale, weekStartsOn],
  );
  const longDateFormatter = useMemo(
    () => getDateTimeFormatter(locale, LONG_DATE_FORMAT),
    [locale],
  );
  const days = useMemo(
    () => getMonthMatrix(viewMonth, weekStartsOn),
    [viewMonth, weekStartsOn],
  );
  const monthLabel = formatMonthLabel(viewMonth, locale);

  const selectDay = (date: Date) => {
    if (isDateDisabled(date, min, max)) return;
    const day = startOfDay(date);
    setFocusDate(day);
    if (rangeAnchor == null) {
      setRangeAnchor(day);
      onSelect({ start: day, end: null }, false);
      return;
    }
    setRangeAnchor(null);
    setHoverDate(null);
    onSelect(sortRange(rangeAnchor, day), true);
  };

  const moveFocus = (next: Date) => {
    const clamped = clampDate(next, min, max);
    const existing = dayRefs.current.get(serializeDate(clamped));
    if (existing) {
      existing.focus();
    } else {
      shouldFocusDayRef.current = true;
    }
    setFocusDate(clamped);
    if (!isSameMonth(clamped, viewMonth)) {
      setViewMonth(startOfMonth(clamped));
    }
  };

  const handleGridKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
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
  };

  // While picking the second date, preview the prospective range under the
  // pointer or keyboard focus; otherwise show the committed value.
  const preview = rangeAnchor
    ? sortRange(rangeAnchor, hoverDate ?? focusDate)
    : value.start && value.end
      ? { start: value.start, end: value.end }
      : null;
  const rangeStart = preview?.start ?? value.start;
  const rangeEnd = preview?.end ?? (rangeAnchor ? null : value.end);

  const focusKey = serializeDate(focusDate);
  const tabStopKey = days.some((day) => serializeDate(day) === focusKey)
    ? focusKey
    : serializeDate(
        days.find(
          (day) =>
            isSameMonth(day, viewMonth) && !isDateDisabled(day, min, max),
        ) ??
          days[0] ??
          focusDate,
      );

  return (
    <Portal>
      <div
        ref={setFloatingNode}
        id={panelId}
        role="dialog"
        aria-modal="false"
        aria-label={monthLabel}
        data-gs-overlay-branch=""
        className={dateRangeCalendarPopoverClasses}
        dir={dir}
        style={floatingLayerStyle}
      >
        <CalendarHeader
          monthLabel={monthLabel}
          previousMonthLabel={previousMonthLabel}
          nextMonthLabel={nextMonthLabel}
          dir={dir}
          onChangeMonth={(amount) =>
            setViewMonth(startOfMonth(addMonths(viewMonth, amount)))
          }
          headerClassName={calendarRangeHeaderPaddingClasses}
          navButtonClassName={dateRangeCalendarNavButtonClasses}
        />

        <CalendarWeekdays
          weekdays={weekdays}
          weekdaysClassName={dateRangeCalendarWeekdaysClasses}
          weekdayClassName={dateRangeCalendarWeekdayClasses}
        />

        <div
          className={dateRangeCalendarGridClasses}
          role="grid"
          onKeyDown={handleGridKeyDown}
          onMouseLeave={() => setHoverDate(null)}
        >
          {Array.from({ length: 6 }, (_, week) => (
            <div key={week} className={dateRangeCalendarRowClasses} role="row">
              {days.slice(week * 7, week * 7 + 7).map((day) => {
                const key = serializeDate(day);
                const disabled = isDateDisabled(day, min, max);
                const isStart =
                  rangeStart != null && isSameDay(day, rangeStart);
                const isEnd = rangeEnd != null && isSameDay(day, rangeEnd);
                const inRange =
                  rangeStart != null &&
                  rangeEnd != null &&
                  isBetween(day, rangeStart, rangeEnd);
                const today = isSameDay(day, new Date());
                return (
                  <button
                    key={key}
                    ref={(node) => {
                      if (node) dayRefs.current.set(key, node);
                      else dayRefs.current.delete(key);
                    }}
                    type="button"
                    role="gridcell"
                    tabIndex={key === tabStopKey ? 0 : -1}
                    disabled={disabled}
                    aria-label={longDateFormatter.format(day)}
                    aria-selected={isStart || isEnd || inRange}
                    data-outside={
                      !isSameMonth(day, viewMonth) ? "true" : undefined
                    }
                    data-selected={isStart || isEnd ? "true" : undefined}
                    data-in-range={inRange ? "true" : undefined}
                    data-today={today ? "true" : undefined}
                    className={dateRangeCalendarDayClasses}
                    onClick={() => selectDay(day)}
                    onFocus={() => setFocusDate(day)}
                    onMouseEnter={() => setHoverDate(day)}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </Portal>
  );
}
