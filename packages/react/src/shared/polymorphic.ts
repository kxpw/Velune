import type { ComponentPropsWithRef, ElementType, ReactElement } from "react";

export type PolymorphicRef<TElement extends ElementType> =
  ComponentPropsWithRef<TElement>["ref"];

export type PolymorphicProps<
  TElement extends ElementType,
  TOwnProps extends object = object,
> = TOwnProps &
  Omit<ComponentPropsWithRef<TElement>, keyof TOwnProps | "as" | "ref"> & {
    as?: TElement;
  };

export type PolymorphicComponent<
  TDefaultElement extends ElementType,
  TOwnProps extends object = object,
> = {
  <TElement extends ElementType = TDefaultElement>(
    props: PolymorphicProps<TElement, TOwnProps> & {
      ref?: PolymorphicRef<TElement>;
    },
  ): ReactElement | null;
  displayName?: string;
};
