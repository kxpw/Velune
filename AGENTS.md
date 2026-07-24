# Repository Guidelines

## Project Structure & Module Organization

Velune is a pnpm monorepo. Publishable TypeScript packages live in `packages/`: `react` contains React components, design tokens, and theming, while `hooks` provides supporting React hooks; `velune` is the aggregate package. Applications are under `apps/`: the React/Vite documentation site, Storybook, and Playwright E2E tests. Shared configs and generators belong in `tooling/`; architectural decisions and contributor references are in `docs/`. Component tests, styles, types, and stories are colocated with implementations, for example `packages/react/src/button/`.

## Build, Test, and Development Commands

Use Node 20 and pnpm 9 (`pnpm install`). Common root commands are:

- `pnpm dev`: run the documentation site.
- `pnpm storybook`: start component Storybook.
- `pnpm build`: build every workspace package that defines a build script.
- `pnpm test`: run workspace tests serially; target React with `pnpm --filter @velune/react-internal test`.
- `pnpm lint`: regenerate tokens, then run ESLint and Stylelint.
- `pnpm typecheck`: regenerate tokens and run TypeScript project references.
- `pnpm verify`: run all architecture, component, token, lint, type, and test checks expected by CI.
- `pnpm --filter @velune/e2e test:e2e`: run Playwright scenarios.

## Coding Style & Naming Conventions

Prettier enforces double quotes, semicolons, and trailing commas; run `pnpm format` before submitting. ESLint covers TypeScript/React and Stylelint covers CSS. React components and files use PascalCase (`Button.tsx`, `ButtonProps`), hooks start with `use`, utilities use camelCase, and component directories/CSS classes use kebab-case (`text-area/`, `gs-text-area`). Keep public exports in each module's `index.ts`; use design tokens rather than hard-coded visual values.

## Testing Guidelines

Use Vitest and Testing Library. Colocate unit tests as `*.test.tsx`, accessibility tests as `*.a11y.test.tsx`, and type tests as `*.type-test.ts`. Cover behavior, keyboard interaction, ref forwarding, prop passthrough, and important variants. Component changes should also update `*.stories.tsx`; E2E flows belong in `apps/e2e/tests/`.

## Commit & Pull Request Guidelines

History and commitlint use Conventional Commits: `feat(button): add loading state`, `fix: ...`, or `chore: ...`. Use matching branch prefixes such as `feat/`, `fix/`, or `docs/`. User-visible code, type, or behavior changes require `pnpm changeset`; mark documentation-only PRs `no-release`. Follow `.github/PULL_REQUEST_TEMPLATE.md`, explain motivation and tradeoffs, link issues, report verification, and include screenshots or GIFs for visual changes. Keep PRs focused and run `pnpm verify` before review.
