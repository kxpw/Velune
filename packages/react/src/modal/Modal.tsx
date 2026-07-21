import type { ElementType, ForwardedRef, MouseEvent } from "react";
import { createElement, forwardRef } from "react";
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
  ModalBodyProps,
  ModalCloseProps,
  ModalContentProps,
  ModalDescriptionProps,
  ModalFooterProps,
  ModalHeaderProps,
  ModalProps,
  ModalTitleProps,
} from "./Modal.types";

const modalCloseClasses =
  "gs-modal-close absolute right-3 top-3 inline-flex size-gs-control-hit-target cursor-pointer items-center justify-center rounded-gs-sm border-0 bg-transparent p-0 text-gs-text-secondary transition-[background-color,color,box-shadow,transform] duration-150 ease-gs-standard active:scale-95 hover:bg-gs-action-hover hover:text-gs-text focus-visible:outline-none focus-visible:shadow-gs-button-focus-border motion-reduce:transition-none motion-reduce:active:scale-100 [[data-reduced-motion=true]_&]:transition-none [[data-reduced-motion=true]_&]:active:scale-100 [&_svg]:block [&_svg]:size-4";

const { Provider: ModalProvider, useDialogScope: useModalContext } =
  createDialogScope<DialogContextValue>("Modal");

function ModalImpl(
  {
    open,
    defaultOpen = false,
    onOpenChange,
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
  }: ModalProps,
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
    eventPrefix: "velune.modal",
  });

  const composedRootRef = useComposedRefs(rootRef, ref);

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
    <ModalProvider value={context}>
      <Portal>
        <div
          ref={composedRootRef}
          {...props}
          className={clsx("gs-modal fixed inset-0", className)}
          data-gs-overlay-branch=""
          data-gs-focus-scope=""
          data-size={size}
          style={{
            ...style,
            zIndex: `calc(var(--modal-z-index) + ${layer})`,
          }}
        >
          <div
            className="gs-modal-overlay flex size-full items-end justify-center bg-gs-modal-overlay-bg p-0 animate-gs-modal-overlay-in sm:items-center sm:p-4 motion-reduce:animate-none [[data-reduced-motion=true]_&]:animate-none"
            data-close-on-click={closeOnOverlayClick ? "true" : undefined}
            onClick={handleOverlayClick}
          >
            {children}
          </div>
        </div>
      </Portal>
    </ModalProvider>
  );
}

const ModalRoot = forwardRef(ModalImpl);
ModalRoot.displayName = "Modal";

function ModalContentImpl(
  {
    className,
    children,
    role = "dialog",
    "aria-labelledby": ariaLabelledBy,
    "aria-describedby": ariaDescribedBy,
    onClick,
    ...props
  }: ModalContentProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const { titleId, descriptionId, contentRef, hasTitle, hasDescription } =
    useModalContext("Modal.Content");

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
        "gs-modal-content relative flex max-h-[calc(100dvh-var(--space-4))] w-[min(var(--modal-width-md),100%)] flex-col overflow-hidden rounded-t-gs-modal-radius rounded-b-none border border-gs-surface-border bg-gs-modal-bg bg-gs-surface-highlight p-gs-modal-padding font-inherit text-gs-modal-color shadow-gs-modal-shadow outline-none animate-gs-modal-content-in sm:max-h-[min(100%,calc(100dvh-var(--space-8)))] sm:rounded-gs-modal-radius [[data-size=sm]_&]:w-[min(var(--modal-width-sm),100%)] [[data-size=lg]_&]:w-[min(var(--modal-width-lg),100%)] [[data-size=fullscreen]_&]:size-full [[data-size=fullscreen]_&]:max-h-full [[data-size=fullscreen]_&]:rounded-none motion-reduce:animate-none [[data-reduced-motion=true]_&]:animate-none",
        className,
      )}
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

const ModalContent = forwardRef(ModalContentImpl);
ModalContent.displayName = "Modal.Content";

function ModalHeaderImpl(
  { className, children, ...props }: ModalHeaderProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  return (
    <div
      ref={ref}
      className={clsx("gs-modal-header mb-2 grid min-w-0 pe-10", className)}
      {...props}
    >
      <div className="gs-modal-header-main grid min-w-0 flex-auto gap-1">
        {children}
      </div>
      <ModalClose className="gs-modal-header-close" />
    </div>
  );
}

const ModalHeader = forwardRef(ModalHeaderImpl);
ModalHeader.displayName = "Modal.Header";

function ModalTitleImpl(
  { as = "h2", className, children, ...props }: ModalTitleProps<ElementType>,
  ref: ForwardedRef<HTMLElement>,
) {
  const { titleId, setHasTitle } = useModalContext("Modal.Title");
  useDialogSlotFlag(setHasTitle);

  return createElement(
    as,
    {
      ref,
      id: titleId,
      ...props,
      className: clsx(
        "gs-modal-title m-0 text-gs-modal-title-size font-gs-modal-title-weight leading-gs-normal text-gs-modal-color",
        className,
      ),
    },
    children,
  );
}

const ModalTitle = forwardRef(
  ModalTitleImpl,
) as unknown as PolymorphicComponent<
  "h2",
  import("./Modal.types").ModalTitleOwnProps
>;
ModalTitle.displayName = "Modal.Title";

const ModalDescription = forwardRef<
  HTMLParagraphElement,
  ModalDescriptionProps
>(({ className, children, ...props }, ref) => {
  const { descriptionId, setHasDescription } =
    useModalContext("Modal.Description");
  useDialogSlotFlag(setHasDescription);

  return (
    <p
      ref={ref}
      id={descriptionId}
      className={clsx(
        "gs-modal-description m-0 text-gs-modal-description-size font-normal leading-gs-normal text-gs-text-secondary",
        className,
      )}
      {...props}
    >
      {children}
    </p>
  );
});
ModalDescription.displayName = "Modal.Description";

function ModalBodyImpl(
  { className, children, ...props }: ModalBodyProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  return (
    <div
      ref={ref}
      className={clsx(
        "gs-modal-body min-h-0 flex-auto overflow-y-auto overscroll-contain text-sm leading-gs-body text-gs-text-secondary",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

const ModalBody = forwardRef(ModalBodyImpl);
ModalBody.displayName = "Modal.Body";

function ModalFooterImpl(
  { className, children, ...props }: ModalFooterProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  return (
    <div
      ref={ref}
      className={clsx(
        "gs-modal-footer mt-5 flex flex-wrap items-center justify-end gap-2",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

const ModalFooter = forwardRef(ModalFooterImpl);
ModalFooter.displayName = "Modal.Footer";

function ModalCloseImpl(
  {
    className,
    children,
    "aria-label": ariaLabel = "Close",
    onClick,
    ...props
  }: ModalCloseProps,
  ref: ForwardedRef<HTMLButtonElement>,
) {
  const { setOpen } = useModalContext("Modal.Close");

  return (
    <button
      {...props}
      ref={ref}
      type="button"
      className={clsx(modalCloseClasses, className)}
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

const ModalClose = forwardRef(ModalCloseImpl);
ModalClose.displayName = "Modal.Close";

export const Modal = Object.assign(ModalRoot, {
  Content: ModalContent,
  Header: ModalHeader,
  Title: ModalTitle,
  Description: ModalDescription,
  Body: ModalBody,
  Footer: ModalFooter,
  Close: ModalClose,
});
