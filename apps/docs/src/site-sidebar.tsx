import type { ReactNode } from "react";
import { Box } from "velune/react";

/** Shared chrome for docs, components, and templates sidebars. */

export const siteSidebarAsideClassName =
  "sticky top-15 z-10 h-auto min-w-gs-0 border-b border-gs-border-default bg-gs-surface md:flex md:h-[calc(100vh-60px)] md:self-start md:flex-col md:border-r md:border-b-0";

export const siteSidebarMobileClassName = "p-gs-3 md:hidden";

export const siteSidebarNavClassName =
  "hidden flex-1 overflow-y-auto px-gs-3 py-gs-4 md:block";

export const siteNavLinkClassName =
  "flex h-gs-10 items-center gap-gs-2 rounded-gs-sm px-gs-2.5 text-gs-sm text-gs-text-secondary no-underline hover:bg-gs-action-hover hover:text-gs-text";

export const siteNavLinkActiveClassName =
  "bg-gs-surface-mist font-gs-medium text-gs-text shadow-[inset_2px_0_var(--color-primary)]";

export const siteNavSectionLabelClassName =
  "mb-gs-1 px-gs-2 uppercase";

export const siteWorkspaceClassName =
  "min-h-[calc(100vh-60px)] md:grid md:grid-cols-[240px_minmax(0,1fr)]";

export const siteWorkspaceContentClassName =
  "mx-auto w-full min-w-gs-0 max-w-[1360px] px-gs-4 pt-gs-7 pb-gs-16 sm:px-gs-6 md:px-gs-8 md:pt-gs-10 xl:px-gs-12";

/** Shared left rail: Select on mobile, link list on desktop. */
export function SiteSidebar({
  "aria-label": ariaLabel,
  mobile,
  children,
}: {
  "aria-label": string;
  mobile: ReactNode;
  children: ReactNode;
}) {
  return (
    <Box
      as="aside"
      className={siteSidebarAsideClassName}
      aria-label={ariaLabel}
    >
      <Box className={siteSidebarMobileClassName}>{mobile}</Box>
      <Box as="nav" className={siteSidebarNavClassName}>
        {children}
      </Box>
    </Box>
  );
}
