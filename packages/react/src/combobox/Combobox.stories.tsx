import { useState, type CSSProperties } from "react";
import { Combobox } from "./Combobox";

const meta = {
  title: "React/Combobox",
  component: Combobox,
};

export default meta;

const frame: CSSProperties = {
  display: "grid",
  gap: "var(--space-6)",
  maxWidth: 320,
  minHeight: 280,
  alignContent: "start",
};

export const Default = {
  render: () => (
    <div style={frame}>
      <Combobox defaultValue="react" placeholder="Choose a framework">
        <Combobox.Label>Framework</Combobox.Label>
        <Combobox.Item value="react">React</Combobox.Item>
        <Combobox.Item value="vue">Vue</Combobox.Item>
        <Combobox.Item value="svelte">Svelte</Combobox.Item>
        <Combobox.Item value="solid">Solid</Combobox.Item>
      </Combobox>
    </div>
  ),
};

function ControlledCombobox() {
  const [value, setValue] = useState("berlin");
  return (
    <Combobox value={value} onValueChange={setValue}>
      <Combobox.Label>City</Combobox.Label>
      <Combobox.Description>Selected: {value}</Combobox.Description>
      <Combobox.Item value="berlin">Berlin</Combobox.Item>
      <Combobox.Item value="lisbon">Lisbon</Combobox.Item>
      <Combobox.Item value="tokyo">Tokyo</Combobox.Item>
      <Combobox.Empty>No matching city.</Combobox.Empty>
    </Combobox>
  );
}

export const Controlled = {
  render: () => (
    <div style={frame}>
      <ControlledCombobox />
    </div>
  ),
};

export const Invalid = {
  render: () => (
    <div style={frame}>
      <Combobox invalid required placeholder="Choose a plan">
        <Combobox.Label>Plan</Combobox.Label>
        <Combobox.ErrorMessage>
          Choose a plan to continue.
        </Combobox.ErrorMessage>
        <Combobox.Item value="starter">Starter</Combobox.Item>
        <Combobox.Item value="team">Team</Combobox.Item>
        <Combobox.Item value="enterprise" disabled>
          Enterprise
        </Combobox.Item>
      </Combobox>
    </div>
  ),
};

export const Disabled = {
  render: () => (
    <div style={frame}>
      <Combobox defaultValue="react" disabled>
        <Combobox.Label>Framework</Combobox.Label>
        <Combobox.Item value="react">React</Combobox.Item>
        <Combobox.Item value="vue">Vue</Combobox.Item>
      </Combobox>
    </div>
  ),
};

export const FullWidth = {
  render: () => (
    <div style={{ ...frame, maxWidth: 480 }}>
      <Combobox fullWidth placeholder="Search members">
        <Combobox.Label>Member</Combobox.Label>
        <Combobox.Item value="ada">Ada Lovelace</Combobox.Item>
        <Combobox.Item value="grace">Grace Hopper</Combobox.Item>
        <Combobox.Item value="alan">Alan Turing</Combobox.Item>
        <Combobox.Empty>No matching member.</Combobox.Empty>
      </Combobox>
    </div>
  ),
};
