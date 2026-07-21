import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

export type SliderOrientation = "horizontal" | "vertical";

/** A single value or one value per thumb for range selection. */
export type SliderValue = number | number[];

export interface SliderProps {
  /** Controlled value. Pass an array for a multi-thumb range. */
  value?: SliderValue;
  defaultValue?: SliderValue;
  /** Fires on every value change while dragging or pressing keys. */
  onValueChange?: (value: SliderValue) => void;
  /** Fires once interaction settles (pointer up / key release). */
  onValueChangeEnd?: (value: SliderValue) => void;
  /** Default: `0`. */
  min?: number;
  /** Default: `100`. */
  max?: number;
  /** Default: `1`. */
  step?: number;
  disabled?: boolean;
  /** Default: `"horizontal"`. */
  orientation?: SliderOrientation;
  /** Formats the output and thumb value labels. */
  formatOptions?: Intl.NumberFormatOptions;
  id?: string;
  className?: string;
  style?: CSSProperties;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  /** `Slider.Label` and `Slider.Output` slots. */
  children?: ReactNode;
}

export interface SliderLabelProps extends HTMLAttributes<HTMLSpanElement> {
  children?: ReactNode;
}

export interface SliderOutputProps extends HTMLAttributes<HTMLOutputElement> {
  /** Custom output content. Defaults to the formatted value(s). */
  children?: ReactNode;
}
