import type { ForwardedRef, MouseEvent } from "react";
import { forwardRef } from "react";
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
  modalBodyClasses,
  modalClasses,
  modalCloseClasses,
  modalContentClasses,
  modalDescriptionClasses,
  modalFooterClasses,
  modalHeaderClasses,
  modalHeaderCloseClasses,
  modalHeaderMainClasses,
  modalOverlayClasses,
  modalTitleClasses,
} from "./Modal.classes";
import type { ModalContentProps, ModalProps } from "./Modal.types";

const { Provider: ModalProvider, useDialogScope: useModalContext } =
  createDialogScope<DialogContextValue>("Modal");

const {
  Header: ModalHeader,
  Title: ModalTitle,
  Description: ModalDescription,
  Body: ModalBody,
  Footer: ModalFooter,
  Close: ModalClose,
} = createDialogSurface({
  name: "Modal",
  useContext: useModalContext,
  classes: {
    header: modalHeaderClasses,
    headerMain: modalHeaderMainClasses,
    headerClose: modalHeaderCloseClasses,
    title: modalTitleClasses,
    description: modalDescriptionClasses,
    body: modalBodyClasses,
    footer: modalFooterClasses,
    close: modalCloseClasses,
  },
});

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
          className={clsx(modalClasses, className)}
          data-gs-overlay-branch=""
          data-gs-focus-scope=""
          data-size={size}
          style={{
            ...style,
            zIndex: `calc(var(--z-modal) + ${layer})`,
          }}
        >
          <div
            className={modalOverlayClasses}
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
      className={clsx(modalContentClasses, className)}
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

export const Modal = Object.assign(ModalRoot, {
  Content: ModalContent,
  Header: ModalHeader,
  Title: ModalTitle,
  Description: ModalDescription,
  Body: ModalBody,
  Footer: ModalFooter,
  Close: ModalClose,
});
