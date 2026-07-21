// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TextArea } from "./TextArea";

afterEach(cleanup);

describe("TextArea", () => {
  it("sets a readable displayName", () => {
    expect(TextArea.displayName).toBe("TextArea");
  });

  it("restores its initial uncontrolled value on form reset", () => {
    const { container } = render(
      <form>
        <TextArea name="notes" defaultValue="Initial" />
      </form>,
    );
    const textArea = screen.getByRole("textbox") as HTMLTextAreaElement;

    fireEvent.change(textArea, { target: { value: "Changed" } });
    fireEvent.reset(container.querySelector("form")!);

    expect(textArea.value).toBe("Initial");
  });

  it("preserves the last controlled value when changing modes", () => {
    const { rerender } = render(
      <TextArea aria-label="Notes" value="Controlled" />,
    );

    rerender(<TextArea aria-label="Notes" />);

    expect((screen.getByRole("textbox") as HTMLTextAreaElement).value).toBe(
      "Controlled",
    );
  });

  it("does not detach a forwarded ref while its value updates", () => {
    const ref = vi.fn();
    render(<TextArea ref={ref} />);

    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "Updated" },
    });

    expect(ref).toHaveBeenCalledOnce();
    expect(ref).toHaveBeenLastCalledWith(screen.getByRole("textbox"));
  });

  it("links composed field content to the native textarea", () => {
    render(
      <TextArea>
        <TextArea.Label>Summary</TextArea.Label>
        <TextArea.Description>Keep it concise.</TextArea.Description>
        <TextArea.ErrorMessage>Summary is required.</TextArea.ErrorMessage>
      </TextArea>,
    );

    const textArea = screen.getByRole("textbox", { name: "Summary" });
    const describedBy = textArea.getAttribute("aria-describedby")!.split(" ");

    expect(textArea.getAttribute("aria-invalid")).toBe("true");
    expect(describedBy).toContain(
      screen.getByText("Keep it concise.").getAttribute("id"),
    );
    expect(describedBy).toContain(
      screen.getByText("Summary is required.").getAttribute("id"),
    );
  });

  it("maps the resize prop to resize utilities", () => {
    const { rerender } = render(<TextArea />);
    const textArea = screen.getByRole("textbox");
    expect(textArea.classList.contains("resize-y")).toBe(true);

    rerender(<TextArea resize="none" />);
    expect(textArea.classList.contains("resize-none")).toBe(true);
    expect(textArea.classList.contains("resize-y")).toBe(false);

    rerender(<TextArea resize="both" />);
    expect(textArea.classList.contains("resize")).toBe(true);
  });

  it("keeps autosize resize behavior regardless of the resize prop", () => {
    render(<TextArea autosize resize="both" />);
    const textArea = screen.getByRole("textbox");
    expect(textArea.classList.contains("resize-none")).toBe(true);
  });
});
