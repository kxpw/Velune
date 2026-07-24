import { clsx } from "clsx";
import { createRecipe } from "../shared/recipe";
import type { InputSize } from "../input";
import {
  calendarHeaderClasses,
  calendarMonthLabelClasses,
  calendarNavButtonClasses,
  calendarNavButtonMotionClasses,
  calendarRangeHeaderPaddingClasses,
  calendarRangeWeekdaysGapClasses,
  calendarWeekdayClasses,
  calendarWeekdaysClasses,
} from "../date-picker/calendar-classes";

const dateRangePickerFieldSizeClasses = createRecipe({
  variants: {
    size: {
      sm: "[--gs-drp-box:var(--space-8)] [--gs-drp-inline:var(--space-2)] px-[var(--gs-drp-inline)] text-gs-xs",
      md: "[--gs-drp-box:var(--space-9)] [--gs-drp-inline:var(--space-3)] px-[var(--gs-drp-inline)] text-gs-sm",
      lg: "[--gs-drp-box:var(--space-11)] [--gs-drp-inline:var(--space-4)] px-[var(--gs-drp-inline)] text-gs-md",
    },
  },
  defaultVariants: { size: "md" },
});

/** Icon button used in the field actions (clear / open calendar). */
export const dateRangePickerIconButtonClasses =
  "m-gs-0 inline-flex size-gs-11 shrink-0 cursor-pointer items-center justify-center rounded-gs-sm border-0 bg-transparent p-gs-0 text-gs-text-secondary hover:bg-gs-action-hover hover:text-gs-text focus-visible:outline-none focus-visible:shadow-gs-input-focus disabled:cursor-not-allowed disabled:text-gs-text-disabled [&_svg]:block [&_svg]:size-gs-4";

/** Visually hidden native date inputs. */
export const dateRangePickerNativeClasses =
  "gs-date-range-picker-native pointer-events-none absolute -m-gs-input-border-width size-gs-input-border-width overflow-hidden whitespace-nowrap border-0 p-gs-0 [clip:rect(0,0,0,0)] [clip-path:inset(50%)]";

export type DateRangePickerClassesOptions = {
  fullWidth?: boolean | undefined;
};

/** Style recipe for the DateRangePicker root (with field chrome). */
export function dateRangePickerClasses({
  fullWidth = false,
}: DateRangePickerClassesOptions = {}): string {
  return clsx(
    "gs-date-range-picker",
    // Grow with locale-dependent segment widths instead of clipping the
    // trailing action buttons against a hard field width.
    fullWidth ? "grid w-full" : "w-fit min-w-[min(18rem,100%)] max-w-full",
  );
}

/** Extra classes for a disabled field label. */
export const dateRangePickerDisabledLabelClasses =
  "cursor-not-allowed text-gs-text-disabled";

/** Extra classes for disabled description text. */
export const dateRangePickerDisabledTextClasses = "text-gs-text-disabled";

/**
 * Extra width constraint so description / error wrap to the field width
 * instead of widening the `w-fit` root.
 */
export const dateRangePickerMessageWidthClasses = "w-gs-0 min-w-full";

export type DateRangePickerGroupClassesOptions = {
  size?: InputSize | undefined;
  fullWidth?: boolean | undefined;
  invalid?: boolean | undefined;
  disabled?: boolean | undefined;
};

/** Style recipe for the bordered start/end group. */
export function dateRangePickerGroupClasses({
  size = "md",
  fullWidth = false,
  invalid = false,
  disabled = false,
}: DateRangePickerGroupClassesOptions = {}): string {
  return clsx(
    "gs-date-range-picker-group inline-flex h-[max(var(--gs-drp-box),var(--space-11))] min-h-[max(var(--gs-drp-box),var(--space-11))] w-full min-w-gs-0 max-w-full items-center gap-gs-1 overflow-hidden rounded-gs-xs border border-gs-border-default bg-gs-surface bg-gs-surface-highlight text-gs-text shadow-gs-surface-sheen transition-[background-color,border-color,box-shadow] duration-200 ease-gs-standard hover:border-gs-border-focus hover:bg-gs-action-hover focus-within:border-gs-focus focus-within:bg-gs-surface-raised focus-within:shadow-gs-input-surface-focus motion-reduce:transition-none",
    dateRangePickerFieldSizeClasses({ size }),
    fullWidth && "w-full",
    invalid &&
      "border-gs-error bg-gs-error-subtle shadow-gs-input-invalid-focus",
    disabled && "cursor-not-allowed opacity-gs-disabled",
  );
}

/** Classes for the en-dash separator between start and end. */
export const dateRangePickerSeparatorClasses =
  "gs-date-range-picker-separator shrink-0 text-gs-text-secondary";

/** Classes for the trailing clear / calendar action cluster. */
export const dateRangePickerActionsClasses =
  "gs-date-range-picker-actions -me-[var(--gs-drp-inline)] ms-auto inline-flex h-full shrink-0 items-center ps-gs-1 before:me-gs-1 before:h-gs-5 before:w-px before:shrink-0 before:bg-gs-border-default";

/** Keeps the clear slot reserved while empty. */
export const dateRangePickerClearInvisibleClasses = "invisible";

/** Classes for a segmented date field (start or end). */
export const dateRangePickerInputClasses =
  "gs-date-range-picker-input flex min-w-gs-0 shrink-0 items-center tabular-nums";

/** Classes for literal separators inside a segmented field. */
export const dateRangePickerLiteralClasses = "px-gs-0";

export type DateRangePickerSegmentClassesOptions = {
  empty?: boolean | undefined;
  disabled?: boolean | undefined;
};

/** Style recipe for a spinbutton segment inside a date field. */
export function dateRangePickerSegmentClasses({
  empty = false,
  disabled = false,
}: DateRangePickerSegmentClassesOptions = {}): string {
  return clsx(
    "rounded-gs-xs px-px outline-none transition-[color,background-color,box-shadow] duration-200 ease-gs-standard motion-reduce:transition-none",
    empty && "text-gs-text-secondary",
    !disabled && "focus:bg-gs-primary-strong focus:text-gs-on-primary",
    disabled && "cursor-not-allowed",
  );
}

/** Month navigation button inside the calendar popover. */
export const dateRangeCalendarNavButtonClasses = clsx(
  calendarNavButtonClasses,
  calendarNavButtonMotionClasses,
);

/** Classes for the floating calendar popover. */
export const dateRangeCalendarPopoverClasses =
  "gs-date-range-picker-popover invisible z-gs-popover w-[min(var(--modal-width-sm),calc(100vw-var(--space-4)))] box-border rounded-gs-sm border border-gs-border-default bg-gs-surface-raised bg-gs-surface-highlight p-gs-3 font-inherit text-gs-text shadow-gs-2 outline-none data-[ready=true]:visible data-[ready=true]:animate-gs-float-in motion-reduce:animate-none [[data-reduced-motion=true]_&]:animate-none";

/** Classes for the calendar month header. */
export const dateRangeCalendarHeaderClasses = clsx(
  calendarHeaderClasses,
  calendarRangeHeaderPaddingClasses,
);

/** Classes for the month/year label in the calendar. */
export const dateRangeCalendarMonthLabelClasses = calendarMonthLabelClasses;

/** Classes for the weekday header row. */
export const dateRangeCalendarWeekdaysClasses = clsx(
  calendarWeekdaysClasses,
  calendarRangeWeekdaysGapClasses,
);

/** Classes for a single weekday label. */
export const dateRangeCalendarWeekdayClasses = calendarWeekdayClasses;

/** Classes for the calendar day grid. */
export const dateRangeCalendarGridClasses =
  "gs-date-range-picker-grid grid gap-y-gs-1 outline-none";

/** Classes for a calendar week row. */
export const dateRangeCalendarRowClasses =
  "grid grid-cols-[repeat(7,minmax(var(--space-11),1fr))]";

/**
 * Classes for a range calendar day cell. Selection styling is driven by data
 * attributes with variant selectors so it reliably overrides the base utilities.
 */
export const dateRangeCalendarDayClasses = clsx(
  "relative m-gs-0 inline-flex h-gs-11 w-full cursor-pointer items-center justify-center border-0 bg-transparent p-gs-0 font-inherit text-gs-sm font-gs-regular text-gs-text outline-none transition-[color,background-color,box-shadow,transform] duration-150 ease-gs-standard active:scale-95 focus-visible:relative focus-visible:z-10 focus-visible:shadow-gs-input-focus motion-reduce:transition-none motion-reduce:active:scale-100 [[data-reduced-motion=true]_&]:transition-none [[data-reduced-motion=true]_&]:active:scale-100",
  "hover:not-disabled:not-data-[selected=true]:bg-gs-action-hover",
  "data-[in-range=true]:bg-gs-datepicker-day-bg-today",
  "data-[today=true]:not-data-[selected=true]:bg-gs-datepicker-day-bg-today",
  "data-[selected=true]:rounded-gs-sm data-[selected=true]:bg-gs-primary-strong data-[selected=true]:text-gs-on-primary",
  "data-[today=true]:data-[selected=true]:after:absolute data-[today=true]:data-[selected=true]:after:bottom-gs-1 data-[today=true]:data-[selected=true]:after:size-gs-1 data-[today=true]:data-[selected=true]:after:rounded-gs-full data-[today=true]:data-[selected=true]:after:bg-current",
  "data-[outside=true]:text-gs-text-secondary",
  "disabled:cursor-not-allowed disabled:text-gs-text-disabled disabled:opacity-gs-disabled disabled:hover:bg-transparent",
);
