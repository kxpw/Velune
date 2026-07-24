import { dismissControlClasses } from "../shared/feedback-classes";

/** Classes for the Modal root overlay host. */
export const modalClasses = "gs-modal fixed inset-gs-0";

/** Classes for the modal overlay backdrop. */
export const modalOverlayClasses =
  "gs-modal-overlay flex size-full items-end justify-center bg-gs-modal-overlay-bg p-gs-0 animate-gs-modal-overlay-in sm:items-center sm:p-gs-4 motion-reduce:animate-none [[data-reduced-motion=true]_&]:animate-none";

/** Classes for the Modal.Content panel. */
export const modalContentClasses =
  "gs-modal-content relative flex max-h-[calc(100dvh-var(--space-4))] w-[min(var(--modal-width-md),100%)] flex-col overflow-hidden rounded-t-gs-sm rounded-b-gs-none border border-gs-border-default bg-gs-surface-raised bg-gs-surface-highlight p-gs-6 font-inherit text-gs-text shadow-gs-2 outline-none animate-gs-modal-content-in sm:max-h-[min(100%,calc(100dvh-var(--space-8)))] sm:rounded-gs-sm [[data-size=sm]_&]:w-[min(var(--modal-width-sm),100%)] [[data-size=lg]_&]:w-[min(var(--modal-width-lg),100%)] [[data-size=fullscreen]_&]:size-full [[data-size=fullscreen]_&]:max-h-full [[data-size=fullscreen]_&]:rounded-gs-none motion-reduce:animate-none [[data-reduced-motion=true]_&]:animate-none";

/** Classes for the Modal.Header element. */
export const modalHeaderClasses =
  "gs-modal-header mb-gs-2 grid min-w-gs-0 pe-gs-10";

/** Classes for the header main column. */
export const modalHeaderMainClasses =
  "gs-modal-header-main grid min-w-gs-0 flex-auto gap-gs-1";

/** Classes for the default close control in the header. */
export const modalHeaderCloseClasses = "gs-modal-header-close";

/** Classes for the Modal.Title element. */
export const modalTitleClasses =
  "gs-modal-title m-gs-0 text-gs-md font-gs-medium leading-gs-normal text-gs-text";

/** Classes for the Modal.Description element. */
export const modalDescriptionClasses =
  "gs-modal-description m-gs-0 text-gs-sm font-gs-regular leading-gs-normal text-gs-text-secondary";

/** Classes for the Modal.Body element. */
export const modalBodyClasses =
  "gs-modal-body min-h-gs-0 flex-auto overflow-y-auto overscroll-contain text-gs-sm leading-gs-body text-gs-text-secondary";

/** Classes for the Modal.Footer element. */
export const modalFooterClasses =
  "gs-modal-footer mt-gs-5 flex flex-wrap items-center justify-end gap-gs-2";

/** Classes for the Modal.Close button. */
export const modalCloseClasses = dismissControlClasses(
  "chrome",
  "gs-modal-close absolute right-gs-3 top-gs-3",
);
