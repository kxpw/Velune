import type { CSSProperties } from "react";
import { useState } from "react";
import { Input } from "../input";
import { Text } from "../text";
import { Wizard } from "./Wizard";

const meta = {
  title: "React/Wizard",
  component: Wizard,
  parameters: { layout: "padded" },
};

export default meta;

const frame: CSSProperties = {
  maxWidth: 560,
  padding: "var(--space-6)",
};

export const Default = {
  render: function DefaultStory() {
    const [done, setDone] = useState(false);
    return (
      <div style={frame}>
        <Wizard
          defaultStep="account"
          onComplete={() => {
            setDone(true);
          }}
        >
          <Wizard.Step value="account">
            <Wizard.Title>Account</Wizard.Title>
            <Wizard.Description>Identity basics</Wizard.Description>
            <Text size="sm">
              Start with a name and email. You can refine details later.
            </Text>
            <div style={{ marginTop: "var(--space-3)" }}>
              <Input fullWidth placeholder="ada@example.com">
                <Input.Label>Email</Input.Label>
              </Input>
            </div>
          </Wizard.Step>
          <Wizard.Step value="workspace">
            <Wizard.Title>Workspace</Wizard.Title>
            <Wizard.Description>Team setup</Wizard.Description>
            <Text size="sm">
              Choose a workspace name and invite collaborators.
            </Text>
          </Wizard.Step>
          <Wizard.Step value="review">
            <Wizard.Title>Review</Wizard.Title>
            <Wizard.Description>Confirm</Wizard.Description>
            <Text size="sm">
              Double-check your choices, then finish the setup flow.
            </Text>
          </Wizard.Step>
          <Wizard.Navigation />
        </Wizard>
        {done ? (
          <Text
            size="sm"
            tone="success"
            style={{ marginTop: "var(--space-4)" }}
          >
            Setup complete.
          </Text>
        ) : null}
      </div>
    );
  },
};

export const ProgressIndicator = {
  render: () => (
    <div style={frame}>
      <Wizard defaultStep="one" indicator="progress">
        <Wizard.Step value="one">
          <Wizard.Title>Basics</Wizard.Title>
          <Text size="sm">Progress bar variant for compact layouts.</Text>
        </Wizard.Step>
        <Wizard.Step value="two">
          <Wizard.Title>Details</Wizard.Title>
          <Text size="sm">Second step content.</Text>
        </Wizard.Step>
        <Wizard.Step value="three">
          <Wizard.Title>Done</Wizard.Title>
          <Text size="sm">Final step content.</Text>
        </Wizard.Step>
        <Wizard.Navigation>
          <Wizard.Navigation.Finish>Submit</Wizard.Navigation.Finish>
        </Wizard.Navigation>
      </Wizard>
    </div>
  ),
};

export const WithValidation = {
  render: function ValidationStory() {
    const [name, setName] = useState("");
    const [error, setError] = useState("");

    return (
      <div style={frame}>
        <Wizard
          defaultStep="profile"
          onBeforeNext={async ({ from }) => {
            if (from === "profile" && name.trim().length < 2) {
              setError("Enter at least 2 characters");
              return false;
            }
            setError("");
            return true;
          }}
        >
          <Wizard.Step value="profile">
            <Wizard.Title>Profile</Wizard.Title>
            <Input
              fullWidth
              value={name}
              invalid={Boolean(error)}
              onChange={(event) => setName(event.target.value)}
            >
              <Input.Label>Display name</Input.Label>
              {error ? <Input.ErrorMessage>{error}</Input.ErrorMessage> : null}
            </Input>
          </Wizard.Step>
          <Wizard.Step value="confirm">
            <Wizard.Title>Confirm</Wizard.Title>
            <Text size="sm">Hello, {name || "friend"}.</Text>
          </Wizard.Step>
          <Wizard.Navigation />
        </Wizard>
      </div>
    );
  },
};
