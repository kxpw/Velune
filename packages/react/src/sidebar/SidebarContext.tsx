"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type {
  SidebarCollapsible,
  SidebarContextValue,
  SidebarSide,
} from "./Sidebar.types";

export const MOBILE_QUERY = "(max-width: 767px)";

export type SidebarInternalContext = SidebarContextValue & {
  setSide: (side: SidebarSide) => void;
  setCollapsible: (collapsible: SidebarCollapsible) => void;
};

export const SidebarContext = createContext<SidebarInternalContext | null>(
  null,
);

/** Read sidebar layout state. Must be used under `Sidebar.Provider`. */
export function useSidebar(): SidebarContextValue {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    throw new Error("useSidebar must be used within <Sidebar.Provider>");
  }
  return ctx;
}

export function useSidebarInternal(component: string): SidebarInternalContext {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    throw new Error(`${component} must be used within <Sidebar.Provider>`);
  }
  return ctx;
}

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia(MOBILE_QUERY).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const media = window.matchMedia(MOBILE_QUERY);
    const onChange = () => setIsMobile(media.matches);
    onChange();
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}

export function useIconCollapsed(): boolean {
  const { collapsible, state } = useSidebar();
  return collapsible === "icon" && state === "collapsed";
}
