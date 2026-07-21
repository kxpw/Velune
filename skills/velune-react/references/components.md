# Velune React Components

## Contents

- Foundations and layout: Box, Container, Flex, Grid, Stack, Text, Divider
- Inputs: Button, Input, TextArea, Checkbox, Radio, Switch, Select, Combobox, Slider, DatePicker, DateRangePicker, Form
- Navigation: Breadcrumb, Tabs, Pagination, Collapse, Wizard
- Overlays: Modal, Drawer, Dropdown, Popover, Tooltip
- Feedback: Alert, Progress, Spinner, Skeleton, Toast
- Data display: Card, ReliefCard, Avatar, Badge, Tag, List, Table, VirtualTable

All imports come from `velune/react`. Query current types with `node scripts/get_component_docs.mjs ComponentName`.

## ReliefCard

Signature hidden-relief card for one decorated moment per page. Accepts `title`, `description`, `headingLevel`, and children.

```tsx
<ReliefCard>
  <ReliefCard.Title>No projects</ReliefCard.Title>
  <ReliefCard.Description>Create your first project.</ReliefCard.Description>
  <ReliefCard.Action>
    <Button>Create project</Button>
  </ReliefCard.Action>
</ReliefCard>
```

## Avatar

Identity primitive with `xs | sm | md | lg | xl` sizes, circle/square shapes, image and initials fallbacks, plus `Avatar.Group`.

```tsx
<Avatar.Group max={3}>
  <Avatar name="Ada Lovelace" />
</Avatar.Group>
```

## Badge

Count, dot, or standalone status indicator. Tones: `default | primary | success | warning | error | info`.

```tsx
<Badge count={120} max={99} />
```

## Box

Polymorphic layout primitive with semantic `as`, display, padding, and margin props. These props accept either a value or a breakpoint object.

```tsx
<Box as="section" padding={{ base: "4", md: "6" }}>
  Content
</Box>
```

## Button

Command or link control. Variants: `primary | secondary | ghost | text`; use `tone="danger"` for destructive actions. Supports loading, icons, full-width layout, and `asChild` for one child element.

```tsx
<Button loading={saving}>
  <Button.Leading>
    <Save size={16} />
  </Button.Leading>
  Save
</Button>
```

## Card

Surface with `outlined | filled | elevated` variants and `sm | md` sizes. Compose the header from `Card.Title`, `Card.Description`, and `Card.Action`.

```tsx
<Card variant="filled">
  <Card.Header>
    <Card.Title>Project</Card.Title>
    <Card.Description>12 collaborators</Card.Description>
  </Card.Header>
  <Card.Body>Project details</Card.Body>
  <Card.Footer>
    <Button size="sm">Open</Button>
  </Card.Footer>
</Card>
```

## Alert

Semantic inline feedback with `neutral | info | success | warning | error` tones, optional icons, dismissal, and controlled visibility.

```tsx
<Alert tone="success" open={visible} onOpenChange={setVisible}>
  <Alert.Title>Saved</Alert.Title>
  <Alert.Description>Your changes are live.</Alert.Description>
</Alert>
```

## Breadcrumb

Accessible navigation trail composed from `Breadcrumb.Item`; the last item receives `aria-current="page"` automatically.

```tsx
<Breadcrumb>
  <Breadcrumb.Item href="/projects">Projects</Breadcrumb.Item>
  <Breadcrumb.Item>Current project</Breadcrumb.Item>
</Breadcrumb>
```

## Checkbox

Native checkbox with checked, unchecked, indeterminate, disabled, and `sm | md | lg` sizes. `Checkbox.Group` owns arrays of string values.

```tsx
<Checkbox.Group defaultValue={["email"]}>
  <Checkbox value="email">Email</Checkbox>
  <Checkbox value="push">Push</Checkbox>
</Checkbox.Group>
```

## Collapse

Accordion/disclosure with single or multiple selection and filled/plain variants. Compose `Collapse.Item`, `Collapse.Trigger`, and `Collapse.Content`.

```tsx
<Collapse defaultValue="details">
  <Collapse.Item value="details">
    <Collapse.Trigger>Details</Collapse.Trigger>
    <Collapse.Content>Project details</Collapse.Content>
  </Collapse.Item>
</Collapse>
```

## Container

Centered width constraint with `xs | sm | md | lg | xl` sizes. `size` accepts a breakpoint object and Container supports semantic `as`.

```tsx
<Container as="main" size={{ base: "sm", lg: "xl" }}>
  Application content
</Container>
```

## DatePicker

Accessible date field and calendar with size, locale, direction, required/invalid/disabled states, min/max bounds, and date serialization helpers.

```tsx
<DatePicker min={new Date()} required>
  <DatePicker.Label>Launch date</DatePicker.Label>
</DatePicker>
```

## DateRangePicker

Paired date fields and a shared range calendar with locale, direction, bounds, required/invalid/disabled states, external-form support, and independently named start/end values.

```tsx
<DateRangePicker startName="travelStart" endName="travelEnd" clearable>
  <DateRangePicker.Label>Travel dates</DateRangePicker.Label>
  <DateRangePicker.Description>
    Select the first and last day of your trip.
  </DateRangePicker.Description>
</DateRangePicker>
```

## Divider

Horizontal or vertical separator with optional label, alignment, tone, and dashed style.

```tsx
<Divider tone="subtle">Or continue with</Divider>
```

## Drawer

Portal overlay placed left, right, top, or bottom. Compose `Drawer.Content`, `Header`, `Body`, `Footer`, and optional `Close`.

```tsx
<Drawer open={open} onOpenChange={setOpen} placement="right">
  <Drawer.Content>
    <Drawer.Header>
      <Drawer.Title>Filters</Drawer.Title>
    </Drawer.Header>
    <Drawer.Body>Filter controls</Drawer.Body>
  </Drawer.Content>
</Drawer>
```

## Dropdown

Action or selection menu with React Aria menu semantics, keyboard navigation, sections, separators, links, disabled items, and single or multiple selection.

```tsx
<Dropdown fullWidth={false}>
  <Dropdown.Trigger>
    <Button variant="secondary">Actions</Button>
  </Dropdown.Trigger>
  <Dropdown.Menu aria-label="Project actions" onAction={runAction}>
    <Dropdown.Item value="duplicate">Duplicate</Dropdown.Item>
    <Dropdown.Item value="delete" tone="danger">
      Delete project
    </Dropdown.Item>
  </Dropdown.Menu>
</Dropdown>
```

## Flex

One-dimensional layout primitive with direction, align, justify, wrap, gap, and full-width props. Each layout prop accepts a breakpoint object.

```tsx
<Flex direction={{ base: "column", md: "row" }} gap={{ base: "2", md: "3" }}>
  ...
</Flex>
```

## Form

Declarative values, validation, submission, and nested field paths. Compose `Form.Item` around input controls.

```tsx
<Form initialValues={{ name: "" }} onSubmit={save}>
  <Form.Item name="name">
    <Input>
      <Input.Label>Name</Input.Label>
    </Input>
  </Form.Item>
</Form>
```

## Grid

Grid layout primitive with typed column counts, gap, justification, and responsive collapse. For explicit breakpoint layouts, provide objects and set `responsive={false}`.

```tsx
<Grid
  columns={{ base: 1, md: 3 }}
  gap={{ base: "2", md: "4" }}
  responsive={false}
>
  {items}
</Grid>
```

## Input

Labeled native input with `sm | md | lg` sizes, composed affixes and field messaging, clearable, invalid, and full-width states.

```tsx
<Input type="email" invalid fullWidth>
  <Input.Label>Email</Input.Label>
  <Input.ErrorMessage>Enter a valid email</Input.ErrorMessage>
</Input>
```

## List

Scan-friendly collection with `List.Item`, loading/empty states, `sm | md` sizes, optional dividers and hover behavior.

```tsx
<List>
  <List.Item>
    <List.Content>
      <List.Title>Ada Lovelace</List.Title>
      <List.Description>Admin</List.Description>
    </List.Content>
  </List.Item>
</List>
```

## Modal

Blocking portal dialog with `sm | md | lg | fullscreen` sizes. Compose `Modal.Content`, `Header`, `Body`, `Footer`, and optional `Close`.

```tsx
<Modal open={open} onOpenChange={setOpen}>
  <Modal.Content>
    <Modal.Header>
      <Modal.Title>Confirm</Modal.Title>
    </Modal.Header>
    <Modal.Body>Details</Modal.Body>
  </Modal.Content>
</Modal>
```

## Pagination

Numbered or simple previous/next navigation. Provide page, total, pageSize, and `onChange`.

```tsx
<Pagination page={page} total={120} pageSize={10} onPageChange={setPage} />
```

## Popover

Anchored interactive content with placement and collision handling.

```tsx
<Popover>
  <Popover.Trigger>
    <Button variant="ghost">More</Button>
  </Popover.Trigger>
  <Popover.Content>Project actions</Popover.Content>
</Popover>
```

## Progress

Determinate or indeterminate progress with `sm | md` sizes, label, and optional visible value.

```tsx
<Progress value={64} aria-label="Uploading" showValue />
```

## Radio

One-of-many selection with `sm | md | lg` sizes. Use `Radio.Group` for name/value ownership and arrow-key navigation.

```tsx
<Radio.Group defaultValue="team" orientation="horizontal">
  <Radio value="personal">Personal</Radio>
  <Radio value="team">Team</Radio>
</Radio.Group>
```

## Select

Single or multiple selection with option groups, searching, keyboard navigation, sizes, invalid state, and full-width mode.

```tsx
<Select>
  <Select.Label>Role</Select.Label>
  <Select.Trigger placeholder="Choose a role" />
  <Select.Content>
    <Select.Item value="admin">Admin</Select.Item>
  </Select.Content>
</Select>
```

## Combobox

Searchable single-select with controlled or uncontrolled value and input state. Compose Label, Item, Empty, and NoMatches slots.

```tsx
<Combobox>
  <Combobox.Label>Assignee</Combobox.Label>
  <Combobox.Item value="ada">Ada Lovelace</Combobox.Item>
  <Combobox.NoMatches>No matching people.</Combobox.NoMatches>
</Combobox>
```

## Slider

Native range control with single-value or range values, keyboard support, value formatting, and horizontal or vertical orientation.

```tsx
<Slider defaultValue={50} min={0} max={100}>
  <Slider.Label>Volume</Slider.Label>
  <Slider.Output />
</Slider>
```

## Skeleton

Loading placeholder with text, rectangular, rounded, and circular variants plus pulse/wave/none animation.

```tsx
<Skeleton variant="rounded" width="100%" height={80} />
```

## Spinner

Indeterminate status with `sm | md | lg` sizes and semantic tones. Always provide a meaningful accessible label for long operations.

```tsx
<Spinner size="sm" tone="muted" aria-label="Loading projects" />
```

## Stack

Vertical layout with tokenized gaps, alignment, optional reverse order, and dividers. Use `gap`; the previous `spacing` prop was removed. Layout props accept breakpoint objects.

```tsx
<Stack gap={{ base: "3", md: "4" }} divider={<Divider />}>
  <Input>
    <Input.Label>Email</Input.Label>
  </Input>
  <Button>Continue</Button>
</Stack>
```

## Switch

Immediate boolean setting with `sm | md | lg` sizes, loading, description, and form participation. `onChange` receives a boolean.

```tsx
<Switch checked={enabled} onCheckedChange={setEnabled}>
  Notifications
</Switch>
```

## Table

Structured data with columns, sorting, selection, horizontal/vertical scrolling, captions, and `sm | md` density.

```tsx
<Table columns={columns} dataSource={members} rowKey="id" selectable />
```

## Tabs

Peer-view navigation with underline/block variants and horizontal/vertical orientation. Compose `Tabs.List`, `Trigger`, and matching `Panel` elements.

```tsx
<Tabs defaultValue="preview">
  <Tabs.List>
    <Tabs.Trigger value="preview">Preview</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Panel value="preview">Rendered result</Tabs.Panel>
</Tabs>
```

## Tag

Category or status label with `sm | md` sizes, semantic tones, optional icon, click behavior, and close action.

```tsx
<Tag tone="success" closable onClose={removeFilter}>
  Stable
</Tag>
```

## Text

Polymorphic typography with token sizes, weights, tones, alignment, font families, truncation, line clamp, and CJK handling.

```tsx
<Text as="h1" size="2xl" weight="semibold">
  Projects
</Text>
```

## TextArea

Long-form input with Input-like field states, autosizing, character count, `sm | md | lg` sizes, and `resize="none" | "vertical" | "horizontal" | "both"`.

```tsx
<TextArea maxLength={160} showCount autosize>
  <TextArea.Label>Summary</TextArea.Label>
</TextArea>
```

## Toast

Transient feedback through one `ToastProvider` and imperative `toast` methods. Supports default, success, warning, error, and info tones plus actions.

```tsx
<ToastProvider>
  <Button onClick={() => toast.success("Saved")}>Save</Button>
</ToastProvider>
```

## Tooltip

Short explanatory overlay for hover/focus or click triggers, with delay and placement controls.

```tsx
<Tooltip>
  <Tooltip.Trigger>
    <Button aria-label="Copy">Copy</Button>
  </Tooltip.Trigger>
  <Tooltip.Content>Copy to clipboard</Tooltip.Content>
</Tooltip>
```

## VirtualTable

Virtualized table for large bounded datasets. Always provide scroll height and an estimated row height.

```tsx
<VirtualTable
  columns={columns}
  dataSource={rows}
  rowKey="id"
  estimatedRowHeight={44}
  scroll={{ x: 720, y: 280 }}
/>
```

## Wizard

Sequential workflow with steps, step metadata, line/progress indicators, controlled navigation, and `Wizard.Navigation`.

```tsx
<Wizard defaultStep="account">
  <Wizard.Step value="account">
    <Wizard.Title>Account</Wizard.Title>
    Account fields
  </Wizard.Step>
  <Wizard.Step value="review">
    <Wizard.Title>Review</Wizard.Title>
    Review details
  </Wizard.Step>
  <Wizard.Navigation>
    <Wizard.Navigation.Finish>Submit</Wizard.Navigation.Finish>
  </Wizard.Navigation>
</Wizard>
```
