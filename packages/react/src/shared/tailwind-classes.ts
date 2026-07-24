import type { BoxSpacing } from "../box";
import type { FlexAlign, FlexJustify } from "../flex";

export const paddingClasses: Record<BoxSpacing, string> = {
  "0": "p-gs-0",
  "1": "p-gs-1",
  "2": "p-gs-2",
  "3": "p-gs-3",
  "4": "p-gs-4",
  "5": "p-gs-5",
  "6": "p-gs-6",
  "7": "p-gs-7",
  "8": "p-gs-8",
  "9": "p-gs-9",
  "10": "p-gs-10",
  "11": "p-gs-11",
  "12": "p-gs-12",
  "16": "p-gs-16",
  "20": "p-gs-20",
};

export const marginClasses: Record<BoxSpacing, string> = {
  "0": "m-gs-0",
  "1": "m-gs-1",
  "2": "m-gs-2",
  "3": "m-gs-3",
  "4": "m-gs-4",
  "5": "m-gs-5",
  "6": "m-gs-6",
  "7": "m-gs-7",
  "8": "m-gs-8",
  "9": "m-gs-9",
  "10": "m-gs-10",
  "11": "m-gs-11",
  "12": "m-gs-12",
  "16": "m-gs-16",
  "20": "m-gs-20",
};

export const gapClasses: Record<BoxSpacing, string> = {
  "0": "gap-gs-0",
  "1": "gap-gs-1",
  "2": "gap-gs-2",
  "3": "gap-gs-3",
  "4": "gap-gs-4",
  "5": "gap-gs-5",
  "6": "gap-gs-6",
  "7": "gap-gs-7",
  "8": "gap-gs-8",
  "9": "gap-gs-9",
  "10": "gap-gs-10",
  "11": "gap-gs-11",
  "12": "gap-gs-12",
  "16": "gap-gs-16",
  "20": "gap-gs-20",
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
