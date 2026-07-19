import { Fragment, type ReactNode } from "react";
import { describe, expect, it } from "vitest";
import {
  collectCompoundSlotProps,
  createCompoundSlot,
  dispatchCompoundSlots,
} from "./compound-slot";

const Label = createCompoundSlot<{ children?: ReactNode }>("Field.Label");
const Description = createCompoundSlot<{ children?: ReactNode }>(
  "Field.Description",
);

describe("dispatchCompoundSlots", () => {
  it("dispatches nested slots and preserves unhandled content order", () => {
    const slots: string[] = [];
    const content: ReactNode[] = [];

    dispatchCompoundSlots(
      <>
        before
        <Fragment>
          <Label>Label</Label>
          <Description>Description</Description>
        </Fragment>
        after
      </>,
      {
        "Field.Label": (element) =>
          slots.push(
            String((element.props as { children: ReactNode }).children),
          ),
        "Field.Description": (element) =>
          slots.push(
            String((element.props as { children: ReactNode }).children),
          ),
      },
      (child) => content.push(child),
    );

    expect(slots).toEqual(["Label", "Description"]);
    expect(content).toEqual(["before", "after"]);
  });

  it("collects nested slot props through a static schema", () => {
    const slots = collectCompoundSlotProps<{
      label: { children?: ReactNode };
      description: { children?: ReactNode };
    }>(
      <>
        <Label>Label</Label>
        <Description>Description</Description>
      </>,
      {
        "Field.Label": "label",
        "Field.Description": "description",
      },
    );

    expect(slots.label?.children).toBe("Label");
    expect(slots.description?.children).toBe("Description");
  });
});
