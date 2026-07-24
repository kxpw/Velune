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
import {
  sliderClasses,
  sliderFillClasses,
  sliderHeaderClasses,
  sliderInputClasses,
  sliderLabelClasses,
  sliderOutputClasses,
  sliderRailClasses,
  sliderTrackClasses,
} from "./Slider.classes";

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
      className={clsx(sliderClasses({ horizontal, disabled }), className)}
      data-orientation={orientation}
      data-disabled={disabled ? "true" : undefined}
    >
      {label != null || output != null ? (
        <div className={sliderHeaderClasses}>
          {label != null ? (
            <span
              {...omitCompoundSlotProps(label, ["children", "className"])}
              id={labelId}
              className={clsx(sliderLabelClasses, label.className)}
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
              className={clsx(sliderOutputClasses, output.className)}
            >
              {output.children ?? formattedValue}
            </output>
          ) : null}
        </div>
      ) : null}
      <div className={sliderTrackClasses(horizontal)}>
        <span aria-hidden="true" className={sliderRailClasses(horizontal)} />
        <span
          aria-hidden="true"
          className={sliderFillClasses(horizontal)}
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
            className={sliderInputClasses({
              horizontal,
              multiThumb: values.length > 1,
              disabled,
            })}
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
