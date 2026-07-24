import type {
  ButtonHTMLAttributes,
  ElementType,
  ForwardedRef,
  HTMLAttributes,
  ReactNode,
} from "react";
import { createElement, forwardRef } from "react";
import { clsx } from "clsx";
import { CloseIcon } from "./icons";
import { useDialogSlotFlag } from "./dialog";
import type { PolymorphicComponent } from "./polymorphic";

export type DialogSurfaceClasses = {
  header: string;
  headerMain: string;
  headerClose: string;
  title: string;
  description: string;
  body: string;
  footer: string;
  close: string;
};

export type DialogSurfaceContext = {
  titleId: string;
  descriptionId: string;
  setHasTitle: (value: boolean) => void;
  setHasDescription: (value: boolean) => void;
  setOpen: (open: boolean) => void;
};

type HeaderProps = HTMLAttributes<HTMLDivElement>;
type TitleOwnProps = {
  className?: string | undefined;
  children?: ReactNode;
};
type DescriptionProps = HTMLAttributes<HTMLParagraphElement>;
type BodyProps = HTMLAttributes<HTMLDivElement>;
type FooterProps = HTMLAttributes<HTMLDivElement>;
type CloseProps = ButtonHTMLAttributes<HTMLButtonElement>;

/**
 * Builds the shared Modal/Drawer compound surface slots (Header, Title,
 * Description, Body, Footer, Close). Content panels stay component-specific.
 */
export function createDialogSurface({
  name,
  useContext,
  classes,
}: {
  name: string;
  useContext: (component: string) => DialogSurfaceContext;
  classes: DialogSurfaceClasses;
}) {
  const Close = forwardRef(function DialogSurfaceClose(
    {
      className,
      children,
      "aria-label": ariaLabel = "Close",
      onClick,
      ...props
    }: CloseProps,
    ref: ForwardedRef<HTMLButtonElement>,
  ) {
    const { setOpen } = useContext(`${name}.Close`);

    return (
      <button
        {...props}
        ref={ref}
        type="button"
        className={clsx(classes.close, className)}
        aria-label={children ? undefined : ariaLabel}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) {
            setOpen(false);
          }
        }}
      >
        {children ?? <CloseIcon />}
      </button>
    );
  });
  Close.displayName = `${name}.Close`;

  const Header = forwardRef(function DialogSurfaceHeader(
    { className, children, ...props }: HeaderProps,
    ref: ForwardedRef<HTMLDivElement>,
  ) {
    return (
      <div ref={ref} className={clsx(classes.header, className)} {...props}>
        <div className={classes.headerMain}>{children}</div>
        <Close className={classes.headerClose} />
      </div>
    );
  });
  Header.displayName = `${name}.Header`;

  function TitleImpl(
    {
      as = "h2",
      className,
      children,
      ...props
    }: TitleOwnProps & {
      as?: ElementType;
    } & Record<string, unknown>,
    ref: ForwardedRef<HTMLElement>,
  ) {
    const { titleId, setHasTitle } = useContext(`${name}.Title`);
    useDialogSlotFlag(setHasTitle);

    return createElement(
      as,
      {
        ref,
        id: titleId,
        ...props,
        className: clsx(classes.title, className),
      },
      children,
    );
  }

  const Title = forwardRef(TitleImpl) as unknown as PolymorphicComponent<
    "h2",
    TitleOwnProps
  >;
  Title.displayName = `${name}.Title`;

  const Description = forwardRef(function DialogSurfaceDescription(
    { className, children, ...props }: DescriptionProps,
    ref: ForwardedRef<HTMLParagraphElement>,
  ) {
    const { descriptionId, setHasDescription } = useContext(
      `${name}.Description`,
    );
    useDialogSlotFlag(setHasDescription);

    return (
      <p
        ref={ref}
        id={descriptionId}
        className={clsx(classes.description, className)}
        {...props}
      >
        {children}
      </p>
    );
  });
  Description.displayName = `${name}.Description`;

  const Body = forwardRef(function DialogSurfaceBody(
    { className, children, ...props }: BodyProps,
    ref: ForwardedRef<HTMLDivElement>,
  ) {
    return (
      <div ref={ref} className={clsx(classes.body, className)} {...props}>
        {children}
      </div>
    );
  });
  Body.displayName = `${name}.Body`;

  const Footer = forwardRef(function DialogSurfaceFooter(
    { className, children, ...props }: FooterProps,
    ref: ForwardedRef<HTMLDivElement>,
  ) {
    return (
      <div ref={ref} className={clsx(classes.footer, className)} {...props}>
        {children}
      </div>
    );
  });
  Footer.displayName = `${name}.Footer`;

  return { Header, Title, Description, Body, Footer, Close };
}
