// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Checkbox } from "./Checkbox";

afterEach(cleanup);

describe("Checkbox", () => {
  it("sets a readable displayName", () => {
    expect(Checkbox.displayName).toBe("Checkbox");
  });

  it("restores an uncontrolled group to its initial form value", () => {
    const { container, rerender } = render(
      <form>
        <Checkbox.Group name="features" defaultValue={["search"]}>
          <Checkbox value="search">Search</Checkbox>
          <Checkbox value="export">Export</Checkbox>
        </Checkbox.Group>
      </form>,
    );
    rerender(
      <form>
        <Checkbox.Group name="features" defaultValue={["export"]}>
          <Checkbox value="search">Search</Checkbox>
          <Checkbox value="export">Export</Checkbox>
        </Checkbox.Group>
      </form>,
    );

    fireEvent.click(screen.getByRole("checkbox", { name: "Export" }));
    fireEvent.reset(container.querySelector("form")!);

    expect(
      (screen.getByRole("checkbox", { name: "Search" }) as HTMLInputElement)
        .checked,
    ).toBe(true);
    expect(
      (screen.getByRole("checkbox", { name: "Export" }) as HTMLInputElement)
        .checked,
    ).toBe(false);
  });

  it("associates every group item with an external form", () => {
    const { container } = render(
      <>
        <form id="settings" />
        <Checkbox.Group
          name="features"
          form="settings"
          defaultValue={["search"]}
        >
          <Checkbox value="search">Search</Checkbox>
          <Checkbox value="export">Export</Checkbox>
        </Checkbox.Group>
      </>,
    );

    const values = new FormData(container.querySelector("form")!).getAll(
      "features",
    );
    expect(values).toEqual(["search"]);
  });

  it("accumulates re-entrant group changes from the latest value", () => {
    const changes: string[][] = [];
    render(
      <Checkbox.Group
        defaultValue={[]}
        onValueChange={(nextValue) => {
          changes.push(nextValue);
          if (nextValue.length === 1) {
            fireEvent.click(screen.getByRole("checkbox", { name: "Export" }));
          }
        }}
      >
        <Checkbox value="search">Search</Checkbox>
        <Checkbox value="export">Export</Checkbox>
      </Checkbox.Group>,
    );

    fireEvent.click(screen.getByRole("checkbox", { name: "Search" }));

    expect(changes).toEqual([["search"], ["search", "export"]]);
    expect(
      (screen.getByRole("checkbox", { name: "Search" }) as HTMLInputElement)
        .checked,
    ).toBe(true);
    expect(
      (screen.getByRole("checkbox", { name: "Export" }) as HTMLInputElement)
        .checked,
    ).toBe(true);
  });

  it("updates field subscriptions when a controlled group value changes", () => {
    const onValueChange = vi.fn();
    const options = (
      <>
        <Checkbox value="search">Search</Checkbox>
        <Checkbox value="export">Export</Checkbox>
      </>
    );
    const { rerender } = render(
      <Checkbox.Group value={[]} onValueChange={onValueChange}>
        {options}
      </Checkbox.Group>,
    );
    const search = screen.getByRole("checkbox", {
      name: "Search",
    }) as HTMLInputElement;

    rerender(
      <Checkbox.Group value={["search"]} onValueChange={onValueChange}>
        {options}
      </Checkbox.Group>,
    );
    expect(search.checked).toBe(true);

    rerender(
      <Checkbox.Group value={[]} onValueChange={onValueChange}>
        {options}
      </Checkbox.Group>,
    );
    expect(search.checked).toBe(false);
  });

  it("preserves the last controlled group value when changing modes", () => {
    const renderGroup = (controlled: boolean) => (
      <form>
        <Checkbox.Group
          name="features"
          defaultValue={["export"]}
          {...(controlled ? { value: ["search"] } : {})}
        >
          <Checkbox value="search">Search</Checkbox>
          <Checkbox value="export">Export</Checkbox>
        </Checkbox.Group>
      </form>
    );
    const { container, rerender } = render(renderGroup(true));

    rerender(renderGroup(false));

    const form = container.querySelector("form")!;
    expect(new FormData(form).getAll("features")).toEqual(["search"]);
    fireEvent.click(screen.getByRole("checkbox", { name: "Export" }));
    expect(new FormData(form).getAll("features")).toEqual(["search", "export"]);
  });

  it("forwards its group ref and protects owned group semantics", () => {
    const ref = vi.fn();
    render(
      <Checkbox.Group
        ref={ref}
        aria-label="Features"
        data-testid="group"
        role="presentation"
        data-orientation="invalid"
        orientation="horizontal"
      >
        <Checkbox value="search">Search</Checkbox>
      </Checkbox.Group>,
    );

    const group = screen.getByRole("group", { name: "Features" });
    expect(ref).toHaveBeenCalledWith(group);
    expect(group).toBe(screen.getByTestId("group"));
    expect(group.getAttribute("data-orientation")).toBe("horizontal");
  });

  it("protects mixed semantics from conflicting ARIA props", () => {
    render(
      <Checkbox indeterminate aria-checked={false} data-testid="checkbox">
        Select all
      </Checkbox>,
    );

    const input = screen.getByTestId("checkbox") as HTMLInputElement;
    expect(input.type).toBe("checkbox");
    expect(input.indeterminate).toBe(true);
    expect(input.getAttribute("aria-checked")).toBe("mixed");
  });

  it("keeps its ref stable when checked and mixed props update", () => {
    const ref = vi.fn();
    const { rerender } = render(
      <Checkbox ref={ref} checked={false} onChange={() => {}}>
        Choice
      </Checkbox>,
    );
    const input = screen.getByRole("checkbox");

    rerender(
      <Checkbox
        ref={ref}
        checked
        indeterminate
        onChange={() => {}}
        className="updated"
      >
        Choice
      </Checkbox>,
    );

    expect(ref).toHaveBeenCalledOnce();
    expect(ref).toHaveBeenLastCalledWith(input);
    expect((input as HTMLInputElement).indeterminate).toBe(true);
  });

  it("keeps label typography stable across selection states", () => {
    const { container, rerender } = render(
      <Checkbox checked={false} onChange={() => {}}>
        Choice
      </Checkbox>,
    );
    const label = container.querySelector(".gs-checkbox-label");
    const uncheckedClasses = label?.className;

    rerender(
      <Checkbox checked onChange={() => {}}>
        Choice
      </Checkbox>,
    );
    expect(label?.className).toBe(uncheckedClasses);

    rerender(
      <Checkbox checked indeterminate onChange={() => {}}>
        Choice
      </Checkbox>,
    );
    expect(label?.className).toBe(uncheckedClasses);
    expect(label?.classList.contains("font-normal")).toBe(true);
    expect(label?.classList.contains("font-medium")).toBe(false);
  });

  it("forwards composed description props and keeps them out of the label", () => {
    const { container } = render(
      <>
        <span id="account-hint">Account preference</span>
        <Checkbox aria-describedby="account-hint">
          Product updates
          <Checkbox.Description
            id="frequency-hint"
            data-testid="description"
            className="custom-description"
          >
            Weekly release notes
          </Checkbox.Description>
        </Checkbox>
      </>,
    );

    const input = screen.getByRole("checkbox", { name: "Product updates" });
    const description = screen.getByTestId("description");
    const describedBy = input.getAttribute("aria-describedby")!.split(" ");
    expect(container.querySelector(".gs-checkbox-label")?.textContent).toBe(
      "Product updates",
    );
    expect(description.textContent).toBe("Weekly release notes");
    expect(description.id).toBe("frequency-hint");
    expect(description.classList.contains("custom-description")).toBe(true);
    expect(describedBy).toContain("account-hint");
    expect(describedBy).toContain("frequency-hint");
  });

  it("links composed group label and description metadata", () => {
    render(
      <Checkbox.Group defaultValue={["search"]}>
        <Checkbox.Group.Label>Features</Checkbox.Group.Label>
        <Checkbox.Group.Description>
          Pick any features.
        </Checkbox.Group.Description>
        <Checkbox value="search">Search</Checkbox>
        <Checkbox value="export">Export</Checkbox>
      </Checkbox.Group>,
    );

    const group = screen.getByRole("group", { name: "Features" });
    const descriptionId = screen
      .getByText("Pick any features.")
      .getAttribute("id");
    expect(group.getAttribute("aria-describedby")).toBe(descriptionId);
  });

  it("marks the group and every item invalid when an error message renders", () => {
    render(
      <Checkbox.Group defaultValue={[]}>
        <Checkbox.Group.Label>Features</Checkbox.Group.Label>
        <Checkbox.Group.ErrorMessage>
          Select at least one feature.
        </Checkbox.Group.ErrorMessage>
        <Checkbox value="search">Search</Checkbox>
      </Checkbox.Group>,
    );

    const group = screen.getByRole("group", { name: "Features" });
    const error = screen.getByRole("alert");
    expect(error.textContent).toBe("Select at least one feature.");
    expect(group.getAttribute("aria-invalid")).toBe("true");
    expect(group.getAttribute("aria-describedby")).toContain(error.id);
    expect(
      screen
        .getByRole("checkbox", { name: "Search" })
        .getAttribute("aria-invalid"),
    ).toBe("true");
  });
});
