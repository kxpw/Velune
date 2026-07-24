import { createRecipe } from "../shared/recipe";

/** Style recipe for the Avatar root (and group overflow indicator). */
export const avatarClasses = createRecipe({
  base: "gs-avatar inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-gs-full bg-gs-surface-mist align-middle font-inherit font-gs-medium leading-gs-none text-gs-text-secondary [[data-high-contrast=true]_&]:bg-gs-surface",
  variants: {
    size: {
      xs: "size-gs-6 text-gs-xs",
      sm: "size-gs-8 text-gs-sm",
      md: "size-gs-10 text-gs-md",
      lg: "size-gs-12 text-gs-lg",
      xl: "size-gs-16 text-gs-xl",
    },
    shape: {
      circle: "",
      square: "rounded-gs-sm",
    },
  },
});

/** Classes for the Avatar fallback (initials, icon, custom content). */
export const avatarFallbackClasses =
  "gs-avatar-fallback inline-flex size-full items-center justify-center uppercase";

/** Classes for the Avatar image element. */
export const avatarImageClasses =
  "gs-avatar-image block size-full object-cover";

/** Classes for the default icon fallback wrapper. */
export const avatarIconClasses =
  "gs-avatar-icon text-gs-text-secondary [&_svg]:block [&_svg]:size-11/20";

/** Classes for the Avatar.Group container. */
export const avatarGroupClasses =
  "gs-avatar-group inline-flex flex-row items-center align-middle";

/** Classes applied to each visible Avatar inside a group. */
export const avatarGroupItemClasses =
  "gs-avatar-group-item shadow-gs-surface-outline";

/** Extra classes for the group overflow indicator. */
export const avatarOverflowClasses =
  "gs-avatar-group-item gs-avatar-overflow bg-gs-avatar-hover text-gs-xs text-gs-text-secondary shadow-gs-surface-outline";

/** Negative margin applied to overlapped group items after the first. */
export const avatarGroupOverlapClasses = "-ms-gs-2";
