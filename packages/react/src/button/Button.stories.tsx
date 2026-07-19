import type { CSSProperties } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Button } from "./Button";
import type { ButtonSize, ButtonVariant } from "./Button.types";

const meta = {
  title: "React/Button",
  component: Button,
  parameters: {
    layout: "padded",
  },
};

export default meta;

const rowStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: "var(--space-3)",
  padding: "var(--space-4)",
};

const stackStyle: CSSProperties = {
  display: "grid",
  gap: "var(--space-5)",
  padding: "var(--space-6)",
  maxWidth: 800,
};

const labelStyle: CSSProperties = {
  margin: 0,
  color: "var(--color-text-muted)",
  fontSize: "var(--font-size-xs)",
  fontWeight: "var(--font-weight-medium)" as CSSProperties["fontWeight"],
  letterSpacing: "0.04em",
  textTransform: "uppercase",
};

const variants: ButtonVariant[] = ["primary", "secondary", "ghost", "danger"];
const sizes: ButtonSize[] = ["sm", "md", "lg"];

export const Default = {
  render: () => (
    <div style={rowStyle}>
      <Button>Button</Button>
    </div>
  ),
};

export const Variants = {
  render: () => (
    <div style={rowStyle}>
      {variants.map((variant) => (
        <Button key={variant} variant={variant}>
          {variant[0]!.toUpperCase() + variant.slice(1)}
        </Button>
      ))}
    </div>
  ),
};

export const Sizes = {
  render: () => (
    <div style={rowStyle}>
      {sizes.map((size) => (
        <Button key={size} size={size}>
          {size.toUpperCase()}
        </Button>
      ))}
    </div>
  ),
};

export const Matrix = {
  name: "Variant × Size",
  render: () => (
    <div style={stackStyle}>
      {variants.map((variant) => (
        <div key={variant}>
          <p style={labelStyle}>{variant}</p>
          <div style={rowStyle}>
            {sizes.map((size) => (
              <Button key={size} variant={variant} size={size}>
                {size}
              </Button>
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
};

export const WithIcons = {
  render: () => (
    <div style={stackStyle}>
      <div style={rowStyle}>
        <Button>
          <Button.Leading>
            <Check />
          </Button.Leading>
          Confirm
        </Button>
        <Button variant="secondary">
          Options
          <Button.Trailing>
            <ChevronDown />
          </Button.Trailing>
        </Button>
        <Button variant="ghost">
          <Button.Leading>
            <Check />
          </Button.Leading>
          Both
          <Button.Trailing>
            <ChevronDown />
          </Button.Trailing>
        </Button>
      </div>
      <div style={rowStyle}>
        {sizes.map((size) => (
          <Button key={size} size={size}>
            <Button.Leading>
              <Check />
            </Button.Leading>
            Save
          </Button>
        ))}
      </div>
    </div>
  ),
};

export const IconOnly = {
  render: () => (
    <div style={stackStyle}>
      <div style={rowStyle}>
        {variants.map((variant) => (
          <Button
            key={variant}
            variant={variant}
            aria-label={`${variant} action`}
          >
            <Button.Leading>
              <Check />
            </Button.Leading>
          </Button>
        ))}
      </div>
      <div style={rowStyle}>
        {sizes.map((size) => (
          <Button key={size} size={size} aria-label={`Menu ${size}`}>
            <Button.Leading>
              <ChevronDown />
            </Button.Leading>
          </Button>
        ))}
        <Button variant="secondary" loading aria-label="Loading action">
          <Button.Leading>
            <Check />
          </Button.Leading>
        </Button>
      </div>
    </div>
  ),
};

export const States = {
  render: () => (
    <div style={stackStyle}>
      <div>
        <p style={labelStyle}>Loading</p>
        <div style={rowStyle}>
          <Button loading>Saving</Button>
          <Button variant="secondary" loading>
            <Button.Leading>
              <Check />
            </Button.Leading>
            Syncing
          </Button>
          <Button variant="danger" loading>
            Deleting
          </Button>
          <Button loading aria-label="Loading" />
        </div>
      </div>
      <div>
        <p style={labelStyle}>Disabled</p>
        <div style={rowStyle}>
          <Button disabled>Disabled</Button>
          <Button variant="secondary" disabled>
            Disabled
          </Button>
          <Button variant="ghost" disabled>
            Disabled
          </Button>
          <Button variant="danger" disabled aria-label="Delete disabled">
            <Button.Leading>
              <Check />
            </Button.Leading>
          </Button>
        </div>
      </div>
    </div>
  ),
};

export const Link = {
  render: () => (
    <div style={rowStyle}>
      <Button as="a" href="#docs">
        Link button
      </Button>
      <Button as="a" href="#docs" variant="secondary">
        Secondary link
        <Button.Trailing>
          <ChevronDown />
        </Button.Trailing>
      </Button>
      <Button as="a" href="#docs" disabled>
        Disabled link
      </Button>
      <Button as="a" href="#docs" aria-label="Open docs">
        <Button.Leading>
          <Check />
        </Button.Leading>
      </Button>
    </div>
  ),
};

export const Block = {
  render: () => (
    <div style={{ ...stackStyle, maxWidth: 360 }}>
      <Button block>
        <Button.Leading>
          <Check />
        </Button.Leading>
        Create project
      </Button>
      <Button block variant="secondary">
        Cancel
      </Button>
      <Button block variant="ghost">
        Learn more
      </Button>
    </div>
  ),
};

export const Composition = {
  render: () => (
    <div style={stackStyle}>
      <div style={rowStyle}>
        <Button size="sm" variant="secondary">
          Cancel
        </Button>
        <Button size="sm">
          <Button.Leading>
            <Check />
          </Button.Leading>
          Save
        </Button>
      </div>
      <div style={rowStyle}>
        <Button variant="ghost">Back</Button>
        <Button variant="secondary">Draft</Button>
        <Button>Publish</Button>
      </div>
      <div style={rowStyle}>
        <Button variant="danger">
          <Button.Leading>
            <Check />
          </Button.Leading>
          Delete
        </Button>
        <Button variant="ghost" aria-label="More">
          <Button.Leading>
            <ChevronDown />
          </Button.Leading>
        </Button>
      </div>
    </div>
  ),
};
