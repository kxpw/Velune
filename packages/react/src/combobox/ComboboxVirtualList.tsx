import type { ReactNode, RefObject } from "react";
import { ListboxVirtualList } from "../shared/listbox-virtual-list";
import {
  comboboxVirtualContentClasses,
  comboboxVirtualRowClasses,
} from "./Combobox.classes";
import type { ComboboxValue } from "./Combobox.types";

export type ComboboxVirtualOption = {
  value: ComboboxValue;
};

export type ComboboxVirtualListProps<T extends ComboboxVirtualOption> = {
  options: readonly T[];
  activeIndex: number;
  scrollRef: RefObject<HTMLDivElement | null>;
  renderOption: (option: T, index: number) => ReactNode;
};

export function ComboboxVirtualList<T extends ComboboxVirtualOption>({
  options,
  activeIndex,
  scrollRef,
  renderOption,
}: ComboboxVirtualListProps<T>) {
  return (
    <ListboxVirtualList
      options={options}
      activeIndex={activeIndex}
      scrollRef={scrollRef as RefObject<HTMLDivElement>}
      renderOption={renderOption}
      contentClassName={comboboxVirtualContentClasses}
      rowClassName={comboboxVirtualRowClasses}
    />
  );
}
