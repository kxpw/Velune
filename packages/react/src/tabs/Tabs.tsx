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

type TabsContextValue = {
  value: TabsValue;
  setValue: (value: TabsValue) => void;
  orientation: TabsOrientation;
  activationMode: "automatic" | "manual";
  baseId: string;
  registerTrigger: (value: TabsValue, node: HTMLButtonElement | null) => void;
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
      orientation,
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
        className={clsx(
          "gs-tabs flex min-w-0 flex-col gap-gs-tabs-gap font-inherit text-gs-text",
          orientation === "vertical" && "flex-row items-start",
          className,
        )}
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
        "gs-tabs-list inline-flex w-max max-w-full shrink-0 self-start items-center overflow-x-auto overflow-y-hidden overscroll-x-contain [scrollbar-width:thin]",
        variant === "block"
          ? "gap-gs-tabs-block-list-gap rounded-gs-tabs-block-list-radius bg-gs-tabs-block-list-bg p-gs-tabs-block-list-padding"
          : "gap-gs-tabs-list-gap rounded-gs-tabs-list-radius bg-gs-tabs-list-bg p-gs-tabs-list-padding",
        fullWidth && "w-full self-stretch items-stretch",
        orientation === "vertical" && "flex-col items-stretch",
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
    activationMode,
    setTabStop,
    syncTabStops,
    variant,
  } = useTabsContext("Tabs.Trigger");
  const selectedTab = selected === value;
  const safeValue = encodeURIComponent(value);
  const triggerId = `${baseId}-tab-${safeValue}`;
  const panelId = `${baseId}-panel-${safeValue}`;

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
        "gs-tabs-trigger m-0 inline-flex min-h-gs-control-hit-target min-w-gs-control-hit-target cursor-pointer appearance-none items-center justify-center whitespace-nowrap border-0 px-gs-tabs-trigger-padding-x py-gs-tabs-trigger-padding-y font-inherit text-gs-tabs-trigger-font-size font-gs-tabs-trigger-font-weight leading-none text-gs-tabs-trigger-color transition-[background-color,color] duration-200 ease-gs-standard focus-visible:bg-gs-tabs-trigger-bg-focus focus-visible:outline-none focus-visible:shadow-gs-button-focus-border disabled:cursor-not-allowed disabled:opacity-gs-disabled [[data-full-width=true]_&]:flex-[1_0_auto] motion-reduce:transition-none [[data-reduced-motion=true]_&]:transition-none",
        variant === "block"
          ? clsx(
              "rounded-gs-tabs-block-trigger-radius",
              selectedTab
                ? "bg-gs-tabs-block-trigger-bg-active text-gs-tabs-trigger-color-active shadow-gs-tabs-block-trigger-shadow"
                : "bg-gs-tabs-trigger-bg",
              !selectedTab &&
                !disabled &&
                "hover:bg-gs-tabs-block-trigger-bg-hover hover:text-gs-text",
            )
          : clsx(
              "rounded-gs-tabs-trigger-radius",
              selectedTab
                ? "bg-gs-tabs-trigger-bg-active text-gs-tabs-trigger-color-active"
                : "bg-gs-tabs-trigger-bg",
              !selectedTab &&
                !disabled &&
                "hover:bg-gs-tabs-trigger-bg-hover hover:text-gs-text",
            ),
        className,
      )}
      data-value={value}
      data-state={selectedTab ? "active" : "inactive"}
      aria-selected={selectedTab}
      aria-controls={panelId}
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
        className={clsx(
          "gs-tabs-trigger-label relative inline-flex min-w-0 items-center gap-2 after:absolute after:inset-x-0 after:bottom-[calc(var(--tabs-trigger-padding-y)*-1)] after:h-gs-tabs-indicator-size after:rounded-full after:bg-gs-tabs-indicator-color after:opacity-0 after:scale-x-0 after:transition-[opacity,transform] after:duration-200 after:ease-gs-decelerate motion-reduce:after:transition-none [[data-reduced-motion=true]_&]:after:transition-none",
          variant === "underline" && "after:content-['']",
          variant === "underline" &&
            selectedTab &&
            "after:scale-x-100 after:opacity-100",
        )}
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
  const { value: selected, baseId, orientation } = useTabsContext("Tabs.Panel");
  const selectedPanel = selected === value;
  const safeValue = encodeURIComponent(value);
  const triggerId = `${baseId}-tab-${safeValue}`;
  const panelId = `${baseId}-panel-${safeValue}`;

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
      className={clsx(
        "gs-tabs-panel min-w-0 py-gs-tabs-panel-padding-y text-sm leading-gs-body text-gs-text outline-none",
        orientation === "vertical" && "flex-auto py-0 ps-4",
        className,
      )}
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
