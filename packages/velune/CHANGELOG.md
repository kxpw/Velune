# velune

## 0.1.0-beta.0

### Minor Changes

- 471bf90: Add an accessible, tokenized DatePicker with keyboard navigation and date constraints.
- 3216bfe: Add an accessible DateRangePicker with controlled and uncontrolled values,
  date ordering constraints, compound field metadata, form submission, responsive
  layout, and the existing DatePicker interaction model.
- 3216bfe: Add an accessible Dropdown with composable triggers, menu items, sections,
  separators, item metadata, selection modes, disabled and danger states, and
  keyboard navigation.
- 62a407f: Add a tokenized Skeleton placeholder with shape and animation variants, plus
  per-component CSS exports for pay-as-you-go styling. Add a dedicated
  VirtualTable entry so regular tables do not load virtualization dependencies.
- 471bf90: Add optional Table row virtualization for large data sets with sticky headers, dynamic row measurement, and configurable overscan.
- 3216bfe: Add a useThemeToggle hook that preserves light, dark, and system preferences,
  exposes the resolved color mode, persists changes, and synchronizes theme
  selection across browser tabs. ThemeProvider now exposes system explicitly
  through `data-theme="system"`.
- 3216bfe: Add configurable reveal, drift, pulse, and disabled animation modes to
  ReliefCard, including custom duration, delay, and easing options. Allow the
  texture to be replaced with a CSS mask, detailed mask options, or a React
  element, and support disabling the texture entirely.
- 3216bfe: Replace configuration-style visual content props across Card, ReliefCard,
  List, Modal, Drawer, Wizard, Select, Popover, Tooltip, Input, TextArea,
  DatePicker, Checkbox, Radio, Switch, Button, Tag, Table, VirtualTable,
  Wizard.Navigation, and Form.Item with declarative compound children. Remove
  the redundant Avatar icon fallback prop, and use native `aria-label` for
  Spinner and Progress accessible names. Preserve dialog and field
  accessibility relationships, form behavior, wizard metadata, overlay
  interactions, and Select search, empty states, grouping, keyboard, and
  submission behavior.

  Standardize polymorphic `as` typing so intrinsic props and refs follow the
  rendered element, and standardize parsed compound slots so Tailwind classes,
  ARIA attributes, and `data-*` attributes reach their rendered DOM parts.
  Rename high-level state callbacks to semantic names: `onValueChange` for
  Select, DatePicker, Checkbox.Group, and Radio.Group; `onCheckedChange` for
  Switch; and `onPageChange` for Pagination. Native form controls continue to
  use event-based `onChange`.

  Keep Input clear and password-visibility actions keyboard reachable, and only
  apply automatic button semantics to Card when it has an actual click action.
  Correct token generation paths so builds update `src/theme` directly instead
  of creating a duplicated `src/theme/src` tree.

  Consolidate compound-slot parsing into one recursive command dispatcher, use
  mode strategies for Select and Collapse selection, and share tested linear and
  calendar navigation algorithms across Select, DatePicker, Tabs, Collapse,
  Radio, and Wizard without changing their public APIs.

  Skip table-wide selection scans when selection is disabled, keep table state
  commands stable, and memoize data rows so root-only updates do not rebuild every
  cell. Keep row-selection commands identity-stable so selecting one row only
  rerenders that row, and avoid resolving selected records when no selection
  listener is registered. Move index-independent rows during sorting without
  rebuilding their cells while preserving index-sensitive custom renderers,
  clickable rows, and virtual rows. Resolve each table sort key once, reuse
  natural string collation, and preserve the original order of equal values so
  large virtualized datasets avoid repeated path parsing during comparison.
  Read single-segment row keys and cell fields directly without allocating path
  segments, and use constant-time aggregate state for internal select-all and
  empty-selection transitions. Partition DatePicker calendar rendering by week
  and isolate stable header, weekday, and footer regions. Automatically virtualize
  large ungrouped Select lists through a lazy chunk while preserving the small-list
  bundle and grouped option behavior. Replace DatePicker's general-purpose date
  formatting dependency with strict local calendar serialization and parsing.
  Resolve the long-date formatter once per locale so rebuilding a month does not
  repeat formatter cache-key work for all 42 day labels.
  Cache Select value membership and selected labels so large-list keyboard
  navigation does not rescan every option, and only refresh latest-value refs when
  their committed value changes. Share a field-level selection store between
  Checkbox.Group and Radio.Group so changing one value only notifies the affected
  options, while preserving controlled values, form resets, and re-entrant changes.
  Keep Switch, Radio, Select option, DatePicker day, and Pagination item typography
  stable across selection states so interaction does not shift text or inline
  layout.
  Keep Tabs variant utilities mutually exclusive so Block lists and selected
  triggers retain their intended background, spacing, radius, and shadow. Keep
  full-width tab labels on one line and let their segments grow with their
  content, using list-level horizontal scrolling when the row exceeds its
  container.
  Refine Toast into a neutral, responsive notification surface with compact tone
  indicators, clearer title and description hierarchy, responsive actions, and a
  non-blocking close control.
  Refine Modal with a compact dialog surface, fixed header and footer regions,
  body-only scrolling, an absolute close control, and bottom-sheet positioning on
  small screens.
  Reuse the empty Form rule list so fields without validation do not re-register
  after unrelated value updates.

- fb768df: Add P0 React primitives and form controls with tokenized styles, stories, tests, and docs.
- 3216bfe: Harden component behavior against Radix React interaction baselines: isolate
  modal backgrounds, preserve nested portal layers, add form participation for
  Select and Switch, improve RTL and keyboard navigation, prevent stale async
  validation, and pause toast timers when users cannot interact with them.
  Make portals hydration-safe; complete native change, reset, required, and
  external-form behavior for Select, Switch, and RadioGroup; compose toast pause
  events; and harden outside-click and overlay focus restoration boundaries.
  Extend the same reset and external-form guarantees to CheckboxGroup, keep toast
  timers paused until every interaction source resumes, follow live DOM order for
  Tabs and Collapse keyboard navigation, and compose overlay content hover/click
  handlers without generating empty dialog label references.
  Complete DatePicker native validation, external-form, change, and reset
  behavior; keep delayed overlay callbacks current without reordering Escape
  layers; and protect force-mounted Tabs and Collapse content from consumer props
  overriding inactive visibility semantics.
  Calibrate React, Select, and Table size budgets for the added interaction
  guarantees shared through their component dependencies.
  Cache DatePicker calendar metadata and date formatters so controlled updates
  avoid rebuilding all 42 day cells and redundant same-month state.
  Protect native state and ARIA invariants from conflicting passthrough props,
  deduplicate unchanged Tabs values, and normalize Collapse state when its mode
  changes from multiple to single.
  Align `useControllableState` with Radix same-value and functional-update
  semantics, preserve the last controlled value on mode changes, and share it
  across Tabs, Modal, Drawer, Popover, and Tooltip.
  Discriminate Collapse and Select single/multiple props so value, default value,
  callbacks, and mode-only options are checked together by TypeScript.
  Close disabled or read-only floating controls without reviving stale open
  state, and prevent stale, re-entrant, or post-unmount Wizard/Form async work
  from committing results.
  Preserve link semantics for anchor buttons, compose Card/List/Tag keyboard
  handlers through real click events without reacting to nested controls, emit
  Input clearing through the native event path, and prevent passthrough props
  from hiding Button/Table busy state.
  Restore uncontrolled Input/TextArea defaults on native form reset, preserve
  their last controlled value when modes change, keep forwarded refs stable,
  protect Divider separator semantics, and make event callbacks current before
  layout effects run.
  Keep composed refs stable across ordinary prop updates for Checkbox, Collapse,
  Drawer, Modal, Popover, Select, Switch, and Tooltip while preserving required
  native DOM synchronization for mixed and collapsed states.
  Transfer mounted Modal and Drawer roots correctly when consumers replace the
  ref prop, and associate Avatar image failures with the failing source so a new
  source renders immediately without an effect-driven extra commit.
  Only emit Select and Switch native change events for user interactions, after
  the form mirror has committed its value; controlled value/checked prop updates
  no longer masquerade as user input or run a value-watching dispatch effect.
  Apply the same user-only, post-commit native change contract to DatePicker and
  the other mirrored form controls.
  Avoid resetting DatePicker, Select, and Switch form listeners when name-only
  props change, and keep Select local filtering memoized when an external search
  callback changes identity without changing search mode.
  Keep scrollable Table header controls above row controls by isolating the table
  stacking context and assigning sticky headers the sticky z-index token.
  Vertically center selection checkbox controls within Table header and body
  cells without changing the first-line alignment of labeled Checkbox usage.
  Use the standard spinner duration for Switch loading feedback instead of the
  much faster generic slow-transition duration.
  Redesign Radio selection controls around the Radix state hierarchy while
  retaining Velune theme tokens: selected items now use a solid primary disc with
  a high-contrast center dot across hover, active, invalid, disabled, focus, and
  high-contrast states.
  Align shared floating placement more closely with Radix Popper: compare
  main-axis overflow before flipping, shift cross-axis overflow without changing
  sides, and coalesce scroll, resize, and element-resize measurements per frame.
  Align Tooltip trigger coordination with Radix: open immediately for keyboard
  focus, suppress pointer-induced focus reopening, keep only one tooltip open,
  and close transient content when an ancestor of its trigger scrolls.
  Trap programmatic focus with a nested FocusScope-style stack for Modal and
  Drawer while allowing non-modal portal branches to receive focus. Delay
  searchable Select autofocus until its positioned portal is visible.
  Restart Toast lifetimes when an existing id is updated, apply reduced queue
  limits immediately, and move focus to the notification viewport before a
  focused toast is removed.
  Add localized Toast viewport labels and configurable keyboard hotkeys, default
  F8 focus access, and composable Escape dismissal that does not reach
  underlying overlays.
  Add configurable Toast swipe direction and threshold with directional gesture
  buffering, pointer capture, scroll-axis preservation, cancelled-swipe rebound,
  and post-swipe click suppression.
  Align Tabs roving focus with Radix across manual activation, direct focus, and
  dynamic trigger removal or disabling; ignore focus, navigation, and click
  events from portaled descendants, and keep tab-stop synchronization linear
  during value updates.
  Align RadioGroup keyboard navigation with Radix roving focus: expose RTL and
  loop controls, constrain arrows to the configured axis, ignore modified and
  portaled descendant events, and support PageUp/PageDown boundary navigation.
  Add Radix-aligned Collapse root orientation, direction, and disabled controls;
  map horizontal keys for RTL, propagate disabled state to every trigger, and
  wrap horizontal items responsively without clipping their content.
  Propagate DatePicker direction into its portaled calendar, mirror RTL day and
  month navigation, protect root state props, and expose localizable calendar
  command labels.
  Compose Select consumer keyboard and blur handlers before internal behavior in
  both field layouts, recover from disabled active options, and propagate RTL and
  localized empty-state copy into the portaled panel.
  Add cancellable Popover open/close autofocus and Escape hooks, wait for
  positioning readiness before focusing content, restore trigger focus by close
  reason, and preserve focus on outside-pointer dismissal.
  Coordinate Tooltip hover delay across instances with a Radix-style skip-delay
  window and expose cancellable Escape dismissal while retaining single-instance
  handoff behavior.
  Expose cancellable Modal open/close autofocus, Escape, and overlay-click
  lifecycle events without rebuilding its focus scope when callbacks change.
  Apply the same dismiss and autofocus lifecycle contract to Drawer while
  preserving initial/final focus refs, nested overlay order, and focus trapping.
  Require complete assistive text for Toast actions, localize dismiss controls,
  and keep short visual action labels separate from live-region announcements.
  Accumulate CheckboxGroup changes from the latest synchronous value, deduplicate
  unchanged updates, and expose protected root DOM props with a forwarded ref.
  Protect Avatar image source and alt props, avoid duplicate image semantics, and
  localize group overflow labels while composing consumer image classes.
  Expose protected Radix-style Progress state data and customizable accessible
  value labels derived from the sanitized value range.
  Publish independent React and aggregate auto-loading entries for AnhuaCard and
  Progress so consumers no longer need the full root component stylesheet.
  Calibrate the React and aggregate full-package budgets for the additional public
  entry stubs while enforcing dedicated cold-load budgets for both components.
  Bring DateRangePicker under the shared controllable-state and native-form
  contracts, close it when disabled or read-only, protect its root state data,
  localize its calendar command, and remove placeholder and formatting props that
  had no effect.
  Propagate Dropdown disabled state through its trigger semantics and visual
  state, and make ArrowDown and ArrowUp focus the first and last enabled menu
  items respectively when opening.
  Expose localizable command, loading, empty-state, navigation, progress, and
  selection labels across Input, Tag, List, Pagination, Wizard, and Table. Avoid
  duplicate List loading announcements and derive Table scroll-region names only
  from textual captions.
  Protect component-owned state data across Modal, Drawer, Wizard, Pagination,
  List, Badge, Card, Container, Form, and ReliefCard, including Modal and Drawer
  focus-scope and overlay-branch markers.
  Attach Checkbox, Radio, and Switch compound description props to their actual
  description nodes, keep visible labels and accessible descriptions distinct,
  and compose consumer-provided description references.
  Expose RadioGroup root DOM props and a forwarded ref on the actual radiogroup,
  compose keyboard handlers before internal navigation, and protect its owned
  orientation and ARIA semantics.
  Keep Wizard indicators and panels consistent when dynamic children remove or
  replace the active step by falling back to the first remaining step without
  emitting a user-navigation callback.
  Give disabled Dropdown triggers native `disabled` semantics only when their
  element supports them; use `aria-disabled` and remove non-native triggers from
  the tab order without leaking click or keyboard activation to consumer handlers.
  Move Pagination page and page-size ownership onto the shared controllable-state
  contract so switching to uncontrolled mode preserves the last visible values
  instead of reverting to stale defaults.
  Move Switch, Select, and DatePicker value ownership onto the same shared
  controllable-state contract while preserving user-only native change events,
  initial-default form resets, and each component's domain equality rules.
  Replace placeholder Select and DatePicker accessibility checks with rendered
  label, description, error, required, and invalid-state regressions.
  Move CheckboxGroup and RadioGroup selection ownership onto the shared
  controllable-state contract while retaining their synchronous selection store
  for child subscriptions, re-entrant checkbox changes, keyboard navigation, and
  initial-default form resets.
- 3216bfe: Migrate every React primitive from component CSS to Tailwind v4 utilities. Tailwind v4 is now required to generate styles for Tailwind-native components, with shared animation primitives available from `velune/react/tailwind.css`.
- 42f4a16: Add pay-as-you-go component, component style, and shared token subpath exports to
  the aggregate package, including ESM auto-style entries for lazy-loading component
  code and CSS within the same bundler boundary.
  Expose the base theme contract separately so on-demand entries retain color
  scheme, theme-root, high-contrast, and reduced-motion coverage.
  Deduplicate inherited component tokens across theme selectors to reduce every
  React component's shared first-load CSS without changing theme behavior.
  Split the shared theme into a reusable foundation and component token slices so
  on-demand consumers no longer download variables for unused components.
  Split foundation variables by semantic color use, palette, typography, spacing,
  motion, and other token groups, then recursively load only each component's
  dependencies.
- 0b299e1: Introduce Porcelain Design System as Velune's default visual language with
  warm ceramic surfaces, restrained cobalt interactions, semantic light and dark
  tokens, accessible target sizes, and stable motion.

  Add Porcelain theme generation, public surface and layout tokens, the Text
  display size, stronger visual-token gates, contrast and Axe checks, and visual
  regression coverage for representative React components.

### Patch Changes

- 607aee6: Improve Button contrast, loading-state stability, and icon-only touch targets.
- 3216bfe: Map the public `velune/react/textarea` subpath to the built TextArea module so
  per-component imports resolve consistently with the React package manifest.
- 3216bfe: Register the packaged React build from the Velune Tailwind CSS entry so
  applications no longer need a node_modules-relative `@source` directive.
- Reduce the initial bundle cost of DateRangePicker and Dropdown by loading their overlay content on demand.
- 3216bfe: Replace the warm porcelain canvas and surface backgrounds with neutral light and dark defaults.
- 471bf90: Polish component density, surface hierarchy, focus states, and touch targets.
- 3216bfe: Unify Input, Select, TextArea, and DatePicker fields with porcelain surfaces, complete borders, balanced spacing, and clearer focus and validation states. Soften secondary button borders, strengthen them on interaction, and slow the button loading spinner for calmer feedback.
- 3216bfe: Fix DatePicker calendar autofocus and accessible text colors, and validate ESM,
  CommonJS, type declarations, and packed-package consumption before publishing.
- 607aee6: Fix package declaration and stylesheet exports, and make unimplemented experimental voice features fail explicitly instead of silently doing nothing.
