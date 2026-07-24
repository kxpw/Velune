"use client";

import type { ForwardedRef } from "react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useState,
} from "react";
import { useControllableState } from "@velune/hooks";
import { clsx } from "clsx";
import { sidebarProviderClasses } from "./Sidebar.classes";
import type {
  SidebarCollapsible,
  SidebarProviderProps,
  SidebarSide,
} from "./Sidebar.types";
import {
  SidebarContext,
  useIsMobile,
  type SidebarInternalContext,
} from "./SidebarContext";

const KEYBOARD_SHORTCUT = "b";
const EDITABLE_SHORTCUT_TARGET =
  "input, textarea, select, [contenteditable]:not([contenteditable='false'])";

function SidebarProviderImpl(
  {
    open: openProp,
    defaultOpen = true,
    onOpenChange,
    enableKeyboardShortcut = true,
    className,
    style,
    children,
    ...props
  }: SidebarProviderProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const isMobile = useIsMobile();
  const sidebarId = useId();
  const [openMobile, setOpenMobile] = useState(false);
  const [open, setOpen] = useControllableState({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });

  // Panel configuration is owned by the nearest Sidebar and mirrored here so
  // Trigger can read layout without requiring a nested context.
  const [side, setSide] = useState<SidebarSide>("left");
  const [collapsible, setCollapsible] =
    useState<SidebarCollapsible>("offcanvas");

  const toggleSidebar = useCallback(() => {
    if (isMobile) {
      setOpenMobile((value) => !value);
      return;
    }
    setOpen((value) => !value);
  }, [isMobile, setOpen]);

  useEffect(() => {
    if (!isMobile) setOpenMobile(false);
  }, [isMobile]);

  useEffect(() => {
    if (!enableKeyboardShortcut) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.key.toLowerCase() !== KEYBOARD_SHORTCUT ||
        !(event.metaKey || event.ctrlKey)
      ) {
        return;
      }
      const target = event.target;
      if (
        target instanceof Element &&
        target.closest(EDITABLE_SHORTCUT_TARGET)
      ) {
        return;
      }
      event.preventDefault();
      toggleSidebar();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enableKeyboardShortcut, toggleSidebar]);

  const state = open ? "expanded" : "collapsed";

  const ctx = useMemo<SidebarInternalContext>(
    () => ({
      state,
      open,
      setOpen,
      openMobile,
      setOpenMobile,
      isMobile,
      toggleSidebar,
      side,
      collapsible,
      sidebarId,
      setSide,
      setCollapsible,
    }),
    [
      state,
      open,
      setOpen,
      openMobile,
      isMobile,
      toggleSidebar,
      side,
      collapsible,
      sidebarId,
    ],
  );

  return (
    <SidebarContext.Provider value={ctx}>
      <div
        ref={ref}
        data-slot="sidebar-wrapper"
        data-state={state}
        data-collapsible={collapsible === "none" ? "" : collapsible}
        data-side={side}
        className={clsx(sidebarProviderClasses, className)}
        style={style}
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

export const SidebarProvider = forwardRef(SidebarProviderImpl);
SidebarProvider.displayName = "Sidebar.Provider";
