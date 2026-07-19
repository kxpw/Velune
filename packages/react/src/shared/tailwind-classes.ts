import type { BoxSpacing } from "../box";
import type { FlexAlign, FlexJustify } from "../flex";

export const paddingClasses: Record<BoxSpacing, string> = {
  "0": "p-0",
  "1": "p-1",
  "2": "p-2",
  "3": "p-3",
  "4": "p-4",
  "5": "p-5",
  "6": "p-6",
  "7": "p-7",
  "8": "p-8",
  "9": "p-9",
  "10": "p-10",
  "11": "p-11",
  "12": "p-12",
  "16": "p-16",
  "20": "p-20",
};

export const marginClasses: Record<BoxSpacing, string> = {
  "0": "m-0",
  "1": "m-1",
  "2": "m-2",
  "3": "m-3",
  "4": "m-4",
  "5": "m-5",
  "6": "m-6",
  "7": "m-7",
  "8": "m-8",
  "9": "m-9",
  "10": "m-10",
  "11": "m-11",
  "12": "m-12",
  "16": "m-16",
  "20": "m-20",
};

export const gapClasses: Record<BoxSpacing, string> = {
  "0": "gap-0",
  "1": "gap-1",
  "2": "gap-2",
  "3": "gap-3",
  "4": "gap-4",
  "5": "gap-5",
  "6": "gap-6",
  "7": "gap-7",
  "8": "gap-8",
  "9": "gap-9",
  "10": "gap-10",
  "11": "gap-11",
  "12": "gap-12",
  "16": "gap-16",
  "20": "gap-20",
};

export const alignItemsClasses: Record<FlexAlign, string> = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
  baseline: "items-baseline",
};

export const justifyContentClasses: Record<FlexJustify, string> = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
  around: "justify-around",
  evenly: "justify-evenly",
};
