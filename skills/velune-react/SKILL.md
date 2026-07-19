---
name: velune-react
description: Build, audit, and maintain accessible React interfaces with the Velune design system, Tailwind CSS v4, semantic Velune utilities, themes, and compound components. Use when installing or configuring `velune`, importing from `velune/react`, creating or refactoring pages and templates with Velune components, selecting component props and variants, customizing Velune tokens, or replacing hand-written UI with Velune primitives.
---

# Velune React

Use the current Velune React API and its native Tailwind v4 styling contract. Treat source types as authoritative.

## Workflow

1. Inspect the target project's package manager, React version, Tailwind version, existing global CSS, and installed `velune` version.
2. Query the needed components before coding:

```bash
node "$SKILL_DIR/scripts/list_components.mjs"
node "$SKILL_DIR/scripts/get_component_docs.mjs" DateRangePicker Dropdown
```

Set `SKILL_DIR` to the directory containing this file. Keep the shell working directory at the target project so scripts can inspect its repository or installed `velune` package.

3. Read [references/setup.md](references/setup.md) when installing Velune or correcting CSS imports.
4. Read [references/patterns.md](references/patterns.md) before composing forms, overlays, navigation, or stateful controls.
5. Read [references/theming.md](references/theming.md) only for tokens, theme switching, semantic utilities, or visual overrides.
6. Implement with `velune/react` components and native Tailwind utilities.
7. Verify types, keyboard interaction, focus behavior, responsive layout, and light/dark themes in proportion to the change.

## Current API Guardrails

- Import React components and theme APIs from `velune/react`.
- Do not use removed packages such as `@velune/core`, `@velune/theme`, `@velune/icons`, or any Velune AI package.
- Do not invent `velune/vue`, `velune/solid`, or `velune/svelte` APIs. Those framework entry points are planned, not implemented.
- Use React 18+, Tailwind CSS v4, and the two required Velune CSS imports.
- Prefer compound APIs: compose headings and supporting copy with component title and description slots; declare selection items with `Select.Content`, `Select.Group`, and `Select.Item`; compose action menus with `Dropdown.Trigger`, `Dropdown.Menu`, and `Dropdown.Item`; use structural parts such as `Card.Header`, `Drawer.Content`, `Modal.Content`, `Tabs.List`, and `Wizard.Step`.
- Preserve controlled and uncontrolled component contracts. Do not mirror props into local state without a behavioral reason.
- Preserve native form behavior. Use `name` and `form` on selection controls and date fields, plus `startName` and `endName` on `DateRangePicker`; do not synthesize business change events for prop synchronization or form reset.
- Use application icon libraries such as `lucide-react`; Velune does not ship an icon package.

## Styling Rules

- Prefer semantic utilities such as `bg-gs-surface`, `text-gs-default`, `text-gs-secondary`, `border-gs-default`, `rounded-gs-sm`, and `shadow-gs-1`.
- Avoid redundant names such as `border-gs-border-default` and `text-gs-text-primary`.
- Avoid fixed-token arbitrary values such as `rounded-[var(--radius-xs)]` or `bg-[var(--color-surface)]` when a Velune utility exists.
- Allow bracket syntax for dynamic `calc()`, `min()`, `max()`, `clamp()`, state selectors, and precise one-off layout tracks.
- Customize semantic CSS variables at an application scope; do not target component internals when a public prop or utility expresses the intent.
- Keep selected, checked, and active typography metrically stable. Do not change font weight, padding, or border width in a way that shifts layout.

## Documentation Commands

```bash
# Component list and current public types
node "$SKILL_DIR/scripts/list_components.mjs"
node "$SKILL_DIR/scripts/get_component_docs.mjs" DateRangePicker Dropdown

# Implementation and component theme variables
node "$SKILL_DIR/scripts/get_source.mjs" Button
node "$SKILL_DIR/scripts/get_styles.mjs" Button
node "$SKILL_DIR/scripts/get_theme.mjs"

# Bundled guides
node "$SKILL_DIR/scripts/get_docs.mjs" setup
node "$SKILL_DIR/scripts/get_docs.mjs" theming
node "$SKILL_DIR/scripts/get_docs.mjs" patterns
```

Use [references/components.md](references/components.md) for the catalog and common anatomy when source files are unavailable.
