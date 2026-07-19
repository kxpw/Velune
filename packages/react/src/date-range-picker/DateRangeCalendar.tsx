import { clsx } from "clsx";
import {
  Button,
  CalendarCell,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeaderCell,
  Dialog,
  Heading,
  Popover,
  RangeCalendar,
} from "react-aria-components";
import type {
  DatePickerDirection,
  DatePickerWeekStartsOn,
} from "../date-picker";

const iconButtonClasses =
  "m-0 inline-flex size-gs-control-hit-target shrink-0 cursor-pointer items-center justify-center rounded-gs-sm border-0 bg-transparent p-0 text-gs-text-secondary hover:bg-gs-datepicker-day-bg-hover hover:text-gs-text focus-visible:outline-none focus-visible:shadow-gs-input-focus disabled:cursor-not-allowed disabled:text-gs-text-disabled [&_svg]:block [&_svg]:size-4";

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

export type DateRangeCalendarProps = {
  weekStartsOn: DatePickerWeekStartsOn;
  dir: DatePickerDirection;
  previousMonthLabel: string;
  nextMonthLabel: string;
};

export default function DateRangeCalendar({
  weekStartsOn,
  dir,
  previousMonthLabel,
  nextMonthLabel,
}: DateRangeCalendarProps) {
  return (
    <Popover
      placement="bottom start"
      offset={8}
      className="gs-date-range-picker-popover z-gs-datepicker w-[min(var(--datepicker-panel-width),calc(100vw-var(--space-4)))] box-border rounded-gs-datepicker-panel-radius border border-gs-surface-border bg-gs-datepicker-panel-bg bg-gs-surface-highlight p-gs-datepicker-panel-padding font-gs-sans text-gs-text shadow-gs-datepicker-panel-shadow outline-none entering:animate-gs-datepicker-in exiting:opacity-0 motion-reduce:entering:animate-none"
    >
      <Dialog className="outline-none">
        <RangeCalendar
          visibleDuration={{ months: 1 }}
          firstDayOfWeek={weekStartsOn === 1 ? "mon" : "sun"}
          className="gs-date-range-picker-calendar w-full outline-none"
        >
          <header className="mb-2 flex items-center gap-gs-datepicker-header-gap px-1 pt-1">
            <Button
              slot="previous"
              className={iconButtonClasses}
              aria-label={previousMonthLabel}
            >
              <Chevron direction={dir === "rtl" ? "next" : "previous"} />
            </Button>
            <Heading className="flex-auto text-center text-sm font-medium text-gs-text" />
            <Button
              slot="next"
              className={iconButtonClasses}
              aria-label={nextMonthLabel}
            >
              <Chevron direction={dir === "rtl" ? "previous" : "next"} />
            </Button>
          </header>

          <CalendarGrid
            weekdayStyle="narrow"
            className="w-full table-fixed border-separate border-spacing-x-0 border-spacing-y-1"
          >
            <CalendarGridHeader>
              {(day) => (
                <CalendarHeaderCell className="h-6 text-gs-datepicker-weekday-size font-medium text-gs-text-secondary">
                  {day}
                </CalendarHeaderCell>
              )}
            </CalendarGridHeader>
            <CalendarGridBody>
              {(date) => (
                <CalendarCell
                  date={date}
                  className={({
                    isDisabled,
                    isFocusVisible,
                    isOutsideMonth,
                    isSelected,
                    isSelectionEnd,
                    isSelectionStart,
                    isToday,
                  }) =>
                    clsx(
                      "relative m-0 inline-flex h-gs-control-hit-target w-full cursor-pointer items-center justify-center border-0 p-0 text-gs-datepicker-cell-font-size font-normal outline-none transition-[color,background-color,box-shadow] duration-200 ease-gs-standard motion-reduce:transition-none",
                      !isSelected &&
                        "bg-transparent hover:bg-gs-datepicker-day-bg-hover",
                      isSelected &&
                        !isSelectionStart &&
                        !isSelectionEnd &&
                        "bg-gs-datepicker-day-bg-today text-gs-text",
                      (isSelectionStart || isSelectionEnd) &&
                        "rounded-gs-datepicker-cell-radius bg-gs-datepicker-day-bg-selected text-gs-datepicker-day-color-selected",
                      isToday && !isSelected && "bg-gs-datepicker-day-bg-today",
                      isToday &&
                        isSelected &&
                        "after:absolute after:bottom-1 after:size-1 after:rounded-full after:bg-current",
                      isOutsideMonth && "text-gs-datepicker-day-color-outside",
                      isDisabled && "cursor-not-allowed text-gs-text-disabled",
                      isFocusVisible && "relative z-10 shadow-gs-input-focus",
                    )
                  }
                />
              )}
            </CalendarGridBody>
          </CalendarGrid>
        </RangeCalendar>
      </Dialog>
    </Popover>
  );
}
