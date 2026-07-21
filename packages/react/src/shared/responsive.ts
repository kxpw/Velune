export type Breakpoint = "base" | "sm" | "md" | "lg" | "xl" | "2xl";

/** A value that can change at the design-system breakpoints. */
export type Responsive<T> = T | Partial<Record<Breakpoint, T>>;

const breakpoints: Exclude<Breakpoint, "base">[] = [
  "sm",
  "md",
  "lg",
  "xl",
  "2xl",
];

export function responsiveClasses<T>(
  value: Responsive<T> | undefined,
  classes: Record<string, string>,
  defaultValue?: T,
): string[] {
  if (value == null) return [];
  if (typeof value !== "object" || Array.isArray(value)) {
    const className = classes[String(value)];
    return className ? [className] : [];
  }

  const result: string[] = [];
  const values = value as Partial<Record<Breakpoint, T>>;
  const baseValue = values.base ?? defaultValue;
  const baseClass = baseValue == null ? undefined : classes[String(baseValue)];
  if (baseClass) {
    result.push(baseClass);
  }
  for (const breakpoint of breakpoints) {
    const item = values[breakpoint];
    const className = item == null ? undefined : classes[String(item)];
    if (className) {
      result.push(`${breakpoint}:${className}`);
    }
  }
  return result;
}

export function responsiveBooleanClasses(
  value: Responsive<boolean> | undefined,
  className: string,
  falseClass?: string,
  defaultValue = false,
): string[] {
  if (value == null) return [];
  if (typeof value === "boolean") return value ? [className] : [];
  const result: string[] = [];
  const baseValue = value.base ?? defaultValue;
  if (baseValue === true) result.push(className);
  if (baseValue === false && falseClass) result.push(falseClass);
  for (const breakpoint of breakpoints) {
    if (value[breakpoint] === true) result.push(`${breakpoint}:${className}`);
    if (value[breakpoint] === false && falseClass) {
      result.push(`${breakpoint}:${falseClass}`);
    }
  }
  return result;
}
