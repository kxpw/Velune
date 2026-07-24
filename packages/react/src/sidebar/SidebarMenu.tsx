"use client";

import type { ForwardedRef, MouseEvent, ReactElement, ReactNode } from "react";
import {
  Children,
  createContext,
  createElement,
  forwardRef,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
} from "react";
import { useControllableState } from "@velune/hooks";
import { clsx } from "clsx";
import { Tooltip } from "../tooltip";
import {
  sidebarMenuActionClasses,
  sidebarMenuBadgeClasses,
  sidebarMenuButtonChevronClasses,
  sidebarMenuButtonClasses,
  sidebarMenuClasses,
  sidebarMenuItemClasses,
  sidebarMenuSubButtonClasses,
  sidebarMenuSubClasses,
  sidebarMenuSubShellClasses,
  sidebarMenuSubShellInnerClasses,
  sidebarMenuSubItemClasses,
  sidebarTriggerClasses,
} from "./Sidebar.classes";
import type {
  SidebarMenuActionProps,
  SidebarMenuBadgeProps,
  SidebarMenuButtonProps,
  SidebarMenuItemProps,
  SidebarMenuProps,
  SidebarMenuSubButtonProps,
  SidebarMenuSubItemProps,
  SidebarMenuSubProps,
  SidebarTriggerProps,
} from "./Sidebar.types";
import { useIconCollapsed, useSidebar } from "./SidebarContext";
import { PanelIcon } from "./SidebarIcons";

export function tooltipAccessibleName(tooltip: ReactNode): string | undefined {
  if (typeof tooltip === "string" || typeof tooltip === "number") {
    return String(tooltip);
  }
  return undefined;
}

export function isSidebarSlot(
  child: ReactNode,
  displayName: string,
): child is ReactElement {
  return (
    isValidElement(child) &&
    typeof child.type !== "string" &&
    (child.type as { displayName?: string }).displayName === displayName
  );
}

type SidebarMenuItemContextValue = {
  open: boolean;
  toggle: () => void;
  collapsible: boolean;
  contentId: string;
};

const SidebarMenuItemContext =
  createContext<SidebarMenuItemContextValue | null>(null);

function useSidebarMenuItem(): SidebarMenuItemContextValue | null {
  return useContext(SidebarMenuItemContext);
}

function MenuChevron({ open }: { open: boolean }) {
  const iconCollapsed = useIconCollapsed();
  return (
    <svg
      className={sidebarMenuButtonChevronClasses({ open, iconCollapsed })}
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

function SidebarMenuImpl(
  { className, ...props }: SidebarMenuProps,
  ref: ForwardedRef<HTMLUListElement>,
) {
  const iconCollapsed = useIconCollapsed();
  return (
    <ul
      ref={ref}
      data-slot="sidebar-menu"
      className={clsx(sidebarMenuClasses({ iconCollapsed }), className)}
      {...props}
    />
  );
}

export const SidebarMenu = forwardRef(SidebarMenuImpl);
SidebarMenu.displayName = "Sidebar.Menu";

function SidebarMenuItemImpl(
  {
    className,
    children,
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    ...props
  }: SidebarMenuItemProps,
  ref: ForwardedRef<HTMLLIElement>,
) {
  const contentId = useId();
  const childArray = Children.toArray(children);
  const hasSubmenu = childArray.some((child) =>
    isSidebarSlot(child, "Sidebar.MenuSub"),
  );
  const [open, setOpen] = useControllableState({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const toggle = useCallback(() => {
    setOpen((value) => !value);
  }, [setOpen]);

  const ctx = useMemo<SidebarMenuItemContextValue | null>(
    () =>
      hasSubmenu
        ? {
            open,
            toggle,
            collapsible: true,
            contentId,
          }
        : null,
    [hasSubmenu, open, toggle, contentId],
  );
  const iconCollapsed = useIconCollapsed();

  return (
    <SidebarMenuItemContext.Provider value={ctx}>
      <li
        ref={ref}
        data-slot="sidebar-menu-item"
        data-state={hasSubmenu ? (open ? "open" : "closed") : undefined}
        className={clsx(sidebarMenuItemClasses({ iconCollapsed }), className)}
        {...props}
      >
        {children}
      </li>
    </SidebarMenuItemContext.Provider>
  );
}

export const SidebarMenuItem = forwardRef(SidebarMenuItemImpl);
SidebarMenuItem.displayName = "Sidebar.MenuItem";

function SidebarMenuButtonImpl(
  {
    className,
    as = "button",
    current = false,
    tooltip,
    type = "button",
    children,
    onClick,
    "aria-label": ariaLabel,
    ...props
  }: SidebarMenuButtonProps,
  ref: ForwardedRef<HTMLButtonElement>,
) {
  const iconCollapsed = useIconCollapsed();
  const { state, isMobile, side } = useSidebar();
  const menuItem = useSidebarMenuItem();
  // Icon rail hides MenuSub — don't pretend the parent toggles an empty panel.
  const submenuCollapsible = Boolean(menuItem?.collapsible) && !iconCollapsed;
  const resolvedAs = submenuCollapsible ? "button" : as;
  const resolvedAriaLabel =
    ariaLabel ?? (iconCollapsed ? tooltipAccessibleName(tooltip) : undefined);

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    (onClick as ((event: MouseEvent<HTMLElement>) => void) | undefined)?.(
      event,
    );
    if (event.defaultPrevented) return;
    if (submenuCollapsible && menuItem) {
      menuItem.toggle();
    }
  };

  const element = createElement(
    resolvedAs === "a" ? "a" : "button",
    {
      ...props,
      ref,
      type: resolvedAs === "button" ? type : undefined,
      href: resolvedAs === "a" ? (props as { href?: string }).href : undefined,
      "data-slot": "sidebar-menu-button",
      "data-current": current ? "true" : undefined,
      "aria-current": current ? "page" : undefined,
      "aria-label": resolvedAriaLabel,
      "aria-expanded": submenuCollapsible ? menuItem!.open : undefined,
      "aria-controls": submenuCollapsible ? menuItem!.contentId : undefined,
      className: clsx(
        sidebarMenuButtonClasses({ iconCollapsed }),
        "peer/menu-button",
        className,
      ),
      onClick: handleClick,
    },
    children,
    submenuCollapsible ? <MenuChevron open={menuItem!.open} /> : null,
  );

  if (!tooltip || state !== "collapsed" || isMobile || !iconCollapsed) {
    return element;
  }

  return (
    <Tooltip
      placement={side === "right" ? "left" : "right"}
      delay={{ open: 0, close: 0 }}
    >
      <Tooltip.Trigger>{element}</Tooltip.Trigger>
      <Tooltip.Content>{tooltip}</Tooltip.Content>
    </Tooltip>
  );
}

export const SidebarMenuButton = forwardRef(SidebarMenuButtonImpl);
SidebarMenuButton.displayName = "Sidebar.MenuButton";

function SidebarMenuActionImpl(
  {
    className,
    as = "button",
    type = "button",
    href,
    showOnHover = false,
    ...props
  }: SidebarMenuActionProps,
  ref: ForwardedRef<HTMLButtonElement>,
) {
  const iconCollapsed = useIconCollapsed();
  return createElement(as === "a" ? "a" : "button", {
    ...props,
    ref,
    href: as === "a" ? href : undefined,
    type: as === "button" ? type : undefined,
    "data-slot": "sidebar-menu-action",
    "data-show-on-hover": showOnHover ? "true" : undefined,
    className: clsx(
      sidebarMenuActionClasses({ iconCollapsed, showOnHover }),
      className,
    ),
  });
}

export const SidebarMenuAction = forwardRef(SidebarMenuActionImpl);
SidebarMenuAction.displayName = "Sidebar.MenuAction";

function SidebarMenuBadgeImpl(
  { className, ...props }: SidebarMenuBadgeProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const iconCollapsed = useIconCollapsed();
  return (
    <div
      ref={ref}
      data-slot="sidebar-menu-badge"
      className={clsx(sidebarMenuBadgeClasses({ iconCollapsed }), className)}
      {...props}
    />
  );
}

export const SidebarMenuBadge = forwardRef(SidebarMenuBadgeImpl);
SidebarMenuBadge.displayName = "Sidebar.MenuBadge";

function SidebarMenuSubImpl(
  { className, ...props }: SidebarMenuSubProps,
  ref: ForwardedRef<HTMLUListElement>,
) {
  const iconCollapsed = useIconCollapsed();
  const menuItem = useSidebarMenuItem();
  const open = menuItem ? menuItem.open : true;
  const shellRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = shellRef.current;
    if (!node || !menuItem) return;
    if (open) {
      node.removeAttribute("inert");
    } else {
      node.setAttribute("inert", "");
    }
  }, [open, menuItem]);

  const list = (
    <ul
      ref={ref}
      id={menuItem?.contentId}
      data-slot="sidebar-menu-sub"
      className={clsx(sidebarMenuSubClasses({ iconCollapsed }), className)}
      {...props}
    />
  );

  if (!menuItem || iconCollapsed) {
    return list;
  }

  return (
    <div
      ref={shellRef}
      className={sidebarMenuSubShellClasses(open)}
      data-state={open ? "open" : "closed"}
      aria-hidden={!open || undefined}
    >
      <div className={sidebarMenuSubShellInnerClasses}>{list}</div>
    </div>
  );
}

export const SidebarMenuSub = forwardRef(SidebarMenuSubImpl);
SidebarMenuSub.displayName = "Sidebar.MenuSub";

function SidebarMenuSubItemImpl(
  { className, ...props }: SidebarMenuSubItemProps,
  ref: ForwardedRef<HTMLLIElement>,
) {
  return (
    <li
      ref={ref}
      data-slot="sidebar-menu-sub-item"
      className={clsx(sidebarMenuSubItemClasses, className)}
      {...props}
    />
  );
}

export const SidebarMenuSubItem = forwardRef(SidebarMenuSubItemImpl);
SidebarMenuSubItem.displayName = "Sidebar.MenuSubItem";

function SidebarMenuSubButtonImpl(
  {
    className,
    as = "button",
    current = false,
    type = "button",
    ...props
  }: SidebarMenuSubButtonProps,
  ref: ForwardedRef<HTMLButtonElement>,
) {
  return createElement(as === "a" ? "a" : "button", {
    ...props,
    ref,
    type: as === "button" ? type : undefined,
    "data-slot": "sidebar-menu-sub-button",
    "data-current": current ? "true" : undefined,
    "aria-current": current ? "page" : undefined,
    className: clsx(sidebarMenuSubButtonClasses(), className),
  });
}

export const SidebarMenuSubButton = forwardRef(SidebarMenuSubButtonImpl);
SidebarMenuSubButton.displayName = "Sidebar.MenuSubButton";

function SidebarTriggerImpl(
  {
    className,
    onClick,
    "aria-label": ariaLabel,
    children,
    ...props
  }: SidebarTriggerProps,
  ref: ForwardedRef<HTMLButtonElement>,
) {
  const { toggleSidebar, open, openMobile, isMobile, sidebarId, state } =
    useSidebar();
  const expanded = isMobile ? openMobile : open;
  const triggerState = isMobile
    ? openMobile
      ? "expanded"
      : "collapsed"
    : state;
  return (
    <button
      ref={ref}
      type="button"
      data-slot="sidebar-trigger"
      data-state={triggerState}
      aria-label={
        ariaLabel ?? (expanded ? "Collapse sidebar" : "Expand sidebar")
      }
      aria-expanded={expanded}
      aria-controls={isMobile && !openMobile ? undefined : sidebarId}
      className={clsx(sidebarTriggerClasses, className)}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        toggleSidebar();
      }}
      {...props}
    >
      {children ?? <PanelIcon />}
    </button>
  );
}

export const SidebarTrigger = forwardRef(SidebarTriggerImpl);
SidebarTrigger.displayName = "Sidebar.Trigger";
