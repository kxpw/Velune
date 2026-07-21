// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Alert } from "./Alert";

afterEach(cleanup);

describe("Alert a11y", () => {
  it("uses role=status for calm tones and role=alert for urgent tones", () => {
    const { rerender } = render(<Alert tone="info">Heads up</Alert>);
    expect(screen.getByRole("status")).toBeTruthy();

    rerender(<Alert tone="success">Saved</Alert>);
    expect(screen.getByRole("status")).toBeTruthy();

    rerender(<Alert tone="warning">Careful</Alert>);
    expect(screen.getByRole("alert")).toBeTruthy();

    rerender(<Alert tone="error">Failed</Alert>);
    expect(screen.getByRole("alert")).toBeTruthy();
  });

  it("lets an explicit role win over the tone mapping", () => {
    render(
      <Alert tone="error" role="note">
        Archived
      </Alert>,
    );

    expect(screen.getByRole("note")).toBeTruthy();
  });

  it("exposes an accessible name on the dismiss button and hides icons", () => {
    render(
      <Alert closable tone="warning">
        <Alert.Title>Storage almost full</Alert.Title>
      </Alert>,
    );

    expect(screen.getByRole("button", { name: "Dismiss" })).toBeTruthy();
    const icon = document.querySelector(".gs-alert-icon")!;
    expect(icon.getAttribute("aria-hidden")).toBe("true");
  });
});
