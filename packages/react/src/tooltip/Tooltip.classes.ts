import { createRecipe } from "../shared/recipe";

/** Classes for the wrapper span around the tooltip trigger. */
export const tooltipTriggerClasses =
  "gs-tooltip-trigger inline-flex max-w-full align-middle";

/** Style recipe for the floating tooltip bubble. */
export const tooltipClasses = createRecipe({
  base: "gs-tooltip invisible pointer-events-auto z-gs-popover box-border max-w-gs-tooltip-max-width wrap-anywhere rounded-gs-sm border border-gs-border-default bg-gs-surface-raised bg-gs-surface-highlight px-gs-2 py-gs-1 font-inherit text-gs-xs font-gs-medium leading-gs-normal tracking-gs-normal text-gs-text shadow-gs-1 data-[ready=true]:visible data-[ready=true]:animate-gs-float-in data-[placement^=top]:[--gs-float-from:0_var(--space-1)] data-[placement^=left]:[--gs-float-from:var(--space-1)_0] data-[placement^=right]:[--gs-float-from:calc(var(--space-1)*-1)_0] motion-reduce:animate-none [[data-reduced-motion=true]_&]:animate-none",
});
