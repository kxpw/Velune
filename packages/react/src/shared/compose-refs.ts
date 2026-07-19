import type { MutableRefObject, Ref } from "react";
import { useCallback } from "react";

type PossibleRef<T> = Ref<T> | undefined;

function setRef<T>(ref: PossibleRef<T>, node: T | null) {
  if (typeof ref === "function") {
    ref(node);
  } else if (ref) {
    (ref as MutableRefObject<T | null>).current = node;
  }
}

export function useComposedRefs<T>(
  firstRef: PossibleRef<T>,
  secondRef: PossibleRef<T>,
) {
  return useCallback(
    (node: T | null) => {
      setRef(firstRef, node);
      setRef(secondRef, node);
    },
    [firstRef, secondRef],
  );
}
