import type { ForwardedRef } from "react";
import { forwardRef } from "react";
import { clsx } from "clsx";
import {
  emptyActionClasses,
  emptyClasses,
  emptyDescriptionClasses,
  emptyTitleClasses,
} from "./Empty.classes";
import type {
  EmptyActionProps,
  EmptyDescriptionProps,
  EmptyProps,
  EmptyTitleProps,
} from "./Empty.types";

function EmptyImpl(
  { className, children, ...props }: EmptyProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  return (
    <div
      ref={ref}
      className={clsx(emptyClasses(), className)}
      role="status"
      {...props}
    >
      {children}
    </div>
  );
}

const EmptyRoot = forwardRef(EmptyImpl);
EmptyRoot.displayName = "Empty";

const EmptyTitle = forwardRef<HTMLHeadingElement, EmptyTitleProps>(
  ({ className, children, ...props }, ref) => (
    <h3 ref={ref} className={clsx(emptyTitleClasses, className)} {...props}>
      {children}
    </h3>
  ),
);
EmptyTitle.displayName = "Empty.Title";

const EmptyDescription = forwardRef<
  HTMLParagraphElement,
  EmptyDescriptionProps
>(({ className, children, ...props }, ref) => (
  <p ref={ref} className={clsx(emptyDescriptionClasses, className)} {...props}>
    {children}
  </p>
));
EmptyDescription.displayName = "Empty.Description";

const EmptyAction = forwardRef<HTMLDivElement, EmptyActionProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={clsx(emptyActionClasses, className)} {...props}>
      {children}
    </div>
  ),
);
EmptyAction.displayName = "Empty.Action";

export const Empty = Object.assign(EmptyRoot, {
  Title: EmptyTitle,
  Description: EmptyDescription,
  Action: EmptyAction,
});
