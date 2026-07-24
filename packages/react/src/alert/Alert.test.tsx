// @vitest-environment jsdom

import { createRef } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Alert } from "./Alert";

afterEach(cleanup);

describe("Alert", () => {
  it("sets readable displayNames", () => {
    expect(Alert.displayName).toBe("Alert");
    expect((Alert.Title as { displayName?: string }).displayName).toBe(
      "Alert.Title",
    );
    expect((Alert.Description as { displayName?: string }).displayName).toBe(
      "Alert.Description",
    );
    expect((Alert.Action as { displayName?: string }).displayName).toBe(
      "Alert.Action",
    );
  });

  it("forwards its ref and DOM props", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Alert ref={ref} data-testid="alert" data-state="ready">
        Saved
      </Alert>,
    );

    const element = screen.getByTestId("alert");
    expect(ref.current).toBe(element);
    expect(element.getAttribute("data-state")).toBe("ready");
  });

  it("maps tones to data-tone and accent utilities", () => {
    const { rerender } = render(<Alert data-testid="alert">Note</Alert>);
    const alert = screen.getByTestId("alert");
    expect(alert.getAttribute("data-tone")).toBe("info");
    expect(alert.classList.contains("bg-gs-alert-info")).toBe(true);
    expect(
      alert.className.includes("[--gs-feedback-accent:var(--color-info)]"),
    ).toBe(true);

    rerender(
      <Alert data-testid="alert" tone="error">
        Failed
      </Alert>,
    );
    expect(alert.getAttribute("data-tone")).toBe("error");
    expect(alert.classList.contains("bg-gs-alert-error")).toBe(true);
  });

  it("renders title, description, and action slots with plain children", () => {
    render(
      <Alert data-testid="alert" tone="success">
        <Alert.Title>Deploy complete</Alert.Title>
        <Alert.Description>All checks passed.</Alert.Description>
        <Alert.Action>
          <a href="#logs">View logs</a>
        </Alert.Action>
      </Alert>,
    );

    expect(
      screen.getByText("Deploy complete").classList.contains("gs-alert-title"),
    ).toBe(true);
    expect(
      screen
        .getByText("Deploy complete")
        .classList.contains("text-gs-feedback-accent"),
    ).toBe(true);
    expect(
      screen
        .getByText("All checks passed.")
        .classList.contains("gs-alert-description"),
    ).toBe(true);
    expect(
      screen
        .getByRole("link", { name: "View logs" })
        .parentElement?.classList.contains("gs-alert-action"),
    ).toBe(true);
  });

  it("forwards refs on title, description, and action subcomponents", () => {
    const titleRef = createRef<HTMLDivElement>();
    const descriptionRef = createRef<HTMLDivElement>();
    const actionRef = createRef<HTMLDivElement>();
    render(
      <Alert>
        <Alert.Title ref={titleRef}>Deploy complete</Alert.Title>
        <Alert.Description ref={descriptionRef}>
          All checks passed.
        </Alert.Description>
        <Alert.Action ref={actionRef}>
          <button type="button">Retry</button>
        </Alert.Action>
      </Alert>,
    );

    expect(titleRef.current?.textContent).toBe("Deploy complete");
    expect(descriptionRef.current?.textContent).toBe("All checks passed.");
    expect(actionRef.current?.textContent).toBe("Retry");
  });

  it("keeps subcomponents in author order and supports wrappers", () => {
    render(
      <Alert data-testid="alert">
        <Alert.Description>Details first</Alert.Description>
        <Alert.Title>Title second</Alert.Title>
      </Alert>,
    );

    const content = screen
      .getByTestId("alert")
      .querySelector(".gs-alert-content");
    expect(
      content?.children[0]?.classList.contains("gs-alert-description"),
    ).toBe(true);
    expect(content?.children[1]?.classList.contains("gs-alert-title")).toBe(
      true,
    );
  });

  it("dismisses itself and calls onClose when closable", () => {
    const onClose = vi.fn();
    render(
      <Alert data-testid="alert" closable onClose={onClose}>
        Temporary note
      </Alert>,
    );

    const close = screen.getByRole("button", { name: "Dismiss" });
    expect(close.classList.contains("hover:bg-gs-action-hover")).toBe(true);
    expect(close.classList.contains("motion-reduce:transition-none")).toBe(
      true,
    );
    fireEvent.click(close);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId("alert")).toBeNull();
  });

  it("supports controlled visibility via open/onOpenChange", () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <Alert data-testid="alert" closable open onOpenChange={onOpenChange}>
        Controlled note
      </Alert>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    // Controlled: stays visible until the owner flips the prop.
    expect(screen.getByTestId("alert")).toBeTruthy();

    rerender(
      <Alert
        data-testid="alert"
        closable
        open={false}
        onOpenChange={onOpenChange}
      >
        Controlled note
      </Alert>,
    );
    expect(screen.queryByTestId("alert")).toBeNull();
  });

  it("supports a custom close label", () => {
    render(
      <Alert closable closeLabel="Hide alert">
        Note
      </Alert>,
    );

    expect(screen.getByRole("button", { name: "Hide alert" })).toBeTruthy();
  });

  it("renders a badge icon and hides it for icon={null}", () => {
    const { rerender } = render(
      <Alert data-testid="alert" icon={<svg data-testid="custom-icon" />}>
        Note
      </Alert>,
    );
    expect(screen.getByTestId("custom-icon")).toBeTruthy();
    expect(
      screen.getByTestId("alert").querySelector(".gs-alert-icon"),
    ).toBeTruthy();

    rerender(
      <Alert data-testid="alert" icon={null}>
        Note
      </Alert>,
    );
    expect(
      screen.getByTestId("alert").querySelector(".gs-alert-icon"),
    ).toBeNull();
  });
});
