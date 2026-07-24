import type { ClassValue } from "clsx";
import { clsx } from "clsx";

/** A class list accepted by recipe definitions: a string or array of strings. */
export type RecipeClassValue = string | readonly string[];

/** Shape of a `variants` definition: group name -> option name -> classes. */
export type RecipeVariantsShape = Record<
  string,
  Record<string, RecipeClassValue>
>;

type StringToBoolean<T> = T extends "true" | "false" ? boolean : T;

/** Props accepted by a recipe, inferred from its `variants` definition. */
export type RecipeSelection<V extends RecipeVariantsShape> = {
  [K in keyof V]?: StringToBoolean<keyof V[K]> | undefined;
};

export type RecipeCompoundVariant<V extends RecipeVariantsShape> =
  RecipeSelection<V> & {
    className: RecipeClassValue;
  };

export interface RecipeConfig<V extends RecipeVariantsShape> {
  /** Classes always applied, before any variant classes. */
  base?: RecipeClassValue;
  /** Variant groups. Boolean variants use `"true"` / `"false"` keys. */
  variants?: V;
  /** Extra classes appended when every listed variant value matches. */
  compoundVariants?: ReadonlyArray<RecipeCompoundVariant<V>>;
  /** Fallback values used when a variant prop is omitted or `undefined`. */
  defaultVariants?: RecipeSelection<V>;
}

export type Recipe<V extends RecipeVariantsShape> = (
  props?: RecipeSelection<V>,
) => string;

/**
 * Extracts the props type of a recipe created with {@link createRecipe},
 * similar to cva's `VariantProps`:
 *
 * ```ts
 * const badge = createRecipe({ variants: { tone: { info: "...", error: "..." } } });
 * type BadgeVariants = RecipeVariantProps<typeof badge>; // { tone?: "info" | "error" }
 * ```
 */
export type RecipeVariantProps<T> =
  T extends Recipe<infer V> ? RecipeSelection<V> : never;

/**
 * Creates a type-safe styling recipe (cva-style, built on clsx).
 *
 * Output order is deterministic: `base`, then each variant group in
 * definition order, then matching `compoundVariants` in definition order.
 * Unknown props are ignored; `undefined` values fall back to
 * `defaultVariants`.
 *
 * ```ts
 * const alertClasses = createRecipe({
 *   base: "gs-alert flex",
 *   variants: {
 *     tone: { info: "border-gs-info", error: "border-gs-error" },
 *   },
 *   defaultVariants: { tone: "info" },
 * });
 * alertClasses({ tone: "error" }); // "gs-alert flex border-gs-error"
 * ```
 */
export function createRecipe<V extends RecipeVariantsShape>(
  config: RecipeConfig<V>,
): Recipe<V> {
  const { base, variants, compoundVariants, defaultVariants } = config;

  return (props?: RecipeSelection<V>): string => {
    const classes: RecipeClassValue[] = [];
    if (base !== undefined) {
      classes.push(base);
    }

    const resolved: Record<string, unknown> = { ...defaultVariants };
    if (props) {
      for (const key of Object.keys(props)) {
        const value = (props as Record<string, unknown>)[key];
        if (value !== undefined) {
          resolved[key] = value;
        }
      }
    }

    if (variants) {
      for (const group of Object.keys(variants)) {
        const value = resolved[group];
        if (value === undefined) {
          continue;
        }
        const variantClass = variants[group]?.[String(value)];
        if (variantClass !== undefined) {
          classes.push(variantClass);
        }
      }
    }

    if (compoundVariants) {
      for (const compound of compoundVariants) {
        const { className, ...matchers } = compound;
        const matches = Object.entries(matchers).every(
          ([group, value]) =>
            value === undefined || String(resolved[group]) === String(value),
        );
        if (matches) {
          classes.push(className);
        }
      }
    }

    return clsx(classes as ClassValue[]);
  };
}
