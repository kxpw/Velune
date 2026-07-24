# Velune Composition Patterns

## Contents

- Layout and typography
- Forms and selection
- Overlays
- Navigation
- Feedback and data
- Accessibility checks

## Layout And Typography

Use Velune primitives for semantic structure. Layout props accept breakpoint
objects; use Tailwind only for exceptional responsive layout:

```tsx
<Container size="lg">
  <Stack gap="6">
    <Text as="h1" size="2xl" weight="medium">
      Projects
    </Text>
    <Grid
      columns={{ base: 1, md: 3 }}
      gap={{ base: "2", md: "4" }}
      responsive={false}
    >
      {children}
    </Grid>
  </Stack>
</Container>
```

Use `Box` for polymorphic regions, `Flex` for one-dimensional alignment, `Grid` for tracks, `Stack` for vertical rhythm, and `AspectRatio` for media frames.
Use `gap` for Stack spacing; `spacing` is not supported.

## Forms And Selection

Keep labels and errors on field components. Use native form submission semantics:

```tsx
<Form initialValues={{ email: "" }} onSubmit={save}>
  <Form.Item
    name="email"
    rules={[{ required: true, message: "Email is required" }]}
  >
    <Input type="email">
      <Input.Label>Email</Input.Label>
    </Input>
  </Form.Item>
  <Button type="submit">Save</Button>
</Form>
```

- Use `Checkbox.Group` for independent selections and `Radio.Group` for one-of-many choices.
- `Switch.onCheckedChange` receives the next boolean: `onCheckedChange={setEnabled}`.
- Use controlled state only when another part of the application owns the value.
- Use `name` and `form` for native form participation. `DateRangePicker` uses `startName` and `endName` for its two serialized values.
- Let form reset restore the component's initial default. Do not dispatch business callbacks to imitate prop synchronization or reset.
- Keep checked-state label font weight stable to avoid layout shifts.

## Overlays

Compose overlays with their structural subcomponents:

```tsx
<Modal open={open} onOpenChange={setOpen}>
  <Modal.Content>
    <Modal.Header>
      <Modal.Title>Rename project</Modal.Title>
    </Modal.Header>
    <Modal.Body>Project settings</Modal.Body>
    <Modal.Footer>
      <Button variant="ghost" onClick={() => setOpen(false)}>
        Cancel
      </Button>
      <Button onClick={save}>Save</Button>
    </Modal.Footer>
  </Modal.Content>
</Modal>
```

Use the same structure for `Drawer`. Let components manage focus trapping, Escape handling, outside interaction, portal placement, and scroll locking.

Use `Dropdown` for menu actions or menu selection, `Popover` for arbitrary interactive content, and `Tooltip` for a short nonessential explanation. Keep the trigger outside the portaled menu content and give every menu an accessible name.

## Navigation

```tsx
<Tabs defaultValue="preview">
  <Tabs.List aria-label="Example view">
    <Tabs.Trigger value="preview">Preview</Tabs.Trigger>
    <Tabs.Trigger value="code">Code</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Panel value="preview">Rendered result</Tabs.Panel>
  <Tabs.Panel value="code">Source code</Tabs.Panel>
</Tabs>
```

Always render a matching panel for each tab trigger. Use `Collapse` for disclosure, `Pagination` for known result sets, and `Wizard` for sequential tasks.

## Feedback And Data

- Mount one `ToastProvider`; call `toast.success`, `toast.warning`, `toast.error`, or `toast.info` from actions. Imperative toasts may pass `action`; custom UIs use `ToastProvider.Action`.
- Prefer `ThemeToggle` for theme switching; use `useThemeToggle` for custom chrome (see [theming.md](theming.md)).
- Use `Progress` for measurable work and `Spinner` for indeterminate waiting.
- Prefer `Empty.Title` / `Empty.Description` / `Empty.Action` for list and table voids; use `ReliefCard` only when the empty state is the one decorated moment on the page.
- Use `Table` for normal datasets and import `VirtualTable` directly for large flat lists (no `Table` `virtualized` prop).
- Table extras: column `sortValue` / `sorter`, `fixed: "start" | "end"` with `scroll.x` and numeric `width`, and `tree` for nested `children` (sibling-only sort; selection is visible rows only).
- Use semantic `Tag`, `Badge`, and text tones (`muted`, `accent`, status) instead of custom status colors.
- Wrap third-party SVG icons with `Icon` (`label` when meaningful; omit for decorative).
- Use `Kbd` for shortcut hints and `ScrollArea` for focused overflow viewports.

## Accessibility Checks

- Give icon-only buttons an accessible name.
- Keep a visible `focus-visible` state; do not remove component focus styles.
- Verify arrow-key behavior in Tabs, Radio, Select, Dropdown, and Collapse.
- Verify locale, direction, bounds, and start/end ordering in DatePicker and DateRangePicker.
- Ensure Modal and Drawer restore focus to their trigger.
- Avoid nesting interactive controls inside interactive Card or List roots.
- Verify 44px hit targets and responsive text containment.
- Respect disabled, invalid, loading, reduced-motion, and high-contrast states.
