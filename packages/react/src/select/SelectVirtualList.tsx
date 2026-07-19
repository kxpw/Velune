import type { ReactNode, RefObject } from "react";
import { useEffect } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { SelectFlatOption } from "./Select.options";

const ESTIMATED_OPTION_HEIGHT = 44;
const VIRTUAL_OVERSCAN = 5;

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
  const virtualizer = useVirtualizer({
    count: options.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ESTIMATED_OPTION_HEIGHT,
    getItemKey: (index) => options[index]?.value ?? index,
    overscan: VIRTUAL_OVERSCAN,
  });

  useEffect(() => {
    if (options[activeIndex]) {
      virtualizer.scrollToIndex(activeIndex, { align: "auto" });
    }
  }, [activeIndex, options, virtualizer]);

  return (
    <div
      className="gs-select-virtual-content relative w-full"
      style={{ height: virtualizer.getTotalSize() }}
    >
      {virtualizer.getVirtualItems().map((virtualItem) => {
        const option = options[virtualItem.index];
        return option ? (
          <div
            key={virtualItem.key}
            ref={virtualizer.measureElement}
            className="gs-select-virtual-row absolute start-0 top-0 w-full"
            data-index={virtualItem.index}
            style={{ transform: `translateY(${virtualItem.start}px)` }}
          >
            {renderOption(option, virtualItem.index)}
          </div>
        ) : null;
      })}
    </div>
  );
}
