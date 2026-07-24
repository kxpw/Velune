import type { ReactNode, RefObject } from "react";
import { useLayoutEffect, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { ListboxVirtualItem } from "./listbox-virtual";

const ESTIMATED_OPTION_HEIGHT = 44;
const VIRTUAL_OVERSCAN = 5;

/** Shared virtualized option list for Select / Combobox. */
export function ListboxVirtualList<T extends ListboxVirtualItem>({
  options,
  activeIndex,
  scrollRef,
  renderOption,
  contentClassName,
  rowClassName,
}: {
  options: readonly T[];
  activeIndex: number;
  scrollRef: RefObject<HTMLDivElement>;
  renderOption: (option: T, index: number) => ReactNode;
  contentClassName: string;
  rowClassName: string;
}) {
  const virtualizer = useVirtualizer({
    count: options.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ESTIMATED_OPTION_HEIGHT,
    getItemKey: (index) => options[index]?.value ?? index,
    overscan: VIRTUAL_OVERSCAN,
  });
  const virtualizerRef = useRef(virtualizer);
  virtualizerRef.current = virtualizer;

  useLayoutEffect(() => {
    if (!options[activeIndex]) {
      return;
    }
    const instance = virtualizerRef.current;
    const visible = instance.getVirtualItems();
    const first = visible[0]?.index;
    const last = visible[visible.length - 1]?.index;
    if (
      first == null ||
      last == null ||
      activeIndex < first ||
      activeIndex > last
    ) {
      instance.scrollToIndex(activeIndex, { align: "auto" });
    }
  }, [activeIndex, options]);

  return (
    <div
      className={contentClassName}
      style={{ height: virtualizer.getTotalSize() }}
    >
      {virtualizer.getVirtualItems().map((virtualItem) => {
        const option = options[virtualItem.index];
        return option ? (
          <div
            key={virtualItem.key}
            ref={virtualizer.measureElement}
            className={rowClassName}
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
