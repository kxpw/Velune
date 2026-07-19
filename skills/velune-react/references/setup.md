# Velune React Setup

## Requirements

- React and React DOM 18 or newer
- Tailwind CSS 4
- A global CSS entry processed by Tailwind

## Install

```bash
pnpm add velune react react-dom tailwindcss
```

Use the target project's package manager instead of changing package managers.

## Global CSS

Load Tailwind first, followed by Velune tokens and utility registration:

```css
@import "tailwindcss";
@import "velune/react/theme/tokens.css";
@import "velune/react/tailwind.css";

@source "../node_modules/velune/dist/react";
```

Adjust the `@source` path for the CSS file's location and package manager layout. In the Velune monorepo, point `@source` at `packages/react/src`.

## Root Provider

Use one provider near the application root when the app needs explicit theme state, high contrast, reduced motion, or generated brand tokens:

```tsx
import { ThemeProvider } from "velune/react";
import "./globals.css";

export function App() {
  return (
    <ThemeProvider theme="system">
      <Routes />
    </ThemeProvider>
  );
}
```

Static applications can consume the CSS tokens without a provider. Overlay components inherit provider state through the document root.

## First Component

```tsx
import { Button, Input, Stack } from "velune/react";

export function SignInForm() {
  return (
    <Stack as="form" gap="4">
      <Input type="email" fullWidth>
        <Input.Label>Email</Input.Label>
      </Input>
      <Button type="submit">Continue</Button>
    </Stack>
  );
}
```

## Troubleshooting

- Missing colors or spacing: confirm both Velune CSS imports are present after Tailwind.
- Missing generated utilities: confirm the `@source` path includes Velune React output.
- Old imports: replace `@velune/core` and `@velune/theme` with `velune/react` and CSS subpath exports.
- Empty overlays: keep `ThemeProvider` at the application root so portal content inherits active theme attributes.
