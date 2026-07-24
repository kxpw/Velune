import { clsx } from "clsx";
import { createRecipe } from "./recipe";
import {
  controlShellBaseClasses,
  controlShellInvalidClasses,
} from "./control-shell-classes";
import type { InputSize } from "../input";

/** Shared listbox option row used by Select and Combobox. */
export const listboxOptionClasses =
  "flex min-h-gs-11 cursor-pointer items-center gap-gs-2 rounded-gs-sm px-gs-3 py-gs-2 font-gs-regular text-gs-text transition-colors duration-200 ease-gs-standard data-[active=true]:bg-gs-action-hover data-[selected=true]:text-gs-border-focus data-[active=true]:data-[selected=true]:bg-gs-focus-muted data-[disabled=true]:cursor-not-allowed data-[disabled=true]:text-gs-text-disabled motion-reduce:transition-none [[data-reduced-motion=true]_&]:transition-none";

/** Shared empty / no-matches row. */
export const listboxEmptyClasses =
  "min-h-gs-11 rounded-gs-sm px-gs-3 py-gs-2 text-gs-text-secondary";

/** Shared floating listbox panel chrome. */
export const listboxPanelClasses =
  "invisible z-gs-popover grid overflow-hidden rounded-gs-xs border border-gs-border-default bg-gs-surface-raised bg-gs-surface-highlight shadow-gs-2 data-[ready=true]:visible data-[ready=true]:animate-gs-float-in data-[placement^=top]:[--gs-float-from:0_var(--space-1)] motion-reduce:animate-none [[data-reduced-motion=true]_&]:animate-none";

const listboxControlSizeClasses = createRecipe({
  variants: {
    size: {
      sm: "h-gs-11 min-h-gs-11 gap-gs-1 px-gs-2",
      md: "h-gs-11 min-h-gs-11 gap-gs-2 px-gs-3",
      lg: "h-gs-11 min-h-gs-11 gap-gs-2 px-gs-4",
    },
  },
  defaultVariants: { size: "md" },
});

export type ListboxControlClassesOptions = {
  size?: InputSize | undefined;
  invalid?: boolean | undefined;
  disabled?: boolean | undefined;
  open?: boolean | undefined;
  /** Root group name for hover selectors, e.g. `select` → `group-hover/select:…`. */
  groupName: "select" | "combobox";
  /** Extra size utilities (Combobox folds text size into the control). */
  sizeClassName?: string | undefined;
};

/** Shared bordered control shell for Select / Combobox. */
export function listboxControlClasses({
  size = "md",
  invalid = false,
  disabled = false,
  open = false,
  groupName,
  sizeClassName,
}: ListboxControlClassesOptions): string {
  return clsx(
    "inline-flex w-full items-center",
    controlShellBaseClasses,
    "has-[:focus-visible]:shadow-gs-input-surface-focus",
    listboxControlSizeClasses({ size }),
    sizeClassName,
    invalid
      ? clsx(
          controlShellInvalidClasses,
          "has-[:focus-visible]:shadow-gs-input-invalid-focus",
        )
      : !disabled &&
          `group-hover/${groupName}:border-gs-border-focus group-hover/${groupName}:bg-gs-action-hover`,
    open &&
      (invalid
        ? "border-gs-error bg-gs-error-subtle shadow-gs-input-invalid-border"
        : "border-gs-focus bg-gs-surface-raised shadow-gs-input-focus-border"),
  );
}

const listboxIndicatorSizeClasses = createRecipe({
  variants: {
    size: {
      sm: "size-gs-3",
      md: "size-gs-4",
      lg: "size-gs-5",
    },
  },
  defaultVariants: { size: "md" },
});

export type ListboxIndicatorClassesOptions = {
  size?: InputSize | undefined;
  open?: boolean | undefined;
  disabled?: boolean | undefined;
  interactive?: boolean | undefined;
};

/** Shared chevron indicator chrome for Select / Combobox. */
export function listboxIndicatorClasses({
  size = "md",
  open = false,
  disabled = false,
  interactive = false,
}: ListboxIndicatorClassesOptions = {}): string {
  return clsx(
    "inline-flex shrink-0 items-center justify-center text-gs-text-secondary transition-transform duration-200 ease-gs-standard motion-reduce:transition-none [[data-reduced-motion=true]_&]:transition-none",
    listboxIndicatorSizeClasses({ size }),
    interactive
      ? "cursor-pointer border-0 bg-transparent p-gs-0"
      : "pointer-events-none",
    open && "rotate-180",
    disabled && "cursor-not-allowed",
  );
}
