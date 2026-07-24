# Velune Theming

## Contents

- Theme provider
- ThemeToggle and useThemeToggle
- Semantic utilities
- CSS variable overrides
- Generated themes
- Theme verification

## Theme Provider

```tsx
<ThemeProvider
  theme="system"
  brandColor="#96683f"
  mood="porcelain"
  base="porcelain"
  contrastRatio="AA"
  highContrast={false}
  reducedMotion={false}
  customTokens={{ "--radius-sm": "8px" }}
>
  <App />
</ThemeProvider>
```

Supported modes are `light`, `dark`, and `system`. Brand props (`brandColor`, `mood`, `base`, `contrastRatio`) run `generateTheme()` and inject semantic variables. When `brandColor` is set, the root also gets `data-brand="true"`.

Use `data-theme`, `data-high-contrast`, `data-reduced-motion`, and `data-brand` when controlling the contract without React context.

## ThemeToggle And useThemeToggle

Prefer `ThemeToggle` for a ready-made sun/moon control. Wire it to a controlled `ThemeProvider`:

```tsx
import { useState } from "react";
import { ThemeProvider, ThemeToggle } from "velune/react";

export function App() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  return (
    <ThemeProvider theme={theme}>
      <ThemeToggle
        theme={theme}
        onThemeChange={(next) => {
          if (next !== "system") setTheme(next);
        }}
      />
      <Routes />
    </ThemeProvider>
  );
}
```

`ThemeToggle` defaults to icon content; `lightLabel` / `darkLabel` feed the accessible name. Pass `children` only when you need custom chrome.

Use `useThemeToggle` when you need custom persistence, layout, or controls:

```tsx
import { Moon, Sun } from "lucide-react";
import { Button, ThemeProvider, useThemeToggle } from "velune/react";

export function CustomThemeToggle() {
  const { resolvedTheme, toggleTheme } = useThemeToggle({
    storageKey: "app-theme",
    defaultTheme: "system",
  });
  const isDark = resolvedTheme === "dark";

  return (
    <ThemeProvider theme={resolvedTheme}>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
        onClick={toggleTheme}
      >
        <Button.Leading>
          {isDark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
        </Button.Leading>
      </Button>
    </ThemeProvider>
  );
}
```

Hook surface: `theme`, `resolvedTheme`, `setTheme`, `toggleTheme`. Options: `defaultTheme`, `storageKey`, `persist`, `applyToDocument`.

## Semantic Utilities

Use concise property-aware Velune names:

```tsx
<Box className="rounded-gs-sm border border-gs-border-default bg-gs-surface p-gs-4 shadow-gs-1">
  <Text className="text-gs-text">Primary content</Text>
  <Text className="text-gs-text-secondary">Supporting content</Text>
</Box>
```

Common groups:

- Surfaces: `bg-gs-canvas`, `bg-gs-surface`, `bg-gs-surface-raised`, `bg-gs-surface-mist`
- Text: `text-gs-text`, `text-gs-text-secondary`, `text-gs-text-accent`, `text-gs-success`, `text-gs-warning`, `text-gs-error`
- Borders: `border-gs-border-default`, `border-gs-border-strong`, `border-gs-focus`
- Feedback tints: `bg-gs-error-subtle`, `bg-gs-error-soft`, `bg-gs-error-strong` (and matching success/warning/info where exposed)
- Shape/elevation: `rounded-gs-xs`, `rounded-gs-sm`, `rounded-gs-lg`, `rounded-gs-full`, `shadow-gs-0`, `shadow-gs-1`, `shadow-gs-2`, `shadow-gs-3`
- Type/space: `text-gs-sm`, `font-gs-medium`, `leading-gs-normal`, `gap-gs-4`, `p-gs-4`
- Motion: `duration-gs-fast` (via `--transition-duration-gs-fast`), `ease-gs-standard`, `ease-gs-glide`

Do not invent removed aliases such as `bg-gs-muted`, `text-gs-muted`, `bg-gs-bg`, `error-tint`, or `error-muted`.

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
  base: "porcelain",
  contrastRatio: "AA",
});

applyTheme(theme, document.documentElement, "light");
const serverCss = getThemeCss(theme);
```

- `mood`: `"porcelain" | "futuristic" | "warm" | "mono"`
- `base`: `"porcelain" | "neutral" | "stone" | "zinc" | "slate"`
- `contrastRatio`: `"AA" | "AAA"`

## Verification

- Check light, dark, and high-contrast states.
- Confirm overlays inherit the same theme as their trigger.
- Confirm text/background pairs meet WCAG AA.
- Confirm reduced-motion mode removes nonessential transitions.
- Scan selected states for size changes caused by weight, padding, or border differences.
