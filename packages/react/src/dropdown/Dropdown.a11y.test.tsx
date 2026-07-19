// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Button } from "../button";
import { Dropdown } from "./Dropdown";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("Dropdown a11y", () => {
  it("connects menu state to the trigger", async () => {
    vi.stubGlobal("CSS", { escape: (value: string) => value });
    render(
      <Dropdown>
        <Dropdown.Trigger>
          <Button>More</Button>
        </Dropdown.Trigger>
        <Dropdown.Menu aria-label="More actions">
          <Dropdown.Item id="rename">Rename</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>,
    );
    const trigger = screen.getByRole("button", { name: "More" });

    expect(trigger.getAttribute("aria-haspopup")).toBe("menu");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    await waitFor(
      () =>
        expect(
          document.querySelector(
            '.gs-dropdown-menu[role="menu"][aria-label="More actions"]',
          ),
        ).not.toBeNull(),
      { timeout: 3000 },
    );
  });
});
