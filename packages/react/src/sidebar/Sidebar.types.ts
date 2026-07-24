import type {
  ButtonHTMLAttributes,
  CSSProperties,
  HTMLAttributes,
  ReactNode,
} from "react";

/** Edge the sidebar anchors to. */
export type SidebarSide = "left" | "right";

/**
 * Collapse behavior for the desktop rail.
 * - `offcanvas`: slides fully off-screen when collapsed
 * - `icon`: collapses to an icon rail
 * - `none`: never collapses
 */
export type SidebarCollapsible = "offcanvas" | "icon" | "none";

/** Expanded vs collapsed desktop state. */
export type SidebarState = "expanded" | "collapsed";

export interface SidebarProviderProps extends HTMLAttributes<HTMLDivElement> {
  /** Controlled expanded state on desktop (`true` = expanded). */
  open?: boolean;
  /** Uncontrolled initial expanded state. Default: `true`. */
  defaultOpen?: boolean;
  /** Called when the desktop expanded state changes. */
  onOpenChange?: (open: boolean) => void;
  /**
   * When `true` (default), `Ctrl/Cmd+B` toggles the sidebar. Ignored while
   * focus is in an editable field.
   */
  enableKeyboardShortcut?: boolean;
  /**
   * Override CSS variables for sidebar widths.
   * Supports `--sidebar-width`, `--sidebar-width-icon`, and `--sidebar-width-mobile`.
   */
  style?: CSSProperties;
  children?: ReactNode;
}

/** Value returned by `useSidebar()`. */
export interface SidebarContextValue {
  /** Current desktop expand/collapse state. */
  state: SidebarState;
  /** Whether the desktop sidebar is expanded. */
  open: boolean;
  setOpen: (open: boolean | ((value: boolean) => boolean)) => void;
  /** Whether the mobile drawer is open. */
  openMobile: boolean;
  setOpenMobile: (open: boolean | ((value: boolean) => boolean)) => void;
  /** `true` below the `md` breakpoint. */
  isMobile: boolean;
  /** Toggles mobile drawer on small screens, desktop open state otherwise. */
  toggleSidebar: () => void;
  side: SidebarSide;
  collapsible: SidebarCollapsible;
  /** DOM id wired to `Sidebar.Trigger` via `aria-controls`. */
  sidebarId: string;
}

export interface SidebarProps extends HTMLAttributes<HTMLDivElement> {
  /** Which edge the sidebar anchors to. Default: `left`. */
  side?: SidebarSide;
  /**
   * Collapse behavior.
   * - `offcanvas`: slides fully off-screen when collapsed
   * - `icon`: collapses to an icon rail
   * - `none`: never collapses
   * Default: `offcanvas`.
   */
  collapsible?: SidebarCollapsible;
  /** Accessible name for the navigation landmark. Default: `"Sidebar"`. */
  "aria-label"?: string;
  children?: ReactNode;
}

export type SidebarHeaderProps = HTMLAttributes<HTMLDivElement>;
export type SidebarFooterProps = HTMLAttributes<HTMLDivElement>;
export type SidebarContentProps = HTMLAttributes<HTMLDivElement>;
export type SidebarGroupProps = HTMLAttributes<HTMLDivElement>;
export type SidebarGroupLabelProps = HTMLAttributes<HTMLDivElement>;
export type SidebarGroupContentProps = HTMLAttributes<HTMLDivElement>;

export interface SidebarGroupActionProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Render as a native button or anchor. Default: `button`. */
  as?: "button" | "a";
  href?: string;
}

export type SidebarMenuProps = HTMLAttributes<HTMLUListElement>;

export interface SidebarMenuItemProps extends HTMLAttributes<HTMLLIElement> {
  /**
   * Controlled open state when this item contains `Sidebar.MenuSub`.
   * Items with a submenu are collapsible by default.
   */
  open?: boolean;
  /** Uncontrolled initial open state for collapsible submenu items. Default: `false`. */
  defaultOpen?: boolean;
  /** Called when a collapsible submenu opens or closes. */
  onOpenChange?: (open: boolean) => void;
}

export interface SidebarMenuButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "type" | "href"
> {
  /**
   * Render as a native button or anchor. Default: `button`.
   * Ignored when the parent `MenuItem` contains `MenuSub` — submenu triggers
   * are always buttons so they can toggle `aria-expanded`.
   */
  as?: "button" | "a";
  /** Required when `as="a"`. */
  href?: string;
  /** Marks the current page / selected destination. */
  current?: boolean;
  /**
   * Tooltip shown when the sidebar is icon-collapsed.
   * Prefer a string (also used as `aria-label` when collapsed) or pass
   * `aria-label` explicitly for icon-only items.
   */
  tooltip?: ReactNode;
  type?: "button" | "submit" | "reset";
  children?: ReactNode;
}

export interface SidebarMenuActionProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Render as a native button or anchor. Default: `button`. */
  as?: "button" | "a";
  href?: string;
  /**
   * When `true`, the action is hidden until the menu item is hovered or
   * focused. Default: `false` (always visible).
   */
  showOnHover?: boolean;
}

export type SidebarMenuBadgeProps = HTMLAttributes<HTMLDivElement>;
export type SidebarMenuSubProps = HTMLAttributes<HTMLUListElement>;
export type SidebarMenuSubItemProps = HTMLAttributes<HTMLLIElement>;

export interface SidebarMenuSubButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "type" | "href"
> {
  /** Render as a native button or anchor. Default: `button`. */
  as?: "button" | "a";
  /** Required when `as="a"`. */
  href?: string;
  /** Marks the current nested destination. */
  current?: boolean;
  type?: "button" | "submit" | "reset";
}

export interface SidebarTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Accessible name. Default depends on open state. */
  "aria-label"?: string;
}
