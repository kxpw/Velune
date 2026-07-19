export type FormValues = Record<string, unknown>;

export function getValueByName(values: FormValues, name: string): unknown {
  if (!name.includes(".")) {
    return values[name];
  }
  return name.split(".").reduce<unknown>((acc, part) => {
    if (acc == null || typeof acc !== "object") {
      return undefined;
    }
    return (acc as FormValues)[part];
  }, values);
}

export function setValueByName(
  values: FormValues,
  name: string,
  value: unknown,
): FormValues {
  if (!name.includes(".")) {
    return { ...values, [name]: value };
  }

  const parts = name.split(".");
  const next: FormValues = { ...values };
  let cursor: FormValues = next;

  for (let i = 0; i < parts.length - 1; i += 1) {
    const part = parts[i]!;
    const current = cursor[part];
    const child =
      current != null && typeof current === "object" && !Array.isArray(current)
        ? { ...(current as FormValues) }
        : {};
    cursor[part] = child;
    cursor = child;
  }

  cursor[parts[parts.length - 1]!] = value;
  return next;
}

export function isEmptyValue(value: unknown): boolean {
  if (value == null) {
    return true;
  }
  if (typeof value === "string") {
    return value.trim().length === 0;
  }
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  return false;
}
