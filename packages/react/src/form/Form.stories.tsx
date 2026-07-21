import type { CSSProperties } from "react";
import { useState } from "react";
import { z } from "zod";
import { Button } from "../button";
import { Input } from "../input";
import { Switch } from "../switch";
import { Text } from "../text";
import { Form } from "./Form";

const meta = {
  title: "React/Form",
  component: Form,
  parameters: { layout: "padded" },
};

export default meta;

const frame: CSSProperties = {
  maxWidth: 420,
  padding: "var(--space-6)",
  display: "grid",
  gap: "var(--space-4)",
};

export const Default = {
  render: function DefaultStory() {
    const [result, setResult] = useState("");
    return (
      <div style={frame}>
        <Form
          initialValues={{ email: "", name: "", newsletter: true }}
          onSubmit={(values) => {
            setResult(JSON.stringify(values, null, 2));
          }}
        >
          <Form.Item
            name="name"
            rules={[{ required: true, message: "Name is required" }]}
          >
            <Input fullWidth placeholder="Ada Lovelace">
              <Input.Label>Name</Input.Label>
            </Input>
          </Form.Item>
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Email is required" },
              {
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Enter a valid email",
              },
            ]}
          >
            <Input fullWidth type="email" placeholder="ada@example.com">
              <Input.Label>Email</Input.Label>
              <Input.Description>We'll never share it.</Input.Description>
            </Input>
          </Form.Item>
          <Form.Item name="newsletter">
            <Switch>Newsletter: product updates</Switch>
          </Form.Item>
          <Button type="submit">Create account</Button>
        </Form>
        {result ? (
          <Text size="sm" family="mono">
            {result}
          </Text>
        ) : null}
      </div>
    );
  },
};

const signUpSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
});

export const WithZodSchema = {
  render: function WithZodSchemaStory() {
    const [result, setResult] = useState("");
    return (
      <div style={frame}>
        <Form
          schema={signUpSchema}
          initialValues={{ email: "", password: "" }}
          onSubmit={(values) => {
            setResult(JSON.stringify(values, null, 2));
          }}
        >
          <Form.Item name="email">
            <Input fullWidth type="email" placeholder="ada@example.com">
              <Input.Label>Email</Input.Label>
            </Input>
          </Form.Item>
          <Form.Item name="password">
            <Input fullWidth type="password">
              <Input.Label>Password</Input.Label>
              <Input.Description>Validated by a zod schema.</Input.Description>
            </Input>
          </Form.Item>
          <Button type="submit">Sign up</Button>
        </Form>
        {result ? (
          <Text size="sm" family="mono">
            {result}
          </Text>
        ) : null}
      </div>
    );
  },
};

export const Nested = {
  render: () => (
    <div style={frame}>
      <Form
        initialValues={{ profile: { displayName: "" } }}
        onSubmit={() => undefined}
      >
        <Form.Item
          name="profile.displayName"
          rules={[{ required: true }, { minLength: 2, message: "Too short" }]}
        >
          <Input fullWidth>
            <Input.Label>Display name</Input.Label>
          </Input>
        </Form.Item>
        <Button type="submit" variant="secondary">
          Save profile
        </Button>
      </Form>
    </div>
  ),
};
