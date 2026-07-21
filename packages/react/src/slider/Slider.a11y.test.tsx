// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Slider } from "./Slider";

afterEach(cleanup);

describe("Slider a11y", () => {
  it("names the slider from its composed label", () => {
    render(
      <Slider defaultValue={30}>
        <Slider.Label>Brightness</Slider.Label>
      </Slider>,
    );

    expect(screen.getByRole("slider", { name: "Brightness" })).toBeTruthy();
  });

  it("supports aria-label for label-less usage", () => {
    render(<Slider defaultValue={30} aria-label="Volume" />);

    expect(screen.getByRole("slider", { name: "Volume" })).toBeTruthy();
  });

  it("exposes vertical orientation", () => {
    render(
      <Slider defaultValue={30} orientation="vertical" aria-label="Zoom" />,
    );

    expect(
      document.querySelector(".gs-slider")!.getAttribute("data-orientation"),
    ).toBe("vertical");
    expect(screen.getByRole("slider").getAttribute("aria-orientation")).toBe(
      "vertical",
    );
  });
});
