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
  "aspect-ratio": [
    {
      id: "media",
      title: "Media frame",
      description: "Keep media stable while its container changes width.",
      body: `<AspectRatio ratio="16/9">
  <div className="grid size-full place-items-center bg-gs-surface-mist">
    Preview
  </div>
</AspectRatio>`,
    },
  ],
  empty: [
    {
      id: "default",
      title: "Empty result",
      description: "Explain the empty state and offer a direct next action.",
      body: `<Empty>
  <Empty.Title>No projects yet</Empty.Title>
  <Empty.Description>Create a project to start organizing work.</Empty.Description>
  <Empty.Action><Button>Create project</Button></Empty.Action>
</Empty>`,
      imports: ["Button"],
    },
  ],
  icon: [
    {
      id: "labeled",
      title: "Labeled icon",
      description: "Use a label whenever an icon carries meaning by itself.",
      body: `<Icon label="Completed"><Check /></Icon>`,
      externalImports: 'import { Check } from "lucide-react";',
    },
  ],
  kbd: [
    {
      id: "shortcut",
      title: "Keyboard shortcut",
      description: "Show a compact command hint next to its action.",
      body: `<span>Open search <Kbd>Ctrl K</Kbd></span>`,
    },
  ],
  "scroll-area": [
    {
      id: "vertical",
      title: "Scrollable content",
      description: "Constrain lengthy content without losing keyboard access.",
      body: `<ScrollArea maxHeight={160}>
  <div className="grid gap-gs-3 p-gs-3">
    {Array.from({ length: 8 }, (_, index) => (
      <p key={index}>Activity update {index + 1}</p>
    ))}
  </div>
</ScrollArea>`,
    },
  ],
  sidebar: [
    {
      id: "composition",
      title: "Composition",
      description:
        "Application shell with every public slot. Use `tooltip` for icon-collapsed labels, `Ctrl/Cmd+B` (opt out via `enableKeyboardShortcut={false}`) to toggle on desktop, and Drawer on mobile.",
      body: `<div className="min-h-svh">
  <Sidebar.Provider>
  <Sidebar collapsible="icon">
    <Sidebar.Header>
      <span className="flex size-gs-10 shrink-0 items-center justify-center rounded-gs-sm bg-gs-surface-mist text-gs-sm font-gs-medium">
        V
      </span>
    </Sidebar.Header>
    <Sidebar.Content>
      <Sidebar.Group>
        <Sidebar.GroupLabel>Workspace</Sidebar.GroupLabel>
        <Sidebar.GroupAction aria-label="Add project">
          <Plus size={16} />
        </Sidebar.GroupAction>
        <Sidebar.GroupContent>
          <Sidebar.Menu>
            <Sidebar.MenuItem>
              <Sidebar.MenuButton tooltip="Home">
                <Home size={16} />
                <span>Home</span>
              </Sidebar.MenuButton>
              <Sidebar.MenuAction aria-label="More" showOnHover>
                <MoreHorizontal size={16} />
              </Sidebar.MenuAction>
            </Sidebar.MenuItem>
            <Sidebar.MenuItem defaultOpen>
              <Sidebar.MenuButton tooltip="Projects">
                <Folder size={16} />
                <span>Projects</span>
              </Sidebar.MenuButton>
              <Sidebar.MenuSub>
                <Sidebar.MenuSubItem>
                  <Sidebar.MenuSubButton>Active</Sidebar.MenuSubButton>
                </Sidebar.MenuSubItem>
                <Sidebar.MenuSubItem>
                  <Sidebar.MenuSubButton>Archived</Sidebar.MenuSubButton>
                </Sidebar.MenuSubItem>
              </Sidebar.MenuSub>
            </Sidebar.MenuItem>
            <Sidebar.MenuItem>
              <Sidebar.MenuButton current tooltip="Team">
                <Users size={16} />
                <span>Team</span>
              </Sidebar.MenuButton>
              <Sidebar.MenuBadge>8</Sidebar.MenuBadge>
            </Sidebar.MenuItem>
          </Sidebar.Menu>
        </Sidebar.GroupContent>
      </Sidebar.Group>
    </Sidebar.Content>
    <Sidebar.Footer>
      <Sidebar.Menu>
        <Sidebar.MenuItem>
          <Sidebar.MenuButton tooltip="Account">
            <User size={16} />
            <span>Account</span>
          </Sidebar.MenuButton>
        </Sidebar.MenuItem>
      </Sidebar.Menu>
    </Sidebar.Footer>
  </Sidebar>
  <main className="relative flex min-h-full min-w-gs-0 flex-1 flex-col bg-gs-surface">
    <header className="flex h-gs-12 items-center gap-gs-2 border-b border-gs-border-default px-gs-4">
      <Sidebar.Trigger />
      <span className="text-gs-sm font-gs-medium">Overview</span>
    </header>
    <pre className="m-gs-0 overflow-auto p-gs-4 font-mono text-gs-xs leading-relaxed text-gs-text-secondary">{[
      "Sidebar.Provider",
      "├── Sidebar",
      "│   ├── Sidebar.Header",
      "│   ├── Sidebar.Content",
      "│   │   └── Sidebar.Group",
      "│       ├── Sidebar.GroupLabel",
      "│       ├── Sidebar.GroupAction",
      "│       └── Sidebar.GroupContent",
      "│           └── Sidebar.Menu",
      "│               └── Sidebar.MenuItem",
      "│                   ├── Sidebar.MenuButton",
      "│                   ├── Sidebar.MenuAction",
      "│                   ├── Sidebar.MenuBadge",
      "│                   └── Sidebar.MenuSub",
      "│                       └── Sidebar.MenuSubItem",
      "│                           └── Sidebar.MenuSubButton",
      "│   └── Sidebar.Footer",
      "└── (main)",
      "    └── Sidebar.Trigger",
    ].join("\\n")}</pre>
  </main>
  </Sidebar.Provider>
</div>`,
      externalImports:
        'import { Folder, Home, MoreHorizontal, Plus, User, Users } from "lucide-react";',
    },
  ],
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
  alert: [
    {
      id: "tones",
      title: "Semantic tones",
      description: "Match the tone to the urgency of the message.",
      body: `<Alert tone="info">Scheduled maintenance starts at 22:00 UTC.</Alert>
<Alert tone="success">Workspace settings saved.</Alert>
<Alert tone="warning">Your trial ends in 3 days.</Alert>
<Alert tone="error">Payment failed. Update your billing details.</Alert>`,
    },
    {
      id: "structured",
      title: "Title and description",
      description: "Use the compound slots for longer messages.",
      body: `<Alert tone="warning">
  <Alert.Title>Storage almost full</Alert.Title>
  <Alert.Description>
    You have used 9.5 GB of your 10 GB quota. Remove unused assets or
    upgrade your plan.
  </Alert.Description>
  <Alert.Action>
    <Button size="sm" variant="secondary">Manage storage</Button>
  </Alert.Action>
</Alert>`,
      imports: ["Button"],
    },
    {
      id: "closable",
      title: "Dismissible",
      description: "Let users dismiss non-critical messages.",
      body: `<Alert tone="info" closable onClose={() => console.log("dismissed")}>
  <Alert.Title>Workspace notice</Alert.Title>
  <Alert.Description>
    Scheduled maintenance starts Friday at 22:00 UTC.
  </Alert.Description>
</Alert>`,
    },
    {
      id: "controlled",
      title: "Controlled visibility",
      description:
        "Drive show and hide from application state with open and onOpenChange.",
      body: `<Button onClick={() => setOpen(true)}>Show alert</Button>
{open ? (
  <Alert tone="info" closable open={open} onOpenChange={setOpen}>
    <Alert.Title>Workspace notice</Alert.Title>
    <Alert.Description>
      Scheduled maintenance starts Friday at 22:00 UTC.
    </Alert.Description>
  </Alert>
) : null}`,
      imports: ["Button"],
      reactImports: ["useState"],
      setup: `const [open, setOpen] = useState(true);`,
    },
  ],
  breadcrumb: [
    {
      id: "basic",
      title: "Page trail",
      description:
        "The last item is treated as the current page automatically.",
      body: `<Breadcrumb>
  <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
  <Breadcrumb.Item href="/projects">Projects</Breadcrumb.Item>
  <Breadcrumb.Item>Northstar</Breadcrumb.Item>
</Breadcrumb>`,
    },
    {
      id: "separator",
      title: "Custom separator",
      description: "Swap the chevron for any node.",
      body: `<Breadcrumb separator="/">
  <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
  <Breadcrumb.Item href="/docs">Docs</Breadcrumb.Item>
  <Breadcrumb.Item>Components</Breadcrumb.Item>
</Breadcrumb>`,
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
  <Text weight="medium">Project summary</Text>
</Box>`,
      imports: ["Text"],
    },
    {
      id: "responsive",
      title: "Responsive spacing",
      description: "Adjust spacing and display mode at design-system breakpoints.",
      body: `<Box padding={{ base: "3", md: "6" }} display={{ base: "block", md: "grid" }}>
  Responsive content
</Box>`,
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
<Button tone="danger">Delete</Button>`,
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
    {
      id: "as-child",
      title: "Render as child",
      description:
        "Use asChild to style an existing element, such as a router link, as a button.",
      body: `<Button asChild variant="secondary">
  <a href="#docs">Read the docs</a>
</Button>`,
    },
    {
      id: "button-classes",
      title: "Style recipe",
      description:
        "Apply button appearance to a non-Button element with buttonClasses().",
      body: `<a href="#docs" className={buttonClasses({ variant: "secondary" })}>
  Read the docs
</a>`,
      imports: ["buttonClasses"],
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
    {
      id: "action",
      title: "Header action",
      description: "Place a compact control or status next to the title.",
      body: `<Card variant="filled">
  <Card.Header>
    <Card.Title>Project overview</Card.Title>
    <Card.Description>Shared with 12 collaborators</Card.Description>
    <Card.Action>
      <Tag size="sm" tone="success">Active</Tag>
    </Card.Action>
  </Card.Header>
  <Card.Body>Shared project details.</Card.Body>
</Card>`,
      imports: ["Tag"],
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
      description:
        "Label the group, add supporting text, and surface a shared error.",
      body: `<Checkbox.Group defaultValue={[]}>
  <Checkbox.Group.Label>Notifications</Checkbox.Group.Label>
  <Checkbox.Group.Description>
    Choose how we reach you about workspace activity.
  </Checkbox.Group.Description>
  <Checkbox value="email">Email</Checkbox>
  <Checkbox value="push">Push</Checkbox>
  <Checkbox.Group.ErrorMessage>
    Select at least one channel.
  </Checkbox.Group.ErrorMessage>
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
      id: "responsive",
      title: "Responsive size",
      description: "Change the maximum content width at a chosen breakpoint.",
      body: `<Container size={{ base: "sm", lg: "xl" }}>
  Content grows with the viewport.
</Container>`,
    },
    {
      id: "semantic",
      title: "Named region",
      description: "Give a constrained page region an accessible name.",
      body: `<Container size="md" role="region" aria-labelledby="overview-title">
  <Text id="overview-title" as="h2" weight="medium">Overview</Text>
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
      body: `<DatePicker defaultValue="2026-07-13">
  <DatePicker.Label>Launch date</DatePicker.Label>
</DatePicker>`,
    },
    {
      id: "constraints",
      title: "Date constraints",
      description: "Limit selection to an allowed scheduling window.",
      body: `<DatePicker min="2026-07-01" max="2026-07-31">
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
    start: "2026-07-13",
    end: "2026-07-18",
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
  min="2026-07-10"
  max="2026-07-25"
  defaultValue={{
    start: "2026-07-12",
    end: "2026-07-18",
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
    start: "2026-07-13",
    end: "2026-07-18",
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
<Text tone="muted">Security preferences</Text>`,
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
      body: `<Dropdown>
  <Dropdown.Trigger>
    <Button variant="secondary">Project actions</Button>
  </Dropdown.Trigger>
  <Dropdown.Menu aria-label="Project actions">
    <Dropdown.Item value="edit">Edit project</Dropdown.Item>
    <Dropdown.Item value="duplicate">Duplicate</Dropdown.Item>
    <Dropdown.Separator />
    <Dropdown.Item value="delete" tone="danger">Delete project</Dropdown.Item>
  </Dropdown.Menu>
</Dropdown>`,
      imports: ["Button"],
    },
    {
      id: "sections",
      title: "Sections and metadata",
      description:
        "Group related commands and add supporting descriptions or shortcuts.",
      body: `<Dropdown>
  <Dropdown.Trigger>
    <Button variant="secondary">Account</Button>
  </Dropdown.Trigger>
  <Dropdown.Menu aria-label="Account menu">
    <Dropdown.Section>
      <Dropdown.SectionTitle>Workspace</Dropdown.SectionTitle>
      <Dropdown.Item value="profile">
        Profile
        <Dropdown.Item.Description>Manage your public identity</Dropdown.Item.Description>
        <Dropdown.Item.Trailing>⌘P</Dropdown.Item.Trailing>
      </Dropdown.Item>
    </Dropdown.Section>
    <Dropdown.Separator />
    <Dropdown.Item value="sign-out">Sign out</Dropdown.Item>
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
    <Dropdown.Item value="name">Name</Dropdown.Item>
    <Dropdown.Item value="owner">Owner</Dropdown.Item>
    <Dropdown.Item value="status">Status</Dropdown.Item>
    <Dropdown.Item value="updated">Last updated</Dropdown.Item>
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
    {
      id: "responsive",
      title: "Responsive direction",
      description: "Stack controls on narrow screens and align them horizontally when space allows.",
      body: `<Flex direction={{ base: "column", md: "row" }} gap={{ base: "2", md: "4" }}>
  <Button>Save</Button>
  <Button variant="secondary">Cancel</Button>
</Flex>`,
      imports: ["Button"],
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
    <Input type="email" fullWidth>
      <Input.Label>Email</Input.Label>
    </Input>
  </Form.Item>
  <Button type="submit" fullWidth>Continue</Button>
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
    <Input fullWidth>
      <Input.Label>Display name</Input.Label>
    </Input>
  </Form.Item>
</Form>`,
      imports: ["Input"],
      setup: `const save = (values: Record<string, unknown>) => {
  console.log("Submitted values", values);
};`,
    },
    {
      id: "schema",
      title: "Standard Schema",
      description:
        "Validate the whole values object with any Standard Schema library.",
      body: `<Form
  schema={emailSchema}
  initialValues={{ email: "" }}
  onSubmit={save}
>
  <Form.Item name="email">
    <Input type="email" fullWidth>
      <Input.Label>Email</Input.Label>
      <Input.Description>Validated by a Standard Schema.</Input.Description>
    </Input>
  </Form.Item>
  <Button type="submit" fullWidth>Continue</Button>
</Form>`,
      imports: ["Button", "Input"],
      setup: `const emailSchema = {
  "~standard": {
    version: 1 as const,
    vendor: "example",
    validate(value: unknown) {
      const values = value as { email?: string };
      if (!values.email?.includes("@")) {
        return {
          issues: [{ message: "Enter a valid email", path: ["email"] }],
        };
      }
      return { value: values };
    },
  },
};
const save = (values: Record<string, unknown>) => {
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
      body: `<Grid columns={{ base: 1, sm: 2, lg: 4 }} gap={{ base: "2", md: "3" }} responsive={false}>
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
    {
      id: "clearable",
      title: "Clearable",
      description: "Let users reset the field without selecting the text.",
      body: `<Input defaultValue="Velune" clearable>
  <Input.Label>Workspace</Input.Label>
</Input>`,
    },
    {
      id: "sizes",
      title: "Sizes",
      description: "Match field density to the surrounding layout.",
      body: `<Input size="sm" placeholder="Small">
  <Input.Label>Small</Input.Label>
</Input>
<Input size="md" placeholder="Medium">
  <Input.Label>Medium</Input.Label>
</Input>
<Input size="lg" placeholder="Large">
  <Input.Label>Large</Input.Label>
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
    {
      id: "hide-on-single-page",
      title: "Hide on a single page",
      description:
        "Omit pagination when the result set fits on one page.",
      body: `<Pagination hideOnSinglePage total={8} pageSize={10} />
<Pagination
  hideOnSinglePage
  page={page}
  total={80}
  pageSize={10}
  onPageChange={setPage}
/>`,
      reactImports: ["useState"],
      setup: `const [page, setPage] = useState(1);`,
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
    {
      id: "empty",
      title: "Empty options",
      description: "Explain when the option list has nothing to choose from.",
      body: `<Select>
  <Select.Label>Assignee</Select.Label>
  <Select.Trigger placeholder="Choose an assignee" />
  <Select.Empty>No assignees yet.</Select.Empty>
  <Select.Content />
</Select>`,
    },
    {
      id: "no-matches",
      title: "No search matches",
      description: "Distinguish a fruitless filter from an empty option list.",
      body: `<Select searchable fullWidth>
  <Select.Label>Member</Select.Label>
  <Select.Trigger placeholder="Choose a member" />
  <Select.NoMatches>No matching member.</Select.NoMatches>
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
    {
      id: "label",
      title: "Accessible label",
      description:
        "Name the spinner with the label prop when aria-label is not set.",
      body: `<Spinner label="Saving draft" />
<Spinner label="Uploading assets" size="lg" />`,
    },
  ],
  stack: [
    {
      id: "vertical",
      title: "Vertical rhythm",
      description: "Arrange related content with tokenized spacing.",
      body: `<Stack gap="3">
  <Text weight="medium">Profile</Text>
  <Text tone="muted">Account preferences</Text>
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
    {
      id: "responsive",
      title: "Responsive rhythm",
      description: "Change spacing or order without adding breakpoint wrappers.",
      body: `<Stack gap={{ base: "2", md: "4" }} reverse={{ base: false, lg: true }}>
  <Text>Primary content</Text>
  <Text tone="muted">Supporting content</Text>
</Stack>`,
      imports: ["Text"],
    },
    {
      id: "divider",
      title: "Divided stack",
      description: "Insert a divider between each pair of children.",
      body: `<Stack gap="3" divider={<Divider />}>
  <Text>Profile</Text>
  <Text>Billing</Text>
  <Text>Security</Text>
</Stack>`,
      imports: ["Divider", "Text"],
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
        "Fit compact or large surfaces and communicate loading or unavailable settings.",
      body: `<Switch size="sm" defaultChecked>Compact</Switch>
<Switch size="lg" defaultChecked>Large</Switch>
<Switch loading>Saving preference</Switch>
<Switch disabled>Unavailable</Switch>
<Switch defaultChecked>
  Email digests
  <Switch.Description>
    Morning summary of workspace activity.
  </Switch.Description>
</Switch>`,
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
    {
      id: "custom-sort",
      title: "Custom column sort",
      description:
        "Use sortValue or sorter when the display value differs from the sort key.",
      body: `<Table columns={columns} dataSource={members} rowKey="id">
  <Table.Caption>Members sorted by custom status order</Table.Caption>
</Table>`,
      setup: `const columns = [
  { key: "name", title: "Name", dataIndex: "name", sortable: true },
  {
    key: "status",
    title: "Status",
    dataIndex: "status",
    sortable: true,
    sortValue: (row: { status: string }) => (row.status === "active" ? 0 : 1),
  },
];
const members = [
  { id: "1", name: "Ada Lovelace", status: "invited" },
  { id: "2", name: "Grace Hopper", status: "active" },
];`,
    },
    {
      id: "fixed-columns",
      title: "Fixed columns",
      description:
        "Pin leading and trailing columns while the middle scrolls horizontally.",
      body: `<Table
  columns={columns}
  dataSource={members}
  rowKey="id"
  selectable
  scroll={{ x: 960 }}
>
  <Table.Caption>Members with fixed name and seats</Table.Caption>
</Table>`,
      setup: `const columns = [
  { key: "name", title: "Name", dataIndex: "name", width: 180, fixed: "start" as const },
  { key: "role", title: "Role", dataIndex: "role", width: 140 },
  { key: "team", title: "Team", dataIndex: "team", width: 160 },
  { key: "seats", title: "Seats", dataIndex: "seats", width: 96, fixed: "end" as const },
];
const members = [
  { id: "1", name: "Ada Lovelace", role: "Admin", team: "Platform", seats: 3 },
  { id: "2", name: "Grace Hopper", role: "Editor", team: "Design", seats: 1 },
];`,
    },
    {
      id: "tree",
      title: "Tree table",
      description:
        "Expand nested children while sorting stays within each sibling group.",
      body: `<Table
  columns={columns}
  dataSource={teams}
  rowKey="id"
  tree={{ defaultExpandAll: true }}
>
  <Table.Caption>Organization tree</Table.Caption>
</Table>`,
      setup: `const columns = [
  { key: "name", title: "Name", dataIndex: "name", sortable: true },
  { key: "role", title: "Role", dataIndex: "role" },
];
const teams = [
  {
    id: "eng",
    name: "Engineering",
    role: "Team",
    children: [
      { id: "eng-1", name: "Ada Lovelace", role: "Admin" },
      { id: "eng-2", name: "Grace Hopper", role: "Editor" },
    ],
  },
  {
    id: "design",
    name: "Design",
    role: "Team",
    children: [{ id: "design-1", name: "Katherine Johnson", role: "Viewer" }],
  },
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
      body: `<Text as="h2" size="2xl" weight="medium">Heading</Text>
<Text as="p">Readable body copy.</Text>
<Text as="p" size="sm" tone="muted">Supporting information.</Text>`,
    },
    {
      id: "tones",
      title: "Semantic tones",
      description: "Communicate meaning while preserving theme contrast.",
      body: `<Text tone="default">Default</Text>
<Text tone="muted">Muted</Text>
<Text tone="accent">Accent</Text>
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
    {
      id: "resize",
      title: "Resize handle",
      description: "Control whether users can resize the field manually.",
      body: `<TextArea resize="both" defaultValue="Stretch in either direction.">
  <TextArea.Label>Freeform notes</TextArea.Label>
</TextArea>
<TextArea resize="none" defaultValue="Height stays fixed.">
  <TextArea.Label>Fixed height</TextArea.Label>
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
    {
      id: "promise",
      title: "Promise feedback",
      description:
        "Track an async operation from loading through success or failure.",
      body: `export function ToastPromiseExample() {
  const saveReport = () => {
    toast.promise(
      new Promise<string>((resolve) => {
        window.setTimeout(() => resolve("report"), 1200);
      }),
      {
        loading: "Saving…",
        success: (name) => \`Saved \${name}\`,
        error: "Save failed",
      },
    );
  };

  return (
    <ToastProvider position="bottom-right">
      <Button onClick={saveReport}>Save report</Button>
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
  combobox: [
    {
      id: "basic",
      title: "Searchable selection",
      description: "Type to filter options, then pick a suggestion.",
      body: `<Combobox defaultValue="react" aria-label="Framework">
  <Combobox.Label>Framework</Combobox.Label>
  <Combobox.Item value="react">React</Combobox.Item>
  <Combobox.Item value="vue">Vue</Combobox.Item>
  <Combobox.Item value="svelte">Svelte</Combobox.Item>
  <Combobox.Item value="solid">Solid</Combobox.Item>
</Combobox>`,
    },
    {
      id: "controlled",
      title: "Controlled value",
      description: "Own the selected key in application state.",
      body: `<Combobox value={value} onValueChange={setValue} aria-label="City">
  <Combobox.Label>City</Combobox.Label>
  <Combobox.Item value="berlin">Berlin</Combobox.Item>
  <Combobox.Item value="lisbon">Lisbon</Combobox.Item>
  <Combobox.Item value="tokyo">Tokyo</Combobox.Item>
  <Combobox.NoMatches>No matching city.</Combobox.NoMatches>
</Combobox>`,
      reactImports: ["useState"],
      setup: `const [value, setValue] = useState("berlin");`,
    },
    {
      id: "empty",
      title: "Empty options",
      description: "Explain when there are no options available at all.",
      body: `<Combobox aria-label="City">
  <Combobox.Label>City</Combobox.Label>
  <Combobox.Empty>No cities available.</Combobox.Empty>
</Combobox>`,
    },
  ],
  slider: [
    {
      id: "basic",
      title: "Single value",
      description: "Label and live output pair with the slider track.",
      body: `<Slider defaultValue={40}>
  <Slider.Label>Volume</Slider.Label>
  <Slider.Output />
</Slider>`,
    },
    {
      id: "range",
      title: "Range selection",
      description: "Pass an array to render one thumb per value.",
      body: `<Slider defaultValue={[20, 80]}>
  <Slider.Label>Price range</Slider.Label>
  <Slider.Output />
</Slider>`,
    },
    {
      id: "format",
      title: "Formatted output",
      description: "Format values with Intl.NumberFormat options.",
      body: `<Slider
  defaultValue={0.5}
  min={0}
  max={1}
  step={0.01}
  formatOptions={{ style: "percent" }}
>
  <Slider.Label>Opacity</Slider.Label>
  <Slider.Output />
</Slider>`,
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
