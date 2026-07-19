import type { HTMLAttributes, LabelHTMLAttributes, ReactNode } from "react";
import type {
  DatePickerDirection,
  DatePickerSize,
  DatePickerWeekStartsOn,
} from "../date-picker";

export interface DateRangeValue {
  start: Date | null;
  end: Date | null;
}

export interface DateRangeInput {
  start?: Date | string | null;
  end?: Date | string | null;
}

export interface DateRangePickerProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "children" | "defaultValue" | "onChange"
> {
  children?: ReactNode;
  value?: DateRangeInput;
  defaultValue?: DateRangeInput;
  onValueChange?: (value: DateRangeValue) => void;
  min?: Date | string | null;
  max?: Date | string | null;
  disabled?: boolean;
  invalid?: boolean;
  required?: boolean;
  readOnly?: boolean;
  /** Accessible name for the start-date field. Default: `Start date`. */
  startLabel?: string;
  /** Accessible name for the end-date field. Default: `End date`. */
  endLabel?: string;
  /** Accessible label for clearing either date. Default: `Clear date range`. */
  clearLabel?: string;
  /** Accessible label for opening the calendar. Default: `Open calendar`. */
  openCalendarLabel?: string;
  /** Accessible label for the previous-month command. Default: `Previous month`. */
  previousMonthLabel?: string;
  /** Accessible label for the next-month command. Default: `Next month`. */
  nextMonthLabel?: string;
  size?: DatePickerSize;
  fullWidth?: boolean;
  clearable?: boolean;
  locale?: string;
  weekStartsOn?: DatePickerWeekStartsOn;
  dir?: DatePickerDirection;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  startName?: string;
  endName?: string;
  /** Associates both date values with a form outside their DOM ancestry. */
  form?: string;
  id?: string;
}

export type DateRangePickerLabelProps = LabelHTMLAttributes<HTMLLabelElement>;
export type DateRangePickerDescriptionProps = HTMLAttributes<HTMLDivElement>;
export type DateRangePickerErrorMessageProps = HTMLAttributes<HTMLDivElement>;
