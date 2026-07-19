# Velune Theming

## Contents

- Theme provider
- Semantic utilities
- CSS variable overrides
- Generated themes
- Theme verification

## Theme Provider

```tsx
<ThemeProvider
  theme="system"
  highContrast={false}
  reducedMotion={false}
  brandColor="#96683f"
  mood="porcelain"
  contrastRatio="AA"
  customTokens={{ "--radius-sm": "8px" }}
>
  <App />
</ThemeProvider>
```

Supported modes are `light`, `dark`, and `system`. Use `data-theme`, `data-high-contrast`, and `data-reduced-motion` when controlling the contract without React context.

## Semantic Utilities

Use concise property-aware Velune names:

```tsx
<Box className="rounded-gs-sm border border-gs-default bg-gs-surface p-4 shadow-gs-1">
  <Text className="text-gs-default">Primary content</Text>
  <Text className="text-gs-secondary">Supporting content</Text>
</Box>
```

Common groups:

- Surfaces: `bg-gs-bg`, `bg-gs-surface`, `bg-gs-surface-raised`, `bg-gs-surface-mist`
- Text: `text-gs-default`, `text-gs-secondary`, `text-gs-accent`, `text-gs-success`, `text-gs-warning`, `text-gs-error`
- Borders: `border-gs-default`, `border-gs-strong`, `border-gs-focus`
- Shape/elevation: `rounded-gs-xs`, `rounded-gs-sm`, `rounded-gs-md`, `shadow-gs-1`, `shadow-gs-2`
- Motion: `duration-gs-fast`, `ease-gs-standard`, `ease-gs-decelerate`

## CSS Variable Overrides

Override public semantic variables in a scoped root:

```css
.product-theme {
  --color-primary: #8f633e;
  --color-primary-strong: #79502f;
  --color-surface: #fffdf8;
  --color-text-primary: #302c26;
}
```

Velune maps these variables to namespaced Tailwind utilities in `velune/react/tailwind.css`. Keep CSS variable names semantic and utility names namespaced.

Do not replace fixed semantic utilities with arbitrary values:

```tsx
// Prefer
<Box className="rounded-gs-xs bg-gs-surface" />

// Avoid
<Box className="rounded-[var(--radius-xs)] bg-[var(--color-surface)]" />
```

## Generated Themes

```ts
import { applyTheme, generateTheme, getThemeCss } from "velune/react";

const theme = generateTheme({
  brand: "#96683f",
  mood: "porcelain",
  contrastRatio: "AA",
});

applyTheme(theme, "light");
const serverCss = getThemeCss(theme);
```

## Verification

- Check light, dark, and high-contrast states.
- Confirm overlays inherit the same theme as their trigger.
- Confirm text/background pairs meet WCAG AA.
- Confirm reduced-motion mode removes nonessential transitions.
- Scan selected states for size changes caused by weight, padding, or border differences.
