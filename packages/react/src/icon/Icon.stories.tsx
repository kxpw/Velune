import { Icon } from "./Icon";

const meta = {
  title: "React/Icon",
  component: Icon,
};

export default meta;

function SampleGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M16 16l4 4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

export const Default = {
  render: () => (
    <Icon label="Search">
      <SampleGlyph />
    </Icon>
  ),
};

export const Sizes = {
  render: () => (
    <div className="flex items-center gap-gs-4 text-gs-text">
      <Icon size="sm" label="Small">
        <SampleGlyph />
      </Icon>
      <Icon size="md" label="Medium">
        <SampleGlyph />
      </Icon>
      <Icon size="lg" label="Large">
        <SampleGlyph />
      </Icon>
    </div>
  ),
};
