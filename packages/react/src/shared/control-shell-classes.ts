/** Default bordered control shell (Select / Combobox / Input family). */
export const controlShellBaseClasses =
  "box-border rounded-gs-xs border border-gs-border-default bg-gs-surface bg-gs-surface-highlight shadow-gs-surface-sheen transition-[background-color,border-color,box-shadow,opacity] duration-200 ease-gs-standard focus-within:border-gs-focus focus-within:bg-gs-surface-raised focus-within:shadow-gs-input-focus-border motion-reduce:transition-none [[data-reduced-motion=true]_&]:transition-none [[data-high-contrast=true]_&]:border [[data-high-contrast=true]_&]:border-gs-border-strong [[data-high-contrast=true]_&]:focus-within:border-gs-focus";

/** Invalid control shell overlay. */
export const controlShellInvalidClasses =
  "border-gs-error bg-gs-error-subtle focus-within:border-gs-error focus-within:bg-gs-error-subtle focus-within:shadow-gs-input-invalid-border [[data-high-contrast=true]_&]:border-gs-error";

/** Invalid hover overlay for Input / TextArea. */
export const controlShellInvalidHoverClasses =
  "hover:not-focus-within:border-gs-error hover:not-focus-within:bg-gs-error-soft";
