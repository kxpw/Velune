import type { ComponentType, ForwardedRef, ReactNode } from "react";
import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { clsx } from "clsx";
import { Button } from "../button";
import {
  createCompoundSlot,
  dispatchCompoundSlots,
  markCompoundSlot,
} from "../shared/compound-slot";
import { findEnabledIndex } from "../shared/keyboard-navigation";
import type {
  WizardDescriptionProps,
  WizardIndicator,
  WizardNavigationContext,
  WizardNavigationProps,
  WizardNavigationFinishProps,
  WizardNavigationNextProps,
  WizardNavigationPreviousProps,
  WizardNavigationStartProps,
  WizardProps,
  WizardStepMeta,
  WizardStepProps,
  WizardStepValue,
  WizardTitleProps,
} from "./Wizard.types";

type WizardContextValue = {
  steps: WizardStepMeta[];
  current: WizardStepValue;
  currentIndex: number;
  linear: boolean;
  indicator: WizardIndicator;
  busy: boolean;
  baseId: string;
  goTo: (value: WizardStepValue) => Promise<void>;
  next: () => Promise<void>;
  prev: () => Promise<void>;
  isFirst: boolean;
  isLast: boolean;
};

const WizardContext = createContext<WizardContextValue | null>(null);

function useWizardContext(component: string): WizardContextValue {
  const ctx = useContext(WizardContext);
  if (!ctx) {
    throw new Error(`${component} must be used within <Wizard>`);
  }
  return ctx;
}

function collectSteps(children: ReactNode): {
  steps: WizardStepMeta[];
  panels: Array<{ value: WizardStepValue; node: ReactNode }>;
  rest: ReactNode[];
} {
  const steps: WizardStepMeta[] = [];
  const panels: Array<{ value: WizardStepValue; node: ReactNode }> = [];
  const rest: ReactNode[] = [];

  dispatchCompoundSlots(
    children,
    {
      "Wizard.Step": (child) => {
        const props = child.props as WizardStepProps;
        const composition = collectStepComposition(props.children);
        steps.push({
          value: props.value,
          title: composition.title ?? props.value,
          description: composition.description,
          titleProps: composition.titleProps,
          descriptionProps: composition.descriptionProps,
          optional: props.optional,
          disabled: props.disabled,
        });
        panels.push({
          value: props.value,
          node: child,
        });
      },
    },
    (child) => {
      if (child != null && child !== false) {
        rest.push(child);
      }
    },
  );

  return { steps, panels, rest };
}

function collectStepComposition(children: ReactNode) {
  let title: ReactNode;
  let description: ReactNode;
  let titleProps: WizardTitleProps | undefined;
  let descriptionProps: WizardDescriptionProps | undefined;
  const content: ReactNode[] = [];

  dispatchCompoundSlots(
    children,
    {
      "Wizard.Title": (child) => {
        titleProps = child.props as WizardTitleProps;
        title = titleProps.children;
      },
      "Wizard.Description": (child) => {
        descriptionProps = child.props as WizardDescriptionProps;
        description = descriptionProps.children;
      },
    },
    (child) => content.push(child),
  );

  return { title, description, titleProps, descriptionProps, content };
}

async function allowNavigation(
  hook:
    | ((
        context: WizardNavigationContext,
      ) => boolean | void | Promise<boolean | void>)
    | undefined,
  context: WizardNavigationContext,
): Promise<boolean> {
  if (!hook) {
    return true;
  }
  const result = await hook(context);
  return result !== false;
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M3.5 8.25L6.5 11.2L12.5 4.8"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function isDisabledStep(step: WizardStepMeta): boolean {
  return Boolean(step.disabled);
}

function WizardImpl(
  {
    currentStep,
    defaultStep,
    onStepChange,
    onBeforeNext,
    onBeforePrev,
    onComplete,
    indicator = "steps",
    linear = true,
    stepsLabel = "Wizard steps",
    progressLabel = "Wizard progress",
    className,
    children,
    ...props
  }: WizardProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const { steps, panels, rest } = useMemo(
    () => collectSteps(children),
    [children],
  );

  const firstValue = steps[0]?.value ?? "";
  const isControlled = currentStep !== undefined;
  const [innerStep, setInnerStep] = useState(defaultStep ?? firstValue);
  const [busy, setBusy] = useState(false);
  const baseId = useId();

  const requestedCurrent = isControlled
    ? (currentStep as WizardStepValue)
    : innerStep;
  const requestedIndex = steps.findIndex(
    (step) => step.value === requestedCurrent,
  );
  const current =
    requestedIndex >= 0 || steps.length === 0 ? requestedCurrent : firstValue;
  const mountedRef = useRef(true);
  const busyRef = useRef(false);
  const navigationRunRef = useRef(0);
  const currentRef = useRef(current);
  currentRef.current = current;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      busyRef.current = false;
      navigationRunRef.current += 1;
    };
  }, []);
  useEffect(() => {
    if (
      !isControlled &&
      steps.length > 0 &&
      requestedIndex < 0 &&
      innerStep !== firstValue
    ) {
      setInnerStep(firstValue);
    }
  }, [firstValue, innerStep, isControlled, requestedIndex, steps.length]);
  const currentIndex = requestedIndex >= 0 ? requestedIndex : 0;
  const isFirst = currentIndex <= 0;
  const isLast = currentIndex >= steps.length - 1;

  const setStep = useCallback(
    (value: WizardStepValue, index: number) => {
      if (!isControlled) {
        setInnerStep(value);
      }
      onStepChange?.(value, index);
    },
    [isControlled, onStepChange],
  );

  const runExclusive = useCallback(
    async (command: (navigationRun: number) => Promise<void>) => {
      if (busyRef.current) return;
      const navigationRun = navigationRunRef.current + 1;
      navigationRunRef.current = navigationRun;
      busyRef.current = true;
      setBusy(true);
      try {
        await command(navigationRun);
      } finally {
        if (mountedRef.current && navigationRunRef.current === navigationRun) {
          busyRef.current = false;
          setBusy(false);
        }
      }
    },
    [],
  );

  const goTo = useCallback(
    async (value: WizardStepValue) => {
      const toIndex = steps.findIndex((step) => step.value === value);
      if (toIndex < 0 || steps[toIndex]?.disabled) {
        return;
      }
      if (value === current) {
        return;
      }

      // Linear flow may only advance to the next enabled step; disabled
      // steps in between do not block the jump.
      if (linear && toIndex > currentIndex) {
        const nextEnabled = findEnabledIndex(
          steps,
          currentIndex,
          "next",
          isDisabledStep,
          false,
        );
        if (toIndex > nextEnabled) {
          return;
        }
      }

      const context: WizardNavigationContext = {
        from: current,
        to: value,
        fromIndex: currentIndex,
        toIndex,
      };

      await runExclusive(async (navigationRun) => {
        const hook = toIndex > currentIndex ? onBeforeNext : onBeforePrev;
        const ok = await allowNavigation(hook, context);
        if (
          !ok ||
          !mountedRef.current ||
          navigationRunRef.current !== navigationRun ||
          currentRef.current !== context.from
        ) {
          return;
        }
        setStep(value, toIndex);
      });
    },
    [
      current,
      currentIndex,
      linear,
      onBeforeNext,
      onBeforePrev,
      runExclusive,
      setStep,
      steps,
    ],
  );

  const next = useCallback(async () => {
    if (isLast) {
      await runExclusive(async () => {
        await onComplete?.();
      });
      return;
    }

    const targetIndex = findEnabledIndex(
      steps,
      currentIndex,
      "next",
      isDisabledStep,
      false,
    );
    const target = steps[targetIndex];
    if (!target) {
      return;
    }
    await goTo(target.value);
  }, [currentIndex, goTo, isLast, onComplete, runExclusive, steps]);

  const prev = useCallback(async () => {
    if (busyRef.current || isFirst) {
      return;
    }
    const targetIndex = findEnabledIndex(
      steps,
      currentIndex,
      "previous",
      isDisabledStep,
      false,
    );
    const target = steps[targetIndex];
    if (!target) {
      return;
    }
    await goTo(target.value);
  }, [currentIndex, goTo, isFirst, steps]);

  const ctx = useMemo<WizardContextValue>(
    () => ({
      steps,
      current,
      currentIndex,
      linear,
      indicator,
      busy,
      baseId,
      goTo,
      next,
      prev,
      isFirst,
      isLast,
    }),
    [
      baseId,
      busy,
      current,
      currentIndex,
      goTo,
      indicator,
      isFirst,
      isLast,
      linear,
      next,
      prev,
      steps,
    ],
  );

  const progress =
    steps.length <= 1 ? 1 : currentIndex / Math.max(1, steps.length - 1);

  // Mirrors the goTo linear rule: the next enabled step stays reachable.
  let nextEnabledIndex = currentIndex + 1;
  while (nextEnabledIndex < steps.length && steps[nextEnabledIndex]?.disabled) {
    nextEnabledIndex += 1;
  }

  return (
    <WizardContext.Provider value={ctx}>
      <div
        ref={ref}
        {...props}
        className={clsx(
          "gs-wizard flex min-w-0 flex-col gap-gs-wizard-gap font-inherit text-gs-text",
          className,
        )}
        data-indicator={indicator}
        data-busy={busy ? "true" : undefined}
      >
        {indicator === "steps" && steps.length > 0 ? (
          <ol
            className="gs-wizard-steps m-0 flex list-none flex-wrap items-start gap-gs-wizard-indicator-gap p-0 max-[40em]:flex-col"
            aria-label={stepsLabel}
          >
            {steps.map((step, index) => {
              const status =
                index < currentIndex
                  ? "done"
                  : index === currentIndex
                    ? "current"
                    : "upcoming";
              const clickable =
                !step.disabled &&
                !busy &&
                (index <= currentIndex || !linear || index <= nextEnabledIndex);

              return (
                <li
                  key={step.value}
                  className={clsx(
                    "gs-wizard-step-item relative flex min-w-[min(100%,var(--space-20))] flex-auto items-start max-[40em]:min-w-full",
                    step.disabled && "opacity-gs-disabled",
                  )}
                  data-status={status}
                  data-disabled={step.disabled ? "true" : undefined}
                >
                  {index > 0 ? (
                    <span
                      className={clsx(
                        "gs-wizard-connector absolute start-[calc(var(--wizard-step-size)/-2)] top-[calc(var(--wizard-step-size)/2)] h-gs-wizard-connector-height w-4 -translate-y-1/2 rounded-full bg-gs-wizard-connector-color max-[40em]:hidden",
                        index <= currentIndex &&
                          "bg-gs-wizard-connector-color-active",
                      )}
                      data-active={index <= currentIndex ? "true" : undefined}
                      aria-hidden="true"
                    />
                  ) : null}
                  <button
                    type="button"
                    className="gs-wizard-step-button group m-0 flex min-h-gs-control-hit-target w-full cursor-pointer appearance-none items-start gap-3 border-0 bg-transparent p-0 text-start font-inherit text-inherit disabled:cursor-default"
                    disabled={!clickable}
                    aria-current={status === "current" ? "step" : undefined}
                    onClick={() => void goTo(step.value)}
                  >
                    <span
                      className={clsx(
                        "gs-wizard-marker inline-flex size-gs-wizard-step-size shrink-0 items-center justify-center rounded-full bg-gs-wizard-marker-bg text-xs font-medium leading-none text-gs-wizard-marker-color transition-[background-color,color,box-shadow,transform] duration-200 ease-gs-standard group-active:scale-95 group-focus-visible:shadow-gs-button-focus-border motion-reduce:transition-none motion-reduce:group-active:scale-100 [[data-reduced-motion=true]_&]:transition-none [[data-reduced-motion=true]_&]:group-active:scale-100 [&_svg]:block [&_svg]:size-4",
                        status === "current" &&
                          "bg-gs-wizard-marker-bg-current text-gs-wizard-marker-color-current",
                        status === "done" &&
                          "bg-gs-wizard-marker-bg-done text-gs-wizard-marker-color-done",
                      )}
                      aria-hidden="true"
                    >
                      {status === "done" ? <CheckIcon /> : index + 1}
                    </span>
                    <span className="gs-wizard-step-copy grid min-w-0 gap-1 pt-[calc((var(--wizard-step-size)-1em*var(--line-height-normal))/2)]">
                      <span
                        {...step.titleProps}
                        className={clsx(
                          "gs-wizard-step-title text-gs-wizard-step-font-size font-gs-wizard-step-title-weight leading-gs-normal text-gs-text-secondary",
                          status === "current" && "text-gs-text",
                          step.titleProps?.className,
                        )}
                      >
                        {step.title}
                      </span>
                      {step.description != null ? (
                        <span
                          {...step.descriptionProps}
                          className={clsx(
                            "gs-wizard-step-description text-gs-wizard-step-description-size leading-gs-body text-gs-text-secondary",
                            step.descriptionProps?.className,
                          )}
                        >
                          {step.description}
                        </span>
                      ) : null}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        ) : null}

        {indicator === "progress" && steps.length > 0 ? (
          <div className="gs-wizard-progress grid gap-2">
            <div className="gs-wizard-progress-meta flex items-baseline justify-between gap-3">
              <span className="gs-wizard-progress-label text-gs-wizard-step-font-size font-gs-wizard-step-title-weight text-gs-text">
                {steps[currentIndex]?.title}
              </span>
              <span className="gs-wizard-progress-count text-xs text-gs-text-secondary tabular-nums">
                {currentIndex + 1} / {steps.length}
              </span>
            </div>
            <div
              className="gs-wizard-progress-track h-gs-wizard-connector-height overflow-hidden rounded-full bg-gs-wizard-connector-color"
              role="progressbar"
              aria-label={progressLabel}
              aria-valuemin={1}
              aria-valuemax={steps.length}
              aria-valuenow={currentIndex + 1}
            >
              <div
                className="gs-wizard-progress-fill h-full rounded-inherit bg-gs-wizard-connector-color-active transition-[width] duration-gs-normal ease-gs-standard motion-reduce:transition-none [[data-reduced-motion=true]_&]:transition-none"
                style={{ width: `${Math.round(progress * 100)}%` }}
              />
            </div>
          </div>
        ) : null}

        <div className="gs-wizard-panels min-w-0">
          {panels.map(({ value, node }) => {
            const active = value === current;
            const stepTitle = steps.find((step) => step.value === value)?.title;
            return (
              <div
                key={value}
                className="gs-wizard-panel min-w-0"
                data-state={active ? "active" : "inactive"}
                hidden={!active}
                role="group"
                id={`${baseId}-panel-${value}`}
                aria-label={typeof stepTitle === "string" ? stepTitle : value}
              >
                {active ? node : null}
              </div>
            );
          })}
        </div>

        {rest}
      </div>
    </WizardContext.Provider>
  );
}

const WizardRoot = forwardRef(WizardImpl);
WizardRoot.displayName = "Wizard";

function WizardStepImpl(
  { value, optional, disabled, className, children, ...props }: WizardStepProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const { content } = collectStepComposition(children);
  // Step metadata is consumed by Wizard root via collectSteps.
  void optional;
  void disabled;
  void value;

  return (
    <div
      ref={ref}
      className={clsx(
        "gs-wizard-step-body min-w-0 py-gs-wizard-content-padding-y text-sm leading-gs-body",
        className,
      )}
      {...props}
    >
      {content}
    </div>
  );
}

const WizardStep = markCompoundSlot(forwardRef(WizardStepImpl), "Wizard.Step");

const WizardTitle = createCompoundSlot<WizardTitleProps>("Wizard.Title");

const WizardDescription =
  createCompoundSlot<WizardDescriptionProps>("Wizard.Description");

function collectNavigationContent(children: ReactNode): {
  actions: ReactNode;
  start?: WizardNavigationStartProps | undefined;
  previous?: WizardNavigationPreviousProps | undefined;
  next?: WizardNavigationNextProps | undefined;
  finish?: WizardNavigationFinishProps | undefined;
} {
  const actions: ReactNode[] = [];
  let start: WizardNavigationStartProps | undefined;
  let previous: WizardNavigationPreviousProps | undefined;
  let next: WizardNavigationNextProps | undefined;
  let finish: WizardNavigationFinishProps | undefined;
  dispatchCompoundSlots(
    children,
    {
      "Wizard.Navigation.Start": (child) => {
        start = child.props as WizardNavigationStartProps;
      },
      "Wizard.Navigation.Previous": (child) => {
        previous = child.props as WizardNavigationPreviousProps;
      },
      "Wizard.Navigation.Next": (child) => {
        next = child.props as WizardNavigationNextProps;
      },
      "Wizard.Navigation.Finish": (child) => {
        finish = child.props as WizardNavigationFinishProps;
      },
    },
    (child) => actions.push(child),
  );
  return { actions, start, previous, next, finish };
}

function WizardNavigationImpl(
  { hidePrev = false, className, children, ...props }: WizardNavigationProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const {
    actions,
    start,
    previous,
    next: nextSlot,
    finish,
  } = collectNavigationContent(children);
  const { next, prev, isFirst, isLast, busy } =
    useWizardContext("Wizard.Navigation");

  return (
    <div
      ref={ref}
      className={clsx(
        "gs-wizard-navigation flex flex-wrap items-center justify-between gap-gs-wizard-nav-gap",
        className,
      )}
      {...props}
    >
      {start ? (
        <div
          {...start}
          className={clsx(
            "gs-wizard-navigation-start min-w-0",
            start.className,
          )}
        >
          {start.children}
        </div>
      ) : (
        <span className="gs-wizard-navigation-start min-w-0" />
      )}
      <div className="gs-wizard-navigation-actions ms-auto inline-flex flex-wrap items-center justify-end gap-gs-wizard-nav-gap">
        {actions}
        {!hidePrev ? (
          <Button
            {...previous}
            type="button"
            variant="ghost"
            disabled={busy || isFirst}
            onClick={(event) => {
              previous?.onClick?.(event);
              if (!event.defaultPrevented) void prev();
            }}
          >
            {previous?.children ?? "Back"}
          </Button>
        ) : null}
        <Button
          {...(isLast ? finish : nextSlot)}
          type="button"
          loading={busy}
          onClick={(event) => {
            const slot = isLast ? finish : nextSlot;
            slot?.onClick?.(event);
            if (!event.defaultPrevented) void next();
          }}
        >
          {isLast
            ? (finish?.children ?? "Finish")
            : (nextSlot?.children ?? "Next")}
        </Button>
      </div>
    </div>
  );
}

const WizardNavigationRoot = forwardRef(WizardNavigationImpl);
WizardNavigationRoot.displayName = "Wizard.Navigation";

const WizardNavigationStart: ComponentType<WizardNavigationStartProps> =
  createCompoundSlot<WizardNavigationStartProps>("Wizard.Navigation.Start");
const WizardNavigationPrevious: ComponentType<WizardNavigationPreviousProps> =
  createCompoundSlot<WizardNavigationPreviousProps>(
    "Wizard.Navigation.Previous",
  );
const WizardNavigationNext: ComponentType<WizardNavigationNextProps> =
  createCompoundSlot<WizardNavigationNextProps>("Wizard.Navigation.Next");
const WizardNavigationFinish: ComponentType<WizardNavigationFinishProps> =
  createCompoundSlot<WizardNavigationFinishProps>("Wizard.Navigation.Finish");

const WizardNavigation = Object.assign(WizardNavigationRoot, {
  Start: WizardNavigationStart,
  Previous: WizardNavigationPrevious,
  Next: WizardNavigationNext,
  Finish: WizardNavigationFinish,
});

export const Wizard = Object.assign(WizardRoot, {
  Step: WizardStep,
  Title: WizardTitle,
  Description: WizardDescription,
  Navigation: WizardNavigation,
});
