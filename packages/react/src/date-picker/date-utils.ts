export type WeekStart = 0 | 1;

const dateTimeFormatters = new Map<string, Intl.DateTimeFormat>();

export function getDateTimeFormatter(
  locale: string,
  options: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat {
  const key = `${locale}:${JSON.stringify(options)}`;
  const cached = dateTimeFormatters.get(key);
  if (cached) {
    return cached;
  }

  const formatter = new Intl.DateTimeFormat(locale, options);
  dateTimeFormatters.set(key, formatter);
  return formatter;
}

/**
 * Identity-stable memo key for Date-ish props. Callers often pass inline
 * `new Date(...)` values whose object identity changes every render; keying
 * memos/effects on this primitive keeps them stable.
 */
export function dateInputKey(
  input: Date | string | null | undefined,
): string | number | null {
  if (input == null) {
    return null;
  }
  return input instanceof Date ? input.getTime() : input;
}

export function startOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function addDays(date: Date, amount: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

export function addMonths(date: Date, amount: number): Date {
  const next = new Date(date);
  const day = next.getDate();
  next.setDate(1);
  next.setMonth(next.getMonth() + amount);
  next.setDate(Math.min(day, daysInMonth(next.getFullYear(), next.getMonth())));
  return next;
}

export function addYears(date: Date, amount: number): Date {
  const next = new Date(date);
  const month = next.getMonth();
  const day = next.getDate();
  const targetYear = next.getFullYear() + amount;
  next.setDate(1);
  next.setFullYear(targetYear);
  next.setMonth(month);
  next.setDate(Math.min(day, daysInMonth(targetYear, month)));
  return next;
}

export function startOfWeek(date: Date, weekStartsOn: WeekStart = 0): Date {
  const offset = (date.getDay() - weekStartsOn + 7) % 7;
  return addDays(date, -offset);
}

export function endOfWeek(date: Date, weekStartsOn: WeekStart = 0): Date {
  return addDays(startOfWeek(date, weekStartsOn), 6);
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

export function isBeforeDay(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() < startOfDay(b).getTime();
}

export function isAfterDay(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() > startOfDay(b).getTime();
}

export function isDateDisabled(
  date: Date,
  min?: Date | null,
  max?: Date | null,
): boolean {
  if (min && isBeforeDay(date, min)) {
    return true;
  }
  if (max && isAfterDay(date, max)) {
    return true;
  }
  return false;
}

export function clampDate(
  date: Date,
  min?: Date | null,
  max?: Date | null,
): Date {
  let next = startOfDay(date);
  if (min && isBeforeDay(next, min)) {
    next = startOfDay(min);
  }
  if (max && isAfterDay(next, max)) {
    next = startOfDay(max);
  }
  return next;
}

/** 6×7 calendar grid starting on weekStartsOn. */
export function getMonthMatrix(
  month: Date,
  weekStartsOn: WeekStart = 0,
): Date[] {
  const first = startOfMonth(month);
  const gridStart = startOfWeek(first, weekStartsOn);
  return Array.from({ length: 42 }, (_, index) => addDays(gridStart, index));
}

export function formatDisplayDate(
  date: Date,
  locale = "en",
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  },
): string {
  return getDateTimeFormatter(locale, options).format(date);
}

export function formatMonthLabel(date: Date, locale = "en"): string {
  return getDateTimeFormatter(locale, {
    month: "long",
    year: "numeric",
  }).format(date);
}

export function getWeekdayLabels(
  locale = "en",
  weekStartsOn: WeekStart = 0,
): string[] {
  // Jan 2 2022 is a Sunday.
  const sunday = new Date(2022, 0, 2);
  const formatter = getDateTimeFormatter(locale, { weekday: "narrow" });
  return Array.from({ length: 7 }, (_, index) => {
    const day = addDays(sunday, (index + weekStartsOn) % 7);
    return formatter.format(day);
  });
}

export function toDateValue(
  value: Date | string | null | undefined,
): Date | null {
  if (value == null || value === "") {
    return null;
  }
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : startOfDay(value);
  }
  const calendarDate = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (calendarDate) {
    const [, year, month, day] = calendarDate;
    const parsed = new Date(Number(year), Number(month) - 1, Number(day));
    return parsed.getFullYear() === Number(year) &&
      parsed.getMonth() === Number(month) - 1 &&
      parsed.getDate() === Number(day)
      ? parsed
      : null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : startOfDay(parsed);
}
