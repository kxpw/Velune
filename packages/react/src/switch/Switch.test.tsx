// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Switch } from "./Switch";

afterEach(cleanup);

describe("Switch", () => {
  it("sets a readable displayName", () => {
    expect(Switch.displayName).toBe("Switch");
  });

  it("participates in form submission", () => {
    const { container } = render(
      <form>
        <Switch name="notifications" value="enabled">
          Notifications
        </Switch>
      </form>,
    );

    fireEvent.click(screen.getByRole("switch"));
    const form = container.querySelector("form")!;
    expect(new FormData(form).get("notifications")).toBe("enabled");
  });

  it("dispatches a bubbling native change event for user changes", async () => {
    const { container } = render(
      <form>
        <Switch name="notifications">Notifications</Switch>
      </form>,
    );
    const onChange = vi.fn();
    container.querySelector("form")!.addEventListener("change", onChange);

    fireEvent.click(screen.getByRole("switch"));

    await waitFor(() => expect(onChange).toHaveBeenCalledOnce());
  });

  it("does not dispatch native change events for checked prop updates", () => {
    const { container, rerender } = render(
      <form>
        <Switch
          name="notifications"
          checked={false}
          onCheckedChange={() => {}}
        />
      </form>,
    );
    const onChange = vi.fn();
    container.querySelector("form")!.addEventListener("change", onChange);

    rerender(
      <form>
        <Switch name="notifications" checked onCheckedChange={() => {}} />
      </form>,
    );

    expect(onChange).not.toHaveBeenCalled();
  });

  it("preserves the last controlled value when changing modes", () => {
    const { rerender } = render(
      <Switch checked defaultChecked={false}>
        Notifications
      </Switch>,
    );

    rerender(<Switch defaultChecked={false}>Notifications</Switch>);

    const control = screen.getByRole("switch");
    expect(control.getAttribute("aria-checked")).toBe("true");
    fireEvent.click(control);
    expect(control.getAttribute("aria-checked")).toBe("false");
  });

  it("keeps its form reset subscription across name prop updates", () => {
    const { container, rerender } = render(
      <form>
        <Switch name="first" />
      </form>,
    );
    const form = container.querySelector("form")!;
    const add = vi.spyOn(form, "addEventListener");
    const remove = vi.spyOn(form, "removeEventListener");

    rerender(
      <form>
        <Switch name="second" />
      </form>,
    );

    expect(add.mock.calls.filter(([type]) => type === "reset")).toHaveLength(0);
    expect(remove.mock.calls.filter(([type]) => type === "reset")).toHaveLength(
      0,
    );
  });

  it("keeps its composed ref stable across checked updates", () => {
    const ref = vi.fn();
    const { rerender } = render(
      <Switch ref={ref} checked={false} onCheckedChange={() => {}} />,
    );
    const control = screen.getByRole("switch");

    rerender(<Switch ref={ref} checked onCheckedChange={() => {}} />);

    expect(ref).toHaveBeenCalledOnce();
    expect(ref).toHaveBeenLastCalledWith(control);
  });

  it("keeps label typography stable across checked updates", () => {
    render(<Switch>Notifications</Switch>);
    const control = screen.getByRole("switch");
    const label = control.querySelector(".gs-switch-label")!;
    const initialClassName = label.className;

    fireEvent.click(control);

    expect(label.className).toBe(initialClassName);
    expect(label.classList.contains("font-medium")).toBe(false);
  });

  it("resets to the initial defaultChecked snapshot", () => {
    const { container, rerender } = render(
      <form>
        <Switch name="notifications" defaultChecked>
          Notifications
        </Switch>
      </form>,
    );
    rerender(
      <form>
        <Switch name="notifications" defaultChecked={false}>
          Notifications
        </Switch>
      </form>,
    );

    fireEvent.click(screen.getByRole("switch"));
    expect(screen.getByRole("switch").getAttribute("aria-checked")).toBe(
      "false",
    );
    fireEvent.reset(container.querySelector("form")!);
    expect(screen.getByRole("switch").getAttribute("aria-checked")).toBe(
      "true",
    );
  });

  it("composes consumer click handlers and respects preventDefault", () => {
    const onClick = vi.fn((event: React.MouseEvent) => event.preventDefault());
    render(<Switch onClick={onClick}>Notifications</Switch>);

    const control = screen.getByRole("switch");
    fireEvent.click(control);

    expect(onClick).toHaveBeenCalledOnce();
    expect(control.getAttribute("aria-checked")).toBe("false");
  });

  it("bridges native required validation to the visible control", () => {
    const { container } = render(<Switch required>Terms</Switch>);
    const control = screen.getByRole("switch");
    const native =
      container.querySelector<HTMLInputElement>(".gs-switch-native")!;

    fireEvent.invalid(native);

    expect(document.activeElement).toBe(control);
    expect(control.getAttribute("aria-required")).toBe("true");
  });

  it("protects switch semantics from conflicting DOM props", () => {
    render(
      <Switch role="button" aria-checked={false} data-testid="switch">
        Notifications
      </Switch>,
    );

    const control = screen.getByTestId("switch") as HTMLButtonElement;
    expect(control.type).toBe("button");
    expect(control.getAttribute("role")).toBe("switch");
    expect(control.getAttribute("aria-checked")).toBe("false");

    fireEvent.click(control);
    expect(control.getAttribute("aria-checked")).toBe("true");
    expect(control.classList.contains("group")).toBe(true);
    expect(
      control
        .querySelector(".gs-switch-thumb")
        ?.classList.contains("translate-x-gs-switch-travel"),
    ).toBe(true);
  });

  it("forwards description props and composes accessible descriptions", () => {
    render(
      <>
        <span id="policy-hint">Organization policy</span>
        <Switch aria-describedby="policy-hint">
          Notifications
          <Switch.Description
            id="delivery-hint"
            data-testid="description"
            className="custom-description"
          >
            Sends a weekly digest
          </Switch.Description>
        </Switch>
      </>,
    );

    const control = screen.getByRole("switch", { name: "Notifications" });
    const description = screen.getByTestId("description");
    const describedBy = control.getAttribute("aria-describedby")!.split(" ");
    expect(description.id).toBe("delivery-hint");
    expect(description.classList.contains("custom-description")).toBe(true);
    expect(describedBy).toContain("policy-hint");
    expect(describedBy).toContain("delivery-hint");
    expect(control.querySelector(".gs-switch-spinner")).toBeNull();
  });

  it("maps loading and small size to Tailwind utilities", () => {
    render(
      <Switch size="sm" loading checked>
        Notifications
        <Switch.Description>Saving</Switch.Description>
      </Switch>,
    );
    const control = screen.getByRole("switch");
    const track = control.querySelector(".gs-switch-track")!;
    const spinner = control.querySelector(".gs-switch-spinner")!;
    const description = control.querySelector(".gs-switch-description")!;

    expect(
      track.classList.contains(
        "[--gs-switch-track-w:var(--switch-track-width-sm)]",
      ),
    ).toBe(true);
    expect(spinner.classList.contains("animate-gs-spinner")).toBe(true);
    expect(spinner.classList.contains("motion-reduce:animate-none")).toBe(true);
    expect(spinner.textContent).toBe("");
    expect(description.textContent).toBe("Saving");
  });
});
