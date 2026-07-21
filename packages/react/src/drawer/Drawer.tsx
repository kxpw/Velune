import type { ElementType, ForwardedRef, MouseEvent } from "react";
import { createElement, forwardRef, useMemo } from "react";
import { clsx } from "clsx";
import { useComposedRefs } from "../shared/compose-refs";
import {
  createDialogScope,
  DialogCloseIcon,
  handleDialogOverlayClick,
  useDialogController,
  useDialogSlotFlag,
  type DialogContextValue,
} from "../shared/dialog";
import { Portal } from "../shared/portal";
import type { PolymorphicComponent } from "../shared/polymorphic";
import type {
  DrawerBodyProps,
  DrawerCloseProps,
  DrawerContentProps,
  DrawerDescriptionProps,
  DrawerFooterProps,
  DrawerHeaderProps,
  DrawerProps,
  DrawerTitleProps,
} from "./Drawer.types";

const drawerCloseClasses =
  "gs-drawer-close -m-1 inline-flex size-gs-control-hit-target shrink-0 cursor-pointer items-center justify-center rounded-gs-sm border-0 bg-transparent p-0 text-gs-text-secondary transition-[background-color,color,box-shadow,transform] duration-150 ease-gs-standard active:scale-95 hover:bg-gs-action-hover hover:text-gs-text focus-visible:outline-none focus-visible:shadow-gs-button-focus-border motion-reduce:transition-none motion-reduce:active:scale-100 [[data-reduced-motion=true]_&]:transition-none [[data-reduced-motion=true]_&]:active:scale-100 [&_svg]:block [&_svg]:size-4";

type DrawerContextValue = DialogContextValue & {
  placement: DrawerProps["placement"];
};

const { Provider: DrawerProvider, useDialogScope: useDrawerContext } =
  createDialogScope<DrawerContextValue>("Drawer");

function DrawerImpl(
  {
    open,
    defaultOpen = false,
    onOpenChange,
    placement = "right",
    size = "md",
    closeOnEsc = true,
    closeOnOverlayClick = true,
    lockScroll = true,
    finalFocusRef,
    initialFocusRef,
    onOpenAutoFocus,
    onCloseAutoFocus,
    onEscapeKeyDown,
    onOverlayClick,
    className,
    style,
    children,
    ...props
  }: DrawerProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const { context, layer, rootRef } = useDialogController({
    open,
    defaultOpen,
    onOpenChange,
    closeOnEsc,
    lockScroll,
    finalFocusRef,
    initialFocusRef,
    onOpenAutoFocus,
    onCloseAutoFocus,
    onEscapeKeyDown,
    eventPrefix: "velune.drawer",
  });

  const composedRootRef = useComposedRefs(rootRef, ref);
  const ctx = useMemo<DrawerContextValue>(
    () => ({ ...context, placement }),
    [context, placement],
  );

  if (!context.open) {
    return null;
  }

  const handleOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
    handleDialogOverlayClick(event, {
      closeOnOverlayClick,
      onOverlayClick,
      setOpen: context.setOpen,
    });
  };

  return (
    <DrawerProvider value={ctx}>
      <Portal>
        <div
          ref={composedRootRef}
          {...props}
          className={clsx("gs-drawer fixed inset-0", className)}
          data-gs-overlay-branch=""
          data-gs-focus-scope=""
          data-placement={placement}
          data-size={size}
          style={{
            ...style,
            zIndex: `calc(var(--drawer-z-index) + ${layer})`,
          }}
        >
          <div
            className={clsx(
              "gs-drawer-overlay flex size-full bg-gs-drawer-overlay-bg animate-gs-drawer-overlay-in motion-reduce:animate-none [[data-reduced-motion=true]_&]:animate-none",
              placement === "right" && "justify-end",
              placement === "left" && "justify-start",
              placement === "top" && "items-start",
              placement === "bottom" && "items-end",
            )}
            onClick={handleOverlayClick}
          >
            {children}
          </div>
        </div>
      </Portal>
    </DrawerProvider>
  );
}

const DrawerRoot = forwardRef(DrawerImpl);
DrawerRoot.displayName = "Drawer";

function DrawerContentImpl(
  {
    className,
    children,
    role = "dialog",
    "aria-labelledby": ariaLabelledBy,
    "aria-describedby": ariaDescribedBy,
    onClick,
    ...props
  }: DrawerContentProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const {
    titleId,
    descriptionId,
    contentRef,
    placement,
    hasTitle,
    hasDescription,
  } = useDrawerContext("Drawer.Content");

  const composedRef = useComposedRefs(contentRef, ref);

  return (
    <div
      {...props}
      ref={composedRef}
      role={role}
      aria-modal="true"
      aria-labelledby={hasTitle ? titleId : ariaLabelledBy}
      aria-describedby={hasDescription ? descriptionId : ariaDescribedBy}
      className={clsx(
        "gs-drawer-content flex flex-col border border-gs-surface-border bg-gs-drawer-bg bg-gs-surface-highlight font-inherit text-gs-drawer-color shadow-gs-drawer-shadow outline-none [--gs-drawer-size:var(--drawer-size)] [[data-size=sm]_&]:[--gs-drawer-size:var(--drawer-size-sm)] [[data-size=lg]_&]:[--gs-drawer-size:var(--drawer-size-lg)] motion-reduce:animate-none [[data-reduced-motion=true]_&]:animate-none",
        placement === "right" &&
          "h-full max-h-full w-[min(var(--gs-drawer-size),100%)] animate-gs-drawer-slide-right",
        placement === "left" &&
          "h-full max-h-full w-[min(var(--gs-drawer-size),100%)] animate-gs-drawer-slide-left",
        placement === "top" &&
          "h-[min(var(--gs-drawer-size),100%)] max-h-full w-full animate-gs-drawer-slide-top",
        placement === "bottom" &&
          "h-[min(var(--gs-drawer-size),100%)] max-h-full w-full animate-gs-drawer-slide-bottom",
        className,
      )}
      data-placement={placement}
      tabIndex={-1}
      onClick={(event) => {
        onClick?.(event);
        event.stopPropagation();
      }}
    >
      {children}
    </div>
  );
}

const DrawerContent = forwardRef(DrawerContentImpl);
DrawerContent.displayName = "Drawer.Content";

function DrawerHeaderImpl(
  { className, children, ...props }: DrawerHeaderProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  return (
    <div
      ref={ref}
      className={clsx(
        "gs-drawer-header flex shrink-0 items-start gap-3 p-gs-drawer-padding pb-3",
        className,
      )}
      {...props}
    >
      <div className="gs-drawer-header-main grid min-w-0 flex-auto gap-1">
        {children}
      </div>
      <DrawerClose className="gs-drawer-header-close" />
    </div>
  );
}

const DrawerHeader = forwardRef(DrawerHeaderImpl);
DrawerHeader.displayName = "Drawer.Header";

function DrawerTitleImpl(
  { as = "h2", className, children, ...props }: DrawerTitleProps<ElementType>,
  ref: ForwardedRef<HTMLElement>,
) {
  const { titleId, setHasTitle } = useDrawerContext("Drawer.Title");
  useDialogSlotFlag(setHasTitle);

  return createElement(
    as,
    {
      ref,
      id: titleId,
      ...props,
      className: clsx(
        "gs-drawer-title m-0 text-gs-drawer-title-size font-gs-drawer-title-weight leading-gs-normal text-gs-drawer-color",
        className,
      ),
    },
    children,
  );
}

const DrawerTitle = forwardRef(
  DrawerTitleImpl,
) as unknown as PolymorphicComponent<
  "h2",
  import("./Drawer.types").DrawerTitleOwnProps
>;
DrawerTitle.displayName = "Drawer.Title";

const DrawerDescription = forwardRef<
  HTMLParagraphElement,
  DrawerDescriptionProps
>(({ className, children, ...props }, ref) => {
  const { descriptionId, setHasDescription } =
    useDrawerContext("Drawer.Description");
  useDialogSlotFlag(setHasDescription);

  return (
    <p
      ref={ref}
      id={descriptionId}
      className={clsx(
        "gs-drawer-description m-0 text-gs-drawer-description-size leading-gs-normal text-gs-text-secondary",
        className,
      )}
      {...props}
    >
      {children}
    </p>
  );
});
DrawerDescription.displayName = "Drawer.Description";

function DrawerBodyImpl(
  { className, children, ...props }: DrawerBodyProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  return (
    <div
      ref={ref}
      className={clsx(
        "gs-drawer-body min-h-0 flex-auto overflow-auto px-gs-drawer-padding pb-gs-drawer-padding text-sm leading-gs-body text-gs-drawer-color",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

const DrawerBody = forwardRef(DrawerBodyImpl);
DrawerBody.displayName = "Drawer.Body";

function DrawerFooterImpl(
  { className, children, ...props }: DrawerFooterProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  return (
    <div
      ref={ref}
      className={clsx(
        "gs-drawer-footer flex shrink-0 flex-wrap items-center justify-end gap-2 px-gs-drawer-padding pb-gs-drawer-padding",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

const DrawerFooter = forwardRef(DrawerFooterImpl);
DrawerFooter.displayName = "Drawer.Footer";

function DrawerCloseImpl(
  {
    className,
    children,
    "aria-label": ariaLabel = "Close",
    onClick,
    ...props
  }: DrawerCloseProps,
  ref: ForwardedRef<HTMLButtonElement>,
) {
  const { setOpen } = useDrawerContext("Drawer.Close");

  return (
    <button
      {...props}
      ref={ref}
      type="button"
      className={clsx(drawerCloseClasses, className)}
      aria-label={children ? undefined : ariaLabel}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) {
          setOpen(false);
        }
      }}
    >
      {children ?? <DialogCloseIcon />}
    </button>
  );
}

const DrawerClose = forwardRef(DrawerCloseImpl);
DrawerClose.displayName = "Drawer.Close";

export const Drawer = Object.assign(DrawerRoot, {
  Content: DrawerContent,
  Header: DrawerHeader,
  Title: DrawerTitle,
  Description: DrawerDescription,
  Body: DrawerBody,
  Footer: DrawerFooter,
  Close: DrawerClose,
});
