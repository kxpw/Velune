import { useEffect } from "react";

let lockCount = 0;
let previousOverflow = "";
let previousPaddingRight = "";

export function useScrollLock(locked: boolean): void {
  useEffect(() => {
    if (!locked || typeof document === "undefined") {
      return;
    }

    if (lockCount === 0) {
      previousOverflow = document.body.style.overflow;
      previousPaddingRight = document.body.style.paddingRight;
      const scrollbarWidth = Math.max(
        0,
        window.innerWidth - document.documentElement.clientWidth,
      );
      if (scrollbarWidth > 0) {
        const computedPadding = Number.parseFloat(
          window.getComputedStyle(document.body).paddingRight,
        );
        document.body.style.paddingRight = `${
          (Number.isFinite(computedPadding) ? computedPadding : 0) +
          scrollbarWidth
        }px`;
      }
      document.body.style.overflow = "hidden";
    }
    lockCount += 1;

    return () => {
      lockCount = Math.max(0, lockCount - 1);
      if (lockCount === 0) {
        document.body.style.overflow = previousOverflow;
        document.body.style.paddingRight = previousPaddingRight;
      }
    };
  }, [locked]);
}
