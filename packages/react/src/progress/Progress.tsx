import type { ForwardedRef } from "react";
import { forwardRef } from "react";
import { clsx } from "clsx";
import type { ProgressProps } from "./Progress.types";
import {
  progressClasses,
  progressFillClasses,
  progressTrackClasses,
  progressValueClasses,
} from "./Progress.classes";

function defaultGetValueLabel(value: number, max: number) {
  return `${Math.round((value / max) * 100)}%`;
}

function ProgressImpl(
  {
    value,
    max = 100,
    size = "md",
    getValueLabel = defaultGetValueLabel,
    showValue = false,
    className,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    "aria-valuetext": ariaValueText,
    ...props
  }: ProgressProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const indeterminate = value === undefined;
  const safeMax = Number.isFinite(max) && max > 0 ? max : 100;
  const current = indeterminate
    ? undefined
    : Math.min(Math.max(Number.isFinite(value) ? value : 0, 0), safeMax);
  const percent = current === undefined ? undefined : (current / safeMax) * 100;
  const state =
    current === undefined
      ? "indeterminate"
      : current === safeMax
        ? "complete"
        : "loading";
  const valueText =
    ariaValueText ??
    (current === undefined ? undefined : getValueLabel(current, safeMax));

  return (
    <div
      {...props}
      ref={ref}
      className={clsx(progressClasses(), className)}
      data-size={size}
      data-indeterminate={indeterminate ? "true" : undefined}
      data-state={state}
      data-value={current}
      data-max={safeMax}
      role="progressbar"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-valuetext={valueText}
      aria-valuemin={0}
      aria-valuemax={safeMax}
      aria-valuenow={current}
    >
      <div className={progressTrackClasses({ size })} aria-hidden="true">
        <div
          className={progressFillClasses({ indeterminate })}
          style={
            percent === undefined ? undefined : { inlineSize: `${percent}%` }
          }
        />
      </div>
      {showValue && percent !== undefined ? (
        <span className={progressValueClasses} aria-hidden="true">
          {Math.round(percent)}%
        </span>
      ) : null}
    </div>
  );
}

export const Progress = forwardRef(ProgressImpl);
Progress.displayName = "Progress";
