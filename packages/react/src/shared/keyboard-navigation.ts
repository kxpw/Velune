export type NavigationOrientation = "horizontal" | "vertical";
export type NavigationDirection = "ltr" | "rtl";
export type LinearNavigationIntent = "first" | "last" | "next" | "previous";

export function resolveLinearNavigation(
  key: string,
  orientation: NavigationOrientation,
  direction: NavigationDirection = "ltr",
): LinearNavigationIntent | null {
  if (key === "Home") return "first";
  if (key === "End") return "last";

  const navigationKeys =
    orientation === "vertical"
      ? { ArrowDown: "next", ArrowUp: "previous" }
      : direction === "rtl"
        ? { ArrowLeft: "next", ArrowRight: "previous" }
        : { ArrowLeft: "previous", ArrowRight: "next" };

  return (navigationKeys[key as keyof typeof navigationKeys] ??
    null) as LinearNavigationIntent | null;
}

export function getLinearNavigationIndex(
  currentIndex: number,
  length: number,
  intent: LinearNavigationIntent,
  loop = true,
): number | null {
  if (length <= 0) return null;
  if (intent === "first") return 0;
  if (intent === "last") return length - 1;

  const step = intent === "next" ? 1 : -1;
  const nextIndex = currentIndex + step;
  if (loop) return (nextIndex + length) % length;
  return Math.min(Math.max(nextIndex, 0), length - 1);
}

export function findEnabledIndex<T>(
  items: readonly T[],
  startIndex: number,
  intent: LinearNavigationIntent,
  isDisabled: (item: T) => boolean,
  loop = true,
): number {
  if (items.length === 0) return -1;

  if (intent === "first" || intent === "last") {
    const start = intent === "first" ? 0 : items.length - 1;
    const step = intent === "first" ? 1 : -1;
    for (let index = start; index >= 0 && index < items.length; index += step) {
      const item = items[index];
      if (item !== undefined && !isDisabled(item)) return index;
    }
    return -1;
  }

  const step = intent === "next" ? 1 : -1;
  let index = startIndex;
  for (let count = 0; count < items.length; count += 1) {
    index += step;
    if (loop) index = (index + items.length) % items.length;
    if (index < 0 || index >= items.length) return -1;
    const item = items[index];
    if (item !== undefined && !isDisabled(item)) return index;
  }
  return -1;
}
