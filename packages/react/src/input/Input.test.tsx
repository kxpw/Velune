// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Input } from "./Input";

afterEach(cleanup);

describe("Input", () => {
  it("sets a readable displayName", () => {
    expect(Input.displayName).toBe("Input");
  });

  it("clears through the native input event path", () => {
    const changes: Array<{ nativeType: string; target: EventTarget | null }> =
      [];
    const onChange = vi.fn((event: React.ChangeEvent<HTMLInputElement>) => {
      changes.push({
        nativeType: event.nativeEvent.type,
        target: event.nativeEvent.target,
      });
    });
    render(
      <Input
        aria-label="Project"
        clearable
        defaultValue="Velune"
        onChange={onChange}
      />,
    );

    const input = screen.getByRole("textbox", { name: "Project" });
    fireEvent.click(screen.getByRole("button", { name: "Clear input" }));

    expect((input as HTMLInputElement).value).toBe("");
    expect(onChange).toHaveBeenCalledOnce();
    expect(changes).toEqual([{ nativeType: "input", target: input }]);
  });

  it("does not mutate a controlled value when its owner rejects clearing", () => {
    const onChange = vi.fn();
    render(
      <Input
        aria-label="Project"
        clearable
        value="Velune"
        onChange={onChange}
      />,
    );

    const input = screen.getByRole("textbox", {
      name: "Project",
    }) as HTMLInputElement;
    fireEvent.click(screen.getByRole("button", { name: "Clear input" }));

    expect(onChange).toHaveBeenCalledOnce();
    expect(input.value).toBe("Velune");
  });

  it("keeps clear and password actions in the keyboard tab order", () => {
    const { rerender } = render(
      <Input aria-label="Search" clearable defaultValue="Velune" />,
    );

    expect(screen.getByRole("button", { name: "Clear input" }).tabIndex).toBe(
      0,
    );

    rerender(<Input aria-label="Password" type="password" />);
    const passwordAction = screen.getByRole("button", {
      name: "Show password",
    });
    expect(passwordAction.tabIndex).toBe(0);

    fireEvent.click(passwordAction);
    expect(
      screen
        .getByRole("button", { name: "Hide password" })
        .getAttribute("aria-pressed"),
    ).toBe("true");
  });

  it("uses custom clear and password action labels", () => {
    render(
      <Input
        aria-label="Account credentials"
        type="password"
        clearable
        defaultValue="secret"
        clearLabel="Reset credential"
        showPasswordLabel="Reveal credential"
        hidePasswordLabel="Conceal credential"
      />,
    );

    expect(
      screen.getByRole("button", { name: "Reset credential" }),
    ).toBeTruthy();
    const passwordAction = screen.getByRole("button", {
      name: "Reveal credential",
    });
    fireEvent.click(passwordAction);
    expect(
      screen.getByRole("button", { name: "Conceal credential" }),
    ).toBeTruthy();
  });

  it("restores its initial uncontrolled value on form reset", () => {
    const { container } = render(
      <form>
        <Input name="project" defaultValue="Velune" />
      </form>,
    );
    const input = screen.getByRole("textbox") as HTMLInputElement;

    fireEvent.change(input, { target: { value: "Radix" } });
    fireEvent.reset(container.querySelector("form")!);

    expect(input.value).toBe("Velune");
  });

  it("preserves the last controlled value when changing modes", () => {
    const { rerender } = render(<Input aria-label="Project" value="Radix" />);

    rerender(<Input aria-label="Project" />);

    expect((screen.getByRole("textbox") as HTMLInputElement).value).toBe(
      "Radix",
    );
  });

  it("does not detach a forwarded ref while its value updates", () => {
    const ref = vi.fn();
    render(<Input ref={ref} />);

    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "Updated" },
    });

    expect(ref).toHaveBeenCalledOnce();
    expect(ref).toHaveBeenLastCalledWith(screen.getByRole("textbox"));
  });

  it("links composed field content to the native input", () => {
    render(
      <Input required>
        <Input.Label>Email</Input.Label>
        <Input.Description>Used for notifications.</Input.Description>
        <Input.ErrorMessage>Enter a valid email.</Input.ErrorMessage>
      </Input>,
    );

    const input = screen.getByRole("textbox", { name: "Email" });
    const describedBy = input.getAttribute("aria-describedby")!.split(" ");

    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(describedBy).toContain(
      screen.getByText("Used for notifications.").getAttribute("id"),
    );
    expect(describedBy).toContain(
      screen.getByText("Enter a valid email.").getAttribute("id"),
    );
  });

  it("forwards compound slot attributes to their rendered elements", () => {
    render(
      <Input>
        <Input.Label className="custom-label" data-testid="input-label">
          Email
        </Input.Label>
        <Input.Prefix className="custom-prefix" data-testid="input-prefix">
          @
        </Input.Prefix>
        <Input.Description
          className="custom-description"
          data-testid="input-description"
        >
          Work address
        </Input.Description>
      </Input>,
    );

    expect(screen.getByTestId("input-label").classList).toContain(
      "custom-label",
    );
    expect(screen.getByTestId("input-prefix").classList).toContain(
      "custom-prefix",
    );
    expect(screen.getByTestId("input-description").classList).toContain(
      "custom-description",
    );
  });
});
