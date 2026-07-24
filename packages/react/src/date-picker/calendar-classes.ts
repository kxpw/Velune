/** Shared calendar month header row. */
export const calendarHeaderClasses =
  "gs-datepicker-header mb-gs-2 flex items-center gap-gs-2";

/** Shared month/year label in the calendar header. */
export const calendarMonthLabelClasses =
  "flex-auto text-center text-gs-sm font-gs-medium text-gs-text";

/** Shared weekday header row. */
export const calendarWeekdaysClasses =
  "gs-datepicker-weekdays mb-gs-1 grid grid-cols-[repeat(7,minmax(var(--space-11),1fr))] gap-gs-1 max-[22.5rem]:gap-gs-0";

/** Shared single weekday label. */
export const calendarWeekdayClasses =
  "gs-datepicker-weekday inline-flex min-h-gs-6 items-center justify-center text-gs-xs font-gs-medium text-gs-text-secondary";

/** Shared base classes for calendar icon / nav buttons. */
export const calendarNavButtonClasses =
  "m-gs-0 inline-flex size-gs-11 shrink-0 cursor-pointer items-center justify-center rounded-gs-sm border-0 bg-transparent p-gs-0 text-gs-text-secondary hover:bg-gs-action-hover hover:text-gs-text focus-visible:outline-none focus-visible:shadow-gs-input-focus [&_svg]:block [&_svg]:size-gs-4";

/** Extra motion/disabled styling for range calendar nav buttons. */
export const calendarNavButtonMotionClasses =
  "transition-[background-color,color,box-shadow,transform] duration-150 ease-gs-standard active:scale-95 disabled:cursor-not-allowed disabled:text-gs-text-disabled motion-reduce:transition-none motion-reduce:active:scale-100 [[data-reduced-motion=true]_&]:transition-none [[data-reduced-motion=true]_&]:active:scale-100";

/** Extra padding on the range calendar header. */
export const calendarRangeHeaderPaddingClasses = "px-gs-1 pt-gs-1";

/** Gap override for the range calendar weekday row. */
export const calendarRangeWeekdaysGapClasses =
  "gap-y-gs-1 max-[22.5rem]:gap-y-gs-1";
