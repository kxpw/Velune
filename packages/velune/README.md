# Velune

Velune is an accessible React component system built with TypeScript, Tailwind
CSS v4, and semantic design tokens.

> Velune is currently pre-1.0. Public APIs may change between minor releases.

## Install

```bash
pnpm add velune@beta
```

Velune requires React 18 or newer and Tailwind CSS 4.

Import Tailwind first, followed by Velune's tokens and utility registration:

```css
@import "tailwindcss";
@import "velune/react/theme/tokens.css";
@import "velune/react/theme/base.css";
@import "velune/react/tailwind.css";
```

## Use

```tsx
import { Button } from "velune/react";

export function App() {
  return <Button>Continue</Button>;
}
```

Per-component imports are also supported:

```tsx
import { Button } from "velune/react/button";
```

React is the supported framework today. The `velune/<framework>` namespace is
reserved for future Vue, Solid, and Svelte implementations; those entries are
not currently published.

## Components

The package publishes **48** components across foundations, layout, inputs,
navigation (including Sidebar), overlays, feedback, and data display. Browse
the full [component catalog](https://velune.dev/components),
[theme guide](https://velune.dev/docs/theme), and
[design tokens](https://velune.dev/tokens) on the documentation site.

## Agent Skill

Install the repository skill to give compatible coding agents current Velune
setup, component, theming, and composition guidance:

```bash
npx skills add kxpw/Velune
```

Refresh an existing project installation with:

```bash
npx skills update velune-react -p
```

See the [repository](https://github.com/kxpw/Velune) for source, contribution
guidance, and the security policy.
