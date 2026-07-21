import type {
  CSSProperties,
  ForwardedRef,
  HTMLAttributes,
  ReactElement,
  Ref,
} from "react";
import { Children, cloneElement, forwardRef, isValidElement } from "react";
import { clsx } from "clsx";

type AnyProps = Record<string, unknown>;

export interface SlotProps extends HTMLAttributes<HTMLElement> {
  children: ReactElement;
}

function setRef<T>(ref: Ref<T> | undefined, node: T | null) {
  if (typeof ref === "function") {
    ref(node);
  } else if (ref) {
    (ref as { current: T | null }).current = node;
  }
}

function composeRefs<T>(...refs: Array<Ref<T> | undefined>) {
  return (node: T | null) => {
    refs.forEach((ref) => setRef(ref, node));
  };
}

function isEventHandlerName(name: string): boolean {
  return /^on[A-Z]/.test(name);
}

const ARIA_ID_LIST_PROPS = new Set([
  "aria-describedby",
  "aria-labelledby",
  "aria-controls",
]);

function joinIdLists(a: unknown, b: unknown): string | undefined {
  const tokens = [
    ...String(a ?? "").split(/\s+/),
    ...String(b ?? "").split(/\s+/),
  ].filter(Boolean);
  const unique = Array.from(new Set(tokens));
  return unique.length > 0 ? unique.join(" ") : undefined;
}

/**
 * Merge slot-provided props into the child's own props.
 *
 * - Event handlers compose: the child's handler runs first; the slot's
 *   handler runs after and can check `event.defaultPrevented`.
 * - `className` values are concatenated, `style` objects shallow-merged
 *   with the child taking precedence.
 * - `aria-describedby`/`aria-labelledby`/`aria-controls` id lists are
 *   merged as unique tokens from both sides.
 * - All other props: the child's own value wins when both are set.
 */
export function mergeSlotProps(
  slotProps: AnyProps,
  childProps: AnyProps,
): AnyProps {
  const merged: AnyProps = { ...slotProps, ...childProps };

  for (const name of Object.keys(slotProps)) {
    const slotValue = slotProps[name];
    const childValue = childProps[name];

    if (isEventHandlerName(name)) {
      if (typeof slotValue === "function" && typeof childValue === "function") {
        merged[name] = (...args: unknown[]) => {
          (childValue as (...a: unknown[]) => void)(...args);
          (slotValue as (...a: unknown[]) => void)(...args);
        };
      } else {
        merged[name] = childValue ?? slotValue;
      }
      continue;
    }

    if (name === "className") {
      merged[name] =
        clsx(slotValue as string, childValue as string) || undefined;
      continue;
    }

    if (name === "style") {
      merged[name] = {
        ...(slotValue as CSSProperties),
        ...(childValue as CSSProperties),
      };
      continue;
    }

    if (ARIA_ID_LIST_PROPS.has(name)) {
      merged[name] = joinIdLists(slotValue, childValue);
      continue;
    }
  }

  return merged;
}

function SlotImpl(
  { children, ...slotProps }: SlotProps,
  ref: ForwardedRef<HTMLElement>,
) {
  const child = Children.only(children);
  if (!isValidElement(child)) {
    throw new Error("Slot expects a single React element child.");
  }

  const childRef = (child as { ref?: Ref<HTMLElement> }).ref;
  return cloneElement(child, {
    ...mergeSlotProps(slotProps as AnyProps, child.props as AnyProps),
    ref: composeRefs(ref, childRef),
  } as AnyProps);
}

/**
 * Renders its single element child with the slot's props merged in, instead
 * of rendering any DOM of its own. This is the primitive behind `asChild`:
 *
 * ```tsx
 * <Slot className="gs-button" onClick={handle}>
 *   <RouterLink to="/docs">Docs</RouterLink>
 * </Slot>
 * ```
 */
export const Slot = forwardRef(SlotImpl);
Slot.displayName = "Slot";
