// @vitest-environment jsdom

import { createRef } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Card } from "./Card";

afterEach(cleanup);

describe("Card", () => {
  it("sets readable displayNames", () => {
    expect(Card.displayName).toBe("Card");
    expect(Card.Header.displayName).toBe("Card.Header");
    expect(Card.Title.displayName).toBe("Card.Title");
    expect(Card.Description.displayName).toBe("Card.Description");
    expect(Card.Action.displayName).toBe("Card.Action");
    expect(Card.Body.displayName).toBe("Card.Body");
    expect(Card.Footer.displayName).toBe("Card.Footer");
  });

  it("activates with a real click event after composing key handlers", () => {
    const onClick = vi.fn();
    const onKeyDown = vi.fn();
    render(
      <Card onClick={onClick} onKeyDown={onKeyDown}>
        Project
      </Card>,
    );

    fireEvent.keyDown(screen.getByRole("button", { name: "Project" }), {
      key: "Enter",
    });
    expect(onKeyDown).toHaveBeenCalledOnce();
    expect(onClick).toHaveBeenCalledOnce();
    expect(onClick.mock.calls[0]![0].nativeEvent).toBeInstanceOf(MouseEvent);
    const card = screen.getByRole("button", { name: "Project" });
    expect(card.classList.contains("touch-manipulation")).toBe(true);
    expect(card.classList.contains("focus-visible:outline-none")).toBe(true);
  });

  it("ignores keyboard events from nested controls", () => {
    const onClick = vi.fn();
    render(
      <Card onClick={onClick}>
        <span>Nested content</span>
      </Card>,
    );

    fireEvent.keyDown(screen.getByText("Nested content"), {
      key: " ",
    });
    expect(onClick).not.toHaveBeenCalled();
  });

  it("does not expose button semantics without an action", () => {
    render(<Card interactive>Project summary</Card>);

    const card = screen.getByText("Project summary");
    expect(card.getAttribute("role")).toBeNull();
    expect(card.getAttribute("tabindex")).toBeNull();
    expect(card.getAttribute("data-interactive")).toBe("true");
  });

  it("supports semantic title levels and forwards the title ref", () => {
    const ref = createRef<HTMLHeadingElement>();
    render(
      <Card>
        <Card.Header>
          <Card.Title as="h2" ref={ref}>
            Project
          </Card.Title>
        </Card.Header>
      </Card>,
    );

    expect(screen.getByRole("heading", { name: "Project", level: 2 })).toBe(
      ref.current,
    );
  });

  it("maps variant, size, and section layout to Tailwind utilities", () => {
    render(
      <Card variant="filled" size="sm">
        <Card.Header>
          <Card.Title>Title</Card.Title>
          <Card.Description>Description</Card.Description>
          <Card.Action>Action</Card.Action>
        </Card.Header>
        <Card.Body>Body</Card.Body>
        <Card.Footer align="between">Footer</Card.Footer>
      </Card>,
    );
    const card = screen.getByText("Body").parentElement!;

    expect(
      card.classList.contains("[--gs-card-padding:var(--card-padding-sm)]"),
    ).toBe(true);
    expect(
      card.classList.contains("[--gs-card-bg:var(--card-bg-filled)]"),
    ).toBe(true);
    expect(
      screen
        .getByText("Title")
        .classList.contains("[[data-size=sm]_&]:text-sm"),
    ).toBe(true);
    expect(
      screen.getByRole("heading", { name: "Title", level: 3 }),
    ).toBeTruthy();
    expect(screen.getByText("Action").classList.contains("col-start-2")).toBe(
      true,
    );
    expect(
      screen.getByText("Footer").classList.contains("justify-between"),
    ).toBe(true);
  });
});
