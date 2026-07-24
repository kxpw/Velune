import { clsx } from "clsx";
import { createRecipe } from "../shared/recipe";

/** Provider shell that owns sidebar CSS variables and layout context. */
export const sidebarProviderClasses =
  "gs-sidebar-provider relative flex h-full min-h-full w-full";

/** Desktop gap spacer that reserves layout width for the fixed rail. */
export const sidebarGapClasses = createRecipe({
  base: "gs-sidebar-gap relative hidden bg-transparent transition-[width] duration-200 ease-gs-standard md:block motion-reduce:transition-none [[data-reduced-motion=true]_&]:transition-none",
  variants: {
    side: {
      left: "",
      right: "order-last",
    },
  },
});

/** Fixed desktop rail container. */
export const sidebarContainerClasses = createRecipe({
  base: "gs-sidebar-container absolute inset-y-gs-0 z-gs-sticky hidden h-full overflow-hidden transition-[inset-inline-start,inset-inline-end,width] duration-200 ease-gs-standard md:flex motion-reduce:transition-none [[data-reduced-motion=true]_&]:transition-none",
  variants: {
    side: {
      left: "",
      right: "",
    },
  },
});

/** Inner panel surface. */
export const sidebarPanelClasses = createRecipe({
  base: "gs-sidebar flex h-full min-w-gs-0 flex-col overflow-hidden bg-gs-surface text-gs-text",
  variants: {
    side: {
      left: "border-e border-gs-border-default",
      right: "border-s border-gs-border-default",
    },
    width: {
      /** Fills the absolutely positioned desktop container. */
      fill: "w-full",
      /** Static rail when `collapsible="none"`. */
      rail: "w-[var(--sidebar-width)] shrink-0",
    },
  },
  defaultVariants: {
    width: "fill",
  },
});

/** Mobile drawer panel fill. */
export const sidebarMobilePanelClasses =
  "gs-sidebar gs-sidebar-mobile flex size-full min-w-gs-0 flex-col overflow-hidden bg-gs-surface text-gs-text";

export const sidebarHeaderClasses = createRecipe({
  base: "gs-sidebar-header flex flex-col gap-gs-2 overflow-hidden p-gs-3",
  variants: {
    iconCollapsed: {
      // Match Content/Footer inset so the mark lines up with menu icons.
      true: "items-center p-gs-2",
      false: "",
    },
  },
});

export const sidebarFooterClasses = createRecipe({
  base: "gs-sidebar-footer flex flex-col gap-gs-2 overflow-hidden p-gs-3",
  variants: {
    iconCollapsed: {
      true: "items-center p-gs-2",
      false: "",
    },
  },
});

export const sidebarContentClasses = createRecipe({
  base: "gs-sidebar-content flex min-h-gs-0 flex-1 flex-col gap-gs-2 overflow-y-auto p-gs-2",
  variants: {
    iconCollapsed: {
      true: "items-center overflow-x-hidden",
      false: "",
    },
  },
});

export const sidebarGroupClasses = createRecipe({
  base: "gs-sidebar-group group/sidebar-group relative flex w-full min-w-gs-0 flex-col p-gs-2",
  variants: {
    iconCollapsed: {
      // Drop Group padding in the icon rail — Header/Content/Footer already inset.
      true: "items-center p-gs-0",
      false: "",
    },
  },
});

export const sidebarGroupLabelClasses = createRecipe({
  base: "gs-sidebar-group-label flex h-gs-8 shrink-0 items-center rounded-gs-sm px-gs-2 text-gs-xs font-gs-medium uppercase tracking-gs-wide text-gs-text-secondary group-has-[[data-slot=sidebar-group-action]]/sidebar-group:pe-gs-8",
  variants: {
    iconCollapsed: {
      true: "hidden",
      false: "",
    },
  },
});

export const sidebarGroupActionClasses = createRecipe({
  base: "gs-sidebar-group-action absolute end-gs-3 top-gs-3 flex size-gs-5 items-center justify-center rounded-gs-sm border-0 bg-transparent p-gs-0 text-gs-text-secondary outline-none hover:bg-gs-action-hover hover:text-gs-text focus-visible:bg-gs-action-hover focus-visible:shadow-gs-button-focus-border",
  variants: {
    iconCollapsed: {
      true: "hidden",
      false: "",
    },
  },
});

export const sidebarGroupContentClasses = createRecipe({
  base: "gs-sidebar-group-content w-full text-gs-sm",
  variants: {
    iconCollapsed: {
      true: "flex flex-col items-center",
      false: "",
    },
  },
});

export const sidebarMenuClasses = createRecipe({
  base: "gs-sidebar-menu m-gs-0 flex w-full min-w-gs-0 list-none flex-col gap-gs-1 p-gs-0",
  variants: {
    iconCollapsed: {
      true: "items-center",
      false: "",
    },
  },
});

export const sidebarMenuItemClasses = createRecipe({
  base: "gs-sidebar-menu-item group/menu-item relative",
  variants: {
    iconCollapsed: {
      true: "flex w-full justify-center [&_.gs-tooltip-trigger]:flex [&_.gs-tooltip-trigger]:size-gs-10 [&_.gs-tooltip-trigger]:shrink-0 [&_.gs-tooltip-trigger]:items-center [&_.gs-tooltip-trigger]:justify-center",
      false: "",
    },
  },
});

export const sidebarMenuButtonClasses = createRecipe({
  base: "gs-sidebar-menu-button flex h-gs-10 w-full cursor-pointer items-center gap-gs-2 overflow-hidden rounded-gs-sm border-0 bg-transparent px-gs-2.5 text-start font-inherit text-gs-sm text-gs-text-secondary no-underline outline-none transition-[width,height,padding,background-color,color,box-shadow] duration-150 ease-gs-standard hover:bg-gs-action-hover hover:text-gs-text focus-visible:bg-gs-action-hover focus-visible:text-gs-text focus-visible:shadow-gs-button-focus-border active:bg-gs-action-hover disabled:pointer-events-none disabled:opacity-50 data-[current=true]:bg-gs-surface-mist data-[current=true]:font-gs-medium data-[current=true]:text-gs-text data-[current=true]:hover:bg-gs-surface-mist data-[current=true]:hover:text-gs-text [&>span:last-child]:truncate [&>svg]:size-gs-4 [&>svg]:shrink-0 motion-reduce:transition-none [[data-reduced-motion=true]_&]:transition-none",
  variants: {
    iconCollapsed: {
      // Fixed square hit target — never inherit Badge/Action end-padding.
      true: "size-gs-10 w-gs-10 max-w-gs-10 shrink-0 justify-center gap-gs-0 p-gs-2 [&>span]:sr-only",
      false:
        "group-has-[[data-slot=sidebar-menu-badge]]/menu-item:pe-gs-12 group-has-[[data-slot=sidebar-menu-action]]/menu-item:pe-gs-12 group-has-[[data-slot=sidebar-menu-sub]]/menu-item:group-has-[[data-slot=sidebar-menu-badge]]/menu-item:pe-gs-16 group-has-[[data-slot=sidebar-menu-sub]]/menu-item:group-has-[[data-slot=sidebar-menu-action]]/menu-item:pe-gs-16",
    },
  },
});

export const sidebarMenuActionClasses = createRecipe({
  base: "gs-sidebar-menu-action absolute end-gs-1 top-gs-2.5 z-[1] flex size-gs-5 cursor-pointer items-center justify-center rounded-gs-sm border-0 bg-transparent p-gs-0 text-gs-text-secondary outline-none hover:bg-gs-action-hover hover:text-gs-text focus-visible:bg-gs-action-hover focus-visible:shadow-gs-button-focus-border [&>svg]:size-gs-4 [&>svg]:shrink-0",
  variants: {
    iconCollapsed: {
      true: "hidden",
      false: "",
    },
    showOnHover: {
      true: "opacity-0 group-hover/menu-item:opacity-100 group-focus-within/menu-item:opacity-100 focus-visible:opacity-100",
      false: "",
    },
  },
});

export const sidebarMenuBadgeClasses = createRecipe({
  base: "gs-sidebar-menu-badge pointer-events-none absolute end-gs-1 top-gs-2.5 flex h-gs-5 min-w-gs-5 items-center justify-center rounded-gs-sm bg-gs-surface-mist px-gs-1 text-gs-xs font-gs-medium text-gs-text-secondary tabular-nums select-none peer-data-[current=true]/menu-button:bg-gs-surface peer-data-[current=true]/menu-button:text-gs-text group-has-[[data-slot=sidebar-menu-action]:not([data-show-on-hover=true])]/menu-item:end-gs-7 group-has-[[data-slot=sidebar-menu-sub]]/menu-item:end-gs-8 group-has-[[data-slot=sidebar-menu-sub]]/menu-item:group-has-[[data-slot=sidebar-menu-action]:not([data-show-on-hover=true])]/menu-item:end-gs-14",
  variants: {
    iconCollapsed: {
      true: "hidden",
      false: "",
    },
  },
});

export const sidebarMenuSubClasses = createRecipe({
  base: "gs-sidebar-menu-sub ms-gs-4 flex w-full min-w-gs-0 list-none flex-col gap-gs-1 px-gs-2 py-gs-0.5",
  variants: {
    iconCollapsed: {
      true: "hidden",
      false: "",
    },
  },
});

/** Animated shell around a collapsible `Sidebar.MenuSub`. */
export function sidebarMenuSubShellClasses(open: boolean): string {
  return clsx(
    "gs-sidebar-menu-sub-shell grid transition-[grid-template-rows] duration-200 ease-gs-standard motion-reduce:transition-none [[data-reduced-motion=true]_&]:transition-none",
    open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
  );
}

export const sidebarMenuSubShellInnerClasses =
  "gs-sidebar-menu-sub-shell-inner min-h-gs-0 overflow-hidden";

export const sidebarMenuButtonChevronClasses = createRecipe({
  base: "gs-sidebar-menu-button-chevron ms-auto size-gs-4 shrink-0 text-gs-text-secondary transition-transform duration-200 ease-gs-standard motion-reduce:transition-none [[data-reduced-motion=true]_&]:transition-none",
  variants: {
    open: {
      true: "rotate-180",
      false: "",
    },
    iconCollapsed: {
      true: "hidden",
      false: "",
    },
  },
});

export const sidebarMenuSubItemClasses =
  "gs-sidebar-menu-sub-item relative w-full";

export const sidebarMenuSubButtonClasses = createRecipe({
  base: "gs-sidebar-menu-sub-button flex h-gs-8 w-full min-w-gs-0 cursor-pointer items-center gap-gs-2 overflow-hidden rounded-gs-sm border-0 bg-transparent px-gs-2 text-start font-inherit text-gs-sm text-gs-text-secondary no-underline outline-none transition-[background-color,color,box-shadow] duration-150 ease-gs-standard hover:bg-gs-action-hover hover:text-gs-text focus-visible:bg-gs-action-hover focus-visible:shadow-gs-button-focus-border data-[current=true]:bg-gs-surface-mist data-[current=true]:font-gs-medium data-[current=true]:text-gs-text data-[current=true]:hover:bg-gs-surface-mist data-[current=true]:hover:text-gs-text [&>span:last-child]:truncate [&>svg]:size-gs-4 [&>svg]:shrink-0 motion-reduce:transition-none [[data-reduced-motion=true]_&]:transition-none",
});

export const sidebarTriggerClasses =
  "gs-sidebar-trigger inline-flex size-gs-9 shrink-0 cursor-pointer items-center justify-center rounded-gs-sm border-0 bg-transparent p-gs-0 text-gs-text-secondary outline-none transition-[background-color,color,box-shadow] duration-150 ease-gs-standard hover:bg-gs-action-hover hover:text-gs-text focus-visible:bg-gs-action-hover focus-visible:text-gs-text focus-visible:shadow-gs-button-focus-border motion-reduce:transition-none [[data-reduced-motion=true]_&]:transition-none";
