import type { ReactNode, RefObject } from "react";
import type { SelectFlatOption } from "./Select.options";
import {
  selectVirtualContentClasses,
  selectVirtualRowClasses,
} from "./Select.classes";
import { ListboxVirtualList } from "../shared/listbox-virtual-list";

export function SelectVirtualList({
  options,
  activeIndex,
  scrollRef,
  renderOption,
}: {
  options: readonly SelectFlatOption[];
  activeIndex: number;
  scrollRef: RefObject<HTMLDivElement>;
  renderOption: (option: SelectFlatOption, index: number) => ReactNode;
}) {
  return (
    <ListboxVirtualList
      options={options}
      activeIndex={activeIndex}
      scrollRef={scrollRef}
      renderOption={renderOption}
      contentClassName={selectVirtualContentClasses}
      rowClassName={selectVirtualRowClasses}
    />
  );
}
