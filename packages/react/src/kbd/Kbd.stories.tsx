import { Kbd } from "./Kbd";

const meta = {
  title: "React/Kbd",
  component: Kbd,
};

export default meta;

export const Default = {
  render: () => <Kbd>⌘K</Kbd>,
};

export const Chord = {
  render: () => (
    <span className="inline-flex items-center gap-gs-1 text-gs-text">
      <Kbd>Ctrl</Kbd>
      <span>+</span>
      <Kbd>K</Kbd>
    </span>
  ),
};
