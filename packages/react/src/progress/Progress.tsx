import type { ForwardedRef } from "react";
import { forwardRef } from "react";
import { clsx } from "clsx";
import type { ProgressProps } from "./Progress.types";

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
      className={clsx(
        "gs-progress flex w-full items-center gap-gs-progress-label-gap font-gs-sans",
        className,
      )}
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
      <div
        className={clsx(
          "gs-progress-track relative flex-auto overflow-hidden rounded-gs-progress-radius bg-gs-progress-track-bg",
          size === "sm" ? "h-gs-progress-height-sm" : "h-gs-progress-height",
        )}
        aria-hidden="true"
      >
        <div
          className={clsx(
            "gs-progress-fill h-full rounded-inherit bg-gs-progress-fill [transition-property:inline-size] duration-gs-normal ease-gs-glide motion-reduce:transition-none [[data-reduced-motion=true]_&]:transition-none",
            indeterminate
              ? "absolute inset-block-0 w-2/5 animate-gs-progress-slide motion-reduce:w-full motion-reduce:animate-none [[data-reduced-motion=true]_&]:w-full [[data-reduced-motion=true]_&]:animate-none"
              : "w-0",
          )}
          style={
            percent === undefined ? undefined : { inlineSize: `${percent}%` }
          }
        />
      </div>
      {showValue && percent !== undefined ? (
        <span
          className="gs-progress-value shrink-0 font-gs-mono text-gs-progress-value-size leading-none text-gs-text-secondary tabular-nums"
          aria-hidden="true"
        >
          {Math.round(percent)}%
        </span>
      ) : null}
    </div>
  );
}

export const Progress = forwardRef(ProgressImpl);
Progress.displayName = "Progress";
