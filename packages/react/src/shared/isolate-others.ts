type IsolationRecord = {
  count: number;
  previousValue: string | null;
  wasInert: boolean;
};

const isolatedElements = new WeakMap<Element, IsolationRecord>();

function isolate(element: Element): void {
  const record = isolatedElements.get(element);
  if (record) {
    record.count += 1;
    return;
  }

  isolatedElements.set(element, {
    count: 1,
    previousValue: element.getAttribute("aria-hidden"),
    wasInert: element.hasAttribute("inert"),
  });
  element.setAttribute("aria-hidden", "true");
  element.setAttribute("inert", "");
}

function restore(element: Element): void {
  const record = isolatedElements.get(element);
  if (!record) {
    return;
  }

  record.count -= 1;
  if (record.count > 0) {
    return;
  }

  if (record.previousValue === null) {
    element.removeAttribute("aria-hidden");
  } else {
    element.setAttribute("aria-hidden", record.previousValue);
  }
  if (!record.wasInert) {
    element.removeAttribute("inert");
  }
  isolatedElements.delete(element);
}

/** Hide body siblings from assistive technology while a modal surface is open. */
export function isolateOthers(target: Element): () => void {
  const body = target.ownerDocument.body;
  const elements = new Set<Element>();

  const consider = (element: Element, preserveOverlayBranch = false) => {
    if (element === target || element.contains(target)) {
      return;
    }
    if (
      preserveOverlayBranch &&
      element.hasAttribute("data-gs-overlay-branch")
    ) {
      return;
    }
    isolate(element);
    elements.add(element);
  };

  Array.from(body.children).forEach((element) => consider(element));

  const observer = new MutationObserver((records) => {
    records.forEach((record) => {
      record.addedNodes.forEach((node) => {
        if (node instanceof Element && node.parentElement === body) {
          consider(node, true);
        }
      });
    });
  });
  observer.observe(body, { childList: true });

  return () => {
    observer.disconnect();
    elements.forEach(restore);
  };
}
