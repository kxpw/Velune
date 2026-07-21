import type { CSSProperties } from "react";
import { Slider } from "./Slider";

const meta = {
  title: "React/Slider",
  component: Slider,
};

export default meta;

const frame: CSSProperties = {
  display: "grid",
  gap: "var(--space-6)",
  maxWidth: 360,
};

export const Default = {
  render: () => (
    <div style={frame}>
      <Slider defaultValue={40}>
        <Slider.Label>Volume</Slider.Label>
        <Slider.Output />
      </Slider>
    </div>
  ),
};

export const Range = {
  render: () => (
    <div style={frame}>
      <Slider defaultValue={[20, 80]}>
        <Slider.Label>Price range</Slider.Label>
        <Slider.Output />
      </Slider>
    </div>
  ),
};

export const Steps = {
  render: () => (
    <div style={frame}>
      <Slider defaultValue={50} step={10}>
        <Slider.Label>Zoom</Slider.Label>
        <Slider.Output />
      </Slider>
    </div>
  ),
};

export const Percent = {
  render: () => (
    <div style={frame}>
      <Slider
        defaultValue={0.5}
        min={0}
        max={1}
        step={0.01}
        formatOptions={{ style: "percent" }}
      >
        <Slider.Label>Opacity</Slider.Label>
        <Slider.Output />
      </Slider>
    </div>
  ),
};

export const Disabled = {
  render: () => (
    <div style={frame}>
      <Slider defaultValue={30} disabled>
        <Slider.Label>Volume</Slider.Label>
        <Slider.Output />
      </Slider>
    </div>
  ),
};

export const Vertical = {
  render: () => (
    <Slider defaultValue={60} orientation="vertical" aria-label="Zoom" />
  ),
};
