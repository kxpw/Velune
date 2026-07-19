// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Form } from "./Form";
import { getValueByName, setValueByName } from "./form-utils";
import { runRules } from "./validate";

afterEach(cleanup);

describe("Form", () => {
  it("sets readable displayNames", () => {
    expect(Form.displayName).toBe("Form");
    expect(Form.Item.displayName).toBe("Form.Item");
  });

  it("reads and writes nested paths", () => {
    const values = setValueByName({}, "address.city", "SF");
    expect(getValueByName(values, "address.city")).toBe("SF");
  });

  it("validates required rules", async () => {
    const error = await runRules("", {}, [{ required: true }]);
    expect(error).toBe("This field is required");
    const ok = await runRules("hello", {}, [{ required: true }]);
    expect(ok).toBeUndefined();
  });

  it("renders token-backed Tailwind form utilities", () => {
    render(
      <Form data-testid="form">
        <Form.Item name="name" required data-testid="item">
          <input aria-label="Name" />
        </Form.Item>
      </Form>,
    );

    expect(screen.getByTestId("form").classList.contains("flex-col")).toBe(
      true,
    );
    expect(
      screen.getByTestId("form").classList.contains("gap-gs-form-gap"),
    ).toBe(true);
    expect(screen.getByTestId("item").classList.contains("grid")).toBe(true);
    expect(
      (screen.getByRole("textbox", { name: "Name" }) as HTMLInputElement)
        .required,
    ).toBe(true);
  });

  it("ignores stale async field validation results", async () => {
    const resolvers: Array<(value: string | undefined) => void> = [];
    const validator = vi.fn(
      () =>
        new Promise<string | undefined>((resolve) => {
          resolvers.push(resolve);
        }),
    );
    render(
      <Form initialValues={{ name: "first" }}>
        <Form.Item name="name" rules={[{ validator }]}>
          <input aria-label="Name" />
        </Form.Item>
      </Form>,
    );

    const input = screen.getByLabelText("Name");
    fireEvent.blur(input);
    fireEvent.change(input, { target: { value: "second" } });
    await waitFor(() => expect(validator).toHaveBeenCalledTimes(2));

    resolvers[1]!(undefined);
    await Promise.resolve();
    resolvers[0]!("Stale error");
    await Promise.resolve();

    expect(screen.queryByText("Stale error")).toBeNull();
  });

  it("does not report async submit validation after unmount", async () => {
    let resolveValidation!: (value: string | undefined) => void;
    const onSubmitFailed = vi.fn();
    const { unmount } = render(
      <Form initialValues={{ name: "draft" }} onSubmitFailed={onSubmitFailed}>
        <Form.Item
          name="name"
          rules={[
            {
              validator: () =>
                new Promise<string | undefined>((resolve) => {
                  resolveValidation = resolve;
                }),
            },
          ]}
        >
          <input />
        </Form.Item>
        <button type="submit">Submit</button>
      </Form>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Submit" }));
    unmount();
    resolveValidation("Too late");
    await Promise.resolve();

    expect(onSubmitFailed).not.toHaveBeenCalled();
  });
});
