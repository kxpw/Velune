import type { HTMLAttributes, ReactNode } from "react";
import type { SelectValue } from "./Select.types";

export type SelectOption = {
  value: SelectValue;
  label: ReactNode;
  disabled?: boolean | undefined;
  searchText?: string | undefined;
  slotProps?: HTMLAttributes<HTMLDivElement> | undefined;
};

export type SelectOptionGroup = {
  label: ReactNode;
  options: SelectOption[];
  searchText?: string | undefined;
  slotProps?: HTMLAttributes<HTMLDivElement> | undefined;
  labelProps?: HTMLAttributes<HTMLDivElement> | undefined;
};

export type SelectOptionItem = SelectOption | SelectOptionGroup;

export type SelectFlatOption = SelectOption & {
  groupKey?: string;
};

export function isSelectOptionGroup(
  item: SelectOptionItem,
): item is SelectOptionGroup {
  return "options" in item && Array.isArray(item.options);
}
