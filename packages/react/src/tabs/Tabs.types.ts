import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";

export type TabsOrientation = "horizontal" | "vertical";
export type TabsVariant = "underline" | "block";
export type TabsValue = string;

export interface TabsProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "onChange"
> {
  value?: TabsValue;
  defaultValue?: TabsValue;
  onValueChange?: (value: TabsValue) => void;
  orientation?: TabsOrientation;
  /** Visual treatment. Default: `underline`. */
  variant?: TabsVariant;
  /** Activate tab on focus (arrow keys). Default: `true`. */
  activationMode?: "automatic" | "manual";
  children?: ReactNode;
}

export interface TabsListProps extends HTMLAttributes<HTMLDivElement> {
  /** Stretch the header to its container and distribute tabs evenly. */
  fullWidth?: boolean;
  children?: ReactNode;
}

export interface TabsTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  value: TabsValue;
  children?: ReactNode;
}

export interface TabsPanelProps extends HTMLAttributes<HTMLDivElement> {
  value: TabsValue;
  children?: ReactNode;
  /** Keep panel mounted when inactive. Default: `false`. */
  forceMount?: boolean;
}
