---
"velune": minor
---

Ship the pending library updates as one release:

- Add Sidebar navigation rail (Provider, collapse modes, menu slots, mobile Drawer) with a11y polish: nav landmark, mobile `aria-controls`, offcanvas inert + focus escape, icon-rail layout, Badge/Action spacing, quieter MenuItem defaults, and `enableKeyboardShortcut`.
- Extend Table with column `sortValue`/`sorter`, sticky `fixed` columns, and expandable `tree` rows (shared with VirtualTable).
- Add `"use client"` directives to built component entries for React Server Components.
- Improve theme provider coordination across portals, high-contrast native controls, generated theme CSS imports, ThemeToggle (sun/moon icons + accessible names), and generated AAA contrast on muted surfaces.
- Normalize design-system naming and shared recipes (Alert/Toast accents, dismiss chrome, Select/Combobox/Input control surfaces); refine Alert tone bars, badge icons, and Action slot.
- Collapse foundation/component token duplicates; unify Tailwind to one utility per role; remove deprecated compatibility aliases (`error-tint`, Alert `neutral`, Button `danger` variant, Table `virtualized` bridge, and related legacy props/utilities).
