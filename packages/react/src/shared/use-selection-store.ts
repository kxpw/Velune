import { useLayoutEffect, useRef } from "react";

export const subscribeToNothing = () => () => {};
export const undefinedSnapshot = () => undefined;

type SelectionStore<T> = {
  getSnapshot: () => T;
  setSnapshot: (next: T, notifyListeners: boolean) => void;
  subscribe: (listener: () => void) => () => boolean;
};

export function useSelectionStore<T>(value: T) {
  const valueRef = useRef(value);
  valueRef.current = value;
  const committedValueRef = useRef(value);
  const listenersRef = useRef(new Set<() => void>());
  const storeRef = useRef<SelectionStore<T> | undefined>(undefined);
  storeRef.current ??= {
    getSnapshot: () => valueRef.current,
    setSnapshot: (next, notifyListeners) => {
      valueRef.current = next;
      if (notifyListeners) {
        committedValueRef.current = next;
        listenersRef.current.forEach((listener) => listener());
      }
    },
    subscribe: (listener) => {
      listenersRef.current.add(listener);
      return () => listenersRef.current.delete(listener);
    },
  };

  useLayoutEffect(() => {
    valueRef.current = value;
    if (!Object.is(committedValueRef.current, value)) {
      committedValueRef.current = value;
      listenersRef.current.forEach((listener) => listener());
    }
  }, [value]);

  return storeRef.current;
}
