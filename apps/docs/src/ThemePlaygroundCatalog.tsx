import { useMemo, useState, type CSSProperties, type ReactNode } from "react";
import {
  Bell,
  Check,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
  Share2,
} from "lucide-react";
import {
  Alert,
  AspectRatio,
  Avatar,
  Badge,
  Box,
  Breadcrumb,
  Button,
  Card,
  Checkbox,
  Collapse,
  Combobox,
  Container,
  DatePicker,
  DateRangePicker,
  Divider,
  Drawer,
  Dropdown,
  Empty,
  Flex,
  Form,
  Grid,
  Icon,
  Input,
  Kbd,
  List,
  Modal,
  Pagination,
  Popover,
  Progress,
  Radio,
  ReliefCard,
  ScrollArea,
  Select,
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
  toast,
  Tooltip,
  VirtualTable,
  Wizard,
  type ThemeContrastLevel,
} from "velune/react";

type PlaygroundMode = "light" | "dark" | "highContrast";

const SCENE_SECTIONS = [
  { id: "app-shell", title: "App shell" },
  { id: "onboarding", title: "Onboarding" },
  { id: "members", title: "Members" },
  { id: "project", title: "Project" },
  { id: "settings", title: "Settings" },
  { id: "states", title: "States" },
] as const;

const MEMBER_ROWS = [
  {
    id: "1",
    name: "Ada Lovelace",
    role: "Admin",
    status: "Active",
    initials: "AL",
  },
  {
    id: "2",
    name: "Grace Hopper",
    role: "Editor",
    status: "Review",
    initials: "GH",
  },
  {
    id: "3",
    name: "Alan Turing",
    role: "Viewer",
    status: "Active",
    initials: "AT",
  },
  {
    id: "4",
    name: "Katherine Johnson",
    role: "Editor",
    status: "Active",
    initials: "KJ",
  },
];

const ACTIVITY_ROWS = Array.from({ length: 36 }, (_, index) => ({
  id: String(index + 1),
  event: [
    "Published release notes",
    "Approved design review",
    "Updated access policy",
    "Closed support ticket",
  ][index % 4]!,
  actor: ["Maya Chen", "Noah Williams", "Ari Morgan", "Sam Patel"][index % 4]!,
  when: `${(index % 12) + 1}h ago`,
}));

function Scene({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Box
      as="section"
      id={id}
      aria-labelledby={`${id}-heading`}
      className="scroll-mt-gs-4"
    >
      <Box className="mb-gs-3">
        <Text as="h2" id={`${id}-heading`} size="lg" weight="medium">
          {title}
        </Text>
        <Text as="p" size="sm" tone="muted" className="mt-gs-1 max-w-prose">
          {description}
        </Text>
      </Box>
      <Box className="overflow-hidden rounded-gs-sm border border-gs-border-default bg-gs-surface">
        {children}
      </Box>
    </Box>
  );
}

function overlayThemeProps(
  mode: PlaygroundMode,
  previewStyle?: CSSProperties,
) {
  return {
    "data-theme": mode === "dark" ? ("dark" as const) : ("light" as const),
    "data-high-contrast":
      mode === "highContrast" ? ("true" as const) : undefined,
    style: previewStyle,
  };
}

function statusTone(status: string): "success" | "warning" | "primary" {
  if (status === "Review") return "warning";
  if (status === "Active") return "success";
  return "primary";
}

export function ThemePlaygroundCatalog({
  contrast,
  mode,
  previewStyle,
}: {
  contrast: ThemeContrastLevel;
  mode: PlaygroundMode;
  previewStyle: CSSProperties | undefined;
}) {
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [invitee, setInvitee] = useState("ada");
  const overlayProps = overlayThemeProps(mode, previewStyle);

  const memberColumns = useMemo(
    () => [
      {
        key: "name",
        title: "Member",
        dataIndex: "name",
        sortable: true,
        render: (_: unknown, record: (typeof MEMBER_ROWS)[number]) => (
          <Flex align="center" gap="2">
            <Avatar name={record.name} size="sm">
              {record.initials}
            </Avatar>
            <Text size="sm" weight="medium">
              {record.name}
            </Text>
          </Flex>
        ),
      },
      { key: "role", title: "Role", dataIndex: "role" },
      {
        key: "status",
        title: "Status",
        dataIndex: "status",
        render: (value: unknown) => (
          <Tag tone={statusTone(String(value))} size="sm">
            {String(value)}
          </Tag>
        ),
      },
      {
        key: "actions",
        title: "",
        render: () => (
          <Dropdown portal={false}>
            <Dropdown.Trigger>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                aria-label="Member actions"
              >
                <Button.Leading>
                  <MoreHorizontal size={16} />
                </Button.Leading>
              </Button>
            </Dropdown.Trigger>
            <Dropdown.Menu aria-label="Member actions">
              <Dropdown.Item value="edit">Edit role</Dropdown.Item>
              <Dropdown.Item value="resend">Resend invite</Dropdown.Item>
              <Dropdown.Item value="remove" tone="danger">
                Remove
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        ),
      },
    ],
    [],
  );

  const activityColumns = useMemo(
    () => [
      { key: "event", title: "Event", dataIndex: "event", sortable: true },
      { key: "actor", title: "Actor", dataIndex: "actor" },
      { key: "when", title: "When", dataIndex: "when" },
    ],
    [],
  );

  return (
    <Stack gap="8" data-testid="theme-playground-catalog">
      <Box>
        <Text as="h2" size="xl" weight="medium">
          Component catalog
        </Text>
        <Text as="p" size="sm" tone="muted" className="mt-gs-1 max-w-prose">
          Realistic product blocks wired to the current Velune compound-slot
          APIs—searchable Select, Checkbox.Group, closable Alert, and more.
        </Text>
        <Flex gap="2" wrap className="mt-gs-4" aria-label="Scene sections">
          {SCENE_SECTIONS.map((section) => (
            <Button
              key={section.id}
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => {
                document
                  .getElementById(section.id)
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              {section.title}
            </Button>
          ))}
        </Flex>
      </Box>

      <Scene
        id="app-shell"
        title="App shell"
        description="Page chrome with breadcrumbs, badges, and actions that open Modal, Popover, and Toast."
      >
        <Box className="bg-gs-canvas">
          <Flex
            align="center"
            gap="2"
            className="h-gs-12 border-b border-gs-border-default px-gs-4"
          >
            <Breadcrumb>
              <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
              <Breadcrumb.Item href="/projects">Projects</Breadcrumb.Item>
              <Breadcrumb.Item>Release Q3</Breadcrumb.Item>
            </Breadcrumb>
          </Flex>

          <Box className="border-b border-gs-border-default px-gs-4 py-gs-3">
            <Flex align="center" justify="between" gap="3" wrap>
              <Box>
                <Flex align="center" gap="2" wrap>
                  <Text as="h3" size="xl" weight="medium">
                    Release Q3
                  </Text>
                  <Badge tone="success" dot aria-label="Healthy" />
                  <Badge count={3} />
                  <Tag tone="primary" size="sm">
                    In progress
                  </Tag>
                </Flex>
                <Text size="sm" tone="muted" className="mt-gs-1">
                  Open search with <Kbd>Ctrl</Kbd> <Kbd>K</Kbd>
                </Text>
              </Box>
              <Flex align="center" gap="2" wrap>
                <Tooltip portal={false}>
                  <Tooltip.Trigger>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      aria-label="Notifications"
                      onClick={() =>
                        toast.promise(
                          new Promise((resolve) => {
                            window.setTimeout(resolve, 700);
                          }),
                          {
                            loading: "Checking inbox…",
                            success: "You're all caught up",
                            error: "Could not refresh",
                          },
                        )
                      }
                    >
                      <Button.Leading>
                        <Bell size={16} />
                      </Button.Leading>
                    </Button>
                  </Tooltip.Trigger>
                  <Tooltip.Content>Notifications</Tooltip.Content>
                </Tooltip>
                <Popover portal={false}>
                  <Popover.Trigger>
                    <Button type="button" variant="secondary" size="sm">
                      <Button.Leading>
                        <Share2 size={15} />
                      </Button.Leading>
                      Share
                    </Button>
                  </Popover.Trigger>
                  <Popover.Content>
                    <Text size="sm">
                      Anyone with the link can view this board.
                    </Text>
                  </Popover.Content>
                </Popover>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setModalOpen(true)}
                >
                  <Button.Leading>
                    <Plus size={15} />
                  </Button.Leading>
                  Rename
                </Button>
              </Flex>
            </Flex>
          </Box>

          <Box className="p-gs-4">
            <Alert tone="info" closable>
              <Alert.Title>Theme applied across the shell</Alert.Title>
              <Alert.Description>
                Header actions, navigation, and toasts share WCAG {contrast}{" "}
                semantic tokens.
              </Alert.Description>
              <Alert.Action>
                <Button type="button" size="sm" variant="secondary">
                  View tokens
                </Button>
              </Alert.Action>
            </Alert>
          </Box>
        </Box>

        <Modal open={modalOpen} onOpenChange={setModalOpen} {...overlayProps}>
          <Modal.Content>
            <Modal.Header>
              <Modal.Title>Rename project</Modal.Title>
              <Modal.Description>
                Choose a clear name your team will recognize.
              </Modal.Description>
            </Modal.Header>
            <Modal.Body>
              <Input defaultValue="Release Q3" fullWidth clearable>
                <Input.Label>Project name</Input.Label>
                <Input.Description>
                  Shown in breadcrumbs and search.
                </Input.Description>
              </Input>
            </Modal.Body>
            <Modal.Footer>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="button" onClick={() => setModalOpen(false)}>
                Save
              </Button>
            </Modal.Footer>
          </Modal.Content>
        </Modal>
      </Scene>

      <Scene
        id="onboarding"
        title="Onboarding"
        description="Wizard with Navigation.Finish, Form validation, Radio, searchable Select groups, and Combobox.NoMatches."
      >
        <Box className="p-gs-4 sm:p-gs-6">
          <Container size="sm" className="!mx-gs-0 !max-w-xl !px-gs-0">
            <Wizard
              defaultStep="account"
              indicator="steps"
              onComplete={() => undefined}
            >
              <Wizard.Step value="account">
                <Wizard.Title>Create your account</Wizard.Title>
                <Wizard.Description>
                  We'll use this identity for invites and billing.
                </Wizard.Description>
                <Form
                  initialValues={{
                    email: "maya@northstar.io",
                    workspace: "Northstar",
                  }}
                  onSubmit={() => undefined}
                >
                  <Stack gap="4" className="mt-gs-4" divider={<Divider />}>
                    <Form.Item
                      name="email"
                      rules={[
                        { required: true, message: "Email is required" },
                      ]}
                    >
                      <Input type="email" fullWidth>
                        <Input.Label>Work email</Input.Label>
                      </Input>
                    </Form.Item>
                    <Form.Item name="workspace">
                      <Input fullWidth>
                        <Input.Label>Workspace name</Input.Label>
                        <Input.Description>
                          Visible to everyone on the team.
                        </Input.Description>
                      </Input>
                    </Form.Item>
                    <Checkbox defaultChecked>
                      Remember this workspace on this device
                    </Checkbox>
                  </Stack>
                </Form>
              </Wizard.Step>
              <Wizard.Step value="plan">
                <Wizard.Title>Choose a plan</Wizard.Title>
                <Wizard.Description>
                  You can change this later from billing settings.
                </Wizard.Description>
                <Stack gap="4" className="mt-gs-4">
                  <Radio.Group defaultValue="pro" orientation="vertical">
                    <Radio value="starter">Starter · for small teams</Radio>
                    <Radio value="pro">Professional · recommended</Radio>
                    <Radio value="enterprise">Enterprise · SSO & audit</Radio>
                  </Radio.Group>
                  <Select defaultValue="monthly" fullWidth portal={false}>
                    <Select.Label>Billing cycle</Select.Label>
                    <Select.Trigger placeholder="Choose a cycle" />
                    <Select.Content>
                      <Select.Group>
                        <Select.GroupLabel>Standard</Select.GroupLabel>
                        <Select.Item value="monthly">Monthly</Select.Item>
                        <Select.Item value="yearly">
                          Yearly · save two months
                        </Select.Item>
                      </Select.Group>
                    </Select.Content>
                  </Select>
                </Stack>
              </Wizard.Step>
              <Wizard.Step value="invite">
                <Wizard.Title>Invite teammates</Wizard.Title>
                <Wizard.Description>
                  Add a few people now or skip and do it later.
                </Wizard.Description>
                <Stack gap="4" className="mt-gs-4">
                  <Combobox
                    value={invitee}
                    onValueChange={setInvitee}
                    fullWidth
                    portal={false}
                    placeholder="Search teammates"
                  >
                    <Combobox.Label>Suggested teammates</Combobox.Label>
                    <Combobox.Description>
                      Type to filter the directory.
                    </Combobox.Description>
                    <Combobox.Item value="ada">Ada Lovelace</Combobox.Item>
                    <Combobox.Item value="grace">Grace Hopper</Combobox.Item>
                    <Combobox.Item value="alan">Alan Turing</Combobox.Item>
                    <Combobox.NoMatches>
                      No matching teammate.
                    </Combobox.NoMatches>
                  </Combobox>
                  <TextArea
                    placeholder="Optional welcome note"
                    maxLength={120}
                    showCount
                    resize="vertical"
                    fullWidth
                  >
                    <TextArea.Label>Message</TextArea.Label>
                  </TextArea>
                </Stack>
              </Wizard.Step>
              <Wizard.Navigation>
                <Wizard.Navigation.Finish>Create workspace</Wizard.Navigation.Finish>
              </Wizard.Navigation>
            </Wizard>
          </Container>
        </Box>
      </Scene>

      <Scene
        id="members"
        title="Members directory"
        description="Searchable Select with NoMatches, DateRangePicker, selectable Table, Pagination.hideOnSinglePage, and Checkbox.Group filters in a Drawer."
      >
        <Box className="border-b border-gs-border-default px-gs-4 py-gs-3">
          <Flex align="center" justify="between" gap="3" wrap>
            <Box>
              <Text as="h3" size="md" weight="medium">
                Workspace members
              </Text>
              <Text size="sm" tone="muted" className="mt-gs-1">
                24 people · 3 invites pending
              </Text>
            </Box>
            <Flex gap="2" wrap>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setDrawerOpen(true)}
              >
                <Button.Leading>
                  <Filter size={15} />
                </Button.Leading>
                Filters
              </Button>
              <Button type="button" size="sm">
                Invite member
              </Button>
            </Flex>
          </Flex>
          <Grid columns={{ base: 1, sm: 3 }} gap="3" className="mt-gs-4">
            <Input placeholder="Search members" fullWidth clearable>
              <Input.Label>Search</Input.Label>
              <Input.Prefix>
                <Search size={15} aria-hidden="true" />
              </Input.Prefix>
            </Input>
            <Select
              defaultValue="all"
              searchable
              fullWidth
              portal={false}
            >
              <Select.Label>Role</Select.Label>
              <Select.Trigger placeholder="Filter by role" />
              <Select.NoMatches>No matching role.</Select.NoMatches>
              <Select.Content>
                <Select.Item value="all">All roles</Select.Item>
                <Select.Item value="admin">Admin</Select.Item>
                <Select.Item value="editor">Editor</Select.Item>
                <Select.Item value="viewer">Viewer</Select.Item>
              </Select.Content>
            </Select>
            <DateRangePicker
              defaultValue={{ start: "2026-07-01", end: "2026-07-24" }}
              clearable
            >
              <DateRangePicker.Label>Joined</DateRangePicker.Label>
            </DateRangePicker>
          </Grid>
        </Box>
        <Box className="px-gs-2 py-gs-2 sm:px-gs-4">
          <Table
            columns={memberColumns}
            dataSource={MEMBER_ROWS}
            rowKey="id"
            selectable
            size="sm"
          >
            <Table.Caption>Workspace members</Table.Caption>
          </Table>
        </Box>
        <Flex
          align="center"
          justify="between"
          gap="3"
          wrap
          className="border-t border-gs-border-default px-gs-4 py-gs-3"
        >
          <Text size="sm" tone="muted">
            Showing {(page - 1) * 10 + 1}–{Math.min(page * 10, 120)} of 120
          </Text>
          <Pagination
            page={page}
            total={120}
            pageSize={10}
            onPageChange={setPage}
            hideOnSinglePage
          />
        </Flex>

        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen} {...overlayProps}>
          <Drawer.Content>
            <Drawer.Header>
              <Drawer.Title>Member filters</Drawer.Title>
              <Drawer.Description>
                Narrow who appears in the directory.
              </Drawer.Description>
            </Drawer.Header>
            <Drawer.Body>
              <Stack gap="5">
                <Checkbox.Group
                  name="status"
                  defaultValue={["active", "pending"]}
                  orientation="vertical"
                >
                  <Checkbox.Group.Label>Status</Checkbox.Group.Label>
                  <Checkbox.Group.Description>
                    Choose which membership states to include.
                  </Checkbox.Group.Description>
                  <Checkbox value="active">Active members</Checkbox>
                  <Checkbox value="pending">Pending invites</Checkbox>
                  <Checkbox value="suspended">Suspended</Checkbox>
                </Checkbox.Group>
                <Divider />
                <DatePicker
                  defaultValue="2026-01-01"
                  locale="en-US"
                  formatOptions={{ dateStyle: "medium" }}
                >
                  <DatePicker.Label>Joined after</DatePicker.Label>
                </DatePicker>
                <Button type="button" tone="danger" variant="ghost" size="sm">
                  Clear filters
                </Button>
              </Stack>
            </Drawer.Body>
          </Drawer.Content>
        </Drawer>
      </Scene>

      <Scene
        id="project"
        title="Project overview"
        description="Tabs, metric Cards, Progress, AspectRatio, List, ReliefCard.Action, VirtualTable, and ScrollArea."
      >
        <Box className="p-gs-4 sm:p-gs-5">
          <Tabs defaultValue="overview" variant="underline">
            <Tabs.List aria-label="Project sections">
              <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
              <Tabs.Trigger value="activity">Activity</Tabs.Trigger>
              <Tabs.Trigger value="files">Files</Tabs.Trigger>
            </Tabs.List>

            <Tabs.Panel value="overview" className="!pt-gs-4">
              <Grid columns={{ base: 1, md: 3 }} gap="3">
                {[
                  ["Cycle progress", "68%", "On track"],
                  ["Open reviews", "8", "3 due today"],
                  ["Coverage", "92%", "Above target"],
                ].map(([label, value, detail]) => (
                  <Card key={label} variant="filled" size="sm">
                    <Card.Header>
                      <Card.Title>{label}</Card.Title>
                    </Card.Header>
                    <Card.Body>
                      <Text as="p" size="2xl" weight="medium">
                        {value}
                      </Text>
                      <Text as="p" size="xs" tone="muted" className="mt-gs-1">
                        {detail}
                      </Text>
                    </Card.Body>
                  </Card>
                ))}
              </Grid>

              <Grid columns={{ base: 1, lg: 2 }} gap="4" className="mt-gs-4">
                <Card variant="outlined">
                  <Card.Header>
                    <Card.Title>Delivery health</Card.Title>
                    <Card.Action>
                      <Tag tone="success" size="sm">
                        Healthy
                      </Tag>
                    </Card.Action>
                  </Card.Header>
                  <Card.Body>
                    <Progress
                      value={68}
                      showValue
                      aria-label="Release progress"
                    />
                    <AspectRatio ratio="16/9" className="mt-gs-4">
                      <Box className="grid size-full place-items-center rounded-gs-xs bg-gs-surface-mist text-gs-sm text-gs-text-secondary">
                        Sprint burndown preview
                      </Box>
                    </AspectRatio>
                  </Card.Body>
                </Card>

                <Card variant="elevated">
                  <Card.Header>
                    <Card.Title>Recent activity</Card.Title>
                  </Card.Header>
                  <Card.Body>
                    <List>
                      <List.Item>
                        <List.Content>
                          <List.Title>Maya Chen</List.Title>
                          <List.Description>
                            Published the release notes
                          </List.Description>
                        </List.Content>
                      </List.Item>
                      <List.Item>
                        <List.Content>
                          <List.Title>Noah Williams</List.Title>
                          <List.Description>
                            Approved the design review
                          </List.Description>
                        </List.Content>
                      </List.Item>
                      <List.Item>
                        <List.Content>
                          <List.Title>Ari Morgan</List.Title>
                          <List.Description>
                            Updated workspace access
                          </List.Description>
                        </List.Content>
                      </List.Item>
                    </List>
                  </Card.Body>
                </Card>
              </Grid>

              <ReliefCard className="mt-gs-4">
                <ReliefCard.Title as="h3">Ship checklist</ReliefCard.Title>
                <ReliefCard.Description>
                  Docs, changelog, and support macros are ready for launch day.
                </ReliefCard.Description>
                <ReliefCard.Action>
                  <Button type="button" size="sm">
                    Open checklist
                  </Button>
                </ReliefCard.Action>
              </ReliefCard>
            </Tabs.Panel>

            <Tabs.Panel value="activity" className="!pt-gs-4">
              <VirtualTable
                scroll={{ y: 260 }}
                columns={activityColumns}
                dataSource={ACTIVITY_ROWS}
                rowKey="id"
                size="sm"
              >
                <VirtualTable.Caption>Project activity feed</VirtualTable.Caption>
              </VirtualTable>
            </Tabs.Panel>

            <Tabs.Panel value="files" className="!pt-gs-4">
              <ScrollArea maxHeight={200}>
                <Stack gap="2" className="p-gs-1">
                  {[
                    "brand-guidelines.pdf",
                    "launch-checklist.md",
                    "q3-metrics.csv",
                    "support-macros.json",
                    "press-kit.zip",
                    "screenshot-hero.png",
                    "changelog-draft.md",
                    "rollback-plan.md",
                  ].map((file) => (
                    <Flex
                      key={file}
                      align="center"
                      justify="between"
                      className="rounded-gs-xs border border-gs-border-default px-gs-3 py-gs-2"
                    >
                      <Text size="sm">{file}</Text>
                      <Tag size="sm">Ready</Tag>
                    </Flex>
                  ))}
                </Stack>
              </ScrollArea>
            </Tabs.Panel>
          </Tabs>
        </Box>
      </Scene>

      <Scene
        id="settings"
        title="Settings"
        description="Switch sizes, Slider formatOptions, Stack dividers, and Collapse disclosure."
      >
        <Box
          display="grid"
          className="gap-gs-0 lg:grid-cols-[1fr_1fr] lg:divide-x lg:divide-gs-border-default"
        >
          <Box className="p-gs-4 sm:p-gs-5">
            <Text as="h3" size="md" weight="medium">
              Notifications
            </Text>
            <Text size="sm" tone="muted" className="mt-gs-1">
              Choose which updates need your attention.
            </Text>
            <Stack gap="5" className="mt-gs-5" divider={<Divider />}>
              <Switch defaultChecked size="lg">
                Product updates
                <Switch.Description>
                  Releases, migrations, and maintenance windows.
                </Switch.Description>
              </Switch>
              <Switch defaultChecked>
                Review requests
                <Switch.Description>
                  New approvals and comments assigned to you.
                </Switch.Description>
              </Switch>
              <Switch>
                Weekly digest
                <Switch.Description>
                  A compact summary every Monday morning.
                </Switch.Description>
              </Switch>
              <Slider
                defaultValue={0.4}
                min={0}
                max={1}
                step={0.01}
                formatOptions={{ style: "percent" }}
              >
                <Slider.Label>Digest length</Slider.Label>
                <Slider.Output />
              </Slider>
            </Stack>
          </Box>

          <Box className="border-t border-gs-border-default p-gs-4 sm:p-gs-5 lg:border-t-0">
            <Text as="h3" size="md" weight="medium">
              Help & FAQ
            </Text>
            <Text size="sm" tone="muted" className="mt-gs-1">
              Progressive disclosure for supporting answers.
            </Text>
            <Collapse defaultValue="billing" className="mt-gs-4">
              <Collapse.Item value="billing">
                <Collapse.Trigger>How does billing work?</Collapse.Trigger>
                <Collapse.Content>
                  <Text size="sm" tone="muted">
                    Plans renew on the anniversary of your workspace creation.
                    Seats are prorated when you invite teammates mid-cycle.
                  </Text>
                </Collapse.Content>
              </Collapse.Item>
              <Collapse.Item value="sso">
                <Collapse.Trigger>Can we enable SSO?</Collapse.Trigger>
                <Collapse.Content>
                  <Text size="sm" tone="muted">
                    SSO is available on Enterprise. Contact support to map your
                    identity provider.
                  </Text>
                </Collapse.Content>
              </Collapse.Item>
              <Collapse.Item value="export">
                <Collapse.Trigger>How do I export my theme?</Collapse.Trigger>
                <Collapse.Content>
                  <Text size="sm" tone="muted">
                    Use Export in the playground sidebar to copy CSS or a React
                    ThemeProvider snippet.
                  </Text>
                </Collapse.Content>
              </Collapse.Item>
            </Collapse>

            <Flex align="center" gap="2" className="mt-gs-5">
              <Icon label="Verified">
                <Check />
              </Icon>
              <Text size="sm">Settings auto-save is on</Text>
            </Flex>
          </Box>
        </Box>
      </Scene>

      <Scene
        id="states"
        title="Empty & loading"
        description="Empty, Skeleton variants, Spinner labels, and closable success Alert."
      >
        <Box
          display="grid"
          className="gap-gs-4 p-gs-4 sm:grid-cols-2 sm:p-gs-5"
        >
          <Card variant="outlined">
            <Card.Header>
              <Card.Title>Empty projects</Card.Title>
              <Card.Description>
                Guide the next useful action when nothing exists yet.
              </Card.Description>
            </Card.Header>
            <Card.Body>
              <Empty>
                <Empty.Title>No projects yet</Empty.Title>
                <Empty.Description>
                  Create a project to start collaborating with your team.
                </Empty.Description>
                <Empty.Action>
                  <Button type="button" size="sm">
                    Create project
                  </Button>
                </Empty.Action>
              </Empty>
            </Card.Body>
          </Card>

          <Card variant="outlined">
            <Card.Header>
              <Card.Title>Loading board</Card.Title>
              <Card.Action>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setLoadingPreview(true);
                    window.setTimeout(() => setLoadingPreview(false), 1200);
                  }}
                >
                  Replay
                </Button>
              </Card.Action>
            </Card.Header>
            <Card.Body>
              {loadingPreview ? (
                <Stack gap="3">
                  <Flex align="center" gap="2">
                    <Spinner size="sm" label="Loading board" />
                    <Text size="sm" tone="muted">
                      Syncing workspace…
                    </Text>
                  </Flex>
                  <Skeleton variant="text" width="48%" />
                  <Skeleton variant="rounded" height={96} animation="wave" />
                  <Skeleton variant="circular" width={40} />
                </Stack>
              ) : (
                <Stack gap="3">
                  <Text size="sm" weight="medium">
                    Board is ready
                  </Text>
                  <Text size="sm" tone="muted">
                    Skeleton and spinner reserve space so layout does not jump.
                  </Text>
                  <Alert tone="success" closable>
                    <Alert.Title>Sync complete</Alert.Title>
                    <Alert.Description>
                      Contrast targets remain WCAG {contrast}.
                    </Alert.Description>
                  </Alert>
                </Stack>
              )}
            </Card.Body>
          </Card>
        </Box>
      </Scene>
    </Stack>
  );
}
