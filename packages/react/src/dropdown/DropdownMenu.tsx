import type { KeyboardEvent, MouseEvent, ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { clsx } from "clsx";
import { useControllableState } from "@velune/hooks";
import {
  collectCompoundSlotProps,
  dispatchCompoundSlots,
} from "../shared/compound-slot";
import type {
  DropdownItemDescriptionProps,
  DropdownItemLeadingProps,
  DropdownItemProps,
  DropdownItemTrailingProps,
  DropdownKey,
  DropdownMenuProps,
  DropdownSectionProps,
  DropdownSectionTitleProps,
  DropdownSelection,
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

const itemRoleForMode = {
  none: "menuitem",
  single: "menuitemradio",
  multiple: "menuitemcheckbox",
} as const;

type MenuBehavior = {
  selectionMode: "none" | "single" | "multiple";
  isSelected: (key: DropdownKey) => boolean;
  activate: (key: DropdownKey, item: DropdownItemProps) => void;
};

function renderItem(props: DropdownItemProps, behavior: MenuBehavior) {
  const {
    value,
    id,
    children,
    textValue: _textValue,
    disabled = false,
    tone = "default",
    href,
    target,
    onAction: _onAction,
    closeOnSelect: _closeOnSelect,
    className,
    ...itemProps
  } = props;
  void _textValue;
  void _onAction;
  void _closeOnSelect;
  const itemKey = value ?? id;
  if (itemKey === undefined) {
    throw new Error("Dropdown.Item requires a `value` prop.");
  }
  const { leading, description, trailing } =
    collectCompoundSlotProps<ItemComposition>(children, itemSlotSchema);
  const label: ReactNode[] = [];
  dispatchCompoundSlots(children, itemSlotSchemaToHandlers(), (child) =>
    label.push(child),
  );
  const selected = behavior.isSelected(itemKey);
  const role = itemRoleForMode[behavior.selectionMode];

  const sharedProps = {
    ...itemProps,
    role,
    tabIndex: -1,
    "data-tone": tone,
    ...(behavior.selectionMode !== "none" ? { "aria-checked": selected } : {}),
    ...(disabled ? { "aria-disabled": true as const } : {}),
    className: clsx(
      "gs-dropdown-item relative m-0 grid min-h-gs-control-hit-target items-center gap-x-3 rounded-gs-xs px-3 py-2 text-start text-sm leading-gs-normal no-underline outline-none transition-colors duration-150 ease-gs-standard motion-reduce:transition-none",
      leading?.children != null
        ? "grid-cols-[1rem_minmax(0,1fr)_auto]"
        : "grid-cols-[minmax(0,1fr)_auto]",
      tone === "default" &&
        "text-gs-text focus:bg-gs-action-hover data-[selected=true]:not-focus:bg-gs-action-active",
      tone === "danger" &&
        "text-gs-error focus:bg-gs-error-subtle data-[selected=true]:bg-gs-error-subtle",
      disabled
        ? "cursor-not-allowed text-gs-text-disabled opacity-gs-disabled"
        : "cursor-pointer",
      className,
    ),
    "data-selected": selected ? "true" : undefined,
    onClick: (event: MouseEvent<HTMLElement>) => {
      if (disabled) {
        event.preventDefault();
        return;
      }
      behavior.activate(itemKey, props);
    },
    // Menus use "hover moves focus" semantics so focus and hover styling
    // stay unified, matching the previous library behavior.
    onMouseEnter: (event: MouseEvent<HTMLElement>) => {
      if (!disabled) event.currentTarget.focus();
    },
    children: (
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
        {trailing?.children != null || selected ? (
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
            {selected ? (
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
    ),
  };

  if (href !== undefined && !disabled) {
    return (
      <a
        key={String(itemKey)}
        {...sharedProps}
        href={href}
        {...(target !== undefined ? { target } : {})}
      />
    );
  }
  return <div key={String(itemKey)} {...sharedProps} />;
}

function renderMenuChildren(
  children: ReactNode,
  behavior: MenuBehavior,
): ReactNode[] {
  const result: ReactNode[] = [];
  dispatchCompoundSlots(
    children,
    {
      "Dropdown.Item": (child) => {
        result.push(renderItem(child.props as DropdownItemProps, behavior));
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
        const { children: _sectionChildren, ...sectionProps } = section;
        void _sectionChildren;
        result.push(
          <div
            {...sectionProps}
            key={`section-${result.length}`}
            role="group"
            className={clsx(
              "gs-dropdown-section grid gap-0.5",
              section.className,
            )}
          >
            {title?.children != null ? (
              <span
                {...title}
                role="presentation"
                className={clsx(
                  "gs-dropdown-section-title px-3 pb-1 pt-2 text-xs font-medium text-gs-text-secondary",
                  title.className,
                )}
              >
                {title.children}
              </span>
            ) : null}
            {items.map((item) => renderItem(item, behavior))}
          </div>,
        );
      },
      "Dropdown.Separator": (child) => {
        const separator = child.props as DropdownSeparatorProps;
        result.push(
          <div
            {...separator}
            key={`separator-${result.length}`}
            role="separator"
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

function normalizeSelection(
  keys: Iterable<DropdownKey> | "all" | undefined,
): DropdownSelection | undefined {
  if (keys === undefined) return undefined;
  return keys === "all" ? "all" : new Set(keys);
}

function collectAllKeys(children: ReactNode): DropdownKey[] {
  const keys: DropdownKey[] = [];
  const pushItemKey = (props: DropdownItemProps) => {
    const key = props.value ?? props.id;
    if (key !== undefined) keys.push(key);
  };
  dispatchCompoundSlots(
    children,
    {
      "Dropdown.Item": (child) => pushItemKey(child.props as DropdownItemProps),
      "Dropdown.Section": (child) => {
        dispatchCompoundSlots(
          (child.props as DropdownSectionProps).children,
          {
            "Dropdown.Item": (sectionChild) =>
              pushItemKey(sectionChild.props as DropdownItemProps),
          },
          () => {},
        );
      },
      "Dropdown.Separator": () => {},
    },
    () => {},
  );
  return keys;
}

export type DropdownMenuContentProps = {
  menu: DropdownMenuProps;
  labelledBy?: string;
  closeMenu: () => void;
  closeOnSelect: boolean;
  autoFocus: "first" | "last";
};

function getEnabledItems(menu: HTMLElement | null): HTMLElement[] {
  if (!menu) return [];
  return Array.from(
    menu.querySelectorAll<HTMLElement>(
      '[role^="menuitem"]:not([aria-disabled="true"])',
    ),
  );
}

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

  const [selection, setSelection] = useControllableState<DropdownSelection>({
    value: normalizeSelection(selectedKeys),
    defaultValue: normalizeSelection(defaultSelectedKeys) ?? new Set(),
    onChange: onSelectionChange,
  });

  const behavior = useMemo<MenuBehavior>(
    () => ({
      selectionMode,
      isSelected: (key) =>
        selectionMode !== "none" &&
        (selection === "all" ? true : selection.has(key)),
      activate: (key, item) => {
        if (selectionMode === "single") {
          setSelection(new Set([key]));
        } else if (selectionMode === "multiple") {
          const next =
            selection === "all"
              ? new Set(collectAllKeys(children))
              : new Set(selection);
          if (next.has(key)) next.delete(key);
          else next.add(key);
          setSelection(next);
        }
        item.onAction?.();
        onAction?.(key);
        if (item.closeOnSelect ?? closeOnSelect) closeMenu();
      },
    }),
    [
      children,
      closeMenu,
      closeOnSelect,
      onAction,
      selection,
      selectionMode,
      setSelection,
    ],
  );

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const items = getEnabledItems(menuRef.current);
      const target = autoFocus === "last" ? items[items.length - 1] : items[0];
      target?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [autoFocus]);

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
    const items = getEnabledItems(menuRef.current);
    if (items.length === 0) return;
    const currentIndex = items.findIndex(
      (item) => item === document.activeElement,
    );

    const focusAt = (index: number) => {
      event.preventDefault();
      items[(index + items.length) % items.length]?.focus();
    };

    switch (event.key) {
      case "ArrowDown":
        focusAt(currentIndex + 1);
        break;
      case "ArrowUp":
        focusAt(currentIndex - 1);
        break;
      case "Home":
        focusAt(0);
        break;
      case "End":
        focusAt(items.length - 1);
        break;
      case "Enter":
      case " ":
        if (currentIndex >= 0) {
          event.preventDefault();
          items[currentIndex]?.click();
        }
        break;
      default:
        break;
    }
  }, []);

  return (
    <div
      ref={menuRef}
      {...menuProps}
      role="menu"
      {...(ariaLabel !== undefined ? { "aria-label": ariaLabel } : {})}
      {...(labelledBy !== undefined ? { "aria-labelledby": labelledBy } : {})}
      className={clsx(
        "gs-dropdown-menu grid max-h-[min(24rem,calc(100vh-var(--space-8)))] min-w-0 gap-0.5 overflow-y-auto outline-none",
        className,
      )}
      onKeyDown={handleKeyDown}
    >
      {renderMenuChildren(children, behavior)}
    </div>
  );
}
