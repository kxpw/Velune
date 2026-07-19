import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";

export type CollapseType = "single" | "multiple";
export type CollapseVariant = "filled" | "plain";
export type CollapseValue = string;
export type CollapseOrientation = "horizontal" | "vertical";
export type CollapseDirection = "ltr" | "rtl";

interface CollapseBaseProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "onChange"
> {
  /** Visual treatment. Default: `filled`. */
  variant?: CollapseVariant;
  /** Keyboard and layout axis. Default: `vertical`. */
  orientation?: CollapseOrientation;
  /** Reading direction used by horizontal arrow navigation. Default: `ltr`. */
  dir?: CollapseDirection;
  /** Disable every item in the group. */
  disabled?: boolean;
  children?: ReactNode;
}

export interface CollapseSingleProps extends CollapseBaseProps {
  type?: "single";
  /** Controlled open item. */
  value?: CollapseValue;
  defaultValue?: CollapseValue;
  onValueChange?: (value: CollapseValue) => void;
  /** Allow closing the open item. Default: `true`. */
  collapsible?: boolean;
}

export interface CollapseMultipleProps extends CollapseBaseProps {
  type: "multiple";
  /** Controlled open items. */
  value?: CollapseValue[];
  defaultValue?: CollapseValue[];
  onValueChange?: (value: CollapseValue[]) => void;
  collapsible?: never;
}

export type CollapseProps = CollapseSingleProps | CollapseMultipleProps;

export interface CollapseItemProps extends HTMLAttributes<HTMLDivElement> {
  value: CollapseValue;
  disabled?: boolean;
  children?: ReactNode;
}

export interface CollapseTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
}

export interface CollapseContentProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  forceMount?: boolean;
}
