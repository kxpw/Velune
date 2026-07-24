import type { ForwardedRef, MouseEvent } from "react";
import { forwardRef, useMemo } from "react";
import { clsx } from "clsx";
import { useComposedRefs } from "../shared/compose-refs";
import {
  createDialogScope,
  handleDialogOverlayClick,
  useDialogController,
  type DialogContextValue,
} from "../shared/dialog";
import { createDialogSurface } from "../shared/dialog-surface";
import { Portal } from "../shared/portal";
import {
  drawerBodyClasses,
  drawerClasses,
  drawerCloseClasses,
  drawerContentClasses,
  drawerDescriptionClasses,
  drawerFooterClasses,
  drawerHeaderClasses,
  drawerHeaderCloseClasses,
  drawerHeaderMainClasses,
  drawerOverlayClasses,
  drawerTitleClasses,
} from "./Drawer.classes";
import type { DrawerContentProps, DrawerProps } from "./Drawer.types";

type DrawerContextValue = DialogContextValue & {
  placement: DrawerProps["placement"];
};

const { Provider: DrawerProvider, useDialogScope: useDrawerContext } =
  createDialogScope<DrawerContextValue>("Drawer");

const {
  Header: DrawerHeader,
  Title: DrawerTitle,
  Description: DrawerDescription,
  Body: DrawerBody,
  Footer: DrawerFooter,
  Close: DrawerClose,
} = createDialogSurface({
  name: "Drawer",
  useContext: useDrawerContext,
  classes: {
    header: drawerHeaderClasses,
    headerMain: drawerHeaderMainClasses,
    headerClose: drawerHeaderCloseClasses,
    title: drawerTitleClasses,
    description: drawerDescriptionClasses,
    body: drawerBodyClasses,
    footer: drawerFooterClasses,
    close: drawerCloseClasses,
  },
});

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
          className={clsx(drawerClasses, className)}
          data-gs-overlay-branch=""
          data-gs-focus-scope=""
          data-placement={placement}
          data-size={size}
          style={{
            ...style,
            zIndex: `calc(var(--z-modal) + ${layer})`,
          }}
        >
          <div
            className={drawerOverlayClasses({ placement })}
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
      className={clsx(drawerContentClasses({ placement }), className)}
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

export const Drawer = Object.assign(DrawerRoot, {
  Content: DrawerContent,
  Header: DrawerHeader,
  Title: DrawerTitle,
  Description: DrawerDescription,
  Body: DrawerBody,
  Footer: DrawerFooter,
  Close: DrawerClose,
});
