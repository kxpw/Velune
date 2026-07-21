import type { HTMLAttributes, ReactElement, ReactNode } from "react";
import type { PopoverPlacement } from "../popover";

/** Selection key for menu items. */
export type DropdownKey = string | number;
/** Either every item or an explicit set of item keys. */
export type DropdownSelection = "all" | Set<DropdownKey>;

export type DropdownSelectionMode = "none" | "single" | "multiple";
export type DropdownSelectedKeys = DropdownSelection;

export interface DropdownProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "children" | "onChange"
> {
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: PopoverPlacement;
  offset?: number;
  disabled?: boolean;
  portal?: boolean;
  /** Stretch the trigger and menu to their parent width. Default: `true`. */
  fullWidth?: boolean;
}

export interface DropdownTriggerProps {
  children: ReactElement;
  className?: string;
  style?: React.CSSProperties;
}

export interface DropdownMenuProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "children" | "onSelect"
> {
  children?: ReactNode;
  /** Accessible menu name when the trigger does not provide one. */
  "aria-label"?: string;
  selectionMode?: DropdownSelectionMode;
  selectedKeys?: Iterable<DropdownKey> | "all";
  defaultSelectedKeys?: Iterable<DropdownKey> | "all";
  onSelectionChange?: (keys: DropdownSelection) => void;
  onAction?: (key: DropdownKey) => void;
  /** Default: false for multiple selection, true otherwise. */
  closeOnSelect?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export interface DropdownItemProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "children" | "id" | "className" | "onSelect"
> {
  /** Selection key for the item. Matches the `value` naming used by Select. */
  value?: DropdownKey;
  /** @deprecated Use `value` instead. */
  id?: DropdownKey;
  children?: ReactNode;
  textValue?: string;
  disabled?: boolean;
  tone?: "default" | "danger";
  href?: string;
  target?: string;
  onAction?: () => void;
  closeOnSelect?: boolean;
  className?: string;
}

export interface DropdownSectionProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "children" | "className"
> {
  children?: ReactNode;
  className?: string;
}

export type DropdownSectionTitleProps = HTMLAttributes<HTMLElement>;
export type DropdownSeparatorProps = HTMLAttributes<HTMLDivElement>;
export type DropdownItemLeadingProps = HTMLAttributes<HTMLSpanElement>;
export type DropdownItemDescriptionProps = HTMLAttributes<HTMLSpanElement>;
export type DropdownItemTrailingProps = HTMLAttributes<HTMLSpanElement>;
