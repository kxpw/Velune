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
import {
  listClasses,
  listContentClasses,
  listDescriptionClasses,
  listEmptyClasses,
  listItemClasses,
  listLeadingClasses,
  listLoadingClasses,
  listStatusClasses,
  listTitleClasses,
  listTrailingClasses,
} from "./List.classes";
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
        className={clsx(listClasses, className)}
        data-size={size}
        data-divided={divided ? "true" : undefined}
        data-hoverable={hoverable ? "true" : undefined}
        data-loading={isLoading ? "true" : undefined}
        data-empty={isEmpty ? "true" : undefined}
      >
        {isLoading ? (
          <li
            {...loadingContent}
            className={clsx(listStatusClasses, loadingContent?.className)}
            aria-busy="true"
          >
            {loadingContent?.children == null ? (
              <span
                className={listLoadingClasses}
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
          <li {...empty} className={clsx(listStatusClasses, empty?.className)}>
            {empty?.children ?? (
              <span className={listEmptyClasses}>{emptyLabel}</span>
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
        listItemClasses({
          size,
          divided,
          hoverable,
          interactive: isInteractive,
          disabled,
        }),
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
    <span ref={ref} className={clsx(listContentClasses, className)} {...props}>
      {children}
    </span>
  ),
);
ListContent.displayName = "List.Content";

const ListTitle = forwardRef<HTMLSpanElement, ListTitleProps>(
  ({ className, children, ...props }, ref) => (
    <span ref={ref} className={clsx(listTitleClasses, className)} {...props}>
      {children}
    </span>
  ),
);
ListTitle.displayName = "List.Title";

const ListDescription = forwardRef<HTMLSpanElement, ListDescriptionProps>(
  ({ className, children, ...props }, ref) => (
    <span
      ref={ref}
      className={clsx(listDescriptionClasses, className)}
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

const ListLeading = createListSlot("List.Leading", listLeadingClasses);
const ListTrailing = createListSlot("List.Trailing", listTrailingClasses);

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
