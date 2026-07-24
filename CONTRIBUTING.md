# Contributing to Velune

Thank you for contributing to Velune. This document covers the workflow needed
to produce a focused, reviewable change.

## Ways to Contribute

- Report a reproducible bug with the bug report template.
- Propose a reusable component or API improvement with the feature request
  template.
- Improve component behavior, accessibility, tests, examples, or
  documentation.
- Review open pull requests and verify reported behavior.

Small documentation and test improvements can go directly to a pull request.
Discuss new components, broad public APIs, dependencies, and architectural
changes in an issue before implementation.

## Before You Start

- Search existing issues and pull requests before opening a duplicate.
- Use an issue or discussion before implementing a new component, public API,
  or broad architectural change.
- Do not report security vulnerabilities in a public issue. Follow
  [SECURITY.md](SECURITY.md).
- Follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## Local Setup

Use Node.js 20 or newer and pnpm 9 or newer:

```bash
git clone https://github.com/kxpw/Velune.git
cd velune
corepack enable
pnpm install
pnpm verify
```

Start the documentation application or Storybook while developing:

```bash
pnpm dev
pnpm storybook
```

## Repository Layout

| Path               | Purpose                                                     |
| ------------------ | ----------------------------------------------------------- |
| `packages/react/`  | React components, design tokens, themes, tests, and stories |
| `packages/velune/` | Published `velune` package assembly and public exports      |
| `packages/hooks/`  | Shared React hooks                                          |
| `apps/docs/`       | Vite documentation application and component examples       |
| `apps/storybook/`  | Component development and performance stories               |
| `apps/e2e/`        | Playwright interaction, accessibility, and visual tests     |
| `tooling/`         | Generators and repository quality checks                    |

## Making Changes

1. Create a focused branch such as `feat/select-empty-state` or
   `fix/date-picker-focus`.
2. Follow existing component and Tailwind patterns.
3. Add tests proportional to the behavior and regression risk.
4. Update stories and user documentation for visible component changes.
5. Run `pnpm verify` before opening the pull request.

Avoid mixing mechanical refactors, dependency updates, and behavior changes in
one pull request. Preserve unrelated work in the repository and keep generated
files synchronized with their sources.

## Coding Standards

- Use TypeScript and the repository's existing React patterns.
- Use PascalCase for components and component files, camelCase for utilities,
  and `use` prefixes for hooks.
- Keep component directories and CSS classes in kebab-case, for example
  `text-area/` and `gs-text-area`.
- Keep public exports in each module's `index.ts`.
- Forward refs to the primary DOM node and preserve relevant native DOM props,
  event handlers, `aria-*`, and `data-*` attributes.
- Preserve controlled and uncontrolled behavior, native form participation,
  keyboard interaction, focus restoration, and server rendering.
- Use public semantic tokens and Velune Tailwind utilities instead of hard-coded
  visual values.
- Let Prettier, ESLint, and Stylelint own formatting. Do not disable a rule
  without explaining why the local exception is necessary.

## Component Development

Component source, tests, types, and stories are colocated under
`packages/react/src/<component>/`. Register component metadata in
`apps/docs/src/component-data.ts`, then generate and register its source
and package entries with:

```bash
pnpm create:component ComponentName
```

The generator creates the implementation, public types, index, unit test,
accessibility test, and Storybook story, then registers build and package
entries. Replace the generated baseline with the actual component contract and
add:

- behavior and edge-case tests;
- keyboard and focus tests for interactive components;
- controlled/uncontrolled and native form tests when state is owned;
- ref forwarding and prop passthrough tests;
- `*.type-test.ts` coverage for important public type contracts;
- representative stories for variants, states, themes, and responsive layout.

Do not hand-roll established interaction engines when a proven dependency is
already used by the repository. Keep public APIs consistent with neighboring
components and prefer composition over a large set of presentation props.

### Polymorphism: `as` by default

Velune standardizes on the `as` prop for element polymorphism. When a
component should render as a different element, type it with
`PolymorphicProps`/`PolymorphicComponent` from `packages/react/src/shared/polymorphic.ts`
and cover it in `packages/react/src/shared/polymorphic.type-test.tsx`
(see `Box`, `Container`, `Flex`, `Grid`, `Stack`, `Text`, `Card`, and the
`Modal.Title`/`Drawer.Title` slots). Constrained unions are acceptable when
only specific elements are safe, such as `Button`'s `as?: "button" | "a"`.

Do not introduce Radix-style `asChild` props outside Button. When a component needs to
attach behavior to caller-provided markup, expose a compound trigger slot
that clones its single child instead (`Tooltip.Trigger`, `Popover.Trigger`,
`Dropdown.Trigger`), keeping behavior injection and element identity as two
separate, predictable APIs.

## Verification

Run the smallest relevant checks while iterating, followed by the complete
gate before review.

| Command                                          | Purpose                                                                             |
| ------------------------------------------------ | ----------------------------------------------------------------------------------- |
| `pnpm --filter @velune/react-internal test`      | Run React component tests                                                           |
| `pnpm --filter @velune/react-internal typecheck` | Type-check React components                                                         |
| `pnpm format`                                    | Format supported source and documentation files                                     |
| `pnpm lint`                                      | Run ESLint and Stylelint                                                            |
| `pnpm lint:components`                           | Check component structure and registry coverage                                     |
| `pnpm lint:architecture`                         | Check package dependency boundaries                                                 |
| `pnpm lint:tokens`                               | Check token and visual-value rules                                                  |
| `pnpm test:e2e`                                  | Run Playwright interaction and visual scenarios                                     |
| `pnpm verify`                                    | Run the complete local build, lint, type, test, package, size, and performance gate |
| `pnpm verify:ci`                                 | Run `verify` plus the Playwright suite                                              |

Use Vitest and Testing Library for component tests. Colocate unit tests as
`*.test.tsx`, accessibility tests as `*.a11y.test.tsx`, and type tests as
`*.type-test.ts`. Put browser workflows in `apps/e2e/tests/`.

For visual changes, inspect light, dark, and high-contrast themes at desktop
and mobile widths. Check reduced motion, long text, RTL, disabled, invalid, and
loading states when they apply.

## Changesets

Add a changeset for changes to public code, types, or behavior:

```bash
pnpm changeset
```

Choose the published `velune` package and the appropriate SemVer impact.
Documentation-only and repository-only pull requests may use `no-release` in
the pull request description.

- Use **patch** for backward-compatible fixes.
- Use **minor** for backward-compatible features or public API additions.
- Use **major** for breaking changes and include migration guidance.

Velune is pre-1.0, but breaking changes must still be called out explicitly.
Do not add an empty changeset solely to satisfy the checklist.

## Commit and Pull Request Conventions

Use Conventional Commit titles, for example:

```text
feat(select): support grouped empty states
fix(date-picker): preserve focus after month navigation
docs: clarify Tailwind import order
```

Keep pull requests focused. Include:

- the problem and motivation;
- the chosen implementation and relevant tradeoffs;
- verification commands and results;
- screenshots or recordings for visual changes;
- migration notes for breaking changes.

The pull request template contains the complete checklist.

Pull requests should also:

- link the issue or discussion when one exists;
- identify public API, bundle-size, performance, accessibility, and migration
  impact;
- include before/after screenshots or recordings for visual changes;
- update documentation and Storybook examples together with behavior;
- pass CI without unrelated snapshot or generated-file churn.

## Review Priorities

Reviewers evaluate changes in this order:

1. behavior and edge cases;
2. accessibility and keyboard interaction;
3. public API and type design;
4. test quality;
5. performance and bundle impact;
6. documentation and maintainability.

Review feedback may ask for a smaller scope, an alternative API, additional
tests, or measurements. Resolve conversations explicitly, and describe any
intentionally deferred work in the pull request rather than silently omitting
it.

## Documentation Contributions

The documentation application lives in `apps/docs/src/`. Keep installation,
examples, component metadata, and the repository
[`velune-react` skill](skills/velune-react/SKILL.md) aligned with the public
source types. Run the Docs tests, type check, and build when those files change.

## AI-Assisted Contributions

AI-assisted contributions are welcome, but the contributor remains responsible
for every submitted line. Review generated code, remove fabricated APIs, run
the required checks, and do not include secrets, private data, or material you
are not permitted to license. Disclose substantial generated content when that
context will help reviewers assess the change.

## Getting Help

Open a focused issue when the documented setup fails or when the expected API
is unclear. Include the relevant Node, pnpm, React, Tailwind, browser, and Velune
versions plus a minimal reproduction. Security reports must use the private
process in [SECURITY.md](SECURITY.md).

## License

By contributing, you agree that your contributions will be licensed under the
repository's [MIT License](LICENSE).
