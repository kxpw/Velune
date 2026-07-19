import type { ReactNode } from "react";
import {
  createCompoundSlot,
  dispatchCompoundSlots,
} from "../shared/compound-slot";
import type {
  TableCaptionProps,
  TableEmptyProps,
  TableProps,
  TableViewSource,
} from "./Table.types";

export function resolveTableSource<T>(
  props: TableProps<T>,
): TableViewSource<T> {
  let caption: ReactNode;
  let captionProps: TableCaptionProps | undefined;
  let empty: ReactNode;
  let emptyProps: TableEmptyProps | undefined;

  dispatchCompoundSlots(props.children, {
    "Table.Caption": (child) => {
      captionProps = child.props as TableCaptionProps;
      caption = captionProps.children;
    },
    "Table.Empty": (child) => {
      emptyProps = child.props as TableEmptyProps;
      empty = emptyProps.children;
    },
  });

  return {
    ...props,
    children: undefined,
    caption,
    captionProps,
    empty,
    emptyProps,
  };
}

export const TableCaption =
  createCompoundSlot<TableCaptionProps>("Table.Caption");
export const TableEmpty = createCompoundSlot<TableEmptyProps>("Table.Empty");
