import type { ChangeEvent, ForwardedRef } from "react";
import { forwardRef, useId, useMemo } from "react";
import { clsx } from "clsx";
import { useControllableState } from "@velune/hooks";
import {
  collectCompoundSlotProps,
  createCompoundSlot,
  omitCompoundSlotProps,
} from "../shared/compound-slot";
import type {
  SliderLabelProps,
  SliderOutputProps,
  SliderProps,
  SliderValue,
} from "./Slider.types";

type SliderComposition = {
  label?: SliderLabelProps;
  output?: SliderOutputProps;
};

const slotSchema = {
  "Slider.Label": "label",
  "Slider.Output": "output",
} as const satisfies Readonly<Record<string, keyof SliderComposition>>;

function toArray(value: SliderValue | undefined): number[] | undefined {
  if (value === undefined) return undefined;
  return Array.isArray(value) ? value : [value];
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Native range inputs stacked over a custom-drawn rail. Each thumb is the
 * input's own ::-webkit-slider-thumb / ::-moz-range-thumb, so keyboard,
 * pointer, and form semantics come from the platform. With multiple thumbs
 * the inputs ignore pointer events except on the thumb itself so overlapping
 * inputs do not shadow each other.
 */
const thumbClasses = [
  // WebKit/Blink thumb
  "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:size-gs-slider-thumb-size [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-solid [&::-webkit-slider-thumb]:border-gs-slider-thumb-border [&::-webkit-slider-thumb]:bg-gs-slider-thumb-bg [&::-webkit-slider-thumb]:shadow-gs-xs [&::-webkit-slider-thumb]:transition-shadow [&::-webkit-slider-thumb]:duration-150 [&::-webkit-slider-thumb]:ease-gs-standard [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:active:cursor-grabbing",
  "[&:focus-visible::-webkit-slider-thumb]:shadow-gs-button-focus-border",
  "[&:disabled::-webkit-slider-thumb]:cursor-not-allowed",
  // Firefox thumb
  "[&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:box-border [&::-moz-range-thumb]:size-gs-slider-thumb-size [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-solid [&::-moz-range-thumb]:border-gs-slider-thumb-border [&::-moz-range-thumb]:bg-gs-slider-thumb-bg [&::-moz-range-thumb]:shadow-gs-xs [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:active:cursor-grabbing",
  "[&:focus-visible::-moz-range-thumb]:shadow-gs-button-focus-border",
  "[&:disabled::-moz-range-thumb]:cursor-not-allowed",
].join(" ");

function SliderImpl(
  {
    value,
    defaultValue,
    onValueChange,
    onValueChangeEnd,
    min = 0,
    max = 100,
    step = 1,
    disabled = false,
    orientation = "horizontal",
    formatOptions,
    id,
    className,
    children,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    ...props
  }: SliderProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const { label, output } = collectCompoundSlotProps<SliderComposition>(
    children,
    slotSchema,
  );
  const horizontal = orientation === "horizontal";
  const generatedId = useId();
  const labelId = label != null ? `${generatedId}-label` : undefined;
  const multiThumb =
    (toArray(value) ?? toArray(defaultValue) ?? [0]).length > 1;

  const [values, setValues] = useControllableState<number[]>({
    value: toArray(value),
    defaultValue: toArray(defaultValue) ?? [min],
  });

  const emit = (next: number[]) =>
    multiThumb || Array.isArray(value) || Array.isArray(defaultValue)
      ? next
      : (next[0] ?? min);

  const handleChange = (
    index: number,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const raw = Number(event.target.value);
    // Thumbs may not cross: clamp against the neighbouring values.
    const lower = index > 0 ? (values[index - 1] ?? min) : min;
    const upper = index < values.length - 1 ? (values[index + 1] ?? max) : max;
    const nextValue = clamp(raw, lower, upper);
    if (nextValue === values[index]) {
      if (raw !== nextValue) event.target.value = String(nextValue);
      return;
    }
    const next = values.slice();
    next[index] = nextValue;
    setValues(next);
    onValueChange?.(emit(next));
  };

  const handleChangeEnd = () => {
    onValueChangeEnd?.(emit(values));
  };

  const formatter = useMemo(
    () =>
      new Intl.NumberFormat(
        typeof navigator !== "undefined" ? navigator.language : "en",
        formatOptions,
      ),
    [formatOptions],
  );

  const percents = values.map((current) =>
    max === min ? 0 : ((clamp(current, min, max) - min) / (max - min)) * 100,
  );
  const startPercent = values.length > 1 ? (percents[0] ?? 0) : 0;
  const endPercent = percents[percents.length - 1] ?? 0;
  const formattedValue = values.map((v) => formatter.format(v)).join(" – ");

  return (
    <div
      {...props}
      ref={ref}
      id={id}
      className={clsx(
        "gs-slider font-inherit text-gs-slider-label-size text-gs-text",
        horizontal
          ? "grid w-full min-w-0 gap-gs-slider-label-gap"
          : "inline-grid h-40 justify-items-center gap-gs-slider-label-gap",
        disabled && "cursor-not-allowed opacity-gs-disabled",
        className,
      )}
      data-orientation={orientation}
      data-disabled={disabled ? "true" : undefined}
    >
      {label != null || output != null ? (
        <div className="gs-slider-header flex min-w-0 items-center justify-between gap-2">
          {label != null ? (
            <span
              {...omitCompoundSlotProps(label, ["children", "className"])}
              id={labelId}
              className={clsx(
                "gs-slider-label min-w-0 truncate leading-gs-normal",
                label.className,
              )}
            >
              {label.children}
            </span>
          ) : (
            <span aria-hidden="true" />
          )}
          {output != null ? (
            <output
              {...omitCompoundSlotProps(output, ["children", "className"])}
              aria-live="off"
              className={clsx(
                "gs-slider-output shrink-0 font-gs-mono text-gs-progress-value-size leading-none text-gs-text-secondary tabular-nums",
                output.className,
              )}
            >
              {output.children ?? formattedValue}
            </output>
          ) : null}
        </div>
      ) : null}
      <div
        className={clsx(
          "gs-slider-track relative",
          horizontal
            ? "h-gs-slider-thumb-size w-full"
            : "h-full w-gs-slider-thumb-size justify-self-center",
        )}
      >
        <span
          aria-hidden="true"
          className={clsx(
            "gs-slider-rail absolute rounded-full bg-gs-slider-track-bg",
            horizontal
              ? "inset-x-0 top-1/2 h-gs-slider-track-size -translate-y-1/2"
              : "inset-y-0 left-1/2 w-gs-slider-track-size -translate-x-1/2",
          )}
        />
        <span
          aria-hidden="true"
          className={clsx(
            "gs-slider-fill absolute rounded-full bg-gs-slider-fill-bg",
            horizontal
              ? "top-1/2 h-gs-slider-track-size -translate-y-1/2"
              : "left-1/2 w-gs-slider-track-size -translate-x-1/2",
          )}
          style={
            horizontal
              ? {
                  insetInlineStart: `${startPercent}%`,
                  inlineSize: `${endPercent - startPercent}%`,
                }
              : {
                  bottom: `${startPercent}%`,
                  blockSize: `${endPercent - startPercent}%`,
                }
          }
        />
        {values.map((current, index) => (
          <input
            key={index}
            type="range"
            className={clsx(
              "gs-slider-input absolute m-0 appearance-none bg-transparent p-0 outline-none",
              horizontal
                ? "inset-0 h-full w-full"
                : "inset-0 size-full [direction:rtl] [writing-mode:vertical-lr]",
              // Overlapping inputs would shadow each other; only the thumbs
              // stay interactive when there is more than one.
              values.length > 1 &&
                "pointer-events-none [&::-moz-range-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:pointer-events-auto",
              disabled && "cursor-not-allowed",
              thumbClasses,
            )}
            min={min}
            max={max}
            step={step}
            value={current}
            disabled={disabled}
            aria-orientation={orientation}
            {...(ariaLabel !== undefined ? { "aria-label": ariaLabel } : {})}
            {...(ariaLabelledBy !== undefined || labelId !== undefined
              ? { "aria-labelledby": ariaLabelledBy ?? labelId }
              : {})}
            aria-valuetext={formatter.format(current)}
            onChange={(event) => handleChange(index, event)}
            onPointerUp={handleChangeEnd}
            onKeyUp={handleChangeEnd}
          />
        ))}
      </div>
    </div>
  );
}

const SliderRoot = forwardRef(SliderImpl);
SliderRoot.displayName = "Slider";

const SliderLabel = createCompoundSlot<SliderLabelProps>("Slider.Label");
const SliderOutput = createCompoundSlot<SliderOutputProps>("Slider.Output");

export const Slider = Object.assign(SliderRoot, {
  Label: SliderLabel,
  Output: SliderOutput,
});
