import { createRecipe } from "../shared/recipe";

/** Classes for the wrapper span around the popover trigger. */
export const popoverTriggerClasses =
  "gs-popover-trigger inline-flex max-w-full align-middle";

/** Style recipe for the floating popover panel. */
export const popoverClasses = createRecipe({
  base: "gs-popover invisible z-gs-popover box-border w-max max-w-gs-popover-max-width wrap-anywhere rounded-gs-sm border border-gs-border-default bg-gs-surface-raised bg-gs-surface-highlight p-gs-3 font-inherit text-gs-sm leading-gs-body text-gs-text shadow-gs-2 outline-none data-[ready=true]:visible data-[ready=true]:animate-gs-float-in data-[side=top]:[--gs-float-from:0_var(--space-1)] data-[side=left]:[--gs-float-from:var(--space-1)_0] data-[side=right]:[--gs-float-from:calc(var(--space-1)*-1)_0] focus-visible:outline-none focus-visible:shadow-gs-popover-focus motion-reduce:animate-none [[data-reduced-motion=true]_&]:animate-none",
});
