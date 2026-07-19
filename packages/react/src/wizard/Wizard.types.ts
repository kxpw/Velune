import type { HTMLAttributes, ReactNode } from "react";

export type WizardStepValue = string;
export type WizardIndicator = "steps" | "progress" | "none";

export type WizardStepMeta = {
  value: WizardStepValue;
  title: ReactNode;
  description?: ReactNode | undefined;
  optional?: boolean | undefined;
  disabled?: boolean | undefined;
  titleProps?: WizardTitleProps | undefined;
  descriptionProps?: WizardDescriptionProps | undefined;
};

export type WizardNavigationContext = {
  from: WizardStepValue;
  to: WizardStepValue;
  fromIndex: number;
  toIndex: number;
};

export interface WizardProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "onChange"
> {
  /** Controlled active step value. */
  currentStep?: WizardStepValue;
  /** Uncontrolled initial step. Defaults to the first step. */
  defaultStep?: WizardStepValue;
  onStepChange?: (step: WizardStepValue, index: number) => void;
  /**
   * Called before advancing. Return `false` to cancel.
   * Supports async validation (Promise).
   */
  onBeforeNext?: (
    context: WizardNavigationContext,
  ) => boolean | void | Promise<boolean | void>;
  /** Called before going back. Return `false` to cancel. */
  onBeforePrev?: (
    context: WizardNavigationContext,
  ) => boolean | void | Promise<boolean | void>;
  /** Called when Finish is pressed on the last step. */
  onComplete?: () => void | Promise<void>;
  /** Visual indicator style. Default: `"steps"`. */
  indicator?: WizardIndicator;
  /**
   * When true, users can only move sequentially (no jumping ahead).
   * Default: `true`.
   */
  linear?: boolean;
  /** Accessible label for the step indicator. Default: `Wizard steps`. */
  stepsLabel?: string;
  /** Accessible label for the progress indicator. Default: `Wizard progress`. */
  progressLabel?: string;
  children?: ReactNode;
}

export interface WizardStepProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "title"
> {
  value: WizardStepValue;
  optional?: boolean;
  disabled?: boolean;
  children?: ReactNode;
}

export type WizardTitleProps = HTMLAttributes<HTMLSpanElement>;

export type WizardDescriptionProps = HTMLAttributes<HTMLSpanElement>;

export interface WizardNavigationProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "children"
> {
  hidePrev?: boolean;
  children?: ReactNode;
}

export type WizardNavigationStartProps = HTMLAttributes<HTMLDivElement>;
export interface WizardNavigationActionProps extends HTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
}

export type WizardNavigationPreviousProps = WizardNavigationActionProps;
export type WizardNavigationNextProps = WizardNavigationActionProps;
export type WizardNavigationFinishProps = WizardNavigationActionProps;
