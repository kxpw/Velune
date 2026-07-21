// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
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

  describe("schema validation (Standard Schema / zod)", () => {
    it("blocks submit and shows zod issues on their fields", async () => {
      const schema = z.object({
        email: z.string().email("Enter a valid email"),
        profile: z.object({
          age: z.coerce.number().min(18, "Must be 18 or older"),
        }),
      });
      const onSubmit = vi.fn();
      const onSubmitFailed = vi.fn();
      render(
        <Form
          schema={schema}
          initialValues={{ email: "nope", profile: { age: "12" } }}
          onSubmit={onSubmit}
          onSubmitFailed={onSubmitFailed}
        >
          <Form.Item name="email">
            <input aria-label="Email" />
          </Form.Item>
          <Form.Item name="profile.age">
            <input aria-label="Age" />
          </Form.Item>
          <button type="submit">Submit</button>
        </Form>,
      );

      fireEvent.click(screen.getByRole("button", { name: "Submit" }));

      await waitFor(() =>
        expect(screen.getByText("Enter a valid email")).toBeTruthy(),
      );
      expect(screen.getByText("Must be 18 or older")).toBeTruthy();
      expect(onSubmit).not.toHaveBeenCalled();
      expect(onSubmitFailed).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "Enter a valid email",
          "profile.age": "Must be 18 or older",
        }),
        expect.anything(),
      );
    });

    it("submits the parsed schema output including transforms", async () => {
      const schema = z.object({
        name: z.string().trim().min(1),
        age: z.coerce.number(),
      });
      const onSubmit = vi.fn();
      render(
        <Form
          schema={schema}
          initialValues={{ name: "  Ada  ", age: "36" }}
          onSubmit={onSubmit}
        >
          <Form.Item name="name">
            <input aria-label="Name" />
          </Form.Item>
          <Form.Item name="age">
            <input aria-label="Age" />
          </Form.Item>
          <button type="submit">Submit</button>
        </Form>,
      );

      fireEvent.click(screen.getByRole("button", { name: "Submit" }));

      await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
      expect(onSubmit).toHaveBeenCalledWith({ name: "Ada", age: 36 });
    });

    it("validates a field against the schema on blur", async () => {
      const schema = z.object({
        email: z.string().email("Enter a valid email"),
      });
      render(
        <Form schema={schema} initialValues={{ email: "typo" }}>
          <Form.Item name="email">
            <input aria-label="Email" />
          </Form.Item>
        </Form>,
      );

      fireEvent.blur(screen.getByLabelText("Email"));

      await waitFor(() =>
        expect(screen.getByText("Enter a valid email")).toBeTruthy(),
      );
    });

    it("prefers explicit field rules over schema issues", async () => {
      const schema = z.object({
        email: z.string().email("Schema message"),
      });
      const onSubmitFailed = vi.fn();
      render(
        <Form
          schema={schema}
          initialValues={{ email: "" }}
          onSubmitFailed={onSubmitFailed}
        >
          <Form.Item name="email" rules={[{ required: "Rule message" }]}>
            <input aria-label="Email" />
          </Form.Item>
          <button type="submit">Submit</button>
        </Form>,
      );

      fireEvent.click(screen.getByRole("button", { name: "Submit" }));

      await waitFor(() =>
        expect(screen.getByText("Rule message")).toBeTruthy(),
      );
      expect(screen.queryByText("Schema message")).toBeNull();
    });
  });
});
