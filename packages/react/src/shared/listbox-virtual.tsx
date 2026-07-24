import type { ReactNode } from "react";

export const LISTBOX_VIRTUALIZATION_THRESHOLD = 100;
export const LISTBOX_VIRTUAL_FALLBACK_SIZE = 12;

export type ListboxVirtualItem = {
  value: string | number;
};

/** Non-virtualized slice shown while the virtualizer chunk loads. */
export function renderListboxVirtualFallback<T extends ListboxVirtualItem>(
  options: readonly T[],
  activeIndex: number,
  renderOption: (option: T, index: number) => ReactNode,
  className: string,
) {
  const maxStart = Math.max(0, options.length - LISTBOX_VIRTUAL_FALLBACK_SIZE);
  const start = Math.min(
    maxStart,
    Math.max(0, activeIndex - Math.floor(LISTBOX_VIRTUAL_FALLBACK_SIZE / 2)),
  );
  return (
    <div className={className}>
      {options
        .slice(start, start + LISTBOX_VIRTUAL_FALLBACK_SIZE)
        .map((option, offset) => renderOption(option, start + offset))}
    </div>
  );
}
