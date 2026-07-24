// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Slider } from "./Slider";

afterEach(cleanup);

describe("Slider", () => {
  it("sets readable displayNames", () => {
    expect(Slider.displayName).toBe("Slider");
    expect((Slider.Label as { displayName?: string }).displayName).toBe(
      "Slider.Label",
    );
    expect((Slider.Output as { displayName?: string }).displayName).toBe(
      "Slider.Output",
    );
  });

  it("exposes range semantics on the slider input", () => {
    render(<Slider defaultValue={30} min={10} max={90} aria-label="Volume" />);

    const slider = screen.getByRole("slider", { name: "Volume" });
    expect(slider.getAttribute("min")).toBe("10");
    expect(slider.getAttribute("max")).toBe("90");
    expect((slider as HTMLInputElement).value).toBe("30");
  });

  it("fires onValueChange when the value changes", () => {
    const onValueChange = vi.fn();
    render(
      <Slider
        defaultValue={30}
        aria-label="Volume"
        onValueChange={onValueChange}
      />,
    );

    fireEvent.change(screen.getByRole("slider"), { target: { value: "55" } });
    expect(onValueChange).toHaveBeenCalledWith(55);
  });

  it("supports a controlled value", () => {
    const { rerender } = render(<Slider value={20} aria-label="Volume" />);
    const slider = screen.getByRole("slider") as HTMLInputElement;
    expect(slider.value).toBe("20");

    rerender(<Slider value={60} aria-label="Volume" />);
    expect(slider.value).toBe("60");
  });

  it("renders one thumb per value for ranges", () => {
    const onValueChange = vi.fn();
    render(
      <Slider
        defaultValue={[20, 80]}
        aria-label="Price range"
        onValueChange={onValueChange}
      />,
    );

    const sliders = screen.getAllByRole("slider");
    expect(sliders).toHaveLength(2);
    fireEvent.change(sliders[0]!, { target: { value: "35" } });
    expect(onValueChange).toHaveBeenCalledWith([35, 80]);
  });

  it("disables interaction through the disabled prop", () => {
    render(<Slider defaultValue={40} aria-label="Volume" disabled />);

    const slider = screen.getByRole("slider") as HTMLInputElement;
    expect(slider.disabled).toBe(true);
    expect(
      document.querySelector(".gs-slider")!.getAttribute("data-disabled"),
    ).toBe("true");
  });

  it("renders label and output slots", () => {
    render(
      <Slider defaultValue={25}>
        <Slider.Label>Opacity</Slider.Label>
        <Slider.Output />
      </Slider>,
    );

    expect(screen.getByText("Opacity")).toBeTruthy();
    const output = document.querySelector("output")!;
    expect(output.textContent).toBe("25");
    expect(screen.getByRole("slider", { name: "Opacity" })).toBeTruthy();
  });

  it("formats the output with formatOptions", () => {
    render(
      <Slider
        defaultValue={0.5}
        min={0}
        max={1}
        step={0.01}
        formatOptions={{ style: "percent" }}
      >
        <Slider.Label>Opacity</Slider.Label>
        <Slider.Output />
      </Slider>,
    );

    expect(document.querySelector("output")!.textContent).toBe("50%");
  });

  it("centers the rail and fill with standard fraction utilities", () => {
    render(<Slider defaultValue={40} aria-label="Volume" />);

    const rail = document.querySelector(".gs-slider-rail")!;
    const fill = document.querySelector(".gs-slider-fill")!;

    expect(rail.classList.contains("top-1/2")).toBe(true);
    expect(rail.classList.contains("bg-gs-border-default")).toBe(true);
    expect(fill.classList.contains("top-1/2")).toBe(true);
    expect(fill.classList.contains("bg-gs-primary")).toBe(true);
    expect(rail.className).not.toContain("top-gs-1/2");
    expect(fill.className).not.toContain("top-gs-1/2");
  });
});
