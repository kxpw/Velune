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

export const sidebarTemplateSource = `import { useState } from "react";
import {
  Bell,
  Folder,
  Home,
  LogOut,
  Menu,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Settings,
  User,
  Users,
} from "lucide-react";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Drawer,
  Dropdown,
  Flex,
  List,
  Progress,
  Tag,
  Text,
} from "velune/react";

export function SidebarTemplate() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigationButtonClass = collapsed
    ? "justify-start [&_.gs-button-content]:w-full [&_.gs-button-content]:justify-center [&_.gs-button-label]:hidden"
    : "justify-start [&_.gs-button-content]:w-full [&_.gs-button-content]:justify-center [&_.gs-button-label]:hidden md:[&_.gs-button-content]:justify-start md:[&_.gs-button-label]:block md:[&_.gs-button-label]:flex-1 md:[&_.gs-button-label]:text-left";
  const navigationButtonWithBadgeClass =
    navigationButtonClass +
    (collapsed
      ? " [&_.gs-button-icon:last-child]:hidden"
      : " [&_.gs-button-icon:last-child]:hidden md:[&_.gs-button-icon:last-child]:block");

  return (
    <Box
      as="main"
      display="grid"
      className={
        collapsed
          ? "min-h-screen grid-cols-1 bg-gs-surface md:grid-cols-[76px_minmax(0,1fr)]"
          : "min-h-screen grid-cols-1 bg-gs-surface md:grid-cols-[248px_minmax(0,1fr)]"
      }
    >
      <Flex
        as="aside"
        id="workspace-sidebar"
        direction="column"
        className="hidden min-w-0 overflow-hidden border-r border-gs-default md:flex"
      >
        <Box className="px-4 py-5">
          <Text size="sm" weight="semibold">
            {collapsed ? "G" : "Velune"}
          </Text>
          {!collapsed ? (
            <Dropdown>
              <Dropdown.Trigger>
                <Button variant="secondary" size="sm" block className="mt-4">
                  Product workspace
                </Button>
              </Dropdown.Trigger>
              <Dropdown.Menu aria-label="Choose workspace">
                <Dropdown.Item value="product">Product workspace</Dropdown.Item>
                <Dropdown.Item value="design">Design system</Dropdown.Item>
                <Dropdown.Separator />
                <Dropdown.Item value="new">New workspace</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          ) : null}
        </Box>
        <Box
          as="nav"
          display="grid"
          className="gap-1 px-3"
          aria-label="Workspace navigation"
        >
          <Button
            variant="secondary"
            block
            className={navigationButtonClass}
          >
            <Button.Leading><Home size={16} /></Button.Leading>
            Overview
          </Button>
          <Button
            variant="ghost"
            block
            className={navigationButtonClass}
          >
            <Button.Leading><Folder size={16} /></Button.Leading>
            Projects
          </Button>
          <Button
            variant="ghost"
            block
            className={navigationButtonWithBadgeClass}
          >
            <Button.Leading><Users size={16} /></Button.Leading>
            Team
            <Button.Trailing><Badge count={8} /></Button.Trailing>
          </Button>
          <Button
            variant="ghost"
            block
            className={navigationButtonClass}
          >
            <Button.Leading><Bell size={16} /></Button.Leading>
            Activity
          </Button>
        </Box>

        <Box className="mt-auto p-3">
          <Divider tone="subtle" />
          <Button
            variant="ghost"
            block
            className={"mt-2 " + navigationButtonClass}
          >
            <Button.Leading><Settings size={16} /></Button.Leading>
            Settings
          </Button>
          <Dropdown placement="top-start">
            <Dropdown.Trigger>
              <Button variant="ghost" block className={navigationButtonClass}>
                <Button.Leading><User size={16} /></Button.Leading>
                Maya Chen
                {!collapsed ? (
                  <Button.Trailing><MoreHorizontal size={16} /></Button.Trailing>
                ) : null}
              </Button>
            </Dropdown.Trigger>
            <Dropdown.Menu aria-label="Account menu">
              <Dropdown.Item value="profile">Profile</Dropdown.Item>
              <Dropdown.Item value="preferences">Preferences</Dropdown.Item>
              <Dropdown.Separator />
              <Dropdown.Item value="sign-out" tone="danger">
                <Dropdown.Item.Leading><LogOut size={15} /></Dropdown.Item.Leading>
                Sign out
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Box>
      </Flex>

      <Flex as="section" direction="column">
        <Flex
          as="header"
          align="center"
          justify="between"
          gap="4"
          className="border-b border-gs-default px-5 py-4"
        >
          <Flex align="center" gap="3">
            <Box className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                aria-label="Open workspace navigation"
                onClick={() => setMobileOpen(true)}
              >
                <Button.Leading><Menu size={17} /></Button.Leading>
              </Button>
            </Box>
            <Box className="hidden md:block">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                aria-expanded={!collapsed}
                aria-controls="workspace-sidebar"
                onClick={() => setCollapsed((value) => !value)}
              >
                <Button.Leading>
                  {collapsed ? (
                    <PanelLeftOpen size={16} />
                  ) : (
                    <PanelLeftClose size={16} />
                  )}
                </Button.Leading>
              </Button>
            </Box>
            <Box>
              <Text as="p" size="sm" weight="semibold">
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

        <Box className="flex-1 p-6">
          <Flex align="start" justify="between" gap="4" wrap>
            <Box>
              <Text as="h1" size="xl" weight="semibold">Welcome back, Maya</Text>
              <Text as="p" size="sm" tone="muted">Here is what changed across your workspace.</Text>
            </Box>
            <Button size="sm">
              <Button.Leading><Plus size={16} /></Button.Leading>
              New project
            </Button>
          </Flex>
          <Box className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Card variant="filled" size="sm">
              <Card.Header><Card.Description>Active projects</Card.Description></Card.Header>
              <Card.Body><Text size="2xl" weight="semibold">12</Text></Card.Body>
            </Card>
            <Card variant="filled" size="sm">
              <Card.Header><Card.Description>Team members</Card.Description></Card.Header>
              <Card.Body><Text size="2xl" weight="semibold">8</Text></Card.Body>
            </Card>
            <Card variant="filled" size="sm" className="col-span-2 sm:col-span-1">
              <Card.Header><Card.Description>Storage</Card.Description></Card.Header>
              <Card.Body>
                <Progress value={68} size="sm" aria-label="Storage used" />
                <Text as="p" size="xs" tone="muted" className="mt-2">68 GB of 100 GB used</Text>
              </Card.Body>
            </Card>
          </Box>
          <Box as="section" className="mt-6">
            <Text as="h2" weight="semibold">Recent projects</Text>
            <List className="mt-2" aria-label="Recent projects">
              {["Atlas mobile", "Checkout refresh", "Design tokens"].map((name) => (
                <List.Item key={name} interactive>
                  <List.Leading><Folder size={16} /></List.Leading>
                  <List.Content><List.Title>{name}</List.Title></List.Content>
                  <List.Trailing><Tag size="sm">On track</Tag></List.Trailing>
                </List.Item>
              ))}
            </List>
          </Box>
        </Box>
      </Flex>

      <Drawer open={mobileOpen} onOpenChange={setMobileOpen} placement="left" size="sm">
        <Drawer.Content>
          <Drawer.Header><Drawer.Title>Workspace navigation</Drawer.Title></Drawer.Header>
          <Drawer.Body>
            <Box
              as="nav"
              display="grid"
              className="gap-1"
              aria-label="Mobile workspace navigation"
            >
              {[
                ["Overview", <Home size={16} />],
                ["Projects", <Folder size={16} />],
                ["Team", <Users size={16} />],
                ["Activity", <Bell size={16} />],
              ].map(([label, icon], index) => (
                <Button
                  key={String(label)}
                  as="a"
                  href={"#" + String(label).toLowerCase()}
                  variant={index === 0 ? "secondary" : "ghost"}
                  block
                  className="justify-start"
                  onClick={() => setMobileOpen(false)}
                >
                  <Button.Leading>{icon}</Button.Leading>
                  {label}
                </Button>
              ))}
            </Box>
          </Drawer.Body>
        </Drawer.Content>
      </Drawer>
    </Box>
  );
}`;
