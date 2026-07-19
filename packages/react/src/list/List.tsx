import type {
  ForwardedRef,
  KeyboardEvent,
  ReactElement,
  ReactNode,
} from "react";
import { createContext, forwardRef, useContext, useMemo } from "react";
import { clsx } from "clsx";
import {
  createCompoundSlot,
  dispatchCompoundSlots,
} from "../shared/compound-slot";
import { Spinner } from "../spinner";
import type {
  ListContentProps,
  ListDescriptionProps,
  ListEmptyProps,
  ListItemProps,
  ListLeadingProps,
  ListLoadingProps,
  ListProps,
  ListSize,
  ListTitleProps,
  ListTrailingProps,
} from "./List.types";

function collectListContent(children: ReactNode): {
  items: ReactNode[];
  empty?: ListEmptyProps;
  loading?: ListLoadingProps;
} {
  const composition: {
    items: ReactNode[];
    empty?: ListEmptyProps;
    loading?: ListLoadingProps;
  } = { items: [] };
  dispatchCompoundSlots(
    children,
    {
      "List.Empty": (child) => {
        composition.empty = child.props as ListEmptyProps;
      },
      "List.Loading": (child) => {
        composition.loading = child.props as ListLoadingProps;
      },
    },
    (child) => composition.items.push(child),
  );
  return composition;
}

type ListContextValue = {
  size: ListSize;
  hoverable: boolean;
  divided: boolean;
};

const ListContext = createContext<ListContextValue>({
  size: "md",
  hoverable: true,
  divided: true,
});

function ListImpl(
  {
    size = "md",
    divided = true,
    hoverable = true,
    loading = false,
    loadingLabel = "Loading…",
    emptyLabel = "No items",
    className,
    children,
    ...props
  }: ListProps,
  ref: ForwardedRef<HTMLUListElement>,
) {
  const {
    items,
    empty,
    loading: loadingContent,
  } = collectListContent(children);
  const ctx = useMemo(
    () => ({ size, hoverable, divided }),
    [divided, hoverable, size],
  );

  const isLoading = loading;
  const isEmpty = !isLoading && items.length === 0;

  return (
    <ListContext.Provider value={ctx}>
      <ul
        ref={ref}
        {...props}
        className={clsx(
          "gs-list m-0 flex list-none flex-col gap-gs-list-gap p-0 font-inherit text-gs-text",
          className,
        )}
        data-size={size}
        data-divided={divided ? "true" : undefined}
        data-hoverable={hoverable ? "true" : undefined}
        data-loading={isLoading ? "true" : undefined}
        data-empty={isEmpty ? "true" : undefined}
      >
        {isLoading ? (
          <li
            {...loadingContent}
            className={clsx(
              "gs-list-status flex items-center justify-center px-gs-list-item-padding-x py-8 text-sm text-gs-text-secondary",
              loadingContent?.className,
            )}
            aria-busy="true"
          >
            {loadingContent?.children == null ? (
              <span
                className="gs-list-loading inline-flex items-center gap-2"
                role="status"
                aria-live="polite"
              >
                <Spinner
                  size="sm"
                  tone="muted"
                  role="presentation"
                  aria-hidden="true"
                />
                <span>{loadingLabel}</span>
              </span>
            ) : (
              loadingContent.children
            )}
          </li>
        ) : isEmpty ? (
          <li
            {...empty}
            className={clsx(
              "gs-list-status flex items-center justify-center px-gs-list-item-padding-x py-8 text-sm text-gs-text-secondary",
              empty?.className,
            )}
          >
            {empty?.children ?? (
              <span className="gs-list-empty text-gs-text-secondary">
                {emptyLabel}
              </span>
            )}
          </li>
        ) : (
          items
        )}
      </ul>
    </ListContext.Provider>
  );
}

const ListRoot = forwardRef(ListImpl);
ListRoot.displayName = "List";

function ListItemImpl(
  {
    interactive,
    disabled,
    className,
    children,
    onClick,
    onKeyDown,
    role,
    tabIndex,
    "aria-disabled": ariaDisabled,
    ...props
  }: ListItemProps,
  ref: ForwardedRef<HTMLLIElement>,
) {
  const { size, hoverable, divided } = useContext(ListContext);
  const hasInteraction = !!(interactive ?? onClick);
  const isInteractive = hasInteraction && !disabled;

  return (
    <li
      ref={ref}
      {...props}
      className={clsx(
        "gs-list-item m-0 flex items-start gap-gs-list-item-gap rounded-gs-list-item-radius bg-transparent px-gs-list-item-padding-x py-gs-list-item-padding-y text-start font-inherit text-inherit transition-colors duration-200 ease-gs-standard motion-reduce:transition-none [[data-reduced-motion=true]_&]:transition-none",
        size === "sm" && "gap-2 py-2",
        divided &&
          "rounded-none [border-block-start:var(--divider-border-width)_solid_var(--list-divider-color)] first:[border-block-start-width:0] first:[border-start-start-radius:var(--list-item-radius)] first:[border-start-end-radius:var(--list-item-radius)] last:[border-end-start-radius:var(--list-item-radius)] last:[border-end-end-radius:var(--list-item-radius)]",
        hoverable && !disabled && "hover:bg-gs-list-item-bg-hover",
        isInteractive &&
          "min-h-gs-control-hit-target min-w-gs-control-hit-target cursor-pointer focus-visible:bg-gs-list-item-bg-hover focus-visible:outline-none focus-visible:shadow-gs-button-focus-inset",
        disabled && "cursor-not-allowed opacity-gs-disabled",
        className,
      )}
      data-size={size}
      data-interactive={isInteractive ? "true" : undefined}
      data-hoverable={hoverable ? "true" : undefined}
      data-disabled={disabled ? "true" : undefined}
      aria-disabled={disabled || ariaDisabled}
      // Announce the actionable affordance to assistive tech.
      role={role ?? (hasInteraction ? "button" : undefined)}
      tabIndex={hasInteraction ? (disabled ? -1 : (tabIndex ?? 0)) : tabIndex}
      onClick={isInteractive ? onClick : undefined}
      onKeyDown={
        hasInteraction
          ? (event: KeyboardEvent<HTMLLIElement>) => {
              onKeyDown?.(event);
              if (
                !event.defaultPrevented &&
                !disabled &&
                event.target === event.currentTarget &&
                (event.key === "Enter" || event.key === " ")
              ) {
                event.preventDefault();
                event.currentTarget.click();
              }
            }
          : onKeyDown
      }
    >
      {children}
    </li>
  );
}

const ListItem = forwardRef(ListItemImpl);
ListItem.displayName = "List.Item";

const ListContent = forwardRef<HTMLSpanElement, ListContentProps>(
  ({ className, children, ...props }, ref) => (
    <span
      ref={ref}
      className={clsx(
        "gs-list-content grid min-w-0 flex-auto content-center gap-1",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  ),
);
ListContent.displayName = "List.Content";

const ListTitle = forwardRef<HTMLSpanElement, ListTitleProps>(
  ({ className, children, ...props }, ref) => (
    <span
      ref={ref}
      className={clsx(
        "gs-list-title wrap-anywhere text-gs-list-title-size font-medium leading-gs-normal text-gs-text",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  ),
);
ListTitle.displayName = "List.Title";

const ListDescription = forwardRef<HTMLSpanElement, ListDescriptionProps>(
  ({ className, children, ...props }, ref) => (
    <span
      ref={ref}
      className={clsx(
        "gs-list-description wrap-anywhere text-gs-list-description-size font-normal leading-gs-body text-gs-text-secondary",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  ),
);
ListDescription.displayName = "List.Description";

function createListSlot(displayName: string, baseClassName: string) {
  const Slot = forwardRef<
    HTMLSpanElement,
    ListLeadingProps | ListTrailingProps
  >(({ className, children, ...props }, ref) => (
    <span ref={ref} className={clsx(baseClassName, className)} {...props}>
      {children}
    </span>
  ));
  Slot.displayName = displayName;
  return Slot;
}

const ListLeading = createListSlot(
  "List.Leading",
  "gs-list-leading inline-flex shrink-0 self-center items-center text-gs-text-secondary",
);
const ListTrailing = createListSlot(
  "List.Trailing",
  "gs-list-trailing ms-auto inline-flex shrink-0 self-center items-center text-gs-text-secondary",
);

const ListEmpty = createCompoundSlot<ListEmptyProps>("List.Empty");
const ListLoading = createCompoundSlot<ListLoadingProps>("List.Loading");

export const List = Object.assign(ListRoot, {
  Item: ListItem,
  Content: ListContent,
  Title: ListTitle,
  Description: ListDescription,
  Leading: ListLeading,
  Trailing: ListTrailing,
  Empty: ListEmpty,
  Loading: ListLoading,
});

// Keep ReactElement typing available for consumers composing List.Item.
export type ListItemElement = ReactElement<ListItemProps>;
