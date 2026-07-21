// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Combobox } from "./Combobox";

afterEach(cleanup);

describe("Combobox a11y", () => {
  it("names the input from its composed label", () => {
    render(
      <Combobox>
        <Combobox.Label>City</Combobox.Label>
        <Combobox.Item value="berlin">Berlin</Combobox.Item>
      </Combobox>,
    );

    expect(screen.getByRole("combobox", { name: "City" })).toBeTruthy();
  });

  it("supports aria-label for label-less usage", () => {
    render(
      <Combobox aria-label="City">
        <Combobox.Item value="berlin">Berlin</Combobox.Item>
      </Combobox>,
    );

    expect(screen.getByRole("combobox", { name: "City" })).toBeTruthy();
  });

  it("exposes combobox listbox semantics", () => {
    render(
      <Combobox aria-label="City">
        <Combobox.Item value="berlin">Berlin</Combobox.Item>
        <Combobox.Item value="lisbon">Lisbon</Combobox.Item>
      </Combobox>,
    );

    const input = screen.getByRole("combobox");
    expect(input.getAttribute("aria-haspopup")).toBe("listbox");
    expect(input.getAttribute("aria-autocomplete")).toBe("list");
    expect(input.getAttribute("aria-expanded")).toBe("false");

    fireEvent.click(input);
    expect(input.getAttribute("aria-expanded")).toBe("true");

    const listbox = screen.getByRole("listbox", { hidden: true });
    expect(input.getAttribute("aria-controls")).toBe(listbox.id);
    expect(screen.getAllByRole("option", { hidden: true })).toHaveLength(2);
  });

  it("tracks the active option through aria-activedescendant", () => {
    render(
      <Combobox aria-label="City">
        <Combobox.Item value="berlin">Berlin</Combobox.Item>
        <Combobox.Item value="lisbon">Lisbon</Combobox.Item>
      </Combobox>,
    );

    const input = screen.getByRole("combobox");
    fireEvent.keyDown(input, { key: "ArrowDown" });

    const active = input.getAttribute("aria-activedescendant");
    expect(active).toBeTruthy();
    expect(document.getElementById(active!)?.textContent).toBe("Berlin");
  });

  it("marks disabled options with aria-disabled", () => {
    render(
      <Combobox aria-label="City">
        <Combobox.Item value="berlin">Berlin</Combobox.Item>
        <Combobox.Item value="lisbon" disabled>
          Lisbon
        </Combobox.Item>
      </Combobox>,
    );

    fireEvent.click(screen.getByRole("combobox"));
    const options = document.querySelectorAll<HTMLElement>(
      ".gs-combobox-option",
    );
    expect(options[1]!.textContent).toBe("Lisbon");
    expect(options[1]!.getAttribute("aria-disabled")).toBe("true");
  });
});
