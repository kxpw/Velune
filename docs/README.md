# Documentation Files

This directory is the repository-level index for Velune documentation and
shared documentation assets. User-facing guides and component pages are built
by the React/Vite application in `apps/docs/`.

## Files in This Directory

| Path | Purpose |
| --- | --- |
| `README.md` | Explains where documentation source, tests, policies, and assets live |
| `assets/velune-mark.svg` | Repository and documentation logo used by the root README |

## Documentation Source Map

| Path | Purpose |
| --- | --- |
| `../apps/docs/src/DocsPages.tsx` | Getting started, quick start, colors, theme, and Agent Skills pages |
| `../apps/docs/src/router.tsx` | Application routes, navigation, guides, templates, and page composition |
| `../apps/docs/src/component-data.ts` | Source of truth for component names, categories, descriptions, and routes |
| `../apps/docs/src/component-examples.ts` | Complete TypeScript examples rendered by component pages |
| `../apps/docs/src/api-reference.ts` | Public API and type-reference extraction |
| `../apps/docs/src/template-source.ts` | Copyable application template source |
| `../apps/docs/src/styles.css` | Docs-only layout and presentation styles |
| `../apps/docs/src/theme-context.tsx` | Documentation theme state and portal synchronization |
| `../packages/react/src/<component>/` | Component implementation, public types, tests, accessibility tests, and stories |
| `../apps/storybook/` | Component stories, visual states, and performance fixtures |
| `../apps/e2e/tests/` | Browser accessibility, focus, theme, visual, and smoke tests |
| `../skills/velune-react/` | Agent-facing Velune setup, API, theming, and composition guidance |
| `../tooling/scripts/` | Component, token, package, size, and performance documentation checks |

Source types in `packages/react/src/` are authoritative when generated API
reference text or examples disagree with remembered behavior.

## Public Documentation Routes

| Route | Content |
| --- | --- |
| `/docs/getting-started` | Product scope and core concepts |
| `/docs/quick-start` | Installation, CSS imports, and first component |
| `/docs/colors` | Semantic color roles and contrast |
| `/docs/theme` | Theme modes, providers, token overrides, and generated themes |
| `/docs/agent-skills` | Agent Skill installation, updates, and repository structure |
| `/components` | Component catalog and API pages |
| `/tokens` | Design-token browser |
| `/templates` | Copyable application templates |

## Repository Policies

These root files are the maintained source for community and project policy:

| Path | Purpose |
| --- | --- |
| `../README.md` | Project overview and minimal setup |
| `../CONTRIBUTING.md` | Local development, component standards, testing, and pull requests |
| `../CODE_OF_CONDUCT.md` | Contributor Covenant and enforcement process |
| `../SECURITY.md` | Supported versions and private vulnerability reporting |
| `../LICENSE` | MIT License |
| `../.github/ISSUE_TEMPLATE/` | Bug and feature request forms |
| `../.github/PULL_REQUEST_TEMPLATE.md` | Pull request checklist |
| `../.github/workflows/` | Verification and release automation |

## Generated Output

Do not edit these directories as documentation source:

- `apps/docs/dist/`
- `apps/storybook/storybook-static/`
- `apps/e2e/test-results/`
- package `dist/` directories

Regenerate them from their owning source and scripts.

## Verification

Run the Docs-specific checks while editing documentation:

```bash
pnpm --filter @velune/docs test
pnpm --filter @velune/docs typecheck
pnpm --filter @velune/docs lint
pnpm --filter @velune/docs build
```

Run `pnpm verify` before review when documentation changes public examples,
component metadata, generated types, package output, or performance fixtures.

## Adding Documentation

- Put user-facing guides and examples in `apps/docs/src/`.
- Keep component API guidance next to current public source types and registry
  metadata.
- Keep stories and behavioral examples colocated with their component.
- Add repository-wide policy files at the repository root or under
  `.github/`.
- Store only stable shared documentation assets in `docs/assets/`.
- Update this index when a documentation source file or ownership boundary is
  added, moved, or removed.
