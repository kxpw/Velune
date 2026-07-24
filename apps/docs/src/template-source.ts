export const loginTemplateSource = `import { LockKeyhole } from "lucide-react";
import {
  Box,
  Button,
  Card,
  Checkbox,
  Divider,
  Flex,
  Input,
  Stack,
  Text,
} from "velune/react";

export function LoginTemplate() {
  return (
    <Box
      as="main"
      display="grid"
      className="min-h-screen grid-cols-1 bg-gs-surface md:grid-cols-[minmax(260px,0.8fr)_minmax(420px,1.2fr)]"
    >
      <Flex
        as="section"
        direction="column"
        justify="between"
        className="min-h-65 border-b border-gs-default p-6 md:min-h-0 md:border-r md:border-b-0 md:p-12"
      >
        <Box>
          <Button as="a" href="/" variant="text" size="sm">
            Velune
          </Button>
          <Text
            as="h1"
            size="2xl"
            weight="semibold"
            className="mt-8 max-w-sm leading-9"
          >
            A calm workspace for focused product teams.
          </Text>
          <Text as="p" size="sm" tone="muted" className="mt-3 max-w-sm leading-6">
            Review components, align on decisions, and keep every release
            connected to the design system.
          </Text>
        </Box>
        <Text as="p" size="xs" tone="muted">
          Velune workspace · Secure sign in
        </Text>
      </Flex>

      <Box as="section" display="grid" className="place-items-center p-5 md:p-12">
        <Card variant="elevated" className="w-full max-w-105">
          <Card.Header>
            <Card.Title>Welcome back</Card.Title>
            <Card.Description>
              Sign in to continue to your workspace.
            </Card.Description>
          </Card.Header>
          <Card.Body>
            <Stack as="form" gap="4">
              <Input
                type="email"
                placeholder="you@company.com"
                autoComplete="email"
                fullWidth
              >
                <Input.Label>Work email</Input.Label>
              </Input>
              <Input
                type="password"
                placeholder="Enter your password"
                autoComplete="current-password"
                fullWidth
              >
                <Input.Label>Password</Input.Label>
              </Input>
              <Flex
                direction="column"
                align="start"
                gap="2"
                className="sm:flex-row sm:items-center sm:justify-between"
              >
                <Checkbox defaultChecked>Remember me</Checkbox>
                <Button type="button" variant="ghost" size="sm">
                  Forgot password?
                </Button>
              </Flex>
              <Button type="submit" block>
                <Button.Leading><LockKeyhole size={16} /></Button.Leading>
                Sign in
              </Button>
              <Divider tone="subtle">or</Divider>
              <Button type="button" variant="secondary" block>
                Continue with SSO
              </Button>
            </Stack>
          </Card.Body>
          <Card.Footer align="center">
            <Text size="sm" tone="muted">
              New to Velune?{" "}
              <Button as="a" href="/sign-up" variant="text" size="sm">
                Create an account
              </Button>
            </Text>
          </Card.Footer>
        </Card>
      </Box>
    </Box>
  );
}`;

export const sidebarTemplateSource = `import {
  Bell,
  Blocks,
  Folder,
  Home,
  LogOut,
  Plus,
  Settings,
  User,
  Users,
} from "lucide-react";
import {
  Avatar,
  Box,
  Button,
  Card,
  Dropdown,
  Flex,
  List,
  Progress,
  Sidebar,
  Tag,
  Text,
} from "velune/react";

export function SidebarTemplate() {
  return (
    <Sidebar.Provider className="min-h-screen">
      <Sidebar collapsible="icon" aria-label="Workspace navigation">
        <Sidebar.Header>
          <Sidebar.Menu>
            <Sidebar.MenuItem>
              <Dropdown>
                <Dropdown.Trigger>
                  <Sidebar.MenuButton tooltip="Product workspace">
                    <Blocks size={16} />
                    <span>Product workspace</span>
                  </Sidebar.MenuButton>
                </Dropdown.Trigger>
                <Dropdown.Menu aria-label="Choose workspace">
                  <Dropdown.Section>
                    <Dropdown.SectionTitle>Workspaces</Dropdown.SectionTitle>
                    <Dropdown.Item value="product">
                      Product workspace
                      <Dropdown.Item.Description>8 members</Dropdown.Item.Description>
                    </Dropdown.Item>
                    <Dropdown.Item value="design">Design system</Dropdown.Item>
                  </Dropdown.Section>
                  <Dropdown.Separator />
                  <Dropdown.Item value="new-workspace">
                    <Dropdown.Item.Leading>
                      <Plus size={15} />
                    </Dropdown.Item.Leading>
                    New workspace
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Sidebar.MenuItem>
          </Sidebar.Menu>
        </Sidebar.Header>
        <Sidebar.Content>
          <Sidebar.Group>
            <Sidebar.GroupLabel>Navigate</Sidebar.GroupLabel>
            <Sidebar.GroupAction aria-label="New project">
              <Plus size={16} />
            </Sidebar.GroupAction>
            <Sidebar.GroupContent>
              <Sidebar.Menu>
                <Sidebar.MenuItem>
                  <Sidebar.MenuButton as="a" href="#overview" current tooltip="Overview">
                    <Home size={16} />
                    <span>Overview</span>
                  </Sidebar.MenuButton>
                </Sidebar.MenuItem>
                <Sidebar.MenuItem defaultOpen>
                  <Sidebar.MenuButton tooltip="Projects">
                    <Folder size={16} />
                    <span>Projects</span>
                  </Sidebar.MenuButton>
                  <Sidebar.MenuSub>
                    <Sidebar.MenuSubItem>
                      <Sidebar.MenuSubButton as="a" href="#active">
                        Active
                      </Sidebar.MenuSubButton>
                    </Sidebar.MenuSubItem>
                    <Sidebar.MenuSubItem>
                      <Sidebar.MenuSubButton as="a" href="#archived">
                        Archived
                      </Sidebar.MenuSubButton>
                    </Sidebar.MenuSubItem>
                  </Sidebar.MenuSub>
                </Sidebar.MenuItem>
                <Sidebar.MenuItem>
                  <Sidebar.MenuButton as="a" href="#team" tooltip="Team">
                    <Users size={16} />
                    <span>Team</span>
                  </Sidebar.MenuButton>
                  <Sidebar.MenuBadge>8</Sidebar.MenuBadge>
                </Sidebar.MenuItem>
                <Sidebar.MenuItem>
                  <Sidebar.MenuButton as="a" href="#activity" tooltip="Activity">
                    <Bell size={16} />
                    <span>Activity</span>
                  </Sidebar.MenuButton>
                </Sidebar.MenuItem>
              </Sidebar.Menu>
            </Sidebar.GroupContent>
          </Sidebar.Group>
          <Sidebar.Group>
            <Sidebar.GroupContent>
              <Sidebar.Menu>
                <Sidebar.MenuItem>
                  <Sidebar.MenuButton as="a" href="#settings" tooltip="Settings">
                    <Settings size={16} />
                    <span>Settings</span>
                  </Sidebar.MenuButton>
                </Sidebar.MenuItem>
              </Sidebar.Menu>
            </Sidebar.GroupContent>
          </Sidebar.Group>
        </Sidebar.Content>
        <Sidebar.Footer>
          <Sidebar.Menu>
            <Sidebar.MenuItem>
              <Dropdown placement="top-start">
                <Dropdown.Trigger>
                  <Sidebar.MenuButton tooltip="Maya Chen">
                    <User size={16} />
                    <span>Maya Chen</span>
                  </Sidebar.MenuButton>
                </Dropdown.Trigger>
                <Dropdown.Menu aria-label="Account menu">
                  <Dropdown.Section>
                    <Dropdown.SectionTitle>maya@velune.dev</Dropdown.SectionTitle>
                    <Dropdown.Item value="profile">Profile</Dropdown.Item>
                    <Dropdown.Item value="preferences">Preferences</Dropdown.Item>
                  </Dropdown.Section>
                  <Dropdown.Separator />
                  <Dropdown.Item value="sign-out" tone="danger">
                    <Dropdown.Item.Leading>
                      <LogOut size={15} />
                    </Dropdown.Item.Leading>
                    Sign out
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Sidebar.MenuItem>
          </Sidebar.Menu>
        </Sidebar.Footer>
      </Sidebar>

      <Box
        as="main"
        className="relative flex min-h-full min-w-gs-0 flex-1 flex-col bg-gs-surface"
      >
        <Flex
          as="header"
          align="center"
          justify="between"
          gap="4"
          className="border-b border-gs-border-default px-gs-5 py-gs-4"
        >
          <Flex align="center" gap="3">
            <Sidebar.Trigger />
            <Box>
              <Text as="p" size="sm" weight="medium">
                Overview
              </Text>
              <Text as="p" size="xs" tone="muted">
                Thursday, July 16
              </Text>
            </Box>
          </Flex>
          <Avatar.Group max={3} size="sm">
            <Avatar name="Maya Chen" />
            <Avatar name="Ada Lovelace" />
            <Avatar name="Grace Hopper" />
            <Avatar name="Alan Turing" />
          </Avatar.Group>
        </Flex>

        <Box className="flex-1 p-gs-6">
          <Flex align="start" justify="between" gap="4" wrap>
            <Box>
              <Text as="h1" size="xl" weight="medium">
                Welcome back, Maya
              </Text>
              <Text as="p" size="sm" tone="muted">
                Here is what changed across your workspace.
              </Text>
            </Box>
            <Button size="sm">
              <Button.Leading>
                <Plus size={16} />
              </Button.Leading>
              New project
            </Button>
          </Flex>

          <Box className="mt-gs-5 grid grid-cols-2 gap-gs-3 sm:grid-cols-3">
            <Card variant="filled" size="sm">
              <Card.Header>
                <Card.Description>Active projects</Card.Description>
              </Card.Header>
              <Card.Body>
                <Text size="2xl" weight="medium">
                  12
                </Text>
              </Card.Body>
            </Card>
            <Card variant="filled" size="sm">
              <Card.Header>
                <Card.Description>Team members</Card.Description>
              </Card.Header>
              <Card.Body>
                <Text size="2xl" weight="medium">
                  8
                </Text>
              </Card.Body>
            </Card>
            <Card variant="filled" size="sm" className="col-span-2 sm:col-span-1">
              <Card.Header>
                <Card.Description>Storage</Card.Description>
              </Card.Header>
              <Card.Body>
                <Progress value={68} size="sm" aria-label="Storage used" />
                <Text as="p" size="xs" tone="muted" className="mt-gs-2">
                  68 GB of 100 GB used
                </Text>
              </Card.Body>
            </Card>
          </Box>

          <Box as="section" className="mt-gs-6">
            <Text as="h2" weight="medium">
              Recent projects
            </Text>
            <List className="mt-gs-2" aria-label="Recent projects">
              {["Atlas mobile", "Checkout refresh", "Design tokens"].map((name) => (
                <List.Item key={name} interactive>
                  <List.Leading>
                    <Folder size={16} />
                  </List.Leading>
                  <List.Content>
                    <List.Title>{name}</List.Title>
                  </List.Content>
                  <List.Trailing>
                    <Tag size="sm">On track</Tag>
                  </List.Trailing>
                </List.Item>
              ))}
            </List>
          </Box>
        </Box>
      </Box>
    </Sidebar.Provider>
  );
}`;
