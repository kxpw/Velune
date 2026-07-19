import type { CSSProperties } from "react";
import { Button } from "../button";
import { ReliefCard } from "./ReliefCard";

const meta = {
  title: "React/ReliefCard",
  component: ReliefCard,
  parameters: {
    layout: "padded",
  },
};

export default meta;

const frameStyle: CSSProperties = {
  maxWidth: "560px",
  padding: "var(--space-6)",
};

export const Default = {
  render: () => (
    <div style={frameStyle}>
      <ReliefCard>
        <ReliefCard.Title>Velune design system</ReliefCard.Title>
        <ReliefCard.Description>
          Hover to reveal the subtle relief pattern beneath the surface. Use it
          once per page.
        </ReliefCard.Description>
      </ReliefCard>
    </div>
  ),
};

export const WithActions = {
  render: () => (
    <div style={frameStyle}>
      <ReliefCard>
        <ReliefCard.Title as="h3">No projects yet</ReliefCard.Title>
        <ReliefCard.Description>
          Create your first project to start your workspace.
        </ReliefCard.Description>
        <ReliefCard.Action>
          <Button variant="primary">Create project</Button>
        </ReliefCard.Action>
      </ReliefCard>
    </div>
  ),
};

export const Drift = {
  render: () => (
    <div style={frameStyle}>
      <ReliefCard animation="drift">
        <ReliefCard.Title>Living surface</ReliefCard.Title>
        <ReliefCard.Description>
          A slow texture drift adds ambient motion without moving the content.
        </ReliefCard.Description>
      </ReliefCard>
    </div>
  ),
};

export const CustomAnimation = {
  render: () => (
    <div style={frameStyle}>
      <ReliefCard
        animation={{
          preset: "pulse",
          duration: 2800,
          delay: 200,
          easing: "cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <ReliefCard.Title>Configurable rhythm</ReliefCard.Title>
        <ReliefCard.Description>
          Duration, delay, and easing can follow the surrounding experience.
        </ReliefCard.Description>
      </ReliefCard>
    </div>
  ),
};

export const CustomTexture = {
  render: () => (
    <div style={frameStyle}>
      <ReliefCard
        animation="drift"
        texture={{
          source: "radial-gradient(circle, #000 1px, transparent 1.25px)",
          size: "20px 20px",
          position: "center",
          repeat: "repeat",
        }}
      >
        <ReliefCard.Title>Custom texture</ReliefCard.Title>
        <ReliefCard.Description>
          CSS masks can replace the built-in contour artwork.
        </ReliefCard.Description>
      </ReliefCard>
    </div>
  ),
};
