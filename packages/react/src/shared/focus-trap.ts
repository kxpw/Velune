const FOCUSABLE_SELECTOR = [
  "a[href]",
  "area[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "iframe",
  "object",
  "embed",
  "[contenteditable]:not([contenteditable='false'])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

type FocusTrapScope = {
  container: HTMLElement;
  lastFocused: HTMLElement;
  paused: boolean;
};

const focusTrapStack: FocusTrapScope[] = [];

function activateScope(scope: FocusTrapScope): void {
  if (focusTrapStack[0]) {
    focusTrapStack[0].paused = true;
  }
  focusTrapStack.unshift(scope);
}

function deactivateScope(scope: FocusTrapScope): void {
  const index = focusTrapStack.indexOf(scope);
  if (index >= 0) {
    focusTrapStack.splice(index, 1);
  }
  if (focusTrapStack[0]) {
    focusTrapStack[0].paused = false;
  }
}

function isAllowedPortalTarget(target: HTMLElement): boolean {
  const branch = target.closest<HTMLElement>("[data-gs-overlay-branch]");
  return branch !== null && !branch.hasAttribute("data-gs-focus-scope");
}

export function isFocusWithinTrapBoundary(container: HTMLElement): boolean {
  const active = document.activeElement;
  return (
    active instanceof HTMLElement &&
    (container.contains(active) || isAllowedPortalTarget(active))
  );
}

function isVisible(element: HTMLElement): boolean {
  if (element.hidden || element.getAttribute("aria-hidden") === "true") {
    return false;
  }
  const style = window.getComputedStyle(element);
  if (style.visibility === "hidden" || style.display === "none") {
    return false;
  }
  return !!(
    element.offsetWidth ||
    element.offsetHeight ||
    element.getClientRects().length
  );
}

export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter((element) => isVisible(element));
}

export function focusFirst(container: HTMLElement): void {
  const focusable = getFocusableElements(container);
  const target = focusable[0] ?? container;
  target.focus({ preventScroll: true });
}

export function createFocusTrap(container: HTMLElement) {
  const active = document.activeElement as HTMLElement | null;
  const scope: FocusTrapScope = {
    container,
    lastFocused: active && container.contains(active) ? active : container,
    paused: false,
  };

  const restoreInside = () => {
    const target =
      scope.lastFocused.isConnected && container.contains(scope.lastFocused)
        ? scope.lastFocused
        : container;
    target.focus({ preventScroll: true });
  };

  const onFocusIn = (event: FocusEvent) => {
    if (scope.paused) {
      return;
    }
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }
    if (container.contains(target)) {
      scope.lastFocused = target;
      return;
    }
    if (!isAllowedPortalTarget(target)) {
      restoreInside();
    }
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (
      scope.paused ||
      event.key !== "Tab" ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey
    ) {
      return;
    }

    const focusable = getFocusableElements(container);
    if (focusable.length === 0) {
      event.preventDefault();
      container.focus({ preventScroll: true });
      return;
    }

    const first = focusable[0]!;
    const last = focusable[focusable.length - 1]!;
    const active = document.activeElement as HTMLElement | null;

    if (event.shiftKey) {
      if (!active || active === first || !container.contains(active)) {
        event.preventDefault();
        last.focus({ preventScroll: true });
      }
      return;
    }

    if (!active || active === last || !container.contains(active)) {
      event.preventDefault();
      first.focus({ preventScroll: true });
    }
  };

  const mutationObserver = new MutationObserver((records) => {
    if (
      scope.paused ||
      document.activeElement !== document.body ||
      !records.some((record) => record.removedNodes.length > 0)
    ) {
      return;
    }
    restoreInside();
  });

  activateScope(scope);
  container.addEventListener("keydown", onKeyDown);
  document.addEventListener("focusin", onFocusIn);
  mutationObserver.observe(container, { childList: true, subtree: true });
  return () => {
    container.removeEventListener("keydown", onKeyDown);
    document.removeEventListener("focusin", onFocusIn);
    mutationObserver.disconnect();
    deactivateScope(scope);
  };
}
