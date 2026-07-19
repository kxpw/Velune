import type { HTMLAttributes, LabelHTMLAttributes, ReactNode } from "react";
import type { InputSize } from "../input";
import type { WeekStart } from "./date-utils";

export type DatePickerSize = InputSize;
export type DatePickerWeekStartsOn = WeekStart;
export type DatePickerDirection = "ltr" | "rtl";

export interface DatePickerProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "children" | "defaultValue" | "onChange" | "value"
> {
  children?: ReactNode;
  value?: Date | string | null;
  defaultValue?: Date | string | null;
  onValueChange?: (value: Date | null) => void;
  min?: Date | string | null;
  max?: Date | string | null;
  disabled?: boolean;
  invalid?: boolean;
  required?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  /** Label for the calendar's today command. Default: `Today`. */
  todayLabel?: string;
  /** Accessible label for previous-month navigation. */
  previousMonthLabel?: string;
  /** Accessible label for next-month navigation. */
  nextMonthLabel?: string;
  /** Accessible label for clearing the current value. */
  clearLabel?: string;
  size?: DatePickerSize;
  fullWidth?: boolean;
  clearable?: boolean;
  /** BCP 47 locale for labels/formatting. Default: runtime locale. */
  locale?: string;
  formatOptions?: Intl.DateTimeFormatOptions;
  /** `0` Sunday, `1` Monday. Default: `0`. */
  weekStartsOn?: WeekStart;
  /** Reading direction for the field and calendar navigation. Default: `ltr`. */
  dir?: DatePickerDirection;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  name?: string;
  /** Associates the date value with a form outside its DOM ancestry. */
  form?: string;
  id?: string;
}

export type DatePickerLabelProps = LabelHTMLAttributes<HTMLLabelElement>;
export type DatePickerDescriptionProps = HTMLAttributes<HTMLDivElement>;
export type DatePickerErrorMessageProps = HTMLAttributes<HTMLDivElement>;
