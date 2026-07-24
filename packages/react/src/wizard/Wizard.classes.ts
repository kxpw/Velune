import { clsx } from "clsx";
import { createRecipe } from "../shared/recipe";

/** Classes for the Wizard root. */
export const wizardClasses =
  "gs-wizard flex min-w-gs-0 flex-col gap-gs-5 font-inherit text-gs-text";

/** Classes for the steps indicator list. */
export const wizardStepsClasses =
  "gs-wizard-steps m-gs-0 flex list-none flex-wrap items-start gap-gs-2 p-gs-0 max-[40em]:flex-col";

export type WizardStepItemClassesOptions = {
  disabled?: boolean | undefined;
};

/** Style recipe for a step list item. */
export function wizardStepItemClasses({
  disabled = false,
}: WizardStepItemClassesOptions = {}): string {
  return clsx(
    "gs-wizard-step-item relative flex min-w-[min(100%,var(--space-20))] flex-auto items-start max-[40em]:min-w-full",
    disabled && "opacity-gs-disabled",
  );
}

/** Style recipe for the connector between steps. */
export const wizardConnectorClasses = createRecipe({
  base: "gs-wizard-connector absolute start-[calc(var(--space-7)/-2)] top-[calc(var(--space-7)/2)] h-gs-0.5 w-gs-4 -translate-y-1/2 rounded-gs-full bg-gs-wizard-connector max-[40em]:hidden",
  variants: {
    active: {
      true: "bg-gs-primary",
    },
  },
});

/** Classes for the step button. */
export const wizardStepButtonClasses =
  "gs-wizard-step-button group m-gs-0 flex min-h-gs-11 w-full cursor-pointer appearance-none items-start gap-gs-3 border-0 bg-transparent p-gs-0 text-start font-inherit text-inherit disabled:cursor-default";

/** Style recipe for the step marker circle. */
export const wizardMarkerClasses = createRecipe({
  base: "gs-wizard-marker inline-flex size-gs-7 shrink-0 items-center justify-center rounded-gs-full bg-gs-surface text-gs-xs font-gs-medium leading-gs-none text-gs-text-secondary transition-[background-color,color,box-shadow,transform] duration-200 ease-gs-standard group-active:scale-95 group-focus-visible:shadow-gs-button-focus-border motion-reduce:transition-none motion-reduce:group-active:scale-100 [[data-reduced-motion=true]_&]:transition-none [[data-reduced-motion=true]_&]:group-active:scale-100 [&_svg]:block [&_svg]:size-gs-4",
  variants: {
    status: {
      current: "bg-gs-primary-strong text-gs-on-primary",
      done: "bg-gs-surface-done text-gs-primary-strong",
    },
  },
});

/** Classes for the step title/description column. */
export const wizardStepCopyClasses =
  "gs-wizard-step-copy grid min-w-gs-0 gap-gs-1 pt-[calc((var(--space-7)-1em*var(--line-height-normal))/2)]";

export type WizardStepTitleClassesOptions = {
  current?: boolean | undefined;
};

/** Style recipe for the step title. */
export function wizardStepTitleClasses({
  current = false,
}: WizardStepTitleClassesOptions = {}): string {
  return clsx(
    "gs-wizard-step-title text-gs-sm font-gs-medium leading-gs-normal text-gs-text-secondary",
    current && "text-gs-text",
  );
}

/** Classes for the step description. */
export const wizardStepDescriptionClasses =
  "gs-wizard-step-description text-gs-xs leading-gs-body text-gs-text-secondary";

/** Classes for the progress indicator block. */
export const wizardProgressClasses = "gs-wizard-progress grid gap-gs-2";

/** Classes for the progress meta row. */
export const wizardProgressMetaClasses =
  "gs-wizard-progress-meta flex items-baseline justify-between gap-gs-3";

/** Classes for the progress label. */
export const wizardProgressLabelClasses =
  "gs-wizard-progress-label text-gs-sm font-gs-medium text-gs-text";

/** Classes for the progress count. */
export const wizardProgressCountClasses =
  "gs-wizard-progress-count text-gs-xs text-gs-text-secondary tabular-nums";

/** Classes for the progress track. */
export const wizardProgressTrackClasses =
  "gs-wizard-progress-track h-gs-0.5 overflow-hidden rounded-gs-full bg-gs-wizard-connector";

/** Classes for the progress fill. */
export const wizardProgressFillClasses =
  "gs-wizard-progress-fill h-full rounded-inherit bg-gs-primary transition-[width] duration-gs-normal ease-gs-standard motion-reduce:transition-none [[data-reduced-motion=true]_&]:transition-none";

/** Classes for the panels container. */
export const wizardPanelsClasses = "gs-wizard-panels min-w-gs-0";

/** Classes for an individual panel. */
export const wizardPanelClasses = "gs-wizard-panel min-w-gs-0";

/** Classes for Wizard.Step body content. */
export const wizardStepBodyClasses =
  "gs-wizard-step-body min-w-gs-0 py-gs-4 text-gs-sm leading-gs-body";

/** Classes for Wizard.Navigation. */
export const wizardNavigationClasses =
  "gs-wizard-navigation flex flex-wrap items-center justify-between gap-gs-2";

/** Classes for Wizard.Navigation.Start. */
export const wizardNavigationStartClasses =
  "gs-wizard-navigation-start min-w-gs-0";

/** Classes for the trailing navigation actions cluster. */
export const wizardNavigationActionsClasses =
  "gs-wizard-navigation-actions ms-auto inline-flex flex-wrap items-center justify-end gap-gs-2";
