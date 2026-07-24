import { createRecipe } from "../shared/recipe";
import { dismissControlClasses } from "../shared/feedback-classes";

/** Classes for the Drawer root overlay host. */
export const drawerClasses = "gs-drawer fixed inset-gs-0";

/** Style recipe for the drawer overlay (placement-aware alignment). */
export const drawerOverlayClasses = createRecipe({
  base: "gs-drawer-overlay flex size-full bg-gs-drawer-overlay-bg animate-gs-drawer-overlay-in motion-reduce:animate-none [[data-reduced-motion=true]_&]:animate-none",
  variants: {
    placement: {
      right: "justify-end",
      left: "justify-start",
      top: "items-start",
      bottom: "items-end",
    },
  },
});

/** Style recipe for the floating drawer panel. */
export const drawerContentClasses = createRecipe({
  base: "gs-drawer-content flex flex-col border border-gs-border-default bg-gs-surface-raised bg-gs-surface-highlight font-inherit text-gs-text shadow-gs-3 outline-none [--gs-drawer-size:var(--modal-width-sm)] [[data-size=sm]_&]:[--gs-drawer-size:var(--drawer-size-sm)] [[data-size=lg]_&]:[--gs-drawer-size:var(--modal-width-md)] motion-reduce:animate-none [[data-reduced-motion=true]_&]:animate-none",
  variants: {
    placement: {
      right:
        "h-full max-h-full w-[min(var(--gs-drawer-size),100%)] animate-gs-drawer-slide-right",
      left: "h-full max-h-full w-[min(var(--gs-drawer-size),100%)] animate-gs-drawer-slide-left",
      top: "h-[min(var(--gs-drawer-size),100%)] max-h-full w-full animate-gs-drawer-slide-top",
      bottom:
        "h-[min(var(--gs-drawer-size),100%)] max-h-full w-full animate-gs-drawer-slide-bottom",
    },
  },
});

/** Classes for the Drawer.Header element. */
export const drawerHeaderClasses =
  "gs-drawer-header flex shrink-0 items-start gap-gs-3 p-gs-8 pb-gs-3";

/** Classes for the header main column. */
export const drawerHeaderMainClasses =
  "gs-drawer-header-main grid min-w-gs-0 flex-auto gap-gs-1";

/** Classes for the default close control in the header. */
export const drawerHeaderCloseClasses = "gs-drawer-header-close";

/** Classes for the Drawer.Title element. */
export const drawerTitleClasses =
  "gs-drawer-title m-gs-0 text-gs-lg font-gs-medium leading-gs-normal text-gs-text";

/** Classes for the Drawer.Description element. */
export const drawerDescriptionClasses =
  "gs-drawer-description m-gs-0 text-gs-sm leading-gs-normal text-gs-text-secondary";

/** Classes for the Drawer.Body element. */
export const drawerBodyClasses =
  "gs-drawer-body min-h-gs-0 flex-auto overflow-auto px-gs-8 pb-gs-8 text-gs-sm leading-gs-body text-gs-text";

/** Classes for the Drawer.Footer element. */
export const drawerFooterClasses =
  "gs-drawer-footer flex shrink-0 flex-wrap items-center justify-end gap-gs-2 px-gs-8 pb-gs-8";

/** Classes for the Drawer.Close button. */
export const drawerCloseClasses = dismissControlClasses(
  "chrome",
  "gs-drawer-close -m-gs-1",
);
