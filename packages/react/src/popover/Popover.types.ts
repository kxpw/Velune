import type { HTMLAttributes, ReactElement, ReactNode } from "react";
import type { Placement } from "../shared/position";

export type PopoverPlacement = Placement;

export interface PopoverProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "content"
> {
  children: ReactNode;
  /** Preferred placement. Default: `bottom`. */
  placement?: PopoverPlacement;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Render in a portal. Default: `true`. */
  portal?: boolean;
  /** Close when clicking outside. Default: `true`. */
  closeOnOutsideClick?: boolean;
  /** Close on Escape. Default: `true`. */
  closeOnEscape?: boolean;
  /** Called before focus enters newly opened content. Prevent to keep focus. */
  onOpenAutoFocus?: (event: Event) => void;
  /** Called before focus returns to the trigger after close. */
  onCloseAutoFocus?: (event: Event) => void;
  /** Called for Escape before dismissal. Prevent to keep the popover open. */
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  /** Gap between trigger and panel in px. */
  offset?: number;
  /** Disable the popover. */
  disabled?: boolean;
}

export interface PopoverTriggerProps {
  children: ReactElement;
  className?: string;
  style?: React.CSSProperties;
}

export type PopoverContentProps = HTMLAttributes<HTMLDivElement>;
