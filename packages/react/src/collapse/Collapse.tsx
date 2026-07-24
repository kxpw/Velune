import type {
  ForwardedRef,
  KeyboardEvent as ReactKeyboardEvent,
  ReactNode,
} from "react";
import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { clsx } from "clsx";
import {
  getLinearNavigationIndex,
  resolveLinearNavigation,
} from "../shared/keyboard-navigation";
import type {
  CollapseContentProps,
  CollapseItemProps,
  CollapseMultipleProps,
  CollapseProps,
  CollapseSingleProps,
  CollapseTriggerProps,
  CollapseType,
  CollapseValue,
  CollapseVariant,
  CollapseOrientation,
} from "./Collapse.types";
import {
  collapseClasses,
  collapseContentClasses,
  collapseContentInnerClasses,
  collapseIconClasses,
  collapseItemClasses,
  collapseTriggerClasses,
  collapseTriggerLabelClasses,
} from "./Collapse.classes";

type RootContextValue = {
  type: CollapseType;
  openValues: CollapseValue[];
  toggle: (value: CollapseValue) => void;
  collapsible: boolean;
  baseId: string;
  registerTrigger: (
    value: CollapseValue,
    node: HTMLButtonElement | null,
  ) => void;
  getOrderedTriggers: () => HTMLButtonElement[];
  disabled: boolean;
  variant: CollapseVariant;
  orientation: CollapseOrientation;
};

type ItemContextValue = {
  value: CollapseValue;
  open: boolean;
  disabled: boolean;
  triggerId: string;
  contentId: string;
};

const RootContext = createContext<RootContextValue | null>(null);
const ItemContext = createContext<ItemContextValue | null>(null);

function useRoot(component: string): RootContextValue {
  const ctx = useContext(RootContext);
  if (!ctx) {
    throw new Error(`${component} must be used within <Collapse>`);
  }
  return ctx;
}

function useItem(component: string): ItemContextValue {
  const ctx = useContext(ItemContext);
  if (!ctx) {
    throw new Error(`${component} must be used within <Collapse.Item>`);
  }
  return ctx;
}

type CollapseChangeHandler =
  | CollapseSingleProps["onValueChange"]
  | CollapseMultipleProps["onValueChange"];

type CollapseStrategy = {
  normalize: (
    source: CollapseValue | CollapseValue[] | undefined,
  ) => CollapseValue[];
  toggle: (
    current: CollapseValue[],
    value: CollapseValue,
    collapsible: boolean,
  ) => CollapseValue[];
  notify: (handler: CollapseChangeHandler, values: CollapseValue[]) => void;
};

const collapseStrategies: Record<CollapseType, CollapseStrategy> = {
  single: {
    normalize: (source) => {
      if (source == null) return [];
      return Array.isArray(source) ? source.slice(0, 1) : [source];
    },
    toggle: (current, value, collapsible) =>
      current.includes(value) ? (collapsible ? [] : current) : [value],
    notify: (handler, values) =>
      (handler as CollapseSingleProps["onValueChange"])?.(values[0] ?? ""),
  },
  multiple: {
    normalize: (source) => {
      if (source == null) return [];
      return Array.isArray(source) ? source : [source];
    },
    toggle: (current, value) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    notify: (handler, values) =>
      (handler as CollapseMultipleProps["onValueChange"])?.(values),
  },
};

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className={collapseIconClasses(open)}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M4 6L8 10L12 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CollapseImpl(
  {
    type = "single",
    variant = "filled",
    value,
    defaultValue,
    onValueChange,
    collapsible = true,
    orientation = "vertical",
    dir = "ltr",
    disabled = false,
    className,
    children,
    onKeyDown,
    ...props
  }: CollapseProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const isControlled = value !== undefined;
  const strategy = collapseStrategies[type];
  const [inner, setInner] = useState<CollapseValue[]>(() =>
    strategy.normalize(defaultValue),
  );
  const openValues = isControlled
    ? strategy.normalize(value)
    : strategy.normalize(inner);
  const baseId = useId();
  const triggersRef = useRef(new Map<CollapseValue, HTMLButtonElement>());

  const registerTrigger = useCallback(
    (triggerValue: CollapseValue, node: HTMLButtonElement | null) => {
      if (node) {
        triggersRef.current.set(triggerValue, node);
      } else {
        triggersRef.current.delete(triggerValue);
      }
    },
    [],
  );

  const getOrderedTriggers = useCallback(
    () =>
      Array.from(triggersRef.current.values())
        .filter((node) => !node.disabled)
        .sort((a, b) => {
          if (a === b) {
            return 0;
          }
          return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING
            ? -1
            : 1;
        }),
    [],
  );

  const emit = useCallback(
    (next: CollapseValue[]) => {
      if (!isControlled) {
        setInner(next);
      }
      strategy.notify(onValueChange, next);
    },
    [isControlled, onValueChange, strategy],
  );

  const toggle = useCallback(
    (itemValue: CollapseValue) => {
      emit(strategy.toggle(openValues, itemValue, collapsible));
    },
    [collapsible, emit, openValues, strategy],
  );

  const ctx = useMemo(
    () => ({
      type,
      openValues,
      toggle,
      collapsible,
      baseId,
      registerTrigger,
      getOrderedTriggers,
      disabled,
      variant,
      orientation,
    }),
    [
      baseId,
      collapsible,
      getOrderedTriggers,
      disabled,
      orientation,
      openValues,
      registerTrigger,
      toggle,
      type,
      variant,
    ],
  );

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || disabled) {
      return;
    }
    const intent = resolveLinearNavigation(event.key, orientation, dir);
    if (!intent) return;
    const triggers = getOrderedTriggers();
    const currentIndex = triggers.findIndex(
      (trigger) => trigger === event.target,
    );
    if (currentIndex < 0) {
      return;
    }
    const nextIndex = getLinearNavigationIndex(
      currentIndex,
      triggers.length,
      intent,
    );
    if (nextIndex === null) return;
    event.preventDefault();
    triggers[nextIndex]?.focus();
  };

  return (
    <RootContext.Provider value={ctx}>
      <div
        {...props}
        ref={ref}
        className={clsx(collapseClasses(orientation), className)}
        data-type={type}
        data-variant={variant}
        data-orientation={orientation}
        data-disabled={disabled ? "true" : undefined}
        dir={dir}
        onKeyDown={handleKeyDown}
      >
        {children}
      </div>
    </RootContext.Provider>
  );
}

const CollapseRoot = forwardRef(CollapseImpl);
CollapseRoot.displayName = "Collapse";

function CollapseItemImpl(
  { value, disabled = false, className, children, ...props }: CollapseItemProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const {
    openValues,
    baseId,
    disabled: rootDisabled,
    variant,
    orientation,
  } = useRoot("Collapse.Item");
  const resolvedDisabled = disabled || rootDisabled;
  const open = openValues.includes(value);
  const itemCtx = useMemo(
    () => ({
      value,
      open,
      disabled: resolvedDisabled,
      triggerId: `${baseId}-trigger-${encodeURIComponent(value)}`,
      contentId: `${baseId}-content-${encodeURIComponent(value)}`,
    }),
    [baseId, open, resolvedDisabled, value],
  );

  return (
    <ItemContext.Provider value={itemCtx}>
      <div
        {...props}
        ref={ref}
        className={clsx(
          collapseItemClasses({
            variant,
            orientation,
            disabled: resolvedDisabled,
          }),
          className,
        )}
        data-state={open ? "open" : "closed"}
        data-disabled={resolvedDisabled ? "true" : undefined}
      >
        {children}
      </div>
    </ItemContext.Provider>
  );
}

const CollapseItem = forwardRef(CollapseItemImpl);
CollapseItem.displayName = "Collapse.Item";

function CollapseTriggerImpl(
  { className, children, onClick, ...props }: CollapseTriggerProps,
  ref: ForwardedRef<HTMLButtonElement>,
) {
  const { toggle, registerTrigger, variant } = useRoot("Collapse.Trigger");
  const { value, open, disabled, triggerId, contentId } =
    useItem("Collapse.Trigger");

  const setRefs = useCallback(
    (node: HTMLButtonElement | null) => {
      registerTrigger(value, node);
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    },
    [ref, registerTrigger, value],
  );

  return (
    <button
      {...props}
      ref={setRefs}
      id={triggerId}
      type="button"
      className={clsx(collapseTriggerClasses(variant), className)}
      aria-expanded={open}
      aria-controls={contentId}
      data-state={open ? "open" : "closed"}
      disabled={disabled}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || disabled) {
          return;
        }
        toggle(value);
      }}
    >
      <span className={collapseTriggerLabelClasses}>{children}</span>
      <Chevron open={open} />
    </button>
  );
}

const CollapseTrigger = forwardRef(CollapseTriggerImpl);
CollapseTrigger.displayName = "Collapse.Trigger";

function CollapseContentImpl(
  { className, children, forceMount = false, ...props }: CollapseContentProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const { open, triggerId, contentId } = useItem("Collapse.Content");
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const [hasOpened, setHasOpened] = useState(open);

  useEffect(() => {
    if (open) {
      setHasOpened(true);
    }
  }, [open]);

  // Once mounted, content stays present for the CSS grid animation.
  // `aria-hidden` alone leaves collapsed children keyboard-focusable, so mark
  // the subtree inert while closed (attribute form works in React 18 and 19).
  useEffect(() => {
    const node = nodeRef.current;
    if (!node) {
      return;
    }
    if (open) {
      node.removeAttribute("inert");
    } else {
      node.setAttribute("inert", "");
    }
  }, [open]);

  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      nodeRef.current = node;
      if (node?.dataset.state === "closed") node.setAttribute("inert", "");
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  if (!forceMount && !open && !hasOpened) {
    return null;
  }

  return (
    <div
      {...props}
      ref={setRefs}
      id={contentId}
      role="region"
      aria-labelledby={triggerId}
      className={clsx(collapseContentClasses(open), className)}
      data-state={open ? "open" : "closed"}
      aria-hidden={!open || undefined}
    >
      <div className={collapseContentInnerClasses(open)}>
        {children as ReactNode}
      </div>
    </div>
  );
}

const CollapseContent = forwardRef(CollapseContentImpl);
CollapseContent.displayName = "Collapse.Content";

export const Collapse = Object.assign(CollapseRoot, {
  Item: CollapseItem,
  Trigger: CollapseTrigger,
  Content: CollapseContent,
});
