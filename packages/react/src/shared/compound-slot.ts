import {
  Children,
  Fragment,
  isValidElement,
  type ComponentType,
  type ReactElement,
  type ReactNode,
} from "react";

const VELUNE_COMPOUND_SLOT = Symbol.for("velune.compound-slot");

type CompoundSlotComponent<TProps> = ComponentType<TProps> & {
  [VELUNE_COMPOUND_SLOT]: string;
  displayName: string;
};

type NamedComponent = {
  displayName?: string | undefined;
};

export function createCompoundSlot<TProps>(
  name: string,
): ComponentType<TProps> {
  const Slot = (props: TProps) => {
    void props;
    return null;
  };
  Slot.displayName = name;
  return Object.assign(Slot, { [VELUNE_COMPOUND_SLOT]: name });
}

export function markCompoundSlot<TComponent extends NamedComponent>(
  component: TComponent,
  name: string,
): TComponent {
  component.displayName = name;
  return Object.assign(component, { [VELUNE_COMPOUND_SLOT]: name });
}

export function getCompoundSlotName(element: ReactElement): string | undefined {
  const type = element.type;
  if (typeof type === "string") return undefined;
  return (type as Partial<CompoundSlotComponent<unknown>>)[
    VELUNE_COMPOUND_SLOT
  ];
}

export type CompoundSlotHandlers = Readonly<
  Record<string, (element: ReactElement) => void>
>;

export function dispatchCompoundSlots(
  children: ReactNode,
  handlers: CompoundSlotHandlers,
  onUnhandled?: (child: ReactNode) => void,
): void {
  Children.forEach(children, (child) => {
    if (isValidElement(child) && child.type === Fragment) {
      dispatchCompoundSlots(child.props.children, handlers, onUnhandled);
      return;
    }

    if (isValidElement(child)) {
      const name = getCompoundSlotName(child);
      const handler = name ? handlers[name] : undefined;
      if (handler) {
        handler(child);
        return;
      }
    }

    onUnhandled?.(child);
  });
}

export function collectCompoundSlotProps<TSlots extends object>(
  children: ReactNode,
  schema: Readonly<Record<string, keyof TSlots>>,
): Partial<TSlots> {
  const slots: Partial<TSlots> = {};
  const collect = (nodes: ReactNode) => {
    Children.forEach(nodes, (child) => {
      if (!isValidElement(child)) return;
      if (child.type === Fragment) {
        collect(child.props.children);
        return;
      }
      const name = getCompoundSlotName(child);
      const key = name ? schema[name] : undefined;
      if (key !== undefined) {
        slots[key] = child.props as TSlots[typeof key];
      }
    });
  };
  collect(children);
  return slots;
}

export function omitCompoundSlotProps<
  TProps extends object,
  TKey extends keyof TProps,
>(props: TProps | undefined, keys: readonly TKey[]): Omit<TProps, TKey> {
  const result = { ...(props ?? {}) } as TProps;
  keys.forEach((key) => Reflect.deleteProperty(result, key));
  return result;
}
