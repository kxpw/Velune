import { useState, type ReactNode } from "react";
import { ArrowRight, Check, Folder, Home, MoreHorizontal, Plus, User, Users } from "lucide-react";
import {
  ReliefCard,
  AspectRatio,
  Alert,
  Avatar,
  Badge,
  Box,
  Breadcrumb,
  Button,
  buttonClasses,
  Card,
  Checkbox,
  Collapse,
  Combobox,
  Container,
  DatePicker,
  DateRangePicker,
  Divider,
  Drawer,
  Empty,
  Dropdown,
  Flex,
  Form,
  Grid,
  Input,
  Icon,
  Kbd,
  List,
  Modal,
  Pagination,
  Popover,
  Progress,
  Radio,
  Select,
  ScrollArea,
  Sidebar,
  Skeleton,
  Slider,
  Spinner,
  Stack,
  Switch,
  Table,
  Tabs,
  Tag,
  Text,
  TextArea,
  Tooltip,
  VirtualTable,
  Wizard,
  toast,
  type FormSchema,
} from "velune/react";
import type { ComponentEntry } from "./component-data";

const people = [
  { id: "1", name: "Ada Lovelace", role: "Admin", status: "Active" },
  { id: "2", name: "Grace Hopper", role: "Editor", status: "Active" },
  { id: "3", name: "Alan Turing", role: "Viewer", status: "Invited" },
];

const largePeople = Array.from({ length: 120 }, (_, index) => ({
  id: String(index + 1),
  name: `Member ${index + 1}`,
  role: index % 3 === 0 ? "Admin" : index % 3 === 1 ? "Editor" : "Viewer",
  status: index % 5 === 0 ? "Invited" : "Active",
}));

function TablePreview({ selectable = false }: { selectable?: boolean } = {}) {
  return (
    <Table
      columns={[
        { key: "name", title: "Name", dataIndex: "name", sortable: true },
        { key: "role", title: "Role", dataIndex: "role" },
      ]}
      dataSource={people}
      rowKey="id"
      selectable={selectable}
    >
      <Table.Caption>
        {selectable ? "Selectable workspace members" : "Workspace members"}
      </Table.Caption>
    </Table>
  );
}

function TabsPreview() {
  return (
    <Tabs defaultValue="preview" variant="underline">
      <Tabs.List>
        <Tabs.Trigger value="preview">Preview</Tabs.Trigger>
        <Tabs.Trigger value="usage">Usage</Tabs.Trigger>
        <Tabs.Trigger value="api">API</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Panel value="preview">
        <Text size="sm">A focused view for the current task.</Text>
      </Tabs.Panel>
      <Tabs.Panel value="usage">
        <Text size="sm">Composition guidance and examples.</Text>
      </Tabs.Panel>
      <Tabs.Panel value="api">
        <Text size="sm">Properties and type signatures.</Text>
      </Tabs.Panel>
    </Tabs>
  );
}

function SelectionPreview({ kind }: { kind: "checkbox" | "radio" | "switch" }) {
  const [enabled, setEnabled] = useState(true);
  if (kind === "switch") {
    return (
      <Switch checked={enabled} onCheckedChange={setEnabled}>
        Notifications
      </Switch>
    );
  }
  if (kind === "radio") {
    return (
      <Radio.Group defaultValue="team" orientation="horizontal">
        <Radio value="personal">Personal</Radio>
        <Radio value="team">Team</Radio>
      </Radio.Group>
    );
  }
  return (
    <Box className="flex flex-wrap gap-gs-5">
      <Checkbox defaultChecked>Design</Checkbox>
      <Checkbox>Engineering</Checkbox>
      <Checkbox indeterminate>Operations</Checkbox>
    </Box>
  );
}

function ModalPreview({
  kind,
  placement = "right",
  size = "md",
  title,
  showBody = true,
}: {
  kind: "modal" | "drawer";
  placement?: "left" | "right" | "top" | "bottom";
  size?: "sm" | "md" | "lg" | "fullscreen";
  title?: string;
  showBody?: boolean;
}) {
  const [open, setOpen] = useState(false);

  if (kind === "drawer") {
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open drawer</Button>
        <Drawer open={open} onOpenChange={setOpen} placement={placement}>
          <Drawer.Content>
            <Drawer.Header>
              <Drawer.Title>{title ?? "Filters"}</Drawer.Title>
            </Drawer.Header>
            {showBody ? <Drawer.Body>Filter options</Drawer.Body> : null}
          </Drawer.Content>
        </Drawer>
      </>
    );
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open modal</Button>
      <Modal open={open} onOpenChange={setOpen} size={size}>
        <Modal.Content>
          <Modal.Header>
            <Modal.Title>{title ?? "Rename project"}</Modal.Title>
            <Modal.Description>
              {size === "lg"
                ? "Manage the details your team sees across this workspace."
                : "Choose a clear name that your team will recognize."}
            </Modal.Description>
          </Modal.Header>
          {showBody ? (
            <Modal.Body>
              <Input defaultValue="Northstar" fullWidth>
                <Input.Label>Project name</Input.Label>
              </Input>
            </Modal.Body>
          ) : null}
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setOpen(false)}>Save changes</Button>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </>
  );
}

function FormPreview() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <Box className="w-full max-w-md">
      <Form
        initialValues={{ email: "", updates: true }}
        onSubmit={() => setSubmitted(true)}
      >
        <Stack gap="4">
          <Form.Item
            name="email"
            rules={[{ required: true, message: "Email is required" }]}
          >
            <Input type="email" placeholder="you@company.com" fullWidth>
              <Input.Label>Email</Input.Label>
            </Input>
          </Form.Item>
          <Form.Item name="updates">
            <Switch>Product updates: send release notes</Switch>
          </Form.Item>
          <Button type="submit">Create account</Button>
          {submitted ? (
            <Text size="sm" tone="success">
              Account details are ready.
            </Text>
          ) : null}
        </Stack>
      </Form>
    </Box>
  );
}

function WizardPreview() {
  const [complete, setComplete] = useState(false);

  return (
    <Box className="w-full max-w-xl">
      <Wizard defaultStep="account" onComplete={() => setComplete(true)}>
        <Wizard.Step value="account">
          <Wizard.Title>Account</Wizard.Title>
          <Wizard.Description>Identity</Wizard.Description>
          <Input placeholder="you@company.com" fullWidth>
            <Input.Label>Email</Input.Label>
          </Input>
        </Wizard.Step>
        <Wizard.Step value="workspace">
          <Wizard.Title>Workspace</Wizard.Title>
          <Wizard.Description>Setup</Wizard.Description>
          <Input defaultValue="Northstar" fullWidth>
            <Input.Label>Workspace name</Input.Label>
          </Input>
        </Wizard.Step>
        <Wizard.Step value="review">
          <Wizard.Title>Review</Wizard.Title>
          <Wizard.Description>Confirm</Wizard.Description>
          <Text size="sm">Review the details before completing setup.</Text>
        </Wizard.Step>
        <Wizard.Navigation />
      </Wizard>
      {complete ? (
        <Text size="sm" tone="success" className="mt-gs-4">
          Setup complete.
        </Text>
      ) : null}
    </Box>
  );
}

function ComboboxPreview({
  controlled = false,
  empty = false,
}: {
  controlled?: boolean;
  empty?: boolean;
}) {
  const [value, setValue] = useState("berlin");

  if (empty) {
    return (
      <Box className="w-full max-w-xs">
        <Combobox fullWidth>
          <Combobox.Label>City</Combobox.Label>
          <Combobox.Empty>No cities available.</Combobox.Empty>
        </Combobox>
      </Box>
    );
  }

  if (controlled) {
    return (
      <Box className="w-full max-w-xs">
        <Combobox value={value} onValueChange={setValue} fullWidth>
          <Combobox.Label>City</Combobox.Label>
          <Combobox.Item value="berlin">Berlin</Combobox.Item>
          <Combobox.Item value="lisbon">Lisbon</Combobox.Item>
          <Combobox.Item value="tokyo">Tokyo</Combobox.Item>
          <Combobox.NoMatches>No matching city.</Combobox.NoMatches>
        </Combobox>
      </Box>
    );
  }

  return (
    <Box className="w-full max-w-xs">
      <Combobox defaultValue="react" fullWidth>
        <Combobox.Label>Framework</Combobox.Label>
        <Combobox.Item value="react">React</Combobox.Item>
        <Combobox.Item value="vue">Vue</Combobox.Item>
        <Combobox.Item value="svelte">Svelte</Combobox.Item>
        <Combobox.Item value="solid">Solid</Combobox.Item>
      </Combobox>
    </Box>
  );
}

function AlertControlledPreview() {
  const [open, setOpen] = useState(true);
  return (
    <Box className="grid w-full max-w-xl gap-gs-3">
      <Button onClick={() => setOpen(true)}>Show alert</Button>
      {open ? (
        <Alert tone="info" closable open={open} onOpenChange={setOpen}>
          <Alert.Title>Workspace notice</Alert.Title>
          <Alert.Description>
            Scheduled maintenance starts Friday at 22:00 UTC.
          </Alert.Description>
        </Alert>
      ) : null}
    </Box>
  );
}

function PaginationHideOnSinglePagePreview() {
  const [page, setPage] = useState(1);
  return (
    <Box className="grid w-full gap-gs-4">
      <Pagination hideOnSinglePage total={8} pageSize={10} />
      <Pagination
        hideOnSinglePage
        page={page}
        total={80}
        pageSize={10}
        onPageChange={setPage}
      />
    </Box>
  );
}

const emailSchema = {
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
} satisfies FormSchema;

function ExampleVariantPreview({
  entry,
  exampleId,
}: {
  entry: ComponentEntry;
  exampleId: string;
}): ReactNode | null {
  const key = `${entry.slug}:${exampleId}`;

  switch (key) {
    case "alert:tones":
      return (
        <Box className="grid w-full max-w-xl gap-gs-3">
          <Alert tone="info">Scheduled maintenance starts at 22:00 UTC.</Alert>
          <Alert tone="success">Workspace settings saved.</Alert>
          <Alert tone="warning">Your trial ends in 3 days.</Alert>
          <Alert tone="error">Payment failed. Update your billing details.</Alert>
        </Box>
      );
    case "alert:structured":
      return (
        <Box className="w-full max-w-xl">
          <Alert tone="warning">
            <Alert.Title>Storage almost full</Alert.Title>
            <Alert.Description>
              You have used 9.5 GB of your 10 GB quota. Remove unused assets or
              upgrade your plan.
            </Alert.Description>
            <Alert.Action>
              <Button size="sm" variant="secondary">
                Manage storage
              </Button>
            </Alert.Action>
          </Alert>
        </Box>
      );
    case "alert:closable":
      return (
        <Box className="w-full max-w-xl">
          <Alert tone="info" closable>
            <Alert.Title>Workspace notice</Alert.Title>
            <Alert.Description>
              Scheduled maintenance starts Friday at 22:00 UTC.
            </Alert.Description>
          </Alert>
        </Box>
      );
    case "alert:controlled":
      return <AlertControlledPreview />;
    case "aspect-ratio:media":
      return (
        <AspectRatio ratio="16/9" className="w-full max-w-md">
          <Box className="grid size-full place-items-center bg-gs-surface-mist text-gs-text-secondary">
            Preview
          </Box>
        </AspectRatio>
      );
    case "breadcrumb:basic":
      return (
        <Breadcrumb>
          <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
          <Breadcrumb.Item href="/projects">Projects</Breadcrumb.Item>
          <Breadcrumb.Item>Northstar</Breadcrumb.Item>
        </Breadcrumb>
      );
    case "breadcrumb:separator":
      return (
        <Breadcrumb separator="/">
          <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
          <Breadcrumb.Item href="/docs">Docs</Breadcrumb.Item>
          <Breadcrumb.Item>Components</Breadcrumb.Item>
        </Breadcrumb>
      );
    case "combobox:basic":
      return <ComboboxPreview />;
    case "combobox:controlled":
      return <ComboboxPreview controlled />;
    case "combobox:empty":
      return <ComboboxPreview empty />;
    case "slider:basic":
      return (
        <Box className="w-full max-w-sm">
          <Slider defaultValue={40}>
            <Slider.Label>Volume</Slider.Label>
            <Slider.Output />
          </Slider>
        </Box>
      );
    case "slider:range":
      return (
        <Box className="w-full max-w-sm">
          <Slider defaultValue={[20, 80]}>
            <Slider.Label>Price range</Slider.Label>
            <Slider.Output />
          </Slider>
        </Box>
      );
    case "slider:format":
      return (
        <Box className="w-full max-w-sm">
          <Slider
            defaultValue={0.5}
            min={0}
            max={1}
            step={0.01}
            formatOptions={{ style: "percent" }}
          >
            <Slider.Label>Opacity</Slider.Label>
            <Slider.Output />
          </Slider>
        </Box>
      );
    case "relief-card:hero":
      return (
        <ReliefCard>
          <ReliefCard.Title>Velune design system</ReliefCard.Title>
          <ReliefCard.Description>
            Hover to reveal the subtle relief pattern beneath the surface.
          </ReliefCard.Description>
        </ReliefCard>
      );
    case "avatar:fallbacks":
      return (
        <Box className="flex flex-wrap items-center gap-gs-4">
          <Avatar name="Ada Lovelace" size="xs" />
          <Avatar name="Ada Lovelace" size="sm" />
          <Avatar name="Ada Lovelace" size="md" />
          <Avatar name="Ada Lovelace" size="lg" />
          <Avatar name="Ada Lovelace" size="xl" />
          <Avatar name="Grace Hopper" shape="square" />
        </Box>
      );
    case "relief-card:empty-state":
      return (
        <ReliefCard>
          <ReliefCard.Title as="h3">No projects yet</ReliefCard.Title>
          <ReliefCard.Description>
            Create your first project to start your workspace.
          </ReliefCard.Description>
          <ReliefCard.Action>
            <Button>Create project</Button>
          </ReliefCard.Action>
        </ReliefCard>
      );
    case "relief-card:animation":
      return (
        <ReliefCard
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
        </ReliefCard>
      );
    case "progress:value":
      return (
        <Box className="grid w-full max-w-md gap-gs-4">
          <Progress value={24} aria-label="Importing" showValue />
          <Progress value={64} aria-label="Transcoding" showValue />
          <Progress value={100} aria-label="Publishing" showValue />
        </Box>
      );
    case "avatar:group":
      return (
        <Avatar.Group max={3}>
          <Avatar name="Ada Lovelace" />
          <Avatar name="Grace Hopper" />
          <Avatar name="Alan Turing" />
          <Avatar name="Katherine Johnson" />
        </Avatar.Group>
      );
    case "badge:counts":
      return (
        <Box className="flex items-center gap-gs-6">
          <Badge count={8} />
          <Badge count={120} max={99} />
          <Badge count={0} showZero />
        </Box>
      );
    case "badge:tones":
      return (
        <Box className="flex flex-wrap gap-gs-4">
          <Badge tone="default">Default</Badge>
          <Badge tone="primary">Primary</Badge>
          <Badge tone="success">Success</Badge>
          <Badge tone="warning">Pending</Badge>
          <Badge tone="error">Failed</Badge>
          <Badge tone="info">Info</Badge>
        </Box>
      );
    case "box:semantic":
      return (
        <Box as="section" padding="4" className="rounded-gs-sm bg-gs-surface">
          <Text weight="medium">Project summary</Text>
        </Box>
      );
    case "box:spacing":
      return <Box padding="5">Token-aware content</Box>;
    case "box:responsive":
      return (
        <Box
          padding={{ base: "3", md: "6" }}
          display={{ base: "block", md: "grid" }}
        >
          Responsive content
        </Box>
      );
    case "button:variants":
      return (
        <Box className="flex flex-wrap items-center gap-gs-3">
          <Button>Continue</Button>
          <Button variant="secondary">Save draft</Button>
          <Button variant="ghost">Cancel</Button>
          <Button variant="text">Learn more</Button>
          <Button tone="danger">Delete</Button>
        </Box>
      );
    case "button:sizes":
      return (
        <Box className="flex flex-wrap items-center gap-gs-3">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </Box>
      );
    case "button:states":
      return (
        <Box className="flex flex-wrap gap-gs-3">
          <Button loading>Saving</Button>
          <Button disabled>Unavailable</Button>
        </Box>
      );
    case "button:content":
      return (
        <Box className="flex flex-wrap items-center gap-gs-3">
          <Button>
            <Button.Leading>
              <Check size={16} />
            </Button.Leading>
            Confirm
          </Button>
          <Button variant="secondary">
            Continue
            <Button.Trailing>
              <ArrowRight size={16} />
            </Button.Trailing>
          </Button>
        </Box>
      );
    case "button:as-child":
      return (
        <Box className="flex flex-wrap items-center gap-gs-3">
          <Button asChild variant="secondary">
            <a href="#docs">Read the docs</a>
          </Button>
        </Box>
      );
    case "button:button-classes":
      return (
        <Box className="flex flex-wrap items-center gap-gs-3">
          <a href="#docs" className={buttonClasses({ variant: "secondary" })}>
            Read the docs
          </a>
        </Box>
      );
    case "card:variants":
      return (
        <Box className="grid w-full gap-gs-3 sm:grid-cols-3">
          <Card variant="outlined">
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
          </Card>
        </Box>
      );
    case "card:interactive":
      return (
        <Card interactive onClick={() => undefined} className="w-full max-w-md">
          <Card.Header>
            <Card.Title>Northstar</Card.Title>
            <Card.Description>Open project</Card.Description>
          </Card.Header>
        </Card>
      );
    case "card:sections":
      return (
        <Card variant="filled" className="w-full max-w-md">
          <Card.Header>
            <Card.Title>Project</Card.Title>
            <Card.Description>12 collaborators</Card.Description>
          </Card.Header>
          <Card.Body>Shared project details.</Card.Body>
          <Card.Footer>
            <Button size="sm">Open</Button>
          </Card.Footer>
        </Card>
      );
    case "card:action":
      return (
        <Card variant="filled" className="w-full max-w-md">
          <Card.Header>
            <Card.Title>Project overview</Card.Title>
            <Card.Description>Shared with 12 collaborators</Card.Description>
            <Card.Action>
              <Tag size="sm" tone="success">
                Active
              </Tag>
            </Card.Action>
          </Card.Header>
          <Card.Body>Shared project details.</Card.Body>
        </Card>
      );
    case "checkbox:group":
      return (
        <Checkbox.Group defaultValue={[]}>
          <Checkbox.Group.Label>Notifications</Checkbox.Group.Label>
          <Checkbox.Group.Description>
            Choose how we reach you about workspace activity.
          </Checkbox.Group.Description>
          <Checkbox value="email">Email</Checkbox>
          <Checkbox value="push">Push</Checkbox>
          <Checkbox.Group.ErrorMessage>
            Select at least one channel.
          </Checkbox.Group.ErrorMessage>
        </Checkbox.Group>
      );
    case "checkbox:states":
      return <SelectionPreview kind="checkbox" />;
    case "collapse:single":
      return (
        <Collapse defaultValue="basics">
          <Collapse.Item value="basics">
            <Collapse.Trigger>What is Velune?</Collapse.Trigger>
            <Collapse.Content>A React component system.</Collapse.Content>
          </Collapse.Item>
        </Collapse>
      );
    case "collapse:multiple":
      return (
        <Collapse type="multiple" defaultValue={["theme"]}>
          <Collapse.Item value="theme">
            <Collapse.Trigger>Theme</Collapse.Trigger>
            <Collapse.Content>Semantic token configuration.</Collapse.Content>
          </Collapse.Item>
          <Collapse.Item value="a11y">
            <Collapse.Trigger>Accessibility</Collapse.Trigger>
            <Collapse.Content>Keyboard-first behavior.</Collapse.Content>
          </Collapse.Item>
        </Collapse>
      );
    case "collapse:plain":
      return (
        <Collapse variant="plain" defaultValue="theme">
          <Collapse.Item value="theme">
            <Collapse.Trigger>Theme tokens</Collapse.Trigger>
            <Collapse.Content>
              Semantic colors adapt to every theme.
            </Collapse.Content>
          </Collapse.Item>
          <Collapse.Item value="motion">
            <Collapse.Trigger>Motion preferences</Collapse.Trigger>
            <Collapse.Content>
              Reduced motion is respected automatically.
            </Collapse.Content>
          </Collapse.Item>
        </Collapse>
      );
    case "container:sizes":
      return (
        <Box className="grid w-full gap-gs-3">
          {[
            ["xs", "Extra-small content"],
            ["sm", "Small content"],
            ["md", "Medium content"],
            ["lg", "Large content"],
            ["xl", "Extra-large content"],
          ].map(([size, label]) => (
            <Container
              key={size}
              size={size as "xs" | "sm" | "md" | "lg" | "xl"}
              className="rounded-gs-sm bg-gs-surface py-gs-3"
            >
              {label}
            </Container>
          ))}
        </Box>
      );
    case "container:semantic":
      return (
        <Container size="md" role="region" aria-labelledby="overview-title">
          <Text id="overview-title" as="h2" weight="medium">
            Overview
          </Text>
        </Container>
      );
    case "container:responsive":
      return (
        <Container size={{ base: "sm", lg: "xl" }}>
          Content grows with the viewport.
        </Container>
      );
    case "date-picker:basic":
      return (
        <DatePicker defaultValue="2026-07-13">
          <DatePicker.Label>Launch date</DatePicker.Label>
        </DatePicker>
      );
    case "date-picker:constraints":
      return (
        <DatePicker min="2026-07-01" max="2026-07-31">
          <DatePicker.Label>Review date</DatePicker.Label>
        </DatePicker>
      );
    case "date-picker:states":
      return (
        <Box className="grid w-full max-w-md gap-gs-4 sm:grid-cols-2">
          <DatePicker required>
            <DatePicker.Label>Required date</DatePicker.Label>
          </DatePicker>
          <DatePicker defaultValue="2026-07-13" disabled>
            <DatePicker.Label>Unavailable</DatePicker.Label>
          </DatePicker>
        </Box>
      );
    case "date-range-picker:basic":
      return (
        <Box className="w-full max-w-2xl">
          <DateRangePicker
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
          </DateRangePicker>
        </Box>
      );
    case "date-range-picker:constraints":
      return (
        <Box className="w-full max-w-2xl">
          <DateRangePicker
            min="2026-07-10"
            max="2026-07-25"
            defaultValue={{
              start: "2026-07-12",
              end: "2026-07-18",
            }}
          >
            <DateRangePicker.Label>Reservation</DateRangePicker.Label>
          </DateRangePicker>
        </Box>
      );
    case "date-range-picker:states":
      return (
        <Box className="grid w-full max-w-2xl gap-gs-4">
          <DateRangePicker required invalid>
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
          </DateRangePicker>
        </Box>
      );
    case "divider:label":
      return (
        <Box className="w-full max-w-lg">
          <Divider>Or continue with</Divider>
        </Box>
      );
    case "divider:horizontal":
      return (
        <Box className="w-full max-w-lg">
          <Text>Account</Text>
          <Divider />
          <Text tone="muted">Security preferences</Text>
        </Box>
      );
    case "drawer:placements":
      return (
        <ModalPreview
          kind="drawer"
          placement="left"
          title="Navigation"
          showBody={false}
        />
      );
    case "drawer:default":
      return <ModalPreview kind="drawer" />;
    case "dropdown:basic":
      return (
        <Dropdown>
          <Dropdown.Trigger>
            <Button variant="secondary">Project actions</Button>
          </Dropdown.Trigger>
          <Dropdown.Menu aria-label="Project actions">
            <Dropdown.Item value="edit">Edit project</Dropdown.Item>
            <Dropdown.Item value="duplicate">Duplicate</Dropdown.Item>
            <Dropdown.Separator />
            <Dropdown.Item value="delete" tone="danger">
              Delete project
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      );
    case "dropdown:sections":
      return (
        <Dropdown>
          <Dropdown.Trigger>
            <Button variant="secondary">Account</Button>
          </Dropdown.Trigger>
          <Dropdown.Menu aria-label="Account menu">
            <Dropdown.Section>
              <Dropdown.SectionTitle>Workspace</Dropdown.SectionTitle>
              <Dropdown.Item value="profile">
                Profile
                <Dropdown.Item.Description>
                  Manage your public identity
                </Dropdown.Item.Description>
                <Dropdown.Item.Trailing>⌘P</Dropdown.Item.Trailing>
              </Dropdown.Item>
            </Dropdown.Section>
            <Dropdown.Separator />
            <Dropdown.Item value="sign-out">Sign out</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      );
    case "dropdown:selection":
      return (
        <Dropdown>
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
        </Dropdown>
      );
    case "empty:default":
      return (
        <Empty>
          <Empty.Title>No projects yet</Empty.Title>
          <Empty.Description>
            Create a project to start organizing work.
          </Empty.Description>
          <Empty.Action>
            <Button>Create project</Button>
          </Empty.Action>
        </Empty>
      );
    case "icon:labeled":
      return (
        <Icon label="Completed">
          <Check />
        </Icon>
      );
    case "kbd:shortcut":
      return (
        <Text size="sm">
          Open search <Kbd>Ctrl K</Kbd>
        </Text>
      );
    case "flex:wrap":
      return (
        <Flex gap="2" wrap>
          {["Design", "Engineering", "Operations"].map((label) => (
            <Tag key={label}>{label}</Tag>
          ))}
        </Flex>
      );
    case "flex:alignment":
      return (
        <Flex gap="3" align="center" justify="between" fullWidth>
          <Text weight="medium">Members</Text>
          <Button size="sm">Invite</Button>
        </Flex>
      );
    case "flex:responsive":
      return (
        <Flex
          direction={{ base: "column", md: "row" }}
          gap={{ base: "2", md: "4" }}
        >
          <Button>Save</Button>
          <Button variant="secondary">Cancel</Button>
        </Flex>
      );
    case "form:nested":
      return (
        <Box className="w-full max-w-md">
          <Form
            initialValues={{ profile: { name: "" } }}
            onSubmit={() => undefined}
          >
            <Form.Item name="profile.name">
              <Input fullWidth>
                <Input.Label>Display name</Input.Label>
              </Input>
            </Form.Item>
          </Form>
        </Box>
      );
    case "form:validation":
      return (
        <Box className="w-full max-w-md">
          <Form initialValues={{ email: "" }} onSubmit={() => undefined}>
            <Form.Item
              name="email"
              rules={[{ required: true, message: "Email is required" }]}
            >
              <Input type="email" fullWidth>
                <Input.Label>Email</Input.Label>
              </Input>
            </Form.Item>
            <Button type="submit" fullWidth>
              Continue
            </Button>
          </Form>
        </Box>
      );
    case "form:schema":
      return (
        <Box className="w-full max-w-md">
          <Form
            schema={emailSchema}
            initialValues={{ email: "" }}
            onSubmit={() => undefined}
          >
            <Form.Item name="email">
              <Input type="email" fullWidth>
                <Input.Label>Email</Input.Label>
                <Input.Description>
                  Validated by a Standard Schema.
                </Input.Description>
              </Input>
            </Form.Item>
            <Button type="submit" fullWidth>
              Continue
            </Button>
          </Form>
        </Box>
      );
    case "grid:columns":
      return (
        <Grid columns={3} gap="3" className="w-full">
          {["One", "Two", "Three"].map((label) => (
            <Box
              key={label}
              padding="4"
              className="rounded-gs-sm bg-gs-surface"
            >
              {label}
            </Box>
          ))}
        </Grid>
      );
    case "grid:responsive":
      return (
        <Grid columns={4} gap="3" responsive className="w-full">
          {["Design", "Code", "Test", "Ship"].map((label) => (
            <Card key={label} variant="filled">
              <Card.Body>{label}</Card.Body>
            </Card>
          ))}
        </Grid>
      );
    case "input:affixes":
      return (
        <Input defaultValue="velune">
          <Input.Label>Domain</Input.Label>
          <Input.Prefix>https://</Input.Prefix>
          <Input.Suffix>.com</Input.Suffix>
        </Input>
      );
    case "input:labels":
      return (
        <Input placeholder="you@company.com">
          <Input.Label>Email</Input.Label>
          <Input.Description>Used for account notifications.</Input.Description>
        </Input>
      );
    case "input:states":
      return (
        <Box className="grid w-full max-w-md gap-gs-4">
          <Input invalid>
            <Input.Label>Email</Input.Label>
            <Input.ErrorMessage>Enter a valid email</Input.ErrorMessage>
          </Input>
          <Input disabled defaultValue="Northstar">
            <Input.Label>Read-only workspace</Input.Label>
          </Input>
        </Box>
      );
    case "input:clearable":
      return (
        <Input defaultValue="Velune" clearable>
          <Input.Label>Workspace</Input.Label>
        </Input>
      );
    case "input:sizes":
      return (
        <Box className="grid w-full max-w-md gap-gs-4">
          <Input size="sm" placeholder="Small">
            <Input.Label>Small</Input.Label>
          </Input>
          <Input size="md" placeholder="Medium">
            <Input.Label>Medium</Input.Label>
          </Input>
          <Input size="lg" placeholder="Large">
            <Input.Label>Large</Input.Label>
          </Input>
        </Box>
      );
    case "list:states":
      return (
        <Box className="grid w-full max-w-md gap-gs-5">
          <List loading />
          <List>
            <List.Empty>Nothing here yet.</List.Empty>
          </List>
        </Box>
      );
    case "list:people":
      return (
        <Box className="w-full max-w-md">
          <List>
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
          </List>
        </Box>
      );
    case "modal:sizes":
      return <ModalPreview kind="modal" size="lg" title="Workspace settings" />;
    case "modal:default":
      return <ModalPreview kind="modal" />;
    case "pagination:default":
      return (
        <Pagination
          page={4}
          total={120}
          pageSize={10}
          onPageChange={() => undefined}
        />
      );
    case "pagination:simple":
      return (
        <Pagination
          page={2}
          total={50}
          pageSize={10}
          simple
          onPageChange={() => undefined}
        />
      );
    case "pagination:hide-on-single-page":
      return <PaginationHideOnSinglePagePreview />;
    case "popover:placements":
      return (
        <Popover placement="right">
          <Popover.Trigger>
            <Button variant="ghost">More</Button>
          </Popover.Trigger>
          <Popover.Content>
            <Text size="sm">Project actions</Text>
          </Popover.Content>
        </Popover>
      );
    case "popover:default":
      return (
        <Popover>
          <Popover.Trigger>
            <Button variant="secondary">Share</Button>
          </Popover.Trigger>
          <Popover.Content>
            <Text>Anyone with the link can view.</Text>
          </Popover.Content>
        </Popover>
      );
    case "progress:basic":
      return (
        <Box className="grid w-full max-w-md gap-gs-4">
          <Progress value={64} aria-label="Upload progress" />
          <Progress aria-label="Processing" size="sm" />
        </Box>
      );
    case "radio:states":
      return (
        <Box className="grid gap-gs-3">
          <Radio defaultChecked>Selected</Radio>
          <Radio disabled>Unavailable</Radio>
        </Box>
      );
    case "radio:group":
      return <SelectionPreview kind="radio" />;
    case "select:searchable":
      return (
        <Box className="w-full max-w-xs">
          <Select searchable fullWidth>
            <Select.Label>Member</Select.Label>
            <Select.Trigger placeholder="Choose a member" />
            <Select.Content>
              {people.map((person) => (
                <Select.Item key={person.id} value={person.id}>
                  {person.name}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        </Box>
      );
    case "select:options":
      return (
        <Select>
          <Select.Label>Role</Select.Label>
          <Select.Trigger placeholder="Choose a role" />
          <Select.Content>
            <Select.Item value="admin">Admin</Select.Item>
            <Select.Item value="editor">Editor</Select.Item>
          </Select.Content>
        </Select>
      );
    case "select:empty":
      return (
        <Select>
          <Select.Label>Assignee</Select.Label>
          <Select.Trigger placeholder="Choose an assignee" />
          <Select.Empty>No assignees yet.</Select.Empty>
          <Select.Content />
        </Select>
      );
    case "select:no-matches":
      return (
        <Box className="w-full max-w-xs">
          <Select searchable fullWidth>
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
          </Select>
        </Box>
      );
    case "scroll-area:vertical":
      return (
        <ScrollArea maxHeight={160} className="w-full max-w-md">
          <Box className="grid gap-gs-3 p-gs-3">
            {Array.from({ length: 8 }, (_, index) => (
              <Text key={index} size="sm">
                Activity update {index + 1}
              </Text>
            ))}
          </Box>
        </ScrollArea>
      );
    case "sidebar:composition":
      return (
        <Box className="flex h-[32rem] w-full flex-col overflow-hidden rounded-gs-sm border border-gs-border-default">
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
                            <Sidebar.MenuSubButton>
                              Active
                            </Sidebar.MenuSubButton>
                          </Sidebar.MenuSubItem>
                          <Sidebar.MenuSubItem>
                            <Sidebar.MenuSubButton>
                              Archived
                            </Sidebar.MenuSubButton>
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
              <Flex
                align="center"
                gap="2"
                className="h-gs-12 border-b border-gs-border-default px-gs-4"
              >
                <Sidebar.Trigger />
                <Text size="sm" weight="medium">
                  Overview
                </Text>
              </Flex>
              <Box
                as="pre"
                className="m-gs-0 overflow-auto p-gs-4 font-mono text-gs-xs leading-relaxed text-gs-text-secondary"
              >
                {[
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
                ].join("\n")}
              </Box>
            </main>
          </Sidebar.Provider>
        </Box>
      );
    case "skeleton:content":
      return (
        <Stack gap="3" className="w-full max-w-md">
          <Skeleton width="42%" />
          <Skeleton width="84%" />
          <Skeleton variant="rounded" height={160} />
        </Stack>
      );
    case "skeleton:variants":
      return (
        <Box className="grid w-full max-w-md gap-gs-3">
          <Skeleton variant="text" width="70%" />
          <Skeleton variant="rectangular" height={72} />
          <Skeleton variant="rounded" height={72} animation="wave" />
          <Skeleton variant="circular" width={48} />
        </Box>
      );
    case "spinner:sizes":
      return (
        <Box className="flex flex-wrap items-center gap-gs-6">
          <Spinner size="sm" />
          <Spinner size="md" />
          <Spinner size="lg" />
        </Box>
      );
    case "spinner:tones":
      return (
        <Box className="flex flex-wrap items-center gap-gs-6">
          <Spinner tone="primary" aria-label="Loading data" />
          <Spinner tone="current" aria-label="Current color" />
          <Spinner tone="muted" aria-label="Waiting" />
          <Spinner tone="success" aria-label="Finalizing" />
          <Spinner tone="warning" aria-label="Retrying" />
          <Spinner tone="error" aria-label="Failed" />
          <Spinner tone="info" aria-label="Syncing" />
        </Box>
      );
    case "spinner:label":
      return (
        <Box className="flex flex-wrap items-center gap-gs-6">
          <Spinner label="Saving draft" />
          <Spinner label="Uploading assets" size="lg" />
        </Box>
      );
    case "stack:alignment":
      return (
        <Stack gap="3" align="center" fullWidth>
          <Text>Centered content</Text>
          <Button variant="secondary">Action</Button>
        </Stack>
      );
    case "stack:vertical":
      return (
        <Stack gap="3">
          <Text weight="medium">Profile</Text>
          <Text tone="muted">Account preferences</Text>
          <Button>Continue</Button>
        </Stack>
      );
    case "stack:divider":
      return (
        <Stack gap="3" divider={<Divider />}>
          <Text>Profile</Text>
          <Text>Billing</Text>
          <Text>Security</Text>
        </Stack>
      );
    case "stack:responsive":
      return (
        <Stack
          gap={{ base: "2", md: "4" }}
          reverse={{ base: false, lg: true }}
        >
          <Text>Primary content</Text>
          <Text tone="muted">Supporting content</Text>
        </Stack>
      );
    case "switch:states":
      return (
        <Box className="grid gap-gs-4">
          <Switch size="sm" defaultChecked>
            Compact
          </Switch>
          <Switch size="lg" defaultChecked>
            Large
          </Switch>
          <Switch loading>Saving preference</Switch>
          <Switch disabled>Unavailable</Switch>
          <Switch defaultChecked>
            Email digests
            <Switch.Description>
              Morning summary of workspace activity.
            </Switch.Description>
          </Switch>
        </Box>
      );
    case "switch:controlled":
      return <SelectionPreview kind="switch" />;
    case "table:sortable":
      return <TablePreview />;
    case "table:selectable":
      return <TablePreview selectable />;
    case "table:custom-sort":
      return (
        <Table
          columns={[
            { key: "name", title: "Name", dataIndex: "name", sortable: true },
            {
              key: "status",
              title: "Status",
              dataIndex: "status",
              sortable: true,
              sortValue: (row: { status: string }) =>
                row.status === "active" ? 0 : 1,
            },
          ]}
          dataSource={[
            { id: "1", name: "Ada Lovelace", status: "invited" },
            { id: "2", name: "Grace Hopper", status: "active" },
          ]}
          rowKey="id"
        >
          <Table.Caption>Members sorted by custom status order</Table.Caption>
        </Table>
      );
    case "table:fixed-columns":
      return (
        <Table
          columns={[
            {
              key: "name",
              title: "Name",
              dataIndex: "name",
              width: 180,
              fixed: "start",
            },
            { key: "role", title: "Role", dataIndex: "role", width: 140 },
            { key: "team", title: "Team", dataIndex: "team", width: 160 },
            {
              key: "seats",
              title: "Seats",
              dataIndex: "seats",
              width: 96,
              fixed: "end",
            },
          ]}
          dataSource={[
            {
              id: "1",
              name: "Ada Lovelace",
              role: "Admin",
              team: "Platform",
              seats: 3,
            },
            {
              id: "2",
              name: "Grace Hopper",
              role: "Editor",
              team: "Design",
              seats: 1,
            },
          ]}
          rowKey="id"
          selectable
          scroll={{ x: 960 }}
        >
          <Table.Caption>Members with fixed name and seats</Table.Caption>
        </Table>
      );
    case "table:tree":
      return (
        <Table
          columns={[
            { key: "name", title: "Name", dataIndex: "name", sortable: true },
            { key: "role", title: "Role", dataIndex: "role", sortable: true },
          ]}
          dataSource={[
            {
              id: "eng",
              name: "Engineering",
              role: "Team",
              children: [
                { id: "eng-1", name: "Ada Lovelace", role: "Admin" },
                {
                  id: "eng-2",
                  name: "Platform",
                  role: "Squad",
                  children: [
                    { id: "eng-2-1", name: "Grace Hopper", role: "Editor" },
                  ],
                },
              ],
            },
            {
              id: "design",
              name: "Design",
              role: "Team",
              children: [
                { id: "design-1", name: "Katherine Johnson", role: "Viewer" },
              ],
            },
          ]}
          rowKey="id"
          tree={{ defaultExpandAll: true }}
        >
          <Table.Caption>Organization tree</Table.Caption>
        </Table>
      );
    case "virtual-table:basic":
      return (
        <VirtualTable
          columns={[
            { key: "name", title: "Name", dataIndex: "name", width: 240 },
            { key: "role", title: "Role", dataIndex: "role", width: 180 },
            { key: "status", title: "Status", dataIndex: "status", width: 180 },
          ]}
          dataSource={largePeople}
          rowKey="id"
          estimatedRowHeight={44}
          scroll={{ x: 720, y: 280 }}
          stickyHeader
        >
          <VirtualTable.Caption>
            Virtualized workspace members
          </VirtualTable.Caption>
        </VirtualTable>
      );
    case "tabs:block":
      return (
        <Tabs defaultValue="preview" variant="block">
          <Tabs.List fullWidth>
            <Tabs.Trigger value="preview">Preview</Tabs.Trigger>
            <Tabs.Trigger value="code">Code</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Panel value="preview">Rendered result</Tabs.Panel>
          <Tabs.Panel value="code">Source code</Tabs.Panel>
        </Tabs>
      );
    case "tabs:underline":
      return (
        <Tabs defaultValue="overview" variant="underline">
          <Tabs.List>
            <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
            <Tabs.Trigger value="activity">Activity</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Panel value="overview">Project overview</Tabs.Panel>
        </Tabs>
      );
    case "tabs:vertical":
      return (
        <Tabs defaultValue="general" orientation="vertical">
          <Tabs.List>
            <Tabs.Trigger value="general">General</Tabs.Trigger>
            <Tabs.Trigger value="security">Security</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Panel value="general">Workspace preferences</Tabs.Panel>
          <Tabs.Panel value="security">Session settings</Tabs.Panel>
        </Tabs>
      );
    case "tag:closable":
      return (
        <Box className="flex flex-wrap gap-gs-2">
          <Tag closable onClose={() => undefined}>
            Design
          </Tag>
        </Box>
      );
    case "tag:tones":
      return (
        <Box className="flex flex-wrap gap-gs-2">
          <Tag tone="default">Default</Tag>
          <Tag tone="primary">Primary</Tag>
          <Tag tone="success">Stable</Tag>
          <Tag tone="warning">Beta</Tag>
          <Tag tone="error">Blocked</Tag>
          <Tag tone="info">Info</Tag>
          <Tag tone="muted">Muted</Tag>
        </Box>
      );
    case "text:tones":
      return (
        <Box className="grid gap-gs-2">
          <Text tone="default">Default</Text>
          <Text tone="muted">Muted</Text>
          <Text tone="accent">Accent</Text>
          <Text tone="success">Success</Text>
          <Text tone="warning">Warning</Text>
          <Text tone="error">Error</Text>
        </Box>
      );
    case "text:hierarchy":
      return (
        <Box className="grid gap-gs-2">
          <Text as="h2" size="2xl" weight="medium">
            Heading
          </Text>
          <Text as="p">Readable body copy.</Text>
          <Text as="p" size="sm" tone="muted">
            Supporting information.
          </Text>
        </Box>
      );
    case "text-area:basic":
      return (
        <TextArea placeholder="What changed?">
          <TextArea.Label>Release notes</TextArea.Label>
        </TextArea>
      );
    case "text-area:count":
      return (
        <TextArea maxLength={160} showCount>
          <TextArea.Label>Summary</TextArea.Label>
        </TextArea>
      );
    case "text-area:resize":
      return (
        <Box className="grid w-full max-w-md gap-gs-4">
          <TextArea resize="both" defaultValue="Stretch in either direction.">
            <TextArea.Label>Freeform notes</TextArea.Label>
          </TextArea>
          <TextArea resize="none" defaultValue="Height stays fixed.">
            <TextArea.Label>Fixed height</TextArea.Label>
          </TextArea>
        </Box>
      );
    case "toast:action":
      return (
        <Button
          onClick={() =>
            toast.show({
              title: "File deleted",
              description: "This action can be undone.",
              action: {
                label: "Undo",
                altText: "Undo file deletion",
                onClick: () => toast.success("Restored"),
              },
            })
          }
        >
          Delete file
        </Button>
      );
    case "toast:tones":
      return (
        <Box className="flex flex-wrap gap-gs-3">
          <Button onClick={() => toast.show("Notification")}>Default</Button>
          <Button onClick={() => toast.success("Profile updated")}>
            Success
          </Button>
          <Button onClick={() => toast.warning("Storage almost full")}>
            Warning
          </Button>
          <Button onClick={() => toast.error("Upload failed")}>Error</Button>
          <Button onClick={() => toast.info("New version available")}>
            Info
          </Button>
        </Box>
      );
    case "toast:promise":
      return (
        <Button
          onClick={() =>
            toast.promise(
              new Promise<string>((resolve) => {
                window.setTimeout(() => resolve("report"), 1200);
              }),
              {
                loading: "Saving…",
                success: (name) => `Saved ${name}`,
                error: "Save failed",
              },
            )
          }
        >
          Save report
        </Button>
      );
    case "tooltip:click":
      return (
        <Tooltip trigger="click">
          <Tooltip.Trigger>
            <Button>Click toggle</Button>
          </Tooltip.Trigger>
          <Tooltip.Content>Pinned until dismissed</Tooltip.Content>
        </Tooltip>
      );
    case "tooltip:hover":
      return (
        <Tooltip>
          <Tooltip.Trigger>
            <Button variant="secondary">Hover me</Button>
          </Tooltip.Trigger>
          <Tooltip.Content>Copy to clipboard</Tooltip.Content>
        </Tooltip>
      );
    case "wizard:progress":
      return (
        <Box className="w-full max-w-xl">
          <Wizard defaultStep="one" indicator="progress">
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
          </Wizard>
        </Box>
      );
    case "wizard:steps":
      return (
        <Box className="w-full max-w-xl">
          <Wizard defaultStep="account">
            <Wizard.Step value="account">
              <Wizard.Title>Account</Wizard.Title>
              Account fields
            </Wizard.Step>
            <Wizard.Step value="workspace">
              <Wizard.Title>Workspace</Wizard.Title>
              Workspace fields
            </Wizard.Step>
            <Wizard.Navigation />
          </Wizard>
        </Box>
      );
    default:
      return null;
  }
}

export function ComponentPreview({
  entry,
  exampleId,
}: {
  entry: ComponentEntry;
  exampleId?: string;
}) {
  if (exampleId) {
    const variant = ExampleVariantPreview({ entry, exampleId });
    if (variant !== null) return variant;
    return (
      <Text size="sm" tone="error">
        Missing preview for {entry.slug}:{exampleId}
      </Text>
    );
  }

  switch (entry.slug) {
    case "aspect-ratio":
      return (
        <AspectRatio ratio="16/9" className="w-full max-w-md">
          <Box className="grid size-full place-items-center bg-gs-surface-mist text-gs-text-secondary">
            Preview
          </Box>
        </AspectRatio>
      );
    case "alert":
      return (
        <Box className="grid w-full max-w-xl gap-gs-3">
          <Alert tone="info">Scheduled maintenance starts at 22:00 UTC.</Alert>
          <Alert tone="success">
            <Alert.Title>Workspace settings saved</Alert.Title>
            <Alert.Description>
              Changes are visible to everyone in this workspace.
            </Alert.Description>
          </Alert>
        </Box>
      );
    case "breadcrumb":
      return (
        <Breadcrumb>
          <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
          <Breadcrumb.Item href="/projects">Projects</Breadcrumb.Item>
          <Breadcrumb.Item>Northstar</Breadcrumb.Item>
        </Breadcrumb>
      );
    case "combobox":
      return <ComboboxPreview />;
    case "slider":
      return (
        <Box className="w-full max-w-sm">
          <Slider defaultValue={40}>
            <Slider.Label>Volume</Slider.Label>
            <Slider.Output />
          </Slider>
        </Box>
      );
    case "button":
      return (
        <Box className="flex flex-wrap gap-gs-3">
          <Button>Continue</Button>
          <Button variant="secondary">Save draft</Button>
          <Button variant="ghost">Cancel</Button>
        </Box>
      );
    case "empty":
      return (
        <Empty>
          <Empty.Title>No projects yet</Empty.Title>
          <Empty.Description>
            Create a project to start organizing work.
          </Empty.Description>
          <Empty.Action>
            <Button>Create project</Button>
          </Empty.Action>
        </Empty>
      );
    case "icon":
      return (
        <Icon label="Completed">
          <Check />
        </Icon>
      );
    case "kbd":
      return (
        <Text size="sm">
          Open search <Kbd>Ctrl K</Kbd>
        </Text>
      );
    case "input":
      return (
        <Box className="grid max-w-md gap-gs-4">
          <Input defaultValue="Northstar" fullWidth>
            <Input.Label>Workspace name</Input.Label>
          </Input>
          <Input placeholder="you@company.com" fullWidth>
            <Input.Label>Email</Input.Label>
            <Input.Description>
              Used for account notifications.
            </Input.Description>
          </Input>
        </Box>
      );
    case "text-area":
      return (
        <TextArea placeholder="What changed?" fullWidth>
          <TextArea.Label>Release notes</TextArea.Label>
          <TextArea.Description>
            Visible to everyone in this workspace.
          </TextArea.Description>
        </TextArea>
      );
    case "checkbox":
    case "radio":
    case "switch":
      return <SelectionPreview kind={entry.slug} />;
    case "tabs":
      return <TabsPreview />;
    case "collapse":
      return (
        <Collapse defaultValue="first">
          <Collapse.Item value="first">
            <Collapse.Trigger>What is Velune?</Collapse.Trigger>
            <Collapse.Content>
              A composable React component system for product teams.
            </Collapse.Content>
          </Collapse.Item>
          <Collapse.Item value="second">
            <Collapse.Trigger>Does it support themes?</Collapse.Trigger>
            <Collapse.Content>
              Yes. Every visual decision is exposed through tokens.
            </Collapse.Content>
          </Collapse.Item>
        </Collapse>
      );
    case "date-picker":
      return (
        <DatePicker defaultValue="2026-07-13">
          <DatePicker.Label>Launch date</DatePicker.Label>
        </DatePicker>
      );
    case "date-range-picker":
      return (
        <DateRangePicker
          defaultValue={{
            start: "2026-07-13",
            end: "2026-07-18",
          }}
        >
          <DateRangePicker.Label>Travel dates</DateRangePicker.Label>
        </DateRangePicker>
      );
    case "dropdown":
      return (
        <Dropdown>
          <Dropdown.Trigger>
            <Button variant="secondary">Project actions</Button>
          </Dropdown.Trigger>
          <Dropdown.Menu aria-label="Project actions">
            <Dropdown.Item value="edit">Edit project</Dropdown.Item>
            <Dropdown.Item value="duplicate">Duplicate</Dropdown.Item>
            <Dropdown.Separator />
            <Dropdown.Item value="delete" tone="danger">
              Delete project
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      );
    case "table":
      return <TablePreview />;
    case "virtual-table":
      return (
        <VirtualTable
          columns={[
            { key: "name", title: "Name", dataIndex: "name", width: 240 },
            { key: "role", title: "Role", dataIndex: "role", width: 180 },
            { key: "status", title: "Status", dataIndex: "status", width: 180 },
          ]}
          dataSource={largePeople}
          rowKey="id"
          estimatedRowHeight={44}
          scroll={{ x: 720, y: 280 }}
          stickyHeader
        >
          <VirtualTable.Caption>
            Virtualized workspace members
          </VirtualTable.Caption>
        </VirtualTable>
      );
    case "pagination":
      return (
        <Pagination
          page={4}
          total={120}
          pageSize={10}
          onPageChange={() => undefined}
        />
      );
    case "select":
      return (
        <Select defaultValue="editor">
          <Select.Label>Role</Select.Label>
          <Select.Trigger />
          <Select.Content>
            <Select.Item value="admin">Admin</Select.Item>
            <Select.Item value="editor">Editor</Select.Item>
            <Select.Item value="viewer">Viewer</Select.Item>
          </Select.Content>
        </Select>
      );
    case "scroll-area":
      return (
        <ScrollArea maxHeight={160} className="w-full max-w-md">
          <Box className="grid gap-gs-3 p-gs-3">
            {Array.from({ length: 8 }, (_, index) => (
              <Text key={index} size="sm">
                Activity update {index + 1}
              </Text>
            ))}
          </Box>
        </ScrollArea>
      );
    case "relief-card":
      return (
        <ReliefCard>
          <ReliefCard.Title>Velune design system</ReliefCard.Title>
          <ReliefCard.Description>
            Hover to reveal the subtle relief pattern beneath the surface.
          </ReliefCard.Description>
        </ReliefCard>
      );
    case "progress":
      return (
        <Box className="grid w-full max-w-md gap-gs-4">
          <Progress value={64} aria-label="Upload progress" />
          <Progress aria-label="Processing" size="sm" />
        </Box>
      );
    case "avatar":
      return (
        <Box className="flex items-center gap-gs-4">
          <Avatar name="Ada Lovelace" />
          <Avatar name="Grace Hopper" size="lg" />
          <Avatar.Group>
            <Avatar name="Alan Turing" />
            <Avatar name="Katherine Johnson" />
          </Avatar.Group>
        </Box>
      );
    case "badge":
      return (
        <Box className="flex gap-gs-5">
          <Badge>8</Badge>
          <Badge tone="success">Ready</Badge>
          <Badge tone="warning">3 pending</Badge>
        </Box>
      );
    case "tag":
      return (
        <Box className="flex flex-wrap gap-gs-2">
          <Tag>Design</Tag>
          <Tag tone="success">Stable</Tag>
          <Tag tone="warning">Beta</Tag>
          <Tag tone="error">Blocked</Tag>
        </Box>
      );
    case "spinner":
      return (
        <Box className="flex items-center gap-gs-6">
          <Spinner size="sm" />
          <Spinner />
          <Spinner size="lg" aria-label="Loading data" />
        </Box>
      );
    case "skeleton":
      return (
        <Stack gap="3" className="w-full max-w-md">
          <Skeleton width="42%" />
          <Skeleton width="84%" />
          <Skeleton variant="rounded" height={120} />
        </Stack>
      );
    case "divider":
      return (
        <Box className="w-full">
          <Text weight="medium">Account</Text>
          <Divider />
          <Text size="sm" tone="muted">
            Profile and security preferences.
          </Text>
        </Box>
      );
    case "text":
      return (
        <Box className="grid gap-gs-2">
          <Text as="h3" size="2xl" weight="medium">
            A clear visual hierarchy
          </Text>
          <Text>
            Body text stays calm and readable across dense product surfaces.
          </Text>
          <Text size="sm" tone="muted">
            Supporting information uses a quieter tone.
          </Text>
        </Box>
      );
    case "box":
      return (
        <Box
          as="section"
          padding="5"
          className="max-w-md rounded-gs-sm bg-gs-surface"
        >
          <Text weight="medium">Token-aware surface</Text>
          <Text size="sm" tone="muted" className="mt-gs-2">
            Spacing and element semantics are controlled through props.
          </Text>
        </Box>
      );
    case "card":
      return (
        <Card variant="filled" className="w-full max-w-md">
          <Card.Header>
            <Card.Title>Project overview</Card.Title>
            <Card.Description>Shared with 12 collaborators</Card.Description>
            <Card.Action>
              <Tag size="sm" tone="success">
                Active
              </Tag>
            </Card.Action>
          </Card.Header>
          <Card.Body>
            <Text size="sm" tone="muted">
              A quiet filled surface for related project information.
            </Text>
          </Card.Body>
          <Card.Footer>
            <Button size="sm" variant="ghost">
              Dismiss
            </Button>
            <Button size="sm">Open</Button>
          </Card.Footer>
        </Card>
      );
    case "container":
      return (
        <Container size="sm" className="rounded-gs-sm bg-gs-surface py-gs-5">
          <Text weight="medium">Constrained content</Text>
          <Text size="sm" tone="muted" className="mt-gs-2">
            Container keeps page content aligned at a predictable width.
          </Text>
        </Container>
      );
    case "drawer":
    case "modal":
      return <ModalPreview kind={entry.slug} />;
    case "flex":
      return (
        <Flex gap="3" align="center" justify="between" fullWidth wrap>
          <Text weight="medium">Workspace members</Text>
          <Flex gap="2">
            <Button size="sm" variant="secondary">
              Export
            </Button>
            <Button size="sm">Invite</Button>
          </Flex>
        </Flex>
      );
    case "form":
      return <FormPreview />;
    case "grid":
      return (
        <Grid columns={3} gap="3" responsive className="w-full">
          {["Design", "Engineering", "Operations"].map((label) => (
            <Box
              key={label}
              padding="4"
              className="rounded-gs-sm bg-gs-surface"
            >
              <Text size="sm" weight="medium">
                {label}
              </Text>
            </Box>
          ))}
        </Grid>
      );
    case "list":
      return (
        <Box className="w-full max-w-md">
          <List>
            {people.map((person) => (
              <List.Item key={person.id}>
                <List.Leading>
                  <Avatar size="sm" name={person.name} />
                </List.Leading>
                <List.Content>
                  <List.Title>{person.name}</List.Title>
                  <List.Description>{person.role}</List.Description>
                </List.Content>
                <List.Trailing>
                  <Tag
                    size="sm"
                    tone={person.status === "Active" ? "success" : "warning"}
                  >
                    {person.status}
                  </Tag>
                </List.Trailing>
              </List.Item>
            ))}
          </List>
        </Box>
      );
    case "popover":
      return (
        <Popover>
          <Popover.Trigger>
            <Button variant="secondary">Open popover</Button>
          </Popover.Trigger>
          <Popover.Content>
            <Stack gap="2">
              <Text weight="medium">Share project</Text>
              <Text tone="muted" size="sm">
                Anyone with the link can view this board.
              </Text>
              <Button size="sm">Copy link</Button>
            </Stack>
          </Popover.Content>
        </Popover>
      );
    case "stack":
      return (
        <Stack gap="3" className="w-full max-w-sm">
          <Text weight="medium">Profile</Text>
          <Text size="sm" tone="muted">
            Vertical rhythm stays aligned to the global spacing scale.
          </Text>
          <Button>Continue</Button>
        </Stack>
      );
    case "toast":
      return (
        <Box className="flex flex-wrap gap-gs-3">
          <Button onClick={() => toast.success("Profile updated")}>
            Success
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              toast.error({
                title: "Upload failed",
                description: "Please try again in a moment.",
              })
            }
          >
            Error
          </Button>
        </Box>
      );
    case "tooltip":
      return (
        <Box className="flex flex-wrap gap-gs-4">
          <Tooltip>
            <Tooltip.Trigger>
              <Button variant="secondary">Hover me</Button>
            </Tooltip.Trigger>
            <Tooltip.Content>Copy to clipboard</Tooltip.Content>
          </Tooltip>
          <Tooltip trigger="click">
            <Tooltip.Trigger>
              <Button>Click toggle</Button>
            </Tooltip.Trigger>
            <Tooltip.Content>Pinned until clicked again</Tooltip.Content>
          </Tooltip>
        </Box>
      );
    case "wizard":
      return <WizardPreview />;
    default:
      return (
        <Card variant="filled" className="max-w-lg">
          <Card.Header>
            <Card.Title>{entry.name} composition</Card.Title>
            <Card.Description>{entry.description}</Card.Description>
          </Card.Header>
          <Card.Body>
            <Box className="flex items-center gap-gs-3">
              <Badge tone="success">Available</Badge>
              <Text size="sm" tone="muted">
                Theme-aware, accessible, and typed.
              </Text>
            </Box>
          </Card.Body>
        </Card>
      );
  }
}
