import type { ReactNode } from "react";
import { dispatchCompoundSlots } from "../shared/compound-slot";
import {
  LISTBOX_VIRTUALIZATION_THRESHOLD,
  renderListboxVirtualFallback,
} from "../shared/listbox-virtual";
import {
  isSelectOptionGroup,
  type SelectFlatOption,
  type SelectOption,
  type SelectOptionGroup,
  type SelectOptionItem,
} from "./Select.options";
import type {
  SelectContentProps,
  SelectDescriptionProps,
  SelectEmptyProps,
  SelectErrorMessageProps,
  SelectGroupLabelProps,
  SelectGroupProps,
  SelectItemProps,
  SelectLabelProps,
  SelectMultipleProps,
  SelectNoMatchesProps,
  SelectSingleProps,
  SelectTriggerProps,
  SelectValue,
} from "./Select.types";
import { selectVirtualFallbackClasses } from "./Select.classes";

export const SELECT_VIRTUALIZATION_THRESHOLD = LISTBOX_VIRTUALIZATION_THRESHOLD;

const EMPTY_VALUES: SelectValue[] = [];

export type SelectComposition = {
  options: SelectOptionItem[];
  label?: SelectLabelProps;
  description?: SelectDescriptionProps;
  errorMessage?: SelectErrorMessageProps;
  trigger?: SelectTriggerProps;
  content?: SelectContentProps;
  empty?: SelectEmptyProps;
  noMatches?: SelectNoMatchesProps;
};

export function collectSelectItems(children: ReactNode): SelectOptionItem[] {
  const items: SelectOptionItem[] = [];
  dispatchCompoundSlots(children, {
    "Select.Item": (child) => {
      const props = child.props as SelectItemProps;
      items.push({
        value: props.value,
        label: props.children,
        disabled: props.disabled,
        searchText: props.textValue,
        slotProps: props,
      });
    },
    "Select.Group": (child) => {
      const props = child.props as SelectGroupProps;
      let label: ReactNode;
      let labelProps: SelectGroupLabelProps | undefined;
      const options: SelectOption[] = [];
      dispatchCompoundSlots(props.children, {
        "Select.GroupLabel": (groupChild) => {
          labelProps = groupChild.props as SelectGroupLabelProps;
          label = labelProps.children;
        },
        "Select.Item": (groupChild) => {
          const item = groupChild.props as SelectItemProps;
          options.push({
            value: item.value,
            label: item.children,
            disabled: item.disabled,
            searchText: item.textValue,
            slotProps: item,
          });
        },
      });
      items.push({
        label: label ?? "",
        options,
        searchText: props.textValue,
        slotProps: props,
        labelProps,
      });
    },
  });
  return items;
}

export function collectSelectComposition(
  children: ReactNode,
): SelectComposition {
  const composition: SelectComposition = { options: [] };

  dispatchCompoundSlots(children, {
    "Select.Label": (child) => {
      composition.label = child.props as SelectLabelProps;
    },
    "Select.Description": (child) => {
      composition.description = child.props as SelectDescriptionProps;
    },
    "Select.ErrorMessage": (child) => {
      composition.errorMessage = child.props as SelectErrorMessageProps;
    },
    "Select.Trigger": (child) => {
      composition.trigger = child.props as SelectTriggerProps;
    },
    "Select.Empty": (child) => {
      composition.empty = child.props as SelectEmptyProps;
    },
    "Select.NoMatches": (child) => {
      composition.noMatches = child.props as SelectNoMatchesProps;
    },
    "Select.Content": (child) => {
      composition.content = child.props as SelectContentProps;
      composition.options.push(
        ...collectSelectItems((child.props as SelectContentProps).children),
      );
    },
    "Select.Item": (child) => {
      composition.options.push(...collectSelectItems(child));
    },
    "Select.Group": (child) => {
      composition.options.push(...collectSelectItems(child));
    },
  });
  return composition;
}

export function labelToText(label: ReactNode): string {
  return typeof label === "string" || typeof label === "number"
    ? String(label)
    : "";
}

export function optionSearchText(option: SelectOption): string {
  return (option.searchText ?? labelToText(option.label)).toLowerCase();
}

function groupSearchText(group: SelectOptionGroup): string {
  return (group.searchText ?? labelToText(group.label)).toLowerCase();
}

export function normalizeValue(
  value: SelectValue | SelectValue[] | undefined,
): SelectValue[] {
  if (Array.isArray(value)) {
    return value;
  }
  if (value) {
    return [value];
  }
  return EMPTY_VALUES;
}

export function equalValues(a: SelectValue[], b: SelectValue[]): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

type SelectionChangeHandler =
  | SelectSingleProps["onValueChange"]
  | SelectMultipleProps["onValueChange"];

type SelectionStrategy = {
  nextValues: (current: SelectValue[], value: SelectValue) => SelectValue[];
  publicValue: (values: SelectValue[]) => SelectValue | SelectValue[];
  notify: (handler: SelectionChangeHandler, values: SelectValue[]) => void;
  closeOnSelect: boolean;
};

export const selectionStrategies: Record<
  "single" | "multiple",
  SelectionStrategy
> = {
  single: {
    nextValues: (_current, value) => [value],
    publicValue: (values) => values[0] ?? "",
    notify: (handler, values) =>
      (handler as SelectSingleProps["onValueChange"])?.(values[0] ?? ""),
    closeOnSelect: true,
  },
  multiple: {
    nextValues: (current, value) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    publicValue: (values) => values,
    notify: (handler, values) =>
      (handler as SelectMultipleProps["onValueChange"])?.(values),
    closeOnSelect: false,
  },
};

export function flattenOptions(items: SelectOptionItem[]): {
  flat: SelectFlatOption[];
  all: SelectOption[];
} {
  const flat: SelectFlatOption[] = [];
  const all: SelectOption[] = [];

  items.forEach((item, groupIndex) => {
    if (isSelectOptionGroup(item)) {
      const groupKey = `group-${groupIndex}`;
      item.options.forEach((option) => {
        const next = { ...option, groupKey };
        flat.push(next);
        all.push(option);
      });
      return;
    }
    flat.push(item);
    all.push(item);
  });

  return { flat, all };
}

export function filterOptionItems(
  items: SelectOptionItem[],
  query: string,
  skipLocalFilter: boolean,
): SelectOptionItem[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (skipLocalFilter || normalizedQuery.length === 0) {
    return items;
  }

  const result: SelectOptionItem[] = [];

  for (const item of items) {
    if (isSelectOptionGroup(item)) {
      const groupMatches = groupSearchText(item).includes(normalizedQuery);
      const matchedOptions = groupMatches
        ? item.options
        : item.options.filter((option) =>
            optionSearchText(option).includes(normalizedQuery),
          );
      if (matchedOptions.length > 0) {
        result.push({ ...item, options: matchedOptions });
      }
      continue;
    }

    if (optionSearchText(item).includes(normalizedQuery)) {
      result.push(item);
    }
  }

  return result;
}

export function renderVirtualFallback(
  options: readonly SelectFlatOption[],
  activeIndex: number,
  renderOption: (option: SelectFlatOption, index: number) => ReactNode,
) {
  return renderListboxVirtualFallback(
    options,
    activeIndex,
    renderOption,
    selectVirtualFallbackClasses,
  );
}
