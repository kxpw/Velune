import {
  addDays,
  addMonths,
  addYears,
  endOfWeek,
  startOfWeek,
} from "./date-utils";

export type DatePickerKeyboardCommand =
  | { type: "focus"; target: Date }
  | { type: "select" };

export function resolveDatePickerKeyboardCommand(
  current: Date,
  key: string,
  options: {
    direction: "ltr" | "rtl";
    shiftKey: boolean;
    weekStartsOn: 0 | 1;
  },
): DatePickerKeyboardCommand | null {
  const horizontalOffsets =
    options.direction === "rtl"
      ? { ArrowLeft: 1, ArrowRight: -1 }
      : { ArrowLeft: -1, ArrowRight: 1 };
  const horizontalOffset =
    horizontalOffsets[key as keyof typeof horizontalOffsets];
  if (horizontalOffset !== undefined) {
    return { type: "focus", target: addDays(current, horizontalOffset) };
  }

  const focusCommands: Readonly<Record<string, () => Date>> = {
    ArrowUp: () => addDays(current, -7),
    ArrowDown: () => addDays(current, 7),
    PageUp: () =>
      options.shiftKey ? addYears(current, -1) : addMonths(current, -1),
    PageDown: () =>
      options.shiftKey ? addYears(current, 1) : addMonths(current, 1),
    Home: () => startOfWeek(current, options.weekStartsOn),
    End: () => endOfWeek(current, options.weekStartsOn),
  };
  const resolveFocus = focusCommands[key];
  if (resolveFocus) return { type: "focus", target: resolveFocus() };
  return key === "Enter" || key === " " ? { type: "select" } : null;
}
