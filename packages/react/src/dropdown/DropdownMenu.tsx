import { useEffect, useRef, type ReactNode } from "react";
import { clsx } from "clsx";
import {
  Header,
  Menu,
  MenuItem,
  MenuSection,
  Separator,
} from "react-aria-components";
import {
  collectCompoundSlotProps,
  dispatchCompoundSlots,
} from "../shared/compound-slot";
import type {
  DropdownItemDescriptionProps,
  DropdownItemLeadingProps,
  DropdownItemProps,
  DropdownItemTrailingProps,
  DropdownMenuProps,
  DropdownSectionProps,
  DropdownSectionTitleProps,
  DropdownSeparatorProps,
} from "./Dropdown.types";

type ItemComposition = {
  leading?: DropdownItemLeadingProps;
  description?: DropdownItemDescriptionProps;
  trailing?: DropdownItemTrailingProps;
};

const itemSlotSchema = {
  "Dropdown.Item.Leading": "leading",
  "Dropdown.Item.Description": "description",
  "Dropdown.Item.Trailing": "trailing",
} as const satisfies Readonly<Record<string, keyof ItemComposition>>;

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3 8.25L6.25 11.5L13 4.75"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function itemSlotSchemaToHandlers() {
  return {
    "Dropdown.Item.Leading": () => {},
    "Dropdown.Item.Description": () => {},
    "Dropdown.Item.Trailing": () => {},
  };
}

function renderItem(
  props: DropdownItemProps,
  closeMenu: () => void,
  menuCloseOnSelect: boolean,
) {
  const {
    id,
    children,
    textValue,
    disabled = false,
    tone = "default",
    href,
    target,
    onAction,
    closeOnSelect = menuCloseOnSelect,
    className,
    ...itemProps
  } = props;
  const { leading, description, trailing } =
    collectCompoundSlotProps<ItemComposition>(children, itemSlotSchema);
  const label: ReactNode[] = [];
  dispatchCompoundSlots(children, itemSlotSchemaToHandlers(), (child) =>
    label.push(child),
  );

  return (
    <MenuItem
      {...itemProps}
      key={String(id)}
      id={id}
      {...(textValue !== undefined ? { textValue } : {})}
      isDisabled={disabled}
      {...(href !== undefined ? { href } : {})}
      {...(target !== undefined ? { target } : {})}
      shouldCloseOnSelect={false}
      onAction={() => {
        onAction?.();
        if (closeOnSelect) closeMenu();
      }}
      data-tone={tone}
      className={({ isDisabled, isFocused, isSelected }) =>
        clsx(
          "gs-dropdown-item relative m-0 grid min-h-gs-control-hit-target cursor-pointer items-center gap-x-3 rounded-gs-xs px-3 py-2 text-start text-sm leading-gs-normal outline-none transition-colors duration-150 ease-gs-standard motion-reduce:transition-none",
          leading?.children != null
            ? "grid-cols-[1rem_minmax(0,1fr)_auto]"
            : "grid-cols-[minmax(0,1fr)_auto]",
          tone === "default" && "text-gs-text",
          tone === "danger" && "text-gs-error",
          isSelected &&
            !isFocused &&
            tone === "default" &&
            "bg-gs-action-active",
          isSelected && !isFocused && tone === "danger" && "bg-gs-error-subtle",
          isFocused && tone === "default" && "bg-gs-action-hover",
          isFocused && tone === "danger" && "bg-gs-error-subtle",
          isDisabled
            ? "cursor-not-allowed text-gs-text-disabled opacity-gs-disabled"
            : "cursor-pointer",
          className,
        )
      }
    >
      {({ isSelected }) => (
        <>
          {leading?.children != null ? (
            <span
              {...leading}
              className={clsx(
                "gs-dropdown-item-leading inline-flex size-4 shrink-0 items-center justify-center text-gs-text-secondary [&>*]:block [&>*]:size-full",
                tone === "danger" && "text-current",
                leading.className,
              )}
            >
              {leading.children}
            </span>
          ) : null}
          <span className="gs-dropdown-item-content min-w-0">
            <span className="gs-dropdown-item-label block overflow-hidden text-ellipsis whitespace-nowrap font-medium">
              {label}
            </span>
            {description?.children != null ? (
              <span
                {...description}
                className={clsx(
                  "gs-dropdown-item-description mt-0.5 block text-xs font-normal leading-gs-normal text-gs-text-secondary",
                  description.className,
                )}
              >
                {description.children}
              </span>
            ) : null}
          </span>
          {trailing?.children != null || isSelected ? (
            <span className="gs-dropdown-item-end inline-flex items-center justify-end gap-2 text-xs text-gs-text-secondary">
              {trailing?.children != null ? (
                <span
                  {...trailing}
                  className={clsx(
                    "gs-dropdown-item-trailing inline-flex items-center justify-end whitespace-nowrap",
                    trailing.className,
                  )}
                >
                  {trailing.children}
                </span>
              ) : null}
              {isSelected ? (
                <span
                  className="gs-dropdown-item-indicator inline-flex size-4 shrink-0 items-center justify-center text-gs-border-focus [&_svg]:size-full"
                  aria-hidden="true"
                >
                  <CheckIcon />
                </span>
              ) : null}
            </span>
          ) : null}
        </>
      )}
    </MenuItem>
  );
}

function renderMenuChildren(
  children: ReactNode,
  closeMenu: () => void,
  closeOnSelect: boolean,
): ReactNode[] {
  const result: ReactNode[] = [];
  dispatchCompoundSlots(
    children,
    {
      "Dropdown.Item": (child) => {
        result.push(
          renderItem(
            child.props as DropdownItemProps,
            closeMenu,
            closeOnSelect,
          ),
        );
      },
      "Dropdown.Section": (child) => {
        const section = child.props as DropdownSectionProps;
        let title: DropdownSectionTitleProps | undefined;
        const items: DropdownItemProps[] = [];
        dispatchCompoundSlots(section.children, {
          "Dropdown.SectionTitle": (sectionChild) => {
            title = sectionChild.props as DropdownSectionTitleProps;
          },
          "Dropdown.Item": (sectionChild) => {
            items.push(sectionChild.props as DropdownItemProps);
          },
        });
        result.push(
          <MenuSection
            {...section}
            key={`section-${result.length}`}
            className={clsx(
              "gs-dropdown-section grid gap-0.5",
              section.className,
            )}
          >
            {title?.children != null ? (
              <Header
                {...title}
                className={clsx(
                  "gs-dropdown-section-title px-3 pb-1 pt-2 text-xs font-medium text-gs-text-secondary",
                  title.className,
                )}
              >
                {title.children}
              </Header>
            ) : null}
            {items.map((item) => renderItem(item, closeMenu, closeOnSelect))}
          </MenuSection>,
        );
      },
      "Dropdown.Separator": (child) => {
        const separator = child.props as DropdownSeparatorProps;
        result.push(
          <Separator
            {...separator}
            key={`separator-${result.length}`}
            className={clsx(
              "gs-dropdown-separator mx-2 my-1 h-px border-0 bg-gs-default",
              separator.className,
            )}
          />,
        );
      },
    },
    () => {},
  );
  return result;
}

export type DropdownMenuContentProps = {
  menu: DropdownMenuProps;
  labelledBy?: string;
  closeMenu: () => void;
  closeOnSelect: boolean;
  autoFocus: "first" | "last";
};

export default function DropdownMenuContent({
  menu,
  labelledBy,
  closeMenu,
  closeOnSelect,
  autoFocus,
}: DropdownMenuContentProps) {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const {
    children,
    selectionMode = "none",
    selectedKeys,
    defaultSelectedKeys,
    onSelectionChange,
    onAction,
    "aria-label": ariaLabel,
    closeOnSelect: _closeOnSelect,
    className,
    style: _style,
    ...menuProps
  } = menu;
  void _closeOnSelect;
  void _style;

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const items = menuRef.current?.querySelectorAll<HTMLElement>(
        '[role^="menuitem"]:not([aria-disabled="true"])',
      );
      const target =
        autoFocus === "last" ? items?.[items.length - 1] : items?.[0];
      target?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [autoFocus]);

  return (
    <Menu
      ref={menuRef}
      {...menuProps}
      {...(ariaLabel !== undefined ? { "aria-label": ariaLabel } : {})}
      {...(labelledBy !== undefined ? { "aria-labelledby": labelledBy } : {})}
      selectionMode={selectionMode}
      {...(selectedKeys !== undefined ? { selectedKeys } : {})}
      {...(defaultSelectedKeys !== undefined ? { defaultSelectedKeys } : {})}
      {...(onSelectionChange !== undefined ? { onSelectionChange } : {})}
      onAction={(key) => onAction?.(key)}
      className={clsx(
        "gs-dropdown-menu grid max-h-[min(24rem,calc(100vh-var(--space-8)))] min-w-0 gap-0.5 overflow-y-auto outline-none",
        className,
      )}
    >
      {renderMenuChildren(children, closeMenu, closeOnSelect)}
    </Menu>
  );
}
