import type { HTMLAttributes, ReactElement, ReactNode } from "react";
import type {
  HeaderProps,
  Key,
  MenuItemProps,
  MenuProps,
  MenuSectionProps,
  Selection,
  SeparatorProps,
} from "react-aria-components";
import type { PopoverPlacement } from "../popover";

export type DropdownSelectionMode = "none" | "single" | "multiple";
export type DropdownSelectedKeys = Selection;

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
  MenuProps<object>,
  | "children"
  | "className"
  | "style"
  | "selectionMode"
  | "selectedKeys"
  | "defaultSelectedKeys"
  | "onSelectionChange"
  | "onAction"
> {
  children?: ReactNode;
  /** Accessible menu name when the trigger does not provide one. */
  "aria-label"?: string;
  selectionMode?: DropdownSelectionMode;
  selectedKeys?: Iterable<Key> | "all";
  defaultSelectedKeys?: Iterable<Key> | "all";
  onSelectionChange?: (keys: Selection) => void;
  onAction?: (key: Key) => void;
  /** Default: false for multiple selection, true otherwise. */
  closeOnSelect?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export interface DropdownItemProps extends Omit<
  MenuItemProps<object>,
  | "children"
  | "id"
  | "className"
  | "textValue"
  | "isDisabled"
  | "href"
  | "target"
  | "onAction"
  | "shouldCloseOnSelect"
> {
  id: Key;
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
  MenuSectionProps<object>,
  "children" | "className"
> {
  children?: ReactNode;
  className?: string;
}

export type DropdownSectionTitleProps = HeaderProps;
export type DropdownSeparatorProps = SeparatorProps;
export type DropdownItemLeadingProps = HTMLAttributes<HTMLSpanElement>;
export type DropdownItemDescriptionProps = HTMLAttributes<HTMLSpanElement>;
export type DropdownItemTrailingProps = HTMLAttributes<HTMLSpanElement>;
