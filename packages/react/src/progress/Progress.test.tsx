// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Progress } from "./Progress";

afterEach(cleanup);

describe("Progress", () => {
  it("sets a readable displayName", () => {
    expect(Progress.displayName).toBe("Progress");
  });

  it("places progress semantics on the forwarded root and sanitizes NaN", () => {
    render(<Progress value={Number.NaN} aria-label="Upload progress" />);

    const progress = screen.getByRole("progressbar", {
      name: "Upload progress",
    });
    expect(progress.classList.contains("gs-progress")).toBe(true);
    expect(progress.getAttribute("aria-valuenow")).toBe("0");
    expect(progress.querySelector("[role='progressbar']")).toBeNull();
  });

  it("exposes protected state data and a custom accessible value label", () => {
    render(
      <Progress
        value={30}
        max={60}
        aria-label="Processed files"
        getValueLabel={(value, max) => `${value} of ${max} files`}
        data-state="complete"
        data-value="invalid"
        data-max="invalid"
      />,
    );

    const progress = screen.getByRole("progressbar", {
      name: "Processed files",
    });
    expect(progress.getAttribute("aria-valuetext")).toBe("30 of 60 files");
    expect(progress.getAttribute("data-state")).toBe("loading");
    expect(progress.getAttribute("data-value")).toBe("30");
    expect(progress.getAttribute("data-max")).toBe("60");
  });

  it("uses complete and indeterminate state semantics", () => {
    const { rerender } = render(<Progress value={100} aria-label="Publish" />);
    const progress = screen.getByRole("progressbar", { name: "Publish" });

    expect(progress.getAttribute("data-state")).toBe("complete");
    expect(progress.getAttribute("aria-valuetext")).toBe("100%");

    rerender(<Progress aria-label="Publish" />);
    expect(progress.getAttribute("data-state")).toBe("indeterminate");
    expect(progress.hasAttribute("aria-valuetext")).toBe(false);
    const fill = progress.querySelector(".gs-progress-fill")!;
    expect(fill.classList.contains("animate-gs-progress-slide")).toBe(true);
    expect(fill.classList.contains("motion-reduce:w-full")).toBe(true);
    expect(fill.classList.contains("motion-reduce:animate-none")).toBe(true);
  });

  it("maps size and value display to Tailwind utilities", () => {
    render(<Progress size="sm" value={40} aria-label="Upload" showValue />);
    const progress = screen.getByRole("progressbar", { name: "Upload" });

    expect(
      progress
        .querySelector(".gs-progress-track")
        ?.classList.contains("h-gs-progress-height-sm"),
    ).toBe(true);
    expect(
      progress
        .querySelector(".gs-progress-value")
        ?.classList.contains("tabular-nums"),
    ).toBe(true);
  });
});
