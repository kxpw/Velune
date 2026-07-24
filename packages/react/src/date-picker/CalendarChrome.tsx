import { memo } from "react";
import { clsx } from "clsx";
import {
  calendarHeaderClasses,
  calendarMonthLabelClasses,
  calendarNavButtonClasses,
  calendarWeekdayClasses,
  calendarWeekdaysClasses,
} from "./calendar-classes";

function CalendarChevron({ direction }: { direction: "prev" | "next" }) {
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

export type CalendarHeaderProps = {
  monthLabel: string;
  previousMonthLabel: string;
  nextMonthLabel: string;
  dir: "ltr" | "rtl";
  onChangeMonth: (amount: number) => void;
  headerClassName?: string | undefined;
  monthLabelClassName?: string | undefined;
  navButtonClassName?: string | undefined;
};

/** Shared calendar month navigation header. */
export const CalendarHeader = memo(function CalendarHeader({
  monthLabel,
  previousMonthLabel,
  nextMonthLabel,
  dir,
  onChangeMonth,
  headerClassName,
  monthLabelClassName,
  navButtonClassName,
}: CalendarHeaderProps) {
  return (
    <div className={clsx(calendarHeaderClasses, headerClassName)}>
      <button
        type="button"
        className={clsx(calendarNavButtonClasses, navButtonClassName)}
        aria-label={previousMonthLabel}
        onClick={() => onChangeMonth(-1)}
      >
        <CalendarChevron direction={dir === "rtl" ? "next" : "prev"} />
      </button>
      <div className={clsx(calendarMonthLabelClasses, monthLabelClassName)}>
        {monthLabel}
      </div>
      <button
        type="button"
        className={clsx(calendarNavButtonClasses, navButtonClassName)}
        aria-label={nextMonthLabel}
        onClick={() => onChangeMonth(1)}
      >
        <CalendarChevron direction={dir === "rtl" ? "prev" : "next"} />
      </button>
    </div>
  );
});

export type CalendarWeekdaysProps = {
  weekdays: readonly string[];
  weekdaysClassName?: string | undefined;
  weekdayClassName?: string | undefined;
};

/** Shared weekday abbreviation row. */
export const CalendarWeekdays = memo(function CalendarWeekdays({
  weekdays,
  weekdaysClassName,
  weekdayClassName,
}: CalendarWeekdaysProps) {
  return (
    <div
      className={clsx(calendarWeekdaysClasses, weekdaysClassName)}
      aria-hidden="true"
    >
      {weekdays.map((day, index) => (
        <span
          key={`${day}-${index}`}
          className={clsx(calendarWeekdayClasses, weekdayClassName)}
        >
          {day}
        </span>
      ))}
    </div>
  );
});
