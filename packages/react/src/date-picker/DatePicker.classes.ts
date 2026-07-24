import { clsx } from "clsx";
import { createRecipe } from "../shared/recipe";
import type { InputSize } from "../input";
import {
  calendarHeaderClasses,
  calendarMonthLabelClasses,
  calendarNavButtonClasses,
  calendarWeekdayClasses,
  calendarWeekdaysClasses,
} from "./calendar-classes";

/** Classes for a calendar day cell button. */
export const datePickerDayClasses =
  "gs-datepicker-day m-gs-0 inline-flex w-full min-h-gs-11 cursor-pointer appearance-none items-center justify-center box-border rounded-gs-sm border-0 bg-transparent p-gs-0 font-inherit text-gs-sm font-gs-regular text-gs-text transition-[background-color,color,box-shadow,transform] duration-150 ease-gs-standard active:scale-95 hover:not-disabled:not-data-[selected=true]:bg-gs-action-hover data-[outside=true]:text-gs-text-secondary data-[today=true]:not-data-[selected=true]:bg-gs-datepicker-day-bg-today data-[selected=true]:bg-gs-primary-strong data-[selected=true]:text-gs-on-primary focus-visible:outline-none focus-visible:shadow-gs-input-focus data-[focused=true]:focus:outline-none data-[focused=true]:focus:shadow-gs-input-focus disabled:cursor-not-allowed disabled:text-gs-text-disabled disabled:opacity-gs-disabled disabled:hover:bg-transparent motion-reduce:transition-none motion-reduce:active:scale-100 [[data-reduced-motion=true]_&]:transition-none [[data-reduced-motion=true]_&]:active:scale-100";

/** Classes for a calendar week row. */
export const datePickerRowClasses =
  "gs-datepicker-row grid grid-cols-[repeat(7,minmax(var(--space-11),1fr))] gap-gs-1 max-[22.5rem]:gap-gs-0";

/** Classes for the calendar month header. */
export const datePickerHeaderClasses = calendarHeaderClasses;

/** Shared classes for icon / nav buttons in the calendar. */
export const datePickerIconButtonClasses = calendarNavButtonClasses;

/** Extra class for month navigation buttons. */
export const datePickerNavClasses = "gs-datepicker-nav";

/** Classes for the month/year label. */
export const datePickerMonthLabelClasses = clsx(
  calendarMonthLabelClasses,
  "gs-datepicker-month-label",
);

/** Classes for the weekday header row. */
export const datePickerWeekdaysClasses = calendarWeekdaysClasses;

/** Classes for a single weekday label. */
export const datePickerWeekdayClasses = calendarWeekdayClasses;

/** Classes for the calendar footer. */
export const datePickerFooterClasses =
  "gs-datepicker-footer mt-gs-2 flex justify-end pt-gs-2";

/** Classes for the Today shortcut button. */
export const datePickerTodayClasses =
  "gs-datepicker-today m-gs-0 min-h-gs-11 cursor-pointer appearance-none rounded-gs-sm border-0 bg-transparent px-gs-2 py-gs-1 font-inherit text-gs-xs font-gs-medium text-gs-border-focus transition-[background-color,color,box-shadow,transform] duration-150 ease-gs-standard active:scale-95 hover:not-disabled:bg-gs-action-hover focus-visible:outline-none focus-visible:shadow-gs-input-focus disabled:cursor-not-allowed disabled:text-gs-text-disabled motion-reduce:transition-none motion-reduce:active:scale-100 [[data-reduced-motion=true]_&]:transition-none [[data-reduced-motion=true]_&]:active:scale-100";

export type DatePickerClassesOptions = {
  fullWidth?: boolean | undefined;
};

/** Style recipe for the DatePicker root. */
export function datePickerClasses({
  fullWidth = false,
}: DatePickerClassesOptions = {}): string {
  return clsx(
    "gs-datepicker inline-grid max-w-full gap-gs-1 align-top font-inherit text-gs-text",
    fullWidth && "grid w-full",
  );
}

/** Extra classes for a disabled field label. */
export const datePickerDisabledLabelClasses =
  "cursor-not-allowed text-gs-text-disabled";

/** Extra classes for disabled description text. */
export const datePickerDisabledTextClasses = "text-gs-text-disabled";

const datePickerTriggerSizeClasses = createRecipe({
  variants: {
    size: {
      sm: "[--gs-dp-box:var(--space-8)]",
      md: "[--gs-dp-box:var(--space-9)]",
      lg: "[--gs-dp-box:var(--space-11)]",
    },
  },
  defaultVariants: { size: "md" },
});

export type DatePickerTriggerClassesOptions = {
  size?: InputSize | undefined;
  fullWidth?: boolean | undefined;
  invalid?: boolean | undefined;
};

/** Style recipe for the trigger shell. */
export function datePickerTriggerClasses({
  size = "md",
  fullWidth = false,
  invalid = false,
}: DatePickerTriggerClassesOptions = {}): string {
  return clsx(
    "gs-datepicker-trigger relative inline-flex h-[max(var(--gs-dp-box),var(--space-11))] min-h-[max(var(--gs-dp-box),var(--space-11))] min-w-gs-datepicker-trigger-min-width max-w-full items-center rounded-gs-xs border border-gs-border-default bg-gs-surface bg-gs-surface-highlight text-gs-text shadow-gs-surface-sheen transition-[background-color,border-color,box-shadow] duration-200 ease-gs-standard has-[.gs-datepicker-button:hover:not(:disabled)]:border-gs-border-focus has-[.gs-datepicker-button:focus-visible]:border-gs-focus has-[.gs-datepicker-button:focus-visible]:bg-gs-surface-raised motion-reduce:transition-none [[data-reduced-motion=true]_&]:transition-none [[data-high-contrast=true]_&]:border [[data-high-contrast=true]_&]:border-gs-border-strong",
    datePickerTriggerSizeClasses({ size }),
    fullWidth && "w-full",
    invalid &&
      "border-gs-error has-[.gs-datepicker-button:hover:not(:disabled)]:border-gs-error has-[.gs-datepicker-button:focus-visible]:border-gs-error [[data-high-contrast=true]_&]:border-gs-error",
  );
}

const datePickerButtonSizeClasses = createRecipe({
  variants: {
    size: {
      sm: "px-gs-2 text-gs-xs",
      md: "px-gs-3 text-gs-sm",
      lg: "px-gs-4 text-gs-md",
    },
  },
  defaultVariants: { size: "md" },
});

export type DatePickerButtonClassesOptions = {
  size?: InputSize | undefined;
  invalid?: boolean | undefined;
};

/** Style recipe for the trigger button. */
export function datePickerButtonClasses({
  size = "md",
  invalid = false,
}: DatePickerButtonClassesOptions = {}): string {
  return clsx(
    "gs-datepicker-button m-gs-0 inline-flex size-full flex-auto cursor-pointer appearance-none items-center justify-between gap-gs-2 rounded-inherit border-0 bg-transparent py-gs-0 text-start font-inherit text-inherit hover:not-disabled:bg-gs-action-hover focus-visible:outline-none focus-visible:shadow-gs-input-surface-focus disabled:cursor-not-allowed disabled:opacity-gs-disabled",
    datePickerButtonSizeClasses({ size }),
    invalid && "bg-gs-error-subtle focus-visible:shadow-gs-input-invalid-focus",
  );
}

/** Classes for the displayed value text. */
export const datePickerValueClasses =
  "gs-datepicker-value min-w-gs-0 overflow-hidden text-ellipsis whitespace-nowrap data-[placeholder=true]:text-gs-text-secondary";

/** Classes for the calendar icon in the trigger. */
export const datePickerIconClasses =
  "gs-datepicker-icon inline-flex size-gs-4 shrink-0 text-gs-text-secondary [&_svg]:block [&_svg]:size-full";

/** Classes for the clear button. */
export const datePickerClearClasses =
  "gs-datepicker-clear absolute end-8 m-gs-0 inline-flex size-gs-11 cursor-pointer items-center justify-center rounded-gs-sm border-0 bg-transparent p-gs-0 text-gs-text-secondary transition-[background-color,color,box-shadow,transform] duration-150 ease-gs-standard active:scale-95 hover:bg-gs-action-hover hover:text-gs-text focus-visible:outline-none focus-visible:shadow-gs-input-focus motion-reduce:transition-none motion-reduce:active:scale-100 [[data-reduced-motion=true]_&]:transition-none [[data-reduced-motion=true]_&]:active:scale-100 [&_svg]:block [&_svg]:size-gs-3";

/** Classes for the visually hidden native date input. */
export const datePickerNativeClasses =
  "gs-datepicker-native pointer-events-none absolute -m-gs-input-border-width size-gs-input-border-width overflow-hidden whitespace-nowrap border-0 p-gs-0 [clip:rect(0,0,0,0)] [clip-path:inset(50%)]";

/** Classes for the floating calendar panel. */
export const datePickerPanelClasses =
  "gs-datepicker-panel invisible z-gs-popover w-[min(var(--modal-width-sm),calc(100vw-var(--space-4)))] box-border rounded-gs-sm border border-gs-border-default bg-gs-surface-raised bg-gs-surface-highlight p-gs-3 font-inherit text-gs-text shadow-gs-2 outline-none data-[ready=true]:visible data-[ready=true]:animate-gs-float-in max-[22.5rem]:w-[min(var(--modal-width-sm),calc(100vw-var(--space-2)))] max-[22.5rem]:px-gs-0 motion-reduce:animate-none [[data-reduced-motion=true]_&]:data-[ready=true]:animate-none";

/** Classes for the calendar grid. */
export const datePickerGridClasses =
  "gs-datepicker-grid grid gap-gs-1 outline-none";
