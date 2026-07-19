<p align="center">
  <img src="docs/assets/velune-mark.svg" width="96" alt="Velune logo" />
</p>

# Velune

Velune is an accessible React component system built with TypeScript,
Tailwind CSS v4, and semantic design tokens. Its default visual language is
inspired by white porcelain: quiet surfaces, restrained color, and precise
interaction states.

> Velune is currently pre-1.0. Public APIs may change between minor releases.

## Highlights

- 38 accessible React components with compound APIs and per-component exports
- Tailwind CSS v4 utilities backed by public semantic design tokens
- Light, dark, high-contrast, reduced-motion, and generated brand themes
- ESM, CommonJS, type declarations, and automated quality gates

## Quick Start

Velune requires React 18 or newer and Tailwind CSS 4.

```bash
pnpm add velune@beta
```

Import Tailwind first, followed by Velune's semantic tokens and utility
registration in your global CSS entry:

```css
@import "tailwindcss";
@import "velune/react/theme/tokens.css";
@import "velune/react/tailwind.css";
```

```tsx
import { Button } from "velune/react";

export function App() {
  return <Button>Continue</Button>;
}
```

Import from `velune/react` by default. Per-component entries such as
`velune/react/button` are also supported.

## Documentation

Browse the [component catalog](https://velune.dev/components),
[getting-started guide](https://velune.dev/docs/getting-started),
[theme guide](https://velune.dev/docs/theme),
[design tokens](https://velune.dev/tokens), and
[templates](https://velune.dev/templates). Documentation source lives in
[`apps/docs/src`](apps/docs/src); see the
[`docs/` file map](docs/README.md) for ownership details.

## Development

Repository development requires Node.js 20+ and pnpm 9+.

```bash
corepack enable
pnpm install
pnpm dev
pnpm verify
```

The Docs app runs at <http://127.0.0.1:4173>. Use `pnpm storybook` for
component development and `pnpm test:e2e` for Playwright scenarios.

## Agent Skill

Install or update the bundled [`velune-react` skill](skills/velune-react/SKILL.md):

```bash
npx skills add kxpw/Velune
npx skills update velune-react -p
```

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request. Public
API, type, or behavior changes require a changeset. Documentation-only changes
can be marked `no-release` in the pull request.

Follow the [Code of Conduct](CODE_OF_CONDUCT.md). Report vulnerabilities
privately according to the [Security Policy](SECURITY.md).

## License

[MIT](LICENSE) © Velune Contributors
