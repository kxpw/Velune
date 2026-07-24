// @vitest-environment jsdom

import { createRef } from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Combobox } from "./Combobox";

afterEach(cleanup);

function renderCombobox(props: Partial<Parameters<typeof Combobox>[0]> = {}) {
  return render(
    <Combobox aria-label="Framework" {...props}>
      <Combobox.Item value="react">React</Combobox.Item>
      <Combobox.Item value="vue">Vue</Combobox.Item>
      <Combobox.Item value="svelte" disabled>
        Svelte
      </Combobox.Item>
    </Combobox>,
  );
}

describe("Combobox", () => {
  it("sets readable displayNames", () => {
    expect(Combobox.displayName).toBe("Combobox");
    expect((Combobox.Label as { displayName?: string }).displayName).toBe(
      "Combobox.Label",
    );
    expect((Combobox.Item as { displayName?: string }).displayName).toBe(
      "Combobox.Item",
    );
    expect((Combobox.Empty as { displayName?: string }).displayName).toBe(
      "Combobox.Empty",
    );
  });

  it("forwards its ref and DOM props", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Combobox ref={ref} aria-label="Framework" data-testid="combobox">
        <Combobox.Item value="react">React</Combobox.Item>
      </Combobox>,
    );

    const element = screen.getByTestId("combobox");
    expect(ref.current).toBe(element);
    expect(element.classList.contains("gs-combobox")).toBe(true);
  });

  it("shows the default value's label in the input", () => {
    renderCombobox({ defaultValue: "vue" });

    const input = screen.getByRole("combobox") as HTMLInputElement;
    expect(input.value).toBe("Vue");
  });

  it("opens on click and selects an option", () => {
    const onValueChange = vi.fn();
    renderCombobox({ onValueChange });

    const input = screen.getByRole("combobox") as HTMLInputElement;
    fireEvent.click(input);
    expect(input.getAttribute("aria-expanded")).toBe("true");

    const options = document.querySelectorAll<HTMLElement>(
      ".gs-combobox-option",
    );
    fireEvent.click(options[1]!);
    expect(onValueChange).toHaveBeenCalledWith("vue");
    expect(input.value).toBe("Vue");
    expect(input.getAttribute("aria-expanded")).toBe("false");
  });

  it("filters options while typing", () => {
    renderCombobox();

    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "vu" } });

    const options = document.querySelectorAll<HTMLElement>(
      ".gs-combobox-option",
    );
    expect(options).toHaveLength(1);
    expect(options[0]!.textContent).toBe("Vue");
  });

  it("shows the empty slot when nothing matches", () => {
    render(
      <Combobox aria-label="Framework">
        <Combobox.Item value="react">React</Combobox.Item>
        <Combobox.Empty>Nothing found.</Combobox.Empty>
      </Combobox>,
    );

    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "zzz" },
    });

    expect(screen.getByText("Nothing found.")).toBeTruthy();
    expect(screen.queryAllByRole("option", { hidden: true })).toHaveLength(0);
  });

  it("prefers the NoMatches slot over Empty for a fruitless query", () => {
    render(
      <Combobox aria-label="Framework">
        <Combobox.Item value="react">React</Combobox.Item>
        <Combobox.Empty>No options yet.</Combobox.Empty>
        <Combobox.NoMatches>Try another search.</Combobox.NoMatches>
      </Combobox>,
    );

    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "zzz" },
    });

    expect(screen.getByText("Try another search.")).toBeTruthy();
    expect(screen.queryByText("No options yet.")).toBeNull();
  });

  it("selects with keyboard navigation", () => {
    const onValueChange = vi.fn();
    renderCombobox({ onValueChange });

    const input = screen.getByRole("combobox");
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onValueChange).toHaveBeenCalledWith("vue");
  });

  it("skips disabled options during keyboard navigation", () => {
    const onValueChange = vi.fn();
    renderCombobox({ onValueChange });

    const input = screen.getByRole("combobox");
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "End" });
    fireEvent.keyDown(input, { key: "Enter" });

    // "Svelte" is disabled, so End lands on "Vue".
    expect(onValueChange).toHaveBeenCalledWith("vue");
  });

  it("closes on Escape and restores the selected label", () => {
    renderCombobox({ defaultValue: "react" });

    const input = screen.getByRole("combobox") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "vu" } });
    expect(input.value).toBe("vu");

    fireEvent.keyDown(input, { key: "Escape" });
    expect(input.getAttribute("aria-expanded")).toBe("false");
    expect(input.value).toBe("React");
  });

  it("supports a controlled value", () => {
    const { rerender } = render(
      <Combobox value="react" aria-label="Framework">
        <Combobox.Item value="react">React</Combobox.Item>
        <Combobox.Item value="vue">Vue</Combobox.Item>
      </Combobox>,
    );

    const input = screen.getByRole("combobox") as HTMLInputElement;
    expect(input.value).toBe("React");

    rerender(
      <Combobox value="vue" aria-label="Framework">
        <Combobox.Item value="react">React</Combobox.Item>
        <Combobox.Item value="vue">Vue</Combobox.Item>
      </Combobox>,
    );
    expect(input.value).toBe("Vue");
  });

  it("submits the selected value through a hidden input", () => {
    renderCombobox({ name: "framework", defaultValue: "react" });

    const hidden = document.querySelector<HTMLInputElement>(
      'input[type="hidden"][name="framework"]',
    );
    expect(hidden?.value).toBe("react");
  });

  it("disables interaction through the disabled prop", () => {
    renderCombobox({ disabled: true });

    const input = screen.getByRole("combobox") as HTMLInputElement;
    expect(input.disabled).toBe(true);
    fireEvent.click(input);
    expect(input.getAttribute("aria-expanded")).toBe("false");
  });

  it("renders label, description, and error message slots", () => {
    render(
      <Combobox aria-label="Framework" invalid>
        <Combobox.Label>Framework</Combobox.Label>
        <Combobox.Description>Pick your main framework.</Combobox.Description>
        <Combobox.ErrorMessage>Framework is required.</Combobox.ErrorMessage>
        <Combobox.Item value="react">React</Combobox.Item>
      </Combobox>,
    );

    expect(screen.getByText("Framework")).toBeTruthy();
    expect(screen.getByText("Pick your main framework.")).toBeTruthy();
    expect(screen.getByRole("alert").textContent).toBe(
      "Framework is required.",
    );
    expect(screen.getByRole("combobox").getAttribute("aria-invalid")).toBe(
      "true",
    );
  });

  it("virtualizes large option lists", async () => {
    render(
      <Combobox aria-label="Framework">
        {Array.from({ length: 250 }, (_, index) => (
          <Combobox.Item
            key={index}
            value={`option-${index + 1}`}
          >{`Option ${index + 1}`}</Combobox.Item>
        ))}
      </Combobox>,
    );

    fireEvent.click(screen.getByRole("combobox"));
    const listbox = document.querySelector<HTMLElement>("[role=listbox]")!;
    expect(listbox.dataset.virtualized).toBe("true");
    await waitFor(() =>
      expect(
        listbox.querySelector(".gs-combobox-virtual-content"),
      ).not.toBeNull(),
    );
    expect(listbox.querySelectorAll(".gs-combobox-option").length).toBeLessThan(
      250,
    );
  });
});
