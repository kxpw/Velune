import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { clsx } from "clsx";
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
import { Portal } from "../shared/portal";
import type { Placement } from "../shared/position";
import { useFloatingPosition } from "../shared/use-floating-position";

const iconButtonClasses =
  "m-0 inline-flex size-gs-control-hit-target shrink-0 cursor-pointer items-center justify-center rounded-gs-sm border-0 bg-transparent p-0 text-gs-text-secondary transition-[background-color,color,box-shadow,transform] duration-150 ease-gs-standard active:scale-95 hover:bg-gs-datepicker-day-bg-hover hover:text-gs-text focus-visible:outline-none focus-visible:shadow-gs-input-focus disabled:cursor-not-allowed disabled:text-gs-text-disabled motion-reduce:transition-none motion-reduce:active:scale-100 [[data-reduced-motion=true]_&]:transition-none [[data-reduced-motion=true]_&]:active:scale-100 [&_svg]:block [&_svg]:size-4";

function Chevron({ direction }: { direction: "previous" | "next" }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d={
          direction === "previous"
            ? "M10 3.5L5.5 8L10 12.5"
            : "M6 3.5L10.5 8L6 12.5"
        }
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
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
  const { setTriggerNode, setFloatingNode, coords, ready } =
    useFloatingPosition({
      open: true,
      placement: "bottom-start" as Placement,
      offset: 8,
      flip: true,
    });

  useEffect(() => {
    setTriggerNode(anchorRef.current);
  }, [anchorRef, setTriggerNode]);

  const initialFocus = clampDate(value.start ?? new Date(), min, max);
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(initialFocus));
  const [focusDate, setFocusDate] = useState(initialFocus);
  const [rangeAnchor, setRangeAnchor] = useState<Date | null>(null);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const dayRefs = useRef(new Map<string, HTMLButtonElement>());
  const shouldFocusDayRef = useRef(true);

  useEffect(() => {
    if (!ready || !shouldFocusDayRef.current) return;
    const day = dayRefs.current.get(serializeDate(focusDate));
    if (!day) return;
    shouldFocusDayRef.current = false;
    day.focus();
  }, [focusDate, ready, viewMonth]);

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
        data-ready={ready ? "true" : undefined}
        className="gs-date-range-picker-popover z-gs-datepicker w-[min(var(--datepicker-panel-width),calc(100vw-var(--space-4)))] box-border rounded-gs-datepicker-panel-radius border border-gs-surface-border bg-gs-datepicker-panel-bg bg-gs-surface-highlight p-gs-datepicker-panel-padding font-inherit text-gs-text shadow-gs-datepicker-panel-shadow outline-none data-[ready=true]:animate-gs-float-in motion-reduce:animate-none [[data-reduced-motion=true]_&]:animate-none"
        dir={dir}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          transform: `translate3d(${coords.x}px, ${coords.y}px, 0)`,
          visibility: ready ? "visible" : "hidden",
        }}
      >
        <div className="gs-datepicker-header mb-2 flex items-center gap-gs-datepicker-header-gap px-1 pt-1">
          <button
            type="button"
            className={iconButtonClasses}
            aria-label={previousMonthLabel}
            onClick={() => setViewMonth(startOfMonth(addMonths(viewMonth, -1)))}
          >
            <Chevron direction={dir === "rtl" ? "next" : "previous"} />
          </button>
          <div className="flex-auto text-center text-sm font-medium text-gs-text">
            {monthLabel}
          </div>
          <button
            type="button"
            className={iconButtonClasses}
            aria-label={nextMonthLabel}
            onClick={() => setViewMonth(startOfMonth(addMonths(viewMonth, 1)))}
          >
            <Chevron direction={dir === "rtl" ? "previous" : "next"} />
          </button>
        </div>

        <div
          className="gs-datepicker-weekdays mb-1 grid grid-cols-[repeat(7,minmax(var(--control-hit-target),1fr))] gap-y-1"
          aria-hidden="true"
        >
          {weekdays.map((day, index) => (
            <span
              key={`${day}-${index}`}
              className="inline-flex min-h-6 items-center justify-center text-gs-datepicker-weekday-size font-medium text-gs-text-secondary"
            >
              {day}
            </span>
          ))}
        </div>

        <div
          className="gs-date-range-picker-grid grid gap-y-1 outline-none"
          role="grid"
          onKeyDown={handleGridKeyDown}
          onMouseLeave={() => setHoverDate(null)}
        >
          {Array.from({ length: 6 }, (_, week) => (
            <div
              key={week}
              className="grid grid-cols-[repeat(7,minmax(var(--control-hit-target),1fr))]"
              role="row"
            >
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
                    className={clsx(
                      // Selection styling is driven by data attributes with
                      // variant selectors so it reliably overrides the
                      // bg-transparent/text base utilities.
                      "relative m-0 inline-flex h-gs-control-hit-target w-full cursor-pointer items-center justify-center border-0 bg-transparent p-0 font-inherit text-gs-datepicker-cell-font-size font-normal text-gs-text outline-none transition-[color,background-color,box-shadow,transform] duration-150 ease-gs-standard active:scale-95 focus-visible:relative focus-visible:z-10 focus-visible:shadow-gs-input-focus motion-reduce:transition-none motion-reduce:active:scale-100 [[data-reduced-motion=true]_&]:transition-none [[data-reduced-motion=true]_&]:active:scale-100",
                      "hover:not-disabled:not-data-[selected=true]:bg-gs-datepicker-day-bg-hover",
                      "data-[in-range=true]:bg-gs-datepicker-day-bg-today",
                      "data-[today=true]:not-data-[selected=true]:bg-gs-datepicker-day-bg-today",
                      "data-[selected=true]:rounded-gs-datepicker-cell-radius data-[selected=true]:bg-gs-datepicker-day-bg-selected data-[selected=true]:text-gs-datepicker-day-color-selected",
                      "data-[today=true]:data-[selected=true]:after:absolute data-[today=true]:data-[selected=true]:after:bottom-1 data-[today=true]:data-[selected=true]:after:size-1 data-[today=true]:data-[selected=true]:after:rounded-full data-[today=true]:data-[selected=true]:after:bg-current",
                      "data-[outside=true]:text-gs-datepicker-day-color-outside",
                      "disabled:cursor-not-allowed disabled:text-gs-text-disabled",
                    )}
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
