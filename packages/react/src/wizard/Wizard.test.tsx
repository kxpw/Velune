// @vitest-environment jsdom

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Wizard } from "./Wizard";

afterEach(cleanup);

describe("Wizard", () => {
  it("sets readable displayNames", () => {
    expect(Wizard.displayName).toBe("Wizard");
    expect(Wizard.Step.displayName).toBe("Wizard.Step");
    expect(Wizard.Title.displayName).toBe("Wizard.Title");
    expect(Wizard.Description.displayName).toBe("Wizard.Description");
    expect(Wizard.Navigation.displayName).toBe("Wizard.Navigation");
    expect(Wizard.Navigation.Start.displayName).toBe("Wizard.Navigation.Start");
    expect(Wizard.Navigation.Finish.displayName).toBe(
      "Wizard.Navigation.Finish",
    );
  });

  it("uses composed navigation labels and start content", () => {
    render(
      <Wizard defaultStep="only">
        <Wizard.Step value="only">
          <Wizard.Title>Only</Wizard.Title>
          Content
        </Wizard.Step>
        <Wizard.Navigation>
          <Wizard.Navigation.Start>Step helper</Wizard.Navigation.Start>
          <Wizard.Navigation.Finish>Submit</Wizard.Navigation.Finish>
        </Wizard.Navigation>
      </Wizard>,
    );

    expect(screen.getByText("Step helper")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Submit" })).toBeTruthy();
  });

  it("collects composed metadata without rendering it in the panel", () => {
    render(
      <Wizard defaultStep="account">
        <Wizard.Step value="account">
          <Wizard.Title>Account</Wizard.Title>
          <Wizard.Description>Identity basics</Wizard.Description>
          Account fields
        </Wizard.Step>
      </Wizard>,
    );

    expect(
      screen.getByRole("button", { name: /Account/ }).textContent,
    ).toContain("Identity basics");
    expect(document.querySelector(".gs-wizard-step-body")?.textContent).toBe(
      "Account fields",
    );
  });

  it("ignores stale async navigation after the controlled step changes", async () => {
    let resolveNavigation!: (value: boolean) => void;
    const onStepChange = vi.fn();
    const renderWizard = (currentStep: string) => (
      <Wizard
        currentStep={currentStep}
        onStepChange={onStepChange}
        onBeforeNext={() =>
          new Promise<boolean>((resolve) => {
            resolveNavigation = resolve;
          })
        }
      >
        <Wizard.Step value="one">
          <Wizard.Title>One</Wizard.Title>
          One
        </Wizard.Step>
        <Wizard.Step value="two">
          <Wizard.Title>Two</Wizard.Title>
          Two
        </Wizard.Step>
        <Wizard.Step value="three">
          <Wizard.Title>Three</Wizard.Title>
          Three
        </Wizard.Step>
        <Wizard.Navigation />
      </Wizard>
    );
    const { rerender } = render(renderWizard("one"));
    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    rerender(renderWizard("three"));
    resolveNavigation(true);
    await Promise.resolve();

    expect(onStepChange).not.toHaveBeenCalled();
  });

  it("does not complete pending navigation after unmount", async () => {
    let resolveNavigation!: (value: boolean) => void;
    const onStepChange = vi.fn();
    const { unmount } = render(
      <Wizard
        defaultStep="one"
        onStepChange={onStepChange}
        onBeforeNext={() =>
          new Promise<boolean>((resolve) => {
            resolveNavigation = resolve;
          })
        }
      >
        <Wizard.Step value="one">
          <Wizard.Title>One</Wizard.Title>
          One
        </Wizard.Step>
        <Wizard.Step value="two">
          <Wizard.Title>Two</Wizard.Title>
          Two
        </Wizard.Step>
        <Wizard.Navigation />
      </Wizard>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    unmount();
    resolveNavigation(true);
    await Promise.resolve();

    expect(onStepChange).not.toHaveBeenCalled();
  });

  it("prevents navigation re-entry before busy state renders", () => {
    const onBeforeNext = vi.fn(() => new Promise<boolean>(() => {}));
    render(
      <Wizard defaultStep="one" onBeforeNext={onBeforeNext}>
        <Wizard.Step value="one">
          <Wizard.Title>One</Wizard.Title>
          One
        </Wizard.Step>
        <Wizard.Step value="two">
          <Wizard.Title>Two</Wizard.Title>
          Two
        </Wizard.Step>
        <Wizard.Navigation />
      </Wizard>,
    );
    const next = screen.getByRole("button", { name: "Next" });

    act(() => {
      next.click();
      next.click();
    });

    expect(onBeforeNext).toHaveBeenCalledOnce();
  });

  it("maps step and progress indicators to Tailwind utilities", () => {
    const { rerender } = render(
      <Wizard defaultStep="one" data-indicator="none" data-busy="true">
        <Wizard.Step value="one">
          <Wizard.Title>One</Wizard.Title>
          One
        </Wizard.Step>
        <Wizard.Step value="two">
          <Wizard.Title>Two</Wizard.Title>
          Two
        </Wizard.Step>
      </Wizard>,
    );
    expect(
      document
        .querySelector(".gs-wizard-steps")
        ?.classList.contains("max-[40em]:flex-col"),
    ).toBe(true);
    const root = document.querySelector<HTMLElement>(".gs-wizard")!;
    expect(root.dataset.indicator).toBe("steps");
    expect(root.dataset.busy).toBeUndefined();
    expect(
      document
        .querySelector(".gs-wizard-marker")
        ?.classList.contains("bg-gs-primary-strong"),
    ).toBe(true);
    expect(
      document
        .querySelector(".gs-wizard-marker")
        ?.classList.contains("group-active:scale-95"),
    ).toBe(true);
    expect(
      document
        .querySelector(".gs-wizard-marker")
        ?.classList.contains("motion-reduce:transition-none"),
    ).toBe(true);

    rerender(
      <Wizard defaultStep="one" indicator="progress">
        <Wizard.Step value="one">
          <Wizard.Title>One</Wizard.Title>
          One
        </Wizard.Step>
        <Wizard.Step value="two">
          <Wizard.Title>Two</Wizard.Title>
          Two
        </Wizard.Step>
      </Wizard>,
    );
    expect(
      screen
        .getByRole("progressbar")
        .querySelector(".gs-wizard-progress-fill")
        ?.classList.contains("motion-reduce:transition-none"),
    ).toBe(true);
  });

  it("uses custom step and progress indicator labels", () => {
    const steps = (
      <Wizard.Step value="one">
        <Wizard.Title>First step</Wizard.Title>
        Step content
      </Wizard.Step>
    );
    const { rerender } = render(
      <Wizard stepsLabel="Workflow steps">{steps}</Wizard>,
    );

    expect(screen.getByRole("list", { name: "Workflow steps" })).toBeTruthy();

    rerender(
      <Wizard indicator="progress" progressLabel="Completion status">
        {steps}
      </Wizard>,
    );
    expect(
      screen.getByRole("progressbar", { name: "Completion status" }),
    ).toBeTruthy();
  });

  it("falls back consistently when the current step is removed", () => {
    const onStepChange = vi.fn();
    const renderWizard = (includeCurrent: boolean) => (
      <Wizard defaultStep="two" onStepChange={onStepChange}>
        <Wizard.Step value="one">
          <Wizard.Title>One</Wizard.Title>
          First panel
        </Wizard.Step>
        {includeCurrent ? (
          <Wizard.Step value="two">
            <Wizard.Title>Two</Wizard.Title>
            Second panel
          </Wizard.Step>
        ) : null}
        <Wizard.Step value="three">
          <Wizard.Title>Three</Wizard.Title>
          Third panel
        </Wizard.Step>
      </Wizard>
    );
    const { rerender } = render(renderWizard(true));

    expect(screen.getByRole("group", { name: "Two" })).toBeTruthy();
    rerender(renderWizard(false));

    expect(
      screen.getByRole("button", { name: "One" }).getAttribute("aria-current"),
    ).toBe("step");
    expect(screen.getByRole("group", { name: "One" }).textContent).toContain(
      "First panel",
    );
    expect(screen.queryByText("Second panel")).toBeNull();
    expect(onStepChange).not.toHaveBeenCalled();
  });
});
