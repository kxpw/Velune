import type { ComponentEntry } from "./component-data";

export type ComponentExample = {
  id: string;
  title: string;
  description: string;
  code: string;
};

type ExampleSpec = Omit<ComponentExample, "code"> & {
  body: string;
  imports?: string[];
  externalImports?: string;
  reactImports?: string[];
  setup?: string;
  complete?: boolean;
};

const specs: Record<string, ExampleSpec[]> = {
  "relief-card": [
    {
      id: "hero",
      title: "Relief surface",
      description:
        "The one decorated moment per page: texture rests at 5% and surfaces to 16% under attention.",
      body: `<ReliefCard>
  <ReliefCard.Title>Velune design system</ReliefCard.Title>
  <ReliefCard.Description>
    Hover to reveal the subtle relief pattern beneath the surface.
  </ReliefCard.Description>
</ReliefCard>`,
    },
    {
      id: "empty-state",
      title: "Empty state",
      description: "Pair the relief with a single primary action.",
      body: `<ReliefCard>
  <ReliefCard.Title as="h3">No projects yet</ReliefCard.Title>
  <ReliefCard.Description>
    Create your first project to start your workspace.
  </ReliefCard.Description>
  <ReliefCard.Action>
    <Button>Create project</Button>
  </ReliefCard.Action>
</ReliefCard>`,
      imports: ["Button"],
    },
    {
      id: "animation",
      title: "Custom texture and animation",
      description:
        "Replace the built-in mask, then tune its motion while preserving reduced-motion behavior.",
      body: `<ReliefCard
  texture={{
    source: "radial-gradient(circle, #000 1px, transparent 1.25px)",
    size: "20px 20px",
    position: "center",
    repeat: "repeat",
  }}
  animation={{
    preset: "drift",
    duration: 7000,
    delay: 200,
    easing: "ease-in-out",
  }}
>
  <ReliefCard.Title>Custom surface</ReliefCard.Title>
  <ReliefCard.Description>
    The texture moves slowly while the content remains stable.
  </ReliefCard.Description>
</ReliefCard>`,
    },
  ],
  avatar: [
    {
      id: "fallbacks",
      title: "Sizes and shapes",
      description: "Use readable initials at every supported size and shape.",
      body: `<Avatar name="Ada Lovelace" size="xs" />
<Avatar name="Ada Lovelace" size="sm" />
<Avatar name="Ada Lovelace" size="md" />
<Avatar name="Ada Lovelace" size="lg" />
<Avatar name="Ada Lovelace" size="xl" />
<Avatar name="Grace Hopper" shape="square" />`,
    },
    {
      id: "group",
      title: "Avatar group",
      description: "Condense a collaborator list and cap visible members.",
      body: `<Avatar.Group max={3}>
  <Avatar name="Ada Lovelace" />
  <Avatar name="Grace Hopper" />
  <Avatar name="Alan Turing" />
  <Avatar name="Katherine Johnson" />
</Avatar.Group>`,
    },
  ],
  badge: [
    {
      id: "counts",
      title: "Counts",
      description: "Place compact counts next to the content they describe.",
      body: `<Badge count={8} />
<Badge count={120} max={99} />
<Badge count={0} showZero />`,
    },
    {
      id: "tones",
      title: "Semantic tones",
      description: "Communicate status without introducing custom colors.",
      body: `<Badge tone="default">Default</Badge>
<Badge tone="primary">Primary</Badge>
<Badge tone="success">Success</Badge>
<Badge tone="warning">Pending</Badge>
<Badge tone="error">Failed</Badge>
<Badge tone="info">Info</Badge>`,
    },
  ],
  box: [
    {
      id: "spacing",
      title: "Token spacing",
      description: "Apply spacing from the shared design scale.",
      body: `<Box padding="5">Token-aware content</Box>`,
    },
    {
      id: "semantic",
      title: "Semantic element",
      description: "Change the rendered element while retaining system props.",
      body: `<Box as="section" padding="4">
  <Text weight="semibold">Project summary</Text>
</Box>`,
      imports: ["Text"],
    },
  ],
  button: [
    {
      id: "variants",
      title: "Variants",
      description: "Match action emphasis to its meaning in the workflow.",
      body: `<Button>Continue</Button>
<Button variant="secondary">Save draft</Button>
<Button variant="ghost">Cancel</Button>
<Button variant="text">Learn more</Button>
<Button variant="danger">Delete</Button>`,
    },
    {
      id: "sizes",
      title: "Sizes",
      description:
        "Use compact controls in dense surfaces and larger controls for primary flows.",
      body: `<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>`,
    },
    {
      id: "content",
      title: "Composed content",
      description: "Place icons explicitly before or after the command label.",
      body: `<Button>
  <Button.Leading><Check size={16} /></Button.Leading>
  Confirm
</Button>
<Button variant="secondary">
  Continue
  <Button.Trailing><ArrowRight size={16} /></Button.Trailing>
</Button>`,
      externalImports: `import { ArrowRight, Check } from "lucide-react";`,
    },
    {
      id: "states",
      title: "States",
      description:
        "Keep loading and disabled behavior visible and predictable.",
      body: `<Button loading>Saving</Button>
<Button disabled>Unavailable</Button>`,
    },
  ],
  card: [
    {
      id: "variants",
      title: "Variants",
      description:
        "Choose a quiet filled or elevated surface based on hierarchy.",
      body: `<Card variant="outlined">
  <Card.Header>
    <Card.Title>Outlined</Card.Title>
    <Card.Description>Defined boundary</Card.Description>
  </Card.Header>
</Card>
<Card variant="filled">
  <Card.Header>
    <Card.Title>Filled</Card.Title>
    <Card.Description>Quiet grouping</Card.Description>
  </Card.Header>
</Card>
<Card variant="elevated">
  <Card.Header>
    <Card.Title>Elevated</Card.Title>
    <Card.Description>Primary content</Card.Description>
  </Card.Header>
</Card>`,
    },
    {
      id: "sections",
      title: "Composed sections",
      description:
        "Build complete surfaces with header, body, and footer regions.",
      body: `<Card variant="filled">
  <Card.Header>
    <Card.Title>Project</Card.Title>
    <Card.Description>12 collaborators</Card.Description>
  </Card.Header>
  <Card.Body>Shared project details.</Card.Body>
  <Card.Footer>
    <Button size="sm">Open</Button>
  </Card.Footer>
</Card>`,
      imports: ["Button"],
    },
    {
      id: "interactive",
      title: "Interactive card",
      description: "Make the whole surface keyboard and pointer interactive.",
      body: `<Card interactive onClick={() => openProject()}>
  <Card.Header>
    <Card.Title>Northstar</Card.Title>
    <Card.Description>Open project</Card.Description>
  </Card.Header>
</Card>`,
      setup: `const openProject = () => window.alert("Opening Northstar");`,
    },
  ],
  checkbox: [
    {
      id: "states",
      title: "Selection states",
      description: "Display checked, unchecked, and indeterminate values.",
      body: `<Checkbox defaultChecked>Design</Checkbox>
<Checkbox>Engineering</Checkbox>
<Checkbox indeterminate>Operations</Checkbox>`,
    },
    {
      id: "group",
      title: "Checkbox group",
      description: "Coordinate a related set of independent choices.",
      body: `<Checkbox.Group defaultValue={["email"]}>
  <Checkbox value="email">Email</Checkbox>
  <Checkbox value="push">Push</Checkbox>
</Checkbox.Group>`,
    },
  ],
  collapse: [
    {
      id: "single",
      title: "Single panel",
      description: "Reveal one section at a time for focused disclosure.",
      body: `<Collapse defaultValue="basics">
  <Collapse.Item value="basics">
    <Collapse.Trigger>What is Velune?</Collapse.Trigger>
    <Collapse.Content>A React component system.</Collapse.Content>
  </Collapse.Item>
</Collapse>`,
    },
    {
      id: "multiple",
      title: "Multiple panels",
      description: "Allow several independent sections to remain open.",
      body: `<Collapse type="multiple" defaultValue={["theme"]}>
  <Collapse.Item value="theme">
    <Collapse.Trigger>Theme</Collapse.Trigger>
    <Collapse.Content>Semantic token configuration.</Collapse.Content>
  </Collapse.Item>
  <Collapse.Item value="a11y">
    <Collapse.Trigger>Accessibility</Collapse.Trigger>
    <Collapse.Content>Keyboard-first behavior.</Collapse.Content>
  </Collapse.Item>
</Collapse>`,
    },
    {
      id: "plain",
      title: "Plain panels",
      description: "Remove the persistent surface for quieter disclosures.",
      body: `<Collapse variant="plain" defaultValue="theme">
  <Collapse.Item value="theme">
    <Collapse.Trigger>Theme tokens</Collapse.Trigger>
    <Collapse.Content>Semantic colors adapt to every theme.</Collapse.Content>
  </Collapse.Item>
  <Collapse.Item value="motion">
    <Collapse.Trigger>Motion preferences</Collapse.Trigger>
    <Collapse.Content>Reduced motion is respected automatically.</Collapse.Content>
  </Collapse.Item>
</Collapse>`,
    },
  ],
  container: [
    {
      id: "sizes",
      title: "Container sizes",
      description: "Choose a predictable maximum width for each page type.",
      body: `<Container size="xs">Extra-small content</Container>
<Container size="sm">Small content</Container>
<Container size="md">Medium content</Container>
<Container size="lg">Large content</Container>
<Container size="xl">Extra-large content</Container>`,
    },
    {
      id: "semantic",
      title: "Named region",
      description: "Give a constrained page region an accessible name.",
      body: `<Container size="md" role="region" aria-labelledby="overview-title">
  <Text id="overview-title" as="h2" weight="semibold">Overview</Text>
</Container>`,
      imports: ["Text"],
    },
  ],
  "date-picker": [
    {
      id: "basic",
      title: "Basic date picker",
      description:
        "Choose a date with keyboard navigation and locale formatting.",
      body: `<DatePicker defaultValue={new Date(2026, 6, 13)}>
  <DatePicker.Label>Launch date</DatePicker.Label>
</DatePicker>`,
    },
    {
      id: "constraints",
      title: "Date constraints",
      description: "Limit selection to an allowed scheduling window.",
      body: `<DatePicker min={new Date(2026, 6, 1)} max={new Date(2026, 6, 31)}>
  <DatePicker.Label>Review date</DatePicker.Label>
</DatePicker>`,
    },
    {
      id: "states",
      title: "Field states",
      description:
        "Present required, disabled, and invalid date fields consistently.",
      body: `<DatePicker required>
  <DatePicker.Label>Required date</DatePicker.Label>
</DatePicker>
<DatePicker disabled>
  <DatePicker.Label>Unavailable</DatePicker.Label>
</DatePicker>`,
    },
  ],
  "date-range-picker": [
    {
      id: "basic",
      title: "Basic date range",
      description:
        "Edit either date directly or choose a continuous range from the shared calendar.",
      body: `<DateRangePicker
  defaultValue={{
    start: new Date(2026, 6, 13),
    end: new Date(2026, 6, 18),
  }}
  clearable
>
  <DateRangePicker.Label>Travel dates</DateRangePicker.Label>
  <DateRangePicker.Description>
    Select the first and last day of your trip.
  </DateRangePicker.Description>
</DateRangePicker>`,
    },
    {
      id: "constraints",
      title: "Booking window",
      description:
        "Restrict both dates to a valid window while preserving range ordering.",
      body: `<DateRangePicker
  min={new Date(2026, 6, 10)}
  max={new Date(2026, 7, 15)}
  defaultValue={{
    start: new Date(2026, 6, 20),
    end: new Date(2026, 6, 27),
  }}
>
  <DateRangePicker.Label>Reservation</DateRangePicker.Label>
</DateRangePicker>`,
    },
    {
      id: "states",
      title: "Field states",
      description:
        "Communicate required, invalid, read-only, and disabled ranges consistently.",
      body: `<DateRangePicker required invalid>
  <DateRangePicker.Label>Billing period</DateRangePicker.Label>
  <DateRangePicker.ErrorMessage>
    Choose a complete billing period.
  </DateRangePicker.ErrorMessage>
</DateRangePicker>
<DateRangePicker
  defaultValue={{
    start: new Date(2026, 6, 13),
    end: new Date(2026, 6, 18),
  }}
  readOnly
>
  <DateRangePicker.Label>Approved period</DateRangePicker.Label>
</DateRangePicker>`,
    },
  ],
  divider: [
    {
      id: "horizontal",
      title: "Horizontal divider",
      description: "Separate nearby content regions with a quiet rule.",
      body: `<Text>Account</Text>
<Divider />
<Text muted>Security preferences</Text>`,
      imports: ["Text"],
    },
    {
      id: "label",
      title: "Divider with label",
      description: "Name a transition between related groups.",
      body: `<Divider>Or continue with</Divider>`,
    },
  ],
  drawer: [
    {
      id: "default",
      title: "Right drawer",
      description: "Open a contextual workflow without leaving the page.",
      body: `<Button onClick={() => setOpen(true)}>Open drawer</Button>
<Drawer open={open} onOpenChange={setOpen}>
  <Drawer.Content>
    <Drawer.Header>
      <Drawer.Title>Filters</Drawer.Title>
    </Drawer.Header>
    <Drawer.Body>Filter options</Drawer.Body>
  </Drawer.Content>
</Drawer>`,
      imports: ["Button"],
      reactImports: ["useState"],
      setup: `const [open, setOpen] = useState(false);`,
    },
    {
      id: "placements",
      title: "Placements",
      description: "Present the same workflow from any viewport edge.",
      body: `<Button onClick={() => setOpen(true)}>Open drawer</Button>
<Drawer placement="left" open={open} onOpenChange={setOpen}>
  <Drawer.Content>
    <Drawer.Header>
      <Drawer.Title>Navigation</Drawer.Title>
    </Drawer.Header>
  </Drawer.Content>
</Drawer>`,
      imports: ["Button"],
      reactImports: ["useState"],
      setup: `const [open, setOpen] = useState(false);`,
    },
  ],
  dropdown: [
    {
      id: "basic",
      title: "Action menu",
      description:
        "Open a compact command menu from any Velune button or custom trigger.",
      body: `<Dropdown fullWidth={false}>
  <Dropdown.Trigger>
    <Button variant="secondary">Project actions</Button>
  </Dropdown.Trigger>
  <Dropdown.Menu aria-label="Project actions">
    <Dropdown.Item id="edit">Edit project</Dropdown.Item>
    <Dropdown.Item id="duplicate">Duplicate</Dropdown.Item>
    <Dropdown.Separator />
    <Dropdown.Item id="delete" tone="danger">Delete project</Dropdown.Item>
  </Dropdown.Menu>
</Dropdown>`,
      imports: ["Button"],
    },
    {
      id: "sections",
      title: "Sections and metadata",
      description:
        "Group related commands and add supporting descriptions or shortcuts.",
      body: `<Dropdown fullWidth={false}>
  <Dropdown.Trigger>
    <Button variant="secondary">Account</Button>
  </Dropdown.Trigger>
  <Dropdown.Menu aria-label="Account menu">
    <Dropdown.Section>
      <Dropdown.SectionTitle>Workspace</Dropdown.SectionTitle>
      <Dropdown.Item id="profile">
        Profile
        <Dropdown.Item.Description>Manage your public identity</Dropdown.Item.Description>
        <Dropdown.Item.Trailing>⌘P</Dropdown.Item.Trailing>
      </Dropdown.Item>
    </Dropdown.Section>
    <Dropdown.Separator />
    <Dropdown.Item id="sign-out">Sign out</Dropdown.Item>
  </Dropdown.Menu>
</Dropdown>`,
      imports: ["Button"],
    },
    {
      id: "selection",
      title: "Multiple selection",
      description:
        "Keep the menu open while people toggle several independent options.",
      body: `<Dropdown>
  <Dropdown.Trigger>
    <Button variant="secondary">Visible columns</Button>
  </Dropdown.Trigger>
  <Dropdown.Menu
    aria-label="Visible columns"
    selectionMode="multiple"
    defaultSelectedKeys={["name", "status"]}
  >
    <Dropdown.Item id="name">Name</Dropdown.Item>
    <Dropdown.Item id="owner">Owner</Dropdown.Item>
    <Dropdown.Item id="status">Status</Dropdown.Item>
    <Dropdown.Item id="updated">Last updated</Dropdown.Item>
  </Dropdown.Menu>
</Dropdown>`,
      imports: ["Button"],
    },
  ],
  flex: [
    {
      id: "alignment",
      title: "Alignment",
      description: "Align controls and labels along one responsive axis.",
      body: `<Flex gap="3" align="center" justify="between" fullWidth>
  <Text weight="medium">Members</Text>
  <Button size="sm">Invite</Button>
</Flex>`,
      imports: ["Button", "Text"],
    },
    {
      id: "wrap",
      title: "Wrapping content",
      description:
        "Allow items to wrap when horizontal space becomes constrained.",
      body: `<Flex gap="2" wrap>
  <Tag>Design</Tag>
  <Tag>Engineering</Tag>
  <Tag>Operations</Tag>
</Flex>`,
      imports: ["Tag"],
    },
  ],
  form: [
    {
      id: "validation",
      title: "Validation",
      description:
        "Keep field rules, values, and messages in one declarative form.",
      body: `<Form initialValues={{ email: "" }} onSubmit={save}>
  <Form.Item
    name="email"
    rules={[{ required: true, message: "Email is required" }]}
  >
    <Input type="email">
      <Input.Label>Email</Input.Label>
    </Input>
  </Form.Item>
  <Button type="submit">Continue</Button>
</Form>`,
      imports: ["Button", "Input"],
      setup: `const save = (values: Record<string, unknown>) => {
  console.log("Submitted values", values);
};`,
    },
    {
      id: "nested",
      title: "Nested values",
      description: "Bind compound value paths without manual state plumbing.",
      body: `<Form initialValues={{ profile: { name: "" } }} onSubmit={save}>
  <Form.Item name="profile.name">
    <Input>
      <Input.Label>Display name</Input.Label>
    </Input>
  </Form.Item>
</Form>`,
      imports: ["Input"],
      setup: `const save = (values: Record<string, unknown>) => {
  console.log("Submitted values", values);
};`,
    },
  ],
  grid: [
    {
      id: "columns",
      title: "Columns",
      description: "Create predictable tracks using the shared spacing scale.",
      body: `<Grid columns={3} gap="3">
  <Box padding="4">One</Box>
  <Box padding="4">Two</Box>
  <Box padding="4">Three</Box>
</Grid>`,
      imports: ["Box"],
    },
    {
      id: "responsive",
      title: "Responsive grid",
      description: "Collapse dense layouts for smaller viewports.",
      body: `<Grid columns={4} gap="3" responsive>
  {items.map((item) => <Card key={item.id}>{item.name}</Card>)}
</Grid>`,
      imports: ["Card"],
      setup: `const items = [
  { id: "design", name: "Design" },
  { id: "engineering", name: "Engineering" },
  { id: "operations", name: "Operations" },
  { id: "support", name: "Support" },
];`,
    },
  ],
  input: [
    {
      id: "labels",
      title: "Labels and description",
      description: "Give every field a clear name and supporting context.",
      body: `<Input placeholder="you@company.com">
  <Input.Label>Email</Input.Label>
  <Input.Description>Used for account notifications.</Input.Description>
</Input>`,
    },
    {
      id: "affixes",
      title: "Affixes",
      description: "Add contextual content without rebuilding the input shell.",
      body: `<Input defaultValue="velune">
  <Input.Label>Domain</Input.Label>
  <Input.Prefix>https://</Input.Prefix>
  <Input.Suffix>.com</Input.Suffix>
</Input>`,
    },
    {
      id: "states",
      title: "Validation states",
      description:
        "Expose invalid and disabled states with accessible semantics.",
      body: `<Input invalid>
  <Input.Label>Email</Input.Label>
  <Input.ErrorMessage>Enter a valid email</Input.ErrorMessage>
</Input>
<Input disabled defaultValue="Northstar">
  <Input.Label>Read-only workspace</Input.Label>
</Input>`,
    },
  ],
  list: [
    {
      id: "people",
      title: "Rich list items",
      description:
        "Combine identity, supporting text, and status in a scan-friendly list.",
      body: `<List>
  <List.Item>
    <List.Content>
      <List.Title>Ada Lovelace</List.Title>
      <List.Description>Admin</List.Description>
    </List.Content>
  </List.Item>
  <List.Item>
    <List.Content>
      <List.Title>Grace Hopper</List.Title>
      <List.Description>Editor</List.Description>
    </List.Content>
  </List.Item>
</List>`,
    },
    {
      id: "states",
      title: "Empty and loading",
      description: "Reserve stable space while collection state changes.",
      body: `<List loading />
<List>
  <List.Empty>Nothing here yet.</List.Empty>
</List>`,
    },
  ],
  modal: [
    {
      id: "default",
      title: "Confirmation workflow",
      description: "Focus attention on a short blocking decision.",
      body: `<Button onClick={() => setOpen(true)}>Open modal</Button>
<Modal open={open} onOpenChange={setOpen}>
  <Modal.Content>
    <Modal.Header>
      <Modal.Title>Rename project</Modal.Title>
      <Modal.Description>
        Choose a clear name that your team will recognize.
      </Modal.Description>
    </Modal.Header>
    <Modal.Body>
      <Input defaultValue="Northstar" fullWidth>
        <Input.Label>Project name</Input.Label>
      </Input>
    </Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" onClick={() => setOpen(false)}>
        Cancel
      </Button>
      <Button onClick={() => setOpen(false)}>Save changes</Button>
    </Modal.Footer>
  </Modal.Content>
</Modal>`,
      imports: ["Button", "Input"],
      reactImports: ["useState"],
      setup: `const [open, setOpen] = useState(false);`,
    },
    {
      id: "sizes",
      title: "Modal sizes",
      description: "Match dialog width to the complexity of its content.",
      body: `<Button onClick={() => setOpen(true)}>Open modal</Button>
<Modal open={open} size="lg" onOpenChange={setOpen}>
  <Modal.Content>
    <Modal.Header>
      <Modal.Title>Workspace settings</Modal.Title>
      <Modal.Description>
        Manage the details your team sees across this workspace.
      </Modal.Description>
    </Modal.Header>
    <Modal.Body>
      <Input defaultValue="Northstar" fullWidth>
        <Input.Label>Project name</Input.Label>
      </Input>
    </Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" onClick={() => setOpen(false)}>
        Cancel
      </Button>
      <Button onClick={() => setOpen(false)}>Save changes</Button>
    </Modal.Footer>
  </Modal.Content>
</Modal>`,
      imports: ["Button", "Input"],
      reactImports: ["useState"],
      setup: `const [open, setOpen] = useState(false);`,
    },
  ],
  pagination: [
    {
      id: "default",
      title: "Pagination",
      description: "Navigate a known result count with numbered pages.",
      body: `<Pagination page={page} total={120} pageSize={10} onPageChange={setPage} />`,
      reactImports: ["useState"],
      setup: `const [page, setPage] = useState(4);`,
    },
    {
      id: "simple",
      title: "Simple pagination",
      description:
        "Use compact previous and next controls when totals are secondary.",
      body: `<Pagination page={page} total={50} pageSize={10} simple onPageChange={setPage} />`,
      reactImports: ["useState"],
      setup: `const [page, setPage] = useState(2);`,
    },
  ],
  popover: [
    {
      id: "default",
      title: "Rich popover",
      description: "Anchor a short contextual workflow to its trigger.",
      body: `<Popover>
  <Popover.Trigger>
    <Button variant="secondary">Share</Button>
  </Popover.Trigger>
  <Popover.Content>
    <Text>Anyone with the link can view.</Text>
  </Popover.Content>
</Popover>`,
      imports: ["Button", "Text"],
    },
    {
      id: "placements",
      title: "Placements",
      description:
        "Select a preferred edge while retaining automatic collision handling.",
      body: `<Popover placement="right">
  <Popover.Trigger>
    <Button variant="ghost">More</Button>
  </Popover.Trigger>
  <Popover.Content>Project actions</Popover.Content>
</Popover>`,
      imports: ["Button"],
    },
  ],
  progress: [
    {
      id: "basic",
      title: "Determinate and indeterminate",
      description:
        "One glaze thinning into depth — a single-hue gradient, never segmented colors.",
      body: `<Progress value={64} aria-label="Upload progress" />
<Progress aria-label="Processing" size="sm" />`,
    },
    {
      id: "value",
      title: "With value",
      description: "Show the rounded percentage in the mono data face.",
      body: `<Progress value={24} aria-label="Importing" showValue />
<Progress value={64} aria-label="Transcoding" showValue />
<Progress value={100} aria-label="Publishing" showValue />`,
    },
  ],
  radio: [
    {
      id: "group",
      title: "Radio group",
      description: "Choose exactly one option from a related set.",
      body: `<Radio.Group defaultValue="team" orientation="horizontal">
  <Radio value="personal">Personal</Radio>
  <Radio value="team">Team</Radio>
</Radio.Group>`,
    },
    {
      id: "states",
      title: "States",
      description:
        "Present selected and disabled options without custom behavior.",
      body: `<Radio defaultChecked>Selected</Radio>
<Radio disabled>Unavailable</Radio>`,
    },
  ],
  select: [
    {
      id: "options",
      title: "Options",
      description: "Choose one value from a concise list.",
      body: `<Select>
  <Select.Label>Role</Select.Label>
  <Select.Trigger placeholder="Choose a role" />
  <Select.Content>
    <Select.Item value="admin">Admin</Select.Item>
    <Select.Item value="editor">Editor</Select.Item>
  </Select.Content>
</Select>`,
    },
    {
      id: "searchable",
      title: "Searchable select",
      description:
        "Filter larger option sets from the same keyboard-friendly control.",
      body: `<Select searchable fullWidth>
  <Select.Label>Member</Select.Label>
  <Select.Trigger placeholder="Choose a member" />
  <Select.Content>
    {people.map((person) => (
      <Select.Item key={person.id} value={person.id}>
        {person.name}
      </Select.Item>
    ))}
  </Select.Content>
</Select>`,
      setup: `const people = [
  { id: "ada", name: "Ada Lovelace" },
  { id: "grace", name: "Grace Hopper" },
  { id: "alan", name: "Alan Turing" },
];`,
    },
  ],
  skeleton: [
    {
      id: "content",
      title: "Content placeholder",
      description:
        "Reserve the final content structure while data is still loading.",
      body: `<Stack gap="3">
  <Skeleton width="42%" />
  <Skeleton width="84%" />
  <Skeleton variant="rounded" height={160} />
</Stack>`,
      imports: ["Stack"],
    },
    {
      id: "variants",
      title: "Shapes and motion",
      description:
        "Match the placeholder silhouette and motion to the content it replaces.",
      body: `<Skeleton variant="text" width="70%" />
<Skeleton variant="rectangular" height={72} />
<Skeleton variant="rounded" height={72} animation="wave" />
<Skeleton variant="circular" width={48} />`,
    },
  ],
  spinner: [
    {
      id: "sizes",
      title: "Sizes",
      description:
        "Fit progress feedback to the surrounding control or surface.",
      body: `<Spinner size="sm" />
<Spinner size="md" />
<Spinner size="lg" />`,
    },
    {
      id: "tones",
      title: "Tones and label",
      description:
        "Pair progress with readable context when waiting takes longer.",
      body: `<Spinner tone="primary" aria-label="Loading data" />
<Spinner tone="current" aria-label="Current color" />
<Spinner tone="muted" aria-label="Waiting" />
<Spinner tone="success" aria-label="Finalizing" />
<Spinner tone="warning" aria-label="Retrying" />
<Spinner tone="error" aria-label="Failed" />
<Spinner tone="info" aria-label="Syncing" />`,
    },
  ],
  stack: [
    {
      id: "vertical",
      title: "Vertical rhythm",
      description: "Arrange related content with tokenized spacing.",
      body: `<Stack gap="3">
  <Text weight="semibold">Profile</Text>
  <Text muted>Account preferences</Text>
  <Button>Continue</Button>
</Stack>`,
      imports: ["Button", "Text"],
    },
    {
      id: "alignment",
      title: "Alignment",
      description: "Align a stack without adding wrapper styles.",
      body: `<Stack gap="3" align="center" fullWidth>
  <Text>Centered content</Text>
  <Button variant="secondary">Action</Button>
</Stack>`,
      imports: ["Button", "Text"],
    },
  ],
  switch: [
    {
      id: "controlled",
      title: "Immediate setting",
      description: "Apply a binary setting as soon as the control changes.",
      body: `<Switch checked={enabled} onCheckedChange={setEnabled}>
  Notifications
</Switch>`,
      reactImports: ["useState"],
      setup: `const [enabled, setEnabled] = useState(true);`,
    },
    {
      id: "states",
      title: "Sizes and states",
      description:
        "Fit compact surfaces and clearly communicate unavailable settings.",
      body: `<Switch size="sm" defaultChecked>Compact</Switch>
<Switch disabled>Unavailable</Switch>`,
    },
  ],
  table: [
    {
      id: "sortable",
      title: "Sortable table",
      description:
        "Present structured records with sorting and semantic columns.",
      body: `<Table columns={columns} dataSource={members} rowKey="id">
  <Table.Caption>Workspace members</Table.Caption>
</Table>`,
      setup: `const columns = [
  { key: "name", title: "Name", dataIndex: "name", sortable: true },
  { key: "role", title: "Role", dataIndex: "role" },
];
const members = [
  { id: "1", name: "Ada Lovelace", role: "Admin" },
  { id: "2", name: "Grace Hopper", role: "Editor" },
  { id: "3", name: "Alan Turing", role: "Viewer" },
];`,
    },
    {
      id: "selectable",
      title: "Row selection",
      description:
        "Select individual rows while keeping the header control fixed.",
      body: `<Table selectable columns={columns} dataSource={members} rowKey="id">
  <Table.Caption>Selectable workspace members</Table.Caption>
</Table>`,
      setup: `const columns = [
  { key: "name", title: "Name", dataIndex: "name", sortable: true },
  { key: "role", title: "Role", dataIndex: "role" },
];
const members = [
  { id: "1", name: "Ada Lovelace", role: "Admin" },
  { id: "2", name: "Grace Hopper", role: "Editor" },
  { id: "3", name: "Alan Turing", role: "Viewer" },
];`,
    },
  ],
  tabs: [
    {
      id: "underline",
      title: "Underline tabs",
      description: "Switch peer views with a lightweight text treatment.",
      body: `<Tabs defaultValue="overview" variant="underline">
  <Tabs.List>
    <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
    <Tabs.Trigger value="activity">Activity</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Panel value="overview">Project overview</Tabs.Panel>
</Tabs>`,
    },
    {
      id: "block",
      title: "Block tabs",
      description:
        "Use a filled segmented treatment for compact mode switching.",
      body: `<Tabs defaultValue="preview" variant="block">
  <Tabs.List fullWidth>
    <Tabs.Trigger value="preview">Preview</Tabs.Trigger>
    <Tabs.Trigger value="code">Code</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Panel value="preview">Rendered result</Tabs.Panel>
  <Tabs.Panel value="code">Source code</Tabs.Panel>
</Tabs>`,
    },
    {
      id: "vertical",
      title: "Vertical tabs",
      description: "Move navigation to the side for settings-style layouts.",
      body: `<Tabs defaultValue="general" orientation="vertical">
  <Tabs.List>
    <Tabs.Trigger value="general">General</Tabs.Trigger>
    <Tabs.Trigger value="security">Security</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Panel value="general">Workspace preferences</Tabs.Panel>
  <Tabs.Panel value="security">Session settings</Tabs.Panel>
</Tabs>`,
    },
  ],
  tag: [
    {
      id: "tones",
      title: "Semantic tags",
      description: "Label categories and status with theme-aware tones.",
      body: `<Tag tone="default">Default</Tag>
<Tag tone="primary">Primary</Tag>
<Tag tone="success">Stable</Tag>
<Tag tone="warning">Beta</Tag>
<Tag tone="error">Blocked</Tag>
<Tag tone="info">Info</Tag>
<Tag tone="muted">Muted</Tag>`,
    },
    {
      id: "closable",
      title: "Removable tags",
      description: "Represent selections that can be removed in place.",
      body: `<Tag closable onClose={() => removeFilter("design")}>Design</Tag>`,
      setup: `const removeFilter = (filter: string) => {
  console.log("Removed filter", filter);
};`,
    },
  ],
  text: [
    {
      id: "hierarchy",
      title: "Type hierarchy",
      description: "Express semantic hierarchy with the shared type scale.",
      body: `<Text as="h2" size="2xl" weight="semibold">Heading</Text>
<Text as="p">Readable body copy.</Text>
<Text as="p" size="sm" muted>Supporting information.</Text>`,
    },
    {
      id: "tones",
      title: "Semantic tones",
      description: "Communicate meaning while preserving theme contrast.",
      body: `<Text tone="default">Default</Text>
<Text tone="muted">Muted</Text>
<Text tone="primary">Primary</Text>
<Text tone="success">Success</Text>
<Text tone="warning">Warning</Text>
<Text tone="error">Error</Text>`,
    },
  ],
  "text-area": [
    {
      id: "basic",
      title: "Long-form input",
      description: "Collect longer content with clear label and guidance.",
      body: `<TextArea placeholder="What changed?">
  <TextArea.Label>Release notes</TextArea.Label>
</TextArea>`,
    },
    {
      id: "count",
      title: "Character count",
      description: "Make length constraints visible while the user writes.",
      body: `<TextArea maxLength={160} showCount>
  <TextArea.Label>Summary</TextArea.Label>
</TextArea>`,
    },
  ],
  toast: [
    {
      id: "tones",
      title: "Feedback tones",
      description: "Deliver transient feedback with every semantic tone.",
      body: `export function ToastTonesExample() {
  return (
    <ToastProvider position="bottom-right">
      <Button onClick={() => toast.show("Notification")}>Default</Button>
      <Button onClick={() => toast.success("Profile updated")}>Success</Button>
      <Button onClick={() => toast.warning("Storage almost full")}>Warning</Button>
      <Button onClick={() => toast.error("Upload failed")}>Error</Button>
      <Button onClick={() => toast.info("New version available")}>Info</Button>
    </ToastProvider>
  );
}`,
      imports: ["Button", "toast"],
      complete: true,
    },
    {
      id: "action",
      title: "Toast action",
      description:
        "Offer a short recovery action without interrupting the workflow.",
      body: `export function ToastActionExample() {
  const deleteFile = () => {
    toast.show({
      title: "File deleted",
      description: "This action can be undone.",
      action: {
        label: "Undo",
        altText: "Undo file deletion",
        onClick: () => toast.success("Restored"),
      },
    });
  };

  return (
    <ToastProvider position="bottom-right">
      <Button onClick={deleteFile}>Delete file</Button>
    </ToastProvider>
  );
}`,
      imports: ["Button", "toast"],
      complete: true,
    },
  ],
  tooltip: [
    {
      id: "hover",
      title: "Hover and focus",
      description: "Name compact controls for pointer and keyboard users.",
      body: `<Tooltip>
  <Tooltip.Trigger>
    <Button variant="secondary">Hover me</Button>
  </Tooltip.Trigger>
  <Tooltip.Content>Copy to clipboard</Tooltip.Content>
</Tooltip>`,
      imports: ["Button"],
    },
    {
      id: "click",
      title: "Click trigger",
      description: "Keep longer guidance visible until the user dismisses it.",
      body: `<Tooltip trigger="click">
  <Tooltip.Trigger>
    <Button>Click toggle</Button>
  </Tooltip.Trigger>
  <Tooltip.Content>Pinned until dismissed</Tooltip.Content>
</Tooltip>`,
      imports: ["Button"],
    },
  ],
  "virtual-table": [
    {
      id: "basic",
      title: "Virtualized data",
      description:
        "Render large datasets inside a bounded scrolling content region.",
      body: `<VirtualTable
  estimatedRowHeight={44}
  scroll={{ x: 720, y: 280 }}
  columns={columns}
  dataSource={rows}
  rowKey="id"
>
  <VirtualTable.Caption>Virtualized workspace members</VirtualTable.Caption>
</VirtualTable>`,
      setup: `const columns = [
  { key: "name", title: "Name", dataIndex: "name", sortable: true },
  { key: "role", title: "Role", dataIndex: "role" },
];
const rows = Array.from({ length: 1000 }, (_, index) => ({
  id: String(index + 1),
  name: "Member " + (index + 1),
  role: index % 2 === 0 ? "Editor" : "Viewer",
}));`,
    },
  ],
  wizard: [
    {
      id: "steps",
      title: "Step workflow",
      description: "Guide users through a sequenced multi-step task.",
      body: `<Wizard defaultStep="account">
  <Wizard.Step value="account">
    <Wizard.Title>Account</Wizard.Title>
    Account fields
  </Wizard.Step>
  <Wizard.Step value="workspace">
    <Wizard.Title>Workspace</Wizard.Title>
    Workspace fields
  </Wizard.Step>
  <Wizard.Navigation />
</Wizard>`,
    },
    {
      id: "progress",
      title: "Progress indicator",
      description:
        "Use a compact progress treatment when step names are secondary.",
      body: `<Wizard defaultStep="one" indicator="progress">
  <Wizard.Step value="one">
    <Wizard.Title>Basics</Wizard.Title>
    Basics
  </Wizard.Step>
  <Wizard.Step value="two">
    <Wizard.Title>Review</Wizard.Title>
    Review
  </Wizard.Step>
  <Wizard.Navigation>
    <Wizard.Navigation.Finish>Submit</Wizard.Navigation.Finish>
  </Wizard.Navigation>
</Wizard>`,
    },
  ],
};

export function getComponentExamples(
  entry: ComponentEntry,
): ComponentExample[] {
  const importName = entry.importName ?? entry.name.replaceAll(" ", "");
  return (specs[entry.slug] ?? []).map(
    ({
      body,
      imports = [],
      externalImports,
      reactImports = [],
      setup,
      complete = false,
      ...example
    }) => {
      const primaryImports = importName.split(",").map((name) => name.trim());
      const names = Array.from(new Set([...primaryImports, ...imports]));
      const componentName = `${toPascalCase(entry.slug)}${toPascalCase(
        example.id,
      )}Example`;
      const componentCode = complete
        ? body
        : `export function ${componentName}() {
${setup ? `${indent(setup, 2)}\n\n` : ""}  return (
    <>
${indent(body, 6)}
    </>
  );
}`;
      return {
        ...example,
        code: `${
          reactImports.length > 0
            ? `import { ${Array.from(new Set(reactImports)).join(", ")} } from "react";\n`
            : ""
        }import { ${names.join(", ")} } from "velune/react";${
          externalImports ? `\n${externalImports}` : ""
        }\n\n${componentCode}`,
      };
    },
  );
}

function indent(value: string, spaces: number): string {
  const prefix = " ".repeat(spaces);
  return value
    .split("\n")
    .map((line) => `${prefix}${line}`)
    .join("\n");
}

function toPascalCase(value: string): string {
  return value
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join("");
}

export const documentedComponentSlugs = Object.keys(specs);
