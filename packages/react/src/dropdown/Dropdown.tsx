import type {
  FocusEvent,
  ForwardedRef,
  KeyboardEvent,
  MouseEvent,
  PointerEvent,
  ReactElement,
} from "react";
import { forwardRef, lazy, Suspense, useId, useState } from "react";
import { useControllableState } from "@velune/hooks";
import { clsx } from "clsx";
import { Popover } from "../popover";
import {
  collectCompoundSlotProps,
  createCompoundSlot,
} from "../shared/compound-slot";
import { Slot } from "../shared/slot";
import { dropdownClasses, dropdownTriggerClasses } from "./Dropdown.classes";
import type {
  DropdownItemDescriptionProps,
  DropdownItemLeadingProps,
  DropdownItemProps,
  DropdownItemTrailingProps,
  DropdownMenuProps,
  DropdownProps,
  DropdownSectionProps,
  DropdownSectionTitleProps,
  DropdownSeparatorProps,
  DropdownTriggerProps,
} from "./Dropdown.types";

type DropdownComposition = {
  trigger?: DropdownTriggerProps;
  menu?: DropdownMenuProps;
};

const rootSlotSchema = {
  "Dropdown.Trigger": "trigger",
  "Dropdown.Menu": "menu",
} as const satisfies Readonly<Record<string, keyof DropdownComposition>>;

const nativeDisabledElements = new Set([
  "button",
  "input",
  "select",
  "textarea",
]);

function supportsDisabledProp(element: ReactElement): boolean {
  if (typeof element.type === "string") {
    return nativeDisabledElements.has(element.type);
  }
  const type = element.type as { displayName?: string };
  return (
    type.displayName === "Button" ||
    Object.prototype.hasOwnProperty.call(element.props, "disabled")
  );
}

const loadDropdownMenu = () => import("./DropdownMenu");
const DropdownMenuContent = lazy(loadDropdownMenu);

function DropdownImpl(
  {
    children,
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    placement = "bottom-start",
    offset = 6,
    disabled = false,
    portal = true,
    fullWidth = false,
    className,
    ...props
  }: DropdownProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const { trigger, menu } = collectCompoundSlotProps<DropdownComposition>(
    children,
    rootSlotSchema,
  );
  const [open, setOpen] = useControllableState({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const [focusStrategy, setFocusStrategy] = useState<"first" | "last">("first");
  const generatedTriggerId = useId();
  const selectionMode = menu?.selectionMode ?? "none";
  const closeOnSelect = menu?.closeOnSelect ?? selectionMode !== "multiple";
  const triggerElement = trigger?.children;
  if (!triggerElement || !menu) return null;
  const triggerProps = triggerElement.props as {
    id?: string;
    disabled?: boolean;
    tabIndex?: number;
    onClick?: (event: MouseEvent<HTMLElement>) => void;
    onFocus?: (event: FocusEvent<HTMLElement>) => void;
    onKeyDown?: (event: KeyboardEvent<HTMLElement>) => void;
    onPointerEnter?: (event: PointerEvent<HTMLElement>) => void;
    "aria-disabled"?: boolean | "true" | "false";
    "data-disabled"?: string;
  };
  const triggerId = triggerProps.id ?? `${generatedTriggerId}-trigger`;
  const triggerDisabled = Boolean(
    disabled ||
    triggerProps.disabled ||
    triggerProps["aria-disabled"] === true ||
    triggerProps["aria-disabled"] === "true",
  );
  const triggerSupportsDisabled = supportsDisabledProp(triggerElement);

  const {
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    style: menuStyle,
  } = menu;
  const menuLabelledBy =
    ariaLabelledBy ?? (ariaLabel === undefined ? triggerId : undefined);

  return (
    <Popover
      {...props}
      ref={ref}
      open={open}
      onOpenChange={setOpen}
      placement={placement}
      offset={offset}
      disabled={triggerDisabled}
      portal={portal}
      className={clsx(dropdownClasses({ fullWidth }), className)}
    >
      <Popover.Trigger
        className={clsx(
          dropdownTriggerClasses({
            fullWidth,
            disabled: triggerDisabled,
          }),
          trigger.className,
        )}
        {...(trigger.style !== undefined ? { style: trigger.style } : {})}
      >
        <Slot
          id={triggerId}
          {...(triggerSupportsDisabled ? { disabled: triggerDisabled } : {})}
          {...(triggerDisabled && !triggerSupportsDisabled
            ? { tabIndex: -1 }
            : {})}
          aria-haspopup="menu"
          {...(triggerDisabled ? { "aria-disabled": true } : {})}
          {...(triggerDisabled ? { "data-disabled": "" } : {})}
          // Capture-phase guards keep a disabled trigger inert even when the
          // child element cannot take a native `disabled` attribute.
          onClickCapture={(event: MouseEvent<HTMLElement>) => {
            if (triggerDisabled) {
              event.preventDefault();
              event.stopPropagation();
            }
          }}
          onKeyDownCapture={(event: KeyboardEvent<HTMLElement>) => {
            if (triggerDisabled) {
              if (
                event.key === "Enter" ||
                event.key === " " ||
                event.key === "ArrowDown" ||
                event.key === "ArrowUp"
              ) {
                event.preventDefault();
              }
              event.stopPropagation();
            }
          }}
          onFocus={() => {
            void loadDropdownMenu();
          }}
          onPointerEnter={() => {
            void loadDropdownMenu();
          }}
          onClick={(event: MouseEvent<HTMLElement>) => {
            if (triggerDisabled || event.defaultPrevented) {
              return;
            }
            void loadDropdownMenu();
            setFocusStrategy("first");
          }}
          onKeyDown={(event: KeyboardEvent<HTMLElement>) => {
            if (
              triggerDisabled ||
              event.defaultPrevented ||
              (event.key !== "ArrowDown" && event.key !== "ArrowUp")
            ) {
              return;
            }
            event.preventDefault();
            void loadDropdownMenu();
            setFocusStrategy(event.key === "ArrowUp" ? "last" : "first");
            setOpen(true);
          }}
        >
          {triggerElement as ReactElement}
        </Slot>
      </Popover.Trigger>
      <Popover.Content
        role="presentation"
        style={{
          width: fullWidth
            ? "var(--gs-popover-trigger-width, 100%)"
            : "clamp(13rem, var(--gs-popover-trigger-width, 13rem), 22rem)",
          ...menuStyle,
        }}
      >
        {open ? (
          <Suspense fallback={null}>
            <DropdownMenuContent
              menu={menu}
              {...(menuLabelledBy !== undefined
                ? { labelledBy: menuLabelledBy }
                : {})}
              closeMenu={() => setOpen(false)}
              closeOnSelect={closeOnSelect}
              autoFocus={focusStrategy}
            />
          </Suspense>
        ) : null}
      </Popover.Content>
    </Popover>
  );
}

const DropdownRoot = forwardRef(DropdownImpl);
DropdownRoot.displayName = "Dropdown";

const DropdownTrigger =
  createCompoundSlot<DropdownTriggerProps>("Dropdown.Trigger");
const DropdownMenu = createCompoundSlot<DropdownMenuProps>("Dropdown.Menu");
const DropdownItemRoot = createCompoundSlot<DropdownItemProps>("Dropdown.Item");
const DropdownItemLeading = createCompoundSlot<DropdownItemLeadingProps>(
  "Dropdown.Item.Leading",
);
const DropdownItemDescription =
  createCompoundSlot<DropdownItemDescriptionProps>("Dropdown.Item.Description");
const DropdownItemTrailing = createCompoundSlot<DropdownItemTrailingProps>(
  "Dropdown.Item.Trailing",
);
const DropdownItem = Object.assign(DropdownItemRoot, {
  Leading: DropdownItemLeading,
  Description: DropdownItemDescription,
  Trailing: DropdownItemTrailing,
});
const DropdownSection =
  createCompoundSlot<DropdownSectionProps>("Dropdown.Section");
const DropdownSectionTitle = createCompoundSlot<DropdownSectionTitleProps>(
  "Dropdown.SectionTitle",
);
const DropdownSeparator =
  createCompoundSlot<DropdownSeparatorProps>("Dropdown.Separator");

export const Dropdown = Object.assign(DropdownRoot, {
  Trigger: DropdownTrigger,
  Menu: DropdownMenu,
  Item: DropdownItem,
  Section: DropdownSection,
  SectionTitle: DropdownSectionTitle,
  Separator: DropdownSeparator,
});
