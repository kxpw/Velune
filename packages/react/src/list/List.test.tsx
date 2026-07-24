// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { List } from "./List";

afterEach(cleanup);

describe("List", () => {
  it("sets readable displayNames", () => {
    expect(List.displayName).toBe("List");
    expect(List.Item.displayName).toBe("List.Item");
    expect(List.Content.displayName).toBe("List.Content");
    expect(List.Title.displayName).toBe("List.Title");
    expect(List.Description.displayName).toBe("List.Description");
    expect(List.Leading.displayName).toBe("List.Leading");
    expect(List.Trailing.displayName).toBe("List.Trailing");
    expect(List.Empty.displayName).toBe("List.Empty");
    expect(List.Loading.displayName).toBe("List.Loading");
  });

  it("uses composed empty and loading content without rendering markers", () => {
    const { rerender } = render(
      <List>
        <List.Empty>No projects</List.Empty>
        <List.Loading>Fetching projects</List.Loading>
      </List>,
    );

    expect(screen.getByText("No projects")).toBeTruthy();
    expect(screen.queryByText("Fetching projects")).toBeNull();

    rerender(
      <List loading>
        <List.Empty>No projects</List.Empty>
        <List.Loading>Fetching projects</List.Loading>
      </List>,
    );

    expect(screen.getByText("Fetching projects")).toBeTruthy();
    expect(screen.queryByText("No projects")).toBeNull();
  });

  it("uses custom status content without duplicating the spinner label", () => {
    const { rerender } = render(<List emptyLabel="Nothing here yet" />);
    expect(screen.getByText("Nothing here yet")).toBeTruthy();

    rerender(<List loading loadingLabel="Refreshing items" />);
    const status = screen.getByRole("status");
    expect(status.textContent).toBe("Refreshing items");
    expect(
      status.querySelector(".gs-spinner")?.getAttribute("aria-hidden"),
    ).toBe("true");
  });

  it("composes keyboard handlers without exposing a synthetic mouse event", () => {
    const onClick = vi.fn();
    const onKeyDown = vi.fn();
    render(
      <List>
        <List.Item onClick={onClick} onKeyDown={onKeyDown} role="option">
          Open
        </List.Item>
      </List>,
    );

    const item = screen.getByRole("option", { name: "Open" });
    fireEvent.keyDown(item, { key: "Enter" });

    expect(onKeyDown).toHaveBeenCalledOnce();
    expect(onClick).toHaveBeenCalledOnce();
    expect(onClick.mock.calls[0]![0].nativeEvent).toBeInstanceOf(MouseEvent);
    expect(item.classList.contains("cursor-pointer")).toBe(true);
    expect(item.classList.contains("focus-visible:outline-none")).toBe(true);
  });

  it("respects a consumer preventing keyboard activation", () => {
    const onClick = vi.fn();
    render(
      <List>
        <List.Item
          onClick={onClick}
          onKeyDown={(event) => event.preventDefault()}
        >
          Open
        </List.Item>
      </List>,
    );

    fireEvent.keyDown(screen.getByRole("button", { name: "Open" }), {
      key: " ",
    });
    expect(onClick).not.toHaveBeenCalled();
  });

  it("does not activate the item for key events from nested controls", () => {
    const onClick = vi.fn();
    render(
      <List>
        <List.Item onClick={onClick}>
          <List.Content>Result</List.Content>
          <List.Trailing>
            <button>Favorite</button>
          </List.Trailing>
        </List.Item>
      </List>,
    );

    fireEvent.keyDown(screen.getByRole("button", { name: "Favorite" }), {
      key: "Enter",
    });
    expect(onClick).not.toHaveBeenCalled();
  });

  it("keeps disabled interactive items identifiable but unfocusable", () => {
    render(
      <List>
        <List.Item interactive disabled>
          Disabled
        </List.Item>
      </List>,
    );

    const item = screen.getByRole("button", { name: "Disabled" });
    expect(item.getAttribute("aria-disabled")).toBe("true");
    expect(item.getAttribute("tabindex")).toBe("-1");
    expect(item.classList.contains("opacity-gs-disabled")).toBe(true);
  });

  it("maps size, divided, and content styles to Tailwind utilities", () => {
    render(
      <List size="sm" divided data-size="forged" data-empty="true">
        <List.Item>
          <List.Content>
            <List.Title>First</List.Title>
            <List.Description>Details</List.Description>
          </List.Content>
        </List.Item>
        <List.Item>
          <List.Content>
            <List.Title>Second</List.Title>
          </List.Content>
        </List.Item>
      </List>,
    );
    const first = screen.getByText("First").closest("li")!;
    const root = first.closest("ul")!;

    expect(root.dataset.size).toBe("sm");
    expect(root.dataset.empty).toBeUndefined();
    expect(first.classList.contains("gap-gs-2")).toBe(true);
    expect(
      first.classList.contains(
        "[border-block-start:var(--control-border-width)_solid_var(--color-border-default)]",
      ),
    ).toBe(true);
    expect(first.classList.contains("first:[border-block-start-width:0]")).toBe(
      true,
    );
    expect(
      screen.getByText("Details").classList.contains("wrap-anywhere"),
    ).toBe(true);
  });
});
