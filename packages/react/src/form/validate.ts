import { getValueByName, isEmptyValue, type FormValues } from "./form-utils";
import type { FormRule } from "./Form.types";

export async function runRules(
  value: unknown,
  values: FormValues,
  rules: FormRule[] = [],
): Promise<string | undefined> {
  for (const rule of rules) {
    if (rule.required) {
      const empty = isEmptyValue(value);
      if (empty) {
        return (
          (typeof rule.required === "string" ? rule.required : undefined) ??
          rule.message ??
          "This field is required"
        );
      }
    }

    if (value == null || value === "") {
      continue;
    }

    if (typeof value === "string") {
      if (rule.minLength != null && value.length < rule.minLength) {
        return rule.message ?? `Minimum length is ${rule.minLength}`;
      }
      if (rule.maxLength != null && value.length > rule.maxLength) {
        return rule.message ?? `Maximum length is ${rule.maxLength}`;
      }
      if (rule.pattern && !rule.pattern.test(value)) {
        return rule.message ?? "Invalid format";
      }
    }

    if (typeof value === "number") {
      if (rule.min != null && value < rule.min) {
        return rule.message ?? `Minimum value is ${rule.min}`;
      }
      if (rule.max != null && value > rule.max) {
        return rule.message ?? `Maximum value is ${rule.max}`;
      }
    }

    if (rule.validator) {
      try {
        const result = await rule.validator(value, values);
        if (typeof result === "string" && result) {
          return result;
        }
      } catch (error) {
        return error instanceof Error
          ? error.message
          : (rule.message ?? "Validation failed");
      }
    }
  }

  return undefined;
}

export async function validateFields(
  values: FormValues,
  fieldRules: Map<string, FormRule[]>,
  names?: string[],
): Promise<Record<string, string | undefined>> {
  const targets = names ?? Array.from(fieldRules.keys());
  const entries = await Promise.all(
    targets.map(async (name) => {
      const rules = fieldRules.get(name) ?? [];
      const error = await runRules(getValueByName(values, name), values, rules);
      return [name, error] as const;
    }),
  );

  return Object.fromEntries(entries);
}
