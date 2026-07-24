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
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useControllableState } from "@velune/hooks";
import { clsx } from "clsx";
import {
  getLinearNavigationIndex,
  resolveLinearNavigation,
} from "../shared/keyboard-navigation";
import type {
  TabsListProps,
  TabsOrientation,
  TabsPanelProps,
  TabsProps,
  TabsTriggerProps,
  TabsValue,
  TabsVariant,
} from "./Tabs.types";
import {
  tabsClasses,
  tabsListClasses,
  tabsPanelClasses,
  tabsTriggerClasses,
  tabsTriggerLabelClasses,
} from "./Tabs.classes";

type TabsContextValue = {
  value: TabsValue;
  setValue: (value: TabsValue) => void;
  orientation: TabsOrientation;
  activationMode: "automatic" | "manual";
  baseId: string;
  registerTrigger: (value: TabsValue, node: HTMLButtonElement | null) => void;
  registerPanel: (value: TabsValue, present: boolean) => void;
  hasPanel: (value: TabsValue) => boolean;
  getOrderedTriggers: () => HTMLButtonElement[];
  setTabStop: (node: HTMLButtonElement) => void;
  syncTabStops: () => void;
  dir: "ltr" | "rtl";
  variant: TabsVariant;
};

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext(component: string): TabsContextValue {
  const ctx = useContext(TabsContext);
  if (!ctx) {
    throw new Error(`${component} must be used within <Tabs>`);
  }
  return ctx;
}

function TabsImpl(
  {
    value,
    defaultValue = "",
    onValueChange,
    orientation = "horizontal",
    variant = "underline",
    activationMode = "automatic",
    dir: dirProp,
    className,
    children,
    ...props
  }: TabsProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const [current, setValue] = useControllableState<TabsValue>({
    value,
    defaultValue,
    onChange: onValueChange,
  });
  const dir: "ltr" | "rtl" = dirProp === "rtl" ? "rtl" : "ltr";
  const baseId = useId();
  const triggersRef = useRef(new Map<TabsValue, HTMLButtonElement>());
  const [panelValues, setPanelValues] = useState(() => new Set<TabsValue>());
  const syncTabStopsRef = useRef<() => void>(() => {});
  const currentRef = useRef(current);
  currentRef.current = current;

  const registerTrigger = useCallback(
    (tabValue: TabsValue, node: HTMLButtonElement | null) => {
      if (node) {
        triggersRef.current.set(tabValue, node);
      } else {
        triggersRef.current.delete(tabValue);
      }
      syncTabStopsRef.current();
    },
    [],
  );

  const registerPanel = useCallback((tabValue: TabsValue, present: boolean) => {
    setPanelValues((previous) => {
      const has = previous.has(tabValue);
      if (present === has) {
        return previous;
      }
      const next = new Set(previous);
      if (present) {
        next.add(tabValue);
      } else {
        next.delete(tabValue);
      }
      return next;
    });
  }, []);

  const hasPanel = useCallback(
    (tabValue: TabsValue) => panelValues.has(tabValue),
    [panelValues],
  );

  const getAllOrderedTriggers = useCallback(() => {
    return Array.from(triggersRef.current.values()).sort((a, b) => {
      if (a === b) {
        return 0;
      }
      return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING
        ? -1
        : 1;
    });
  }, []);

  const getOrderedTriggers = useCallback(
    () => getAllOrderedTriggers().filter((node) => !node.disabled),
    [getAllOrderedTriggers],
  );

  const setTabStop = useCallback(
    (tabStop: HTMLButtonElement) => {
      getAllOrderedTriggers().forEach((node) => {
        node.tabIndex = node === tabStop ? 0 : -1;
      });
    },
    [getAllOrderedTriggers],
  );

  const syncTabStops = useCallback(() => {
    const enabled = getOrderedTriggers();
    const selected = enabled.find(
      (node) => node.dataset.value === currentRef.current,
    );
    const focused = enabled.find((node) => node === document.activeElement);
    const tabStop = focused ?? selected ?? enabled[0];
    getAllOrderedTriggers().forEach((node) => {
      node.tabIndex = node === tabStop ? 0 : -1;
    });
  }, [getAllOrderedTriggers, getOrderedTriggers]);
  syncTabStopsRef.current = syncTabStops;

  const ctx = useMemo(
    () => ({
      value: current,
      setValue,
      orientation,
      activationMode,
      baseId,
      registerTrigger,
      registerPanel,
      hasPanel,
      getOrderedTriggers,
      setTabStop,
      syncTabStops,
      dir,
      variant,
    }),
    [
      activationMode,
      baseId,
      current,
      dir,
      getOrderedTriggers,
      hasPanel,
      orientation,
      registerPanel,
      registerTrigger,
      setTabStop,
      setValue,
      syncTabStops,
      variant,
    ],
  );

  return (
    <TabsContext.Provider value={ctx}>
      <div
        {...props}
        ref={ref}
        className={clsx(tabsClasses(orientation), className)}
        data-orientation={orientation}
        data-variant={variant}
        dir={dir}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
}

const TabsRoot = forwardRef(TabsImpl);
TabsRoot.displayName = "Tabs";

function TabsListImpl(
  {
    className,
    children,
    fullWidth = false,
    onKeyDown,
    ...props
  }: TabsListProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const { orientation, value, getOrderedTriggers, dir, variant } =
    useTabsContext("Tabs.List");

  const focusTrigger = (button: HTMLButtonElement) => {
    button.focus();
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (
      event.defaultPrevented ||
      !(event.target instanceof HTMLButtonElement) ||
      event.target.getAttribute("role") !== "tab"
    ) {
      return;
    }

    const triggers = getOrderedTriggers();
    if (triggers.length === 0) {
      return;
    }

    // Roving focus moves relative to the focused tab; in manual activation
    // mode the focused tab and the selected tab can differ.
    const focusedIndex = triggers.findIndex(
      (button) => button === document.activeElement,
    );
    const currentIndex =
      focusedIndex >= 0
        ? focusedIndex
        : Math.max(
            0,
            triggers.findIndex((button) => button.dataset.value === value),
          );
    const intent = resolveLinearNavigation(event.key, orientation, dir);
    if (!intent) return;
    const nextIndex = getLinearNavigationIndex(
      currentIndex,
      triggers.length,
      intent,
    );
    if (nextIndex === null) return;
    event.preventDefault();
    focusTrigger(triggers[nextIndex]!);
  };

  return (
    <div
      {...props}
      ref={ref}
      role="tablist"
      aria-orientation={orientation}
      className={clsx(
        tabsListClasses({ variant, fullWidth, orientation }),
        className,
      )}
      data-orientation={orientation}
      data-full-width={fullWidth ? "true" : undefined}
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>
  );
}

const TabsList = forwardRef(TabsListImpl);
TabsList.displayName = "Tabs.List";

function TabsTriggerImpl(
  {
    value,
    className,
    disabled,
    children,
    onClick,
    onFocus,
    ...props
  }: TabsTriggerProps,
  ref: ForwardedRef<HTMLButtonElement>,
) {
  const {
    value: selected,
    setValue,
    baseId,
    registerTrigger,
    hasPanel,
    activationMode,
    setTabStop,
    syncTabStops,
    variant,
  } = useTabsContext("Tabs.Trigger");
  const selectedTab = selected === value;
  const safeValue = encodeURIComponent(value);
  const triggerId = `${baseId}-tab-${safeValue}`;
  const panelId = `${baseId}-panel-${safeValue}`;
  const controlsPanel = hasPanel(value);

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

  useLayoutEffect(() => {
    syncTabStops();
  }, [disabled, selectedTab, syncTabStops]);

  return (
    <button
      {...props}
      ref={setRefs}
      type="button"
      role="tab"
      id={triggerId}
      className={clsx(
        tabsTriggerClasses({ variant, selected: selectedTab, disabled }),
        className,
      )}
      data-value={value}
      data-state={selectedTab ? "active" : "inactive"}
      aria-selected={selectedTab}
      aria-controls={controlsPanel ? panelId : undefined}
      tabIndex={selectedTab ? 0 : -1}
      disabled={disabled}
      onFocus={(event) => {
        onFocus?.(event);
        if (
          event.defaultPrevented ||
          disabled ||
          event.target !== event.currentTarget
        ) {
          return;
        }
        setTabStop(event.currentTarget);
        if (!selectedTab && activationMode === "automatic") {
          setValue(value);
        }
      }}
      onClick={(event) => {
        onClick?.(event);
        if (
          event.defaultPrevented ||
          disabled ||
          event.button !== 0 ||
          event.ctrlKey ||
          !event.currentTarget.contains(event.target as Node)
        ) {
          return;
        }
        setValue(value);
      }}
    >
      <span
        className={tabsTriggerLabelClasses({ variant, selected: selectedTab })}
      >
        {children}
      </span>
    </button>
  );
}

const TabsTrigger = forwardRef(TabsTriggerImpl);
TabsTrigger.displayName = "Tabs.Trigger";

function TabsPanelImpl(
  { value, className, children, forceMount = false, ...props }: TabsPanelProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const {
    value: selected,
    baseId,
    orientation,
    registerPanel,
  } = useTabsContext("Tabs.Panel");
  const selectedPanel = selected === value;
  const safeValue = encodeURIComponent(value);
  const triggerId = `${baseId}-tab-${safeValue}`;
  const panelId = `${baseId}-panel-${safeValue}`;

  useLayoutEffect(() => {
    registerPanel(value, true);
    return () => registerPanel(value, false);
  }, [registerPanel, value]);

  if (!forceMount && !selectedPanel) {
    return null;
  }

  return (
    <div
      {...props}
      ref={ref}
      role="tabpanel"
      id={panelId}
      aria-labelledby={triggerId}
      hidden={!selectedPanel}
      tabIndex={0}
      className={clsx(tabsPanelClasses(orientation), className)}
      data-state={selectedPanel ? "active" : "inactive"}
    >
      {children as ReactNode}
    </div>
  );
}

const TabsPanel = forwardRef(TabsPanelImpl);
TabsPanel.displayName = "Tabs.Panel";

export const Tabs = Object.assign(TabsRoot, {
  List: TabsList,
  Trigger: TabsTrigger,
  Panel: TabsPanel,
});
