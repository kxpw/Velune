"use client";

import type { ForwardedRef } from "react";
import { createElement, forwardRef, useEffect, useRef } from "react";
import { clsx } from "clsx";
import { Drawer } from "../drawer";
import {
  sidebarContainerClasses,
  sidebarContentClasses,
  sidebarFooterClasses,
  sidebarGapClasses,
  sidebarGroupActionClasses,
  sidebarGroupClasses,
  sidebarGroupContentClasses,
  sidebarGroupLabelClasses,
  sidebarHeaderClasses,
  sidebarMobilePanelClasses,
  sidebarPanelClasses,
} from "./Sidebar.classes";
import type {
  SidebarContentProps,
  SidebarFooterProps,
  SidebarGroupActionProps,
  SidebarGroupContentProps,
  SidebarGroupLabelProps,
  SidebarGroupProps,
  SidebarHeaderProps,
  SidebarProps,
} from "./Sidebar.types";
import { useIconCollapsed, useSidebarInternal } from "./SidebarContext";

function SidebarImpl(
  {
    side = "left",
    collapsible = "offcanvas",
    className,
    children,
    "aria-label": ariaLabel = "Sidebar",
    ...props
  }: SidebarProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const {
    isMobile,
    openMobile,
    setOpenMobile,
    state,
    sidebarId,
    setSide,
    setCollapsible,
  } = useSidebarInternal("Sidebar");

  useEffect(() => {
    setSide(side);
    setCollapsible(collapsible);
  }, [side, collapsible, setSide, setCollapsible]);

  const width =
    state === "collapsed" && collapsible === "icon"
      ? "var(--sidebar-width-icon)"
      : "var(--sidebar-width)";
  const offcanvasHidden = state === "collapsed" && collapsible === "offcanvas";
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mobileState = openMobile ? "expanded" : "collapsed";

  // React 18 does not reliably apply boolean `inert`; mirror MenuSub and set
  // the attribute imperatively so off-screen focusables stay unreachable.
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    if (offcanvasHidden) {
      node.setAttribute("inert", "");
      const active = document.activeElement;
      if (active instanceof HTMLElement && node.contains(active)) {
        const wrapper = node.closest('[data-slot="sidebar-wrapper"]');
        const trigger = wrapper?.querySelector('[data-slot="sidebar-trigger"]');
        if (trigger instanceof HTMLElement) {
          trigger.focus();
        } else {
          active.blur();
        }
      }
    } else {
      node.removeAttribute("inert");
    }
  }, [offcanvasHidden]);

  if (collapsible === "none") {
    return (
      <div
        ref={ref}
        id={sidebarId}
        role="navigation"
        aria-label={ariaLabel}
        data-slot="sidebar"
        data-side={side}
        data-state="expanded"
        data-collapsible="none"
        className={clsx(
          sidebarPanelClasses({ side, width: "rail" }),
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  }

  if (isMobile) {
    return (
      <Drawer
        open={openMobile}
        onOpenChange={setOpenMobile}
        placement={side}
        size="sm"
      >
        <Drawer.Content
          className="w-[min(var(--sidebar-width-mobile),100%)] border-0 p-gs-0"
          aria-labelledby={sidebarId}
        >
          <div
            ref={ref}
            id={sidebarId}
            role="navigation"
            aria-label={ariaLabel}
            data-slot="sidebar"
            data-mobile="true"
            data-side={side}
            data-state={mobileState}
            className={clsx(sidebarMobilePanelClasses, className)}
            {...props}
          >
            {children}
          </div>
        </Drawer.Content>
      </Drawer>
    );
  }

  return (
    <>
      <div
        data-slot="sidebar-gap"
        className={sidebarGapClasses({ side })}
        style={{ width: offcanvasHidden ? 0 : width }}
      />
      <div
        ref={containerRef}
        data-slot="sidebar-container"
        data-side={side}
        data-state={state}
        data-collapsible={collapsible}
        className={sidebarContainerClasses({ side })}
        style={{
          // Keep full rail width while offcanvas slides away so content does
          // not squash; only the gap collapses to reclaim layout space.
          width,
          ...(side === "left"
            ? {
                insetInlineStart: offcanvasHidden
                  ? "calc(var(--sidebar-width) * -1)"
                  : 0,
              }
            : {
                insetInlineEnd: offcanvasHidden
                  ? "calc(var(--sidebar-width) * -1)"
                  : 0,
              }),
        }}
        aria-hidden={offcanvasHidden ? true : undefined}
      >
        <div
          ref={ref}
          id={sidebarId}
          role="navigation"
          aria-label={ariaLabel}
          data-slot="sidebar"
          data-side={side}
          data-state={state}
          data-collapsible={collapsible}
          className={clsx(
            sidebarPanelClasses({ side, width: "fill" }),
            className,
          )}
          {...props}
        >
          {children}
        </div>
      </div>
    </>
  );
}

export const SidebarRoot = forwardRef(SidebarImpl);
SidebarRoot.displayName = "Sidebar";

function SidebarHeaderImpl(
  { className, ...props }: SidebarHeaderProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const iconCollapsed = useIconCollapsed();
  return (
    <div
      ref={ref}
      data-slot="sidebar-header"
      className={clsx(sidebarHeaderClasses({ iconCollapsed }), className)}
      {...props}
    />
  );
}

export const SidebarHeader = forwardRef(SidebarHeaderImpl);
SidebarHeader.displayName = "Sidebar.Header";

function SidebarFooterImpl(
  { className, ...props }: SidebarFooterProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const iconCollapsed = useIconCollapsed();
  return (
    <div
      ref={ref}
      data-slot="sidebar-footer"
      className={clsx(sidebarFooterClasses({ iconCollapsed }), className)}
      {...props}
    />
  );
}

export const SidebarFooter = forwardRef(SidebarFooterImpl);
SidebarFooter.displayName = "Sidebar.Footer";

function SidebarContentImpl(
  { className, ...props }: SidebarContentProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const iconCollapsed = useIconCollapsed();
  return (
    <div
      ref={ref}
      data-slot="sidebar-content"
      className={clsx(sidebarContentClasses({ iconCollapsed }), className)}
      {...props}
    />
  );
}

export const SidebarContent = forwardRef(SidebarContentImpl);
SidebarContent.displayName = "Sidebar.Content";

function SidebarGroupImpl(
  { className, ...props }: SidebarGroupProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const iconCollapsed = useIconCollapsed();
  return (
    <div
      ref={ref}
      data-slot="sidebar-group"
      className={clsx(sidebarGroupClasses({ iconCollapsed }), className)}
      {...props}
    />
  );
}

export const SidebarGroup = forwardRef(SidebarGroupImpl);
SidebarGroup.displayName = "Sidebar.Group";

function SidebarGroupLabelImpl(
  { className, ...props }: SidebarGroupLabelProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const iconCollapsed = useIconCollapsed();
  return (
    <div
      ref={ref}
      data-slot="sidebar-group-label"
      className={clsx(sidebarGroupLabelClasses({ iconCollapsed }), className)}
      {...props}
    />
  );
}

export const SidebarGroupLabel = forwardRef(SidebarGroupLabelImpl);
SidebarGroupLabel.displayName = "Sidebar.GroupLabel";

function SidebarGroupActionImpl(
  {
    className,
    as = "button",
    type = "button",
    href,
    ...props
  }: SidebarGroupActionProps,
  ref: ForwardedRef<HTMLButtonElement>,
) {
  const iconCollapsed = useIconCollapsed();
  return createElement(as === "a" ? "a" : "button", {
    ...props,
    ref,
    href: as === "a" ? href : undefined,
    type: as === "button" ? type : undefined,
    "data-slot": "sidebar-group-action",
    className: clsx(sidebarGroupActionClasses({ iconCollapsed }), className),
  });
}

export const SidebarGroupAction = forwardRef(SidebarGroupActionImpl);
SidebarGroupAction.displayName = "Sidebar.GroupAction";

function SidebarGroupContentImpl(
  { className, ...props }: SidebarGroupContentProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const iconCollapsed = useIconCollapsed();
  return (
    <div
      ref={ref}
      data-slot="sidebar-group-content"
      className={clsx(sidebarGroupContentClasses({ iconCollapsed }), className)}
      {...props}
    />
  );
}

export const SidebarGroupContent = forwardRef(SidebarGroupContentImpl);
SidebarGroupContent.displayName = "Sidebar.GroupContent";
