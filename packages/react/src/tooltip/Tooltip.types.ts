import type { HTMLAttributes, ReactElement, ReactNode } from "react";
import type { Placement } from "../shared/position";

export type TooltipPlacement = Placement;
export type TooltipTrigger = "hover" | "focus" | "click" | "manual";

export type TooltipDelay = number | { open?: number; close?: number };

export interface TooltipProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "content"
> {
  children: ReactNode;
  /** Preferred placement. Default: `top`. */
  placement?: TooltipPlacement;
  /** Controlled open state. */
  open?: boolean;
  /** Uncontrolled initial open state. */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /**
   * Interaction that shows the tooltip.
   * Default: `["hover", "focus"]`. Use `"manual"` with controlled `open`.
   */
  trigger?: TooltipTrigger | TooltipTrigger[];
  /** Open/close delay in ms. Default open `400`, close `100`. */
  delay?: TooltipDelay;
  /** Window after close where another tooltip opens immediately. Default: `300`. */
  skipDelayDuration?: number;
  /** Called for Escape before dismissal. Prevent to keep the tooltip open. */
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  /** Disable the tooltip entirely. */
  disabled?: boolean;
  /** Render in a portal. Default: `true`. */
  portal?: boolean;
  /** Gap between trigger and tooltip in px. Default uses token. */
  offset?: number;
}

export interface TooltipTriggerProps {
  children: ReactElement;
}

export type TooltipContentProps = HTMLAttributes<HTMLDivElement>;
