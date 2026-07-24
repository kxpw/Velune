import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import {
  Link,
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
  lazyRouteComponent,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import {
  ArrowRight,
  Asterisk,
  Bell,
  Blocks,
  BookOpen,
  Check,
  ChevronRight,
  Clipboard,
  Code2,
  Command,
  Eye,
  Folder,
  GitFork,
  Home,
  LayoutTemplate,
  Layers3,
  LogOut,
  LockKeyhole,
  Menu,
  MoreHorizontal,
  PackageOpen,
  Paintbrush,
  Palette,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  User,
  Users,
  Zap,
  X,
} from "lucide-react";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Checkbox,
  Divider,
  Drawer,
  Dropdown,
  Flex,
  Input,
  List,
  Progress,
  Select,
  Sidebar,
  Stack,
  Table,
  Tabs,
  Tag,
  Text,
  ThemeToggle,
} from "velune/react";
import type { ComponentExample } from "./component-examples";
import type { ComponentApiReference } from "./api-reference";
import {
  categories,
  componentImport,
  components,
  type ComponentCategory,
} from "./component-data";
import { usePortalTheme } from "./theme-context";
import { useCommandPaletteShortcut, type SearchEntry } from "./search";
import {
  SiteSidebar,
  siteNavLinkActiveClassName,
  siteNavLinkClassName,
  siteNavSectionLabelClassName,
  siteWorkspaceClassName,
  siteWorkspaceContentClassName,
} from "./site-sidebar";
import {
  InlineSyntaxHighlighter,
  SyntaxHighlighter,
} from "./SyntaxHighlighter";

const LazyComponentPreview = lazy(() =>
  import("./ComponentPreview").then(({ ComponentPreview }) => ({
    default: ComponentPreview,
  })),
);

const LazyCommandPalette = lazy(() =>
  import("./CommandPalette").then(({ CommandPalette }) => ({
    default: CommandPalette,
  })),
);

type TemplateSourceName = "loginTemplateSource" | "sidebarTemplateSource";

const templateSourceCache: Partial<Record<TemplateSourceName, string>> = {};

function useTemplateSource(name: TemplateSourceName) {
  const [source, setSource] = useState(() => templateSourceCache[name] ?? "");

  useEffect(() => {
    let active = true;

    if (templateSourceCache[name]) {
      setSource(templateSourceCache[name]);
      return () => {
        active = false;
      };
    }

    void import("./template-source")
      .then((module) => {
        templateSourceCache[name] = module[name];
        if (active) setSource(module[name]);
      })
      .catch(() => {
        if (active) setSource("");
      });

    return () => {
      active = false;
    };
  }, [name]);

  return source;
}

const categoryLabels: Record<ComponentCategory, string> = {
  Foundations: "Foundations",
  Inputs: "Inputs",
  Navigation: "Navigation",
  Feedback: "Feedback",
  Overlays: "Overlays",
  "Data display": "Data display",
  Layout: "Layout",
};

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-gs-3 no-underline">
      <svg
        data-logo-mark
        className="block size-gs-8 flex-none"
        viewBox="0 0 64 64"
        aria-hidden="true"
      >
        <path
          d="M44.05 49.2A21 21 0 1 0 19.95 49.2"
          fill="none"
          stroke="var(--color-text-primary)"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        <path
          d="M16.5 25C20 19.8 25.5 16.2 32 15.4"
          fill="none"
          stroke="var(--color-text-primary)"
          strokeWidth="1.4"
          strokeLinecap="round"
          opacity=".13"
        />
        <path
          d="M40.87 51.03A21 21 0 0 0 23.13 51.03"
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
      <Stack gap="1">
        <Text size="sm" weight="medium">
          Velune
        </Text>
      </Stack>
    </Link>
  );
}

function SidebarContent({
  onNavigate,
  showLogo = true,
}: {
  onNavigate?: () => void;
  showLogo?: boolean;
}) {
  return (
    <>
      {showLogo ? (
        <Box className="px-gs-5 py-gs-5">
          <Logo />
        </Box>
      ) : null}
      <Box
        as="nav"
        className="flex-1 overflow-y-auto px-gs-3 pb-gs-6"
        aria-label="Main navigation"
      >
        <Box display="grid" className="mb-gs-5 gap-gs-1">
          <SideLink to="/" icon={<Command size={16} />} onClick={onNavigate}>
            Overview
          </SideLink>
          <SideLink
            to="/components"
            icon={<Blocks size={16} />}
            onClick={onNavigate}
          >
            Components{" "}
            <Text size="xs" tone="muted" className="ml-auto">
              {components.length}
            </Text>
          </SideLink>
          <SideLink
            to="/tokens"
            icon={<Palette size={16} />}
            onClick={onNavigate}
          >
            Design tokens
          </SideLink>
          <SideLink
            to="/theme-playground"
            icon={<Paintbrush size={16} />}
            onClick={onNavigate}
          >
            Theme
          </SideLink>
          <SideLink
            to="/templates"
            icon={<LayoutTemplate size={16} />}
            onClick={onNavigate}
          >
            Templates
          </SideLink>
          <SideLink
            to="/docs/getting-started"
            icon={<BookOpen size={16} />}
            onClick={onNavigate}
          >
            Documentation
          </SideLink>
        </Box>
      </Box>
    </>
  );
}

function SideLink({
  to,
  icon,
  children,
  onClick,
}: {
  to:
    | "/"
    | "/components"
    | "/tokens"
    | "/theme-playground"
    | "/templates"
    | "/guides"
    | "/docs/getting-started";
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick?: (() => void) | undefined;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={siteNavLinkClassName}
      activeOptions={{ exact: to === "/" }}
      activeProps={{
        className: siteNavLinkActiveClassName,
      }}
    >
      {icon}
      {children}
    </Link>
  );
}

const isApplePlatform =
  typeof navigator !== "undefined" &&
  /Mac|iPhone|iPad/.test(navigator.platform);

function SearchButton({ onOpen }: { onOpen: () => void }) {
  return (
    <>
      <Box className="ml-auto hidden w-[min(360px,30vw)] sm:block">
        <button
          type="button"
          onClick={onOpen}
          aria-label="Search components and pages"
          aria-keyshortcuts="Meta+K Control+K"
          className="flex h-gs-10 w-full cursor-pointer items-center gap-gs-2.5 rounded-gs-sm border border-gs-border-default bg-gs-surface px-gs-3 text-gs-sm text-gs-text-secondary transition-[background-color,border-color,color] duration-gs-fast ease-gs-standard hover:border-gs-border-strong hover:text-gs-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-focus-ring"
        >
          <Search size={16} aria-hidden="true" className="flex-none" />
          <Text as="span" size="sm" className="min-w-gs-0 flex-1 text-left">
            Search
          </Text>
          <Text
            as="kbd"
            family="mono"
            size="2xs"
            tone="muted"
            className="flex-none rounded-gs-xs border border-gs-border-default px-gs-1.5 py-gs-0.5"
          >
            {isApplePlatform ? "⌘K" : "Ctrl K"}
          </Text>
        </button>
      </Box>
      <Box className="ml-auto sm:hidden">
        <Button
          variant="ghost"
          size="sm"
          aria-label="Search components and pages"
          aria-keyshortcuts="Meta+K Control+K"
          onClick={onOpen}
        >
          <Button.Leading>
            <Search size={17} />
          </Button.Leading>
        </Button>
      </Box>
    </>
  );
}

function LandingNavigation({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  return (
    <Flex as="nav" align="center" gap="1" aria-label="Primary navigation">
      <Link
        to="/docs/getting-started"
        onClick={onNavigate}
        className={`rounded-gs-sm px-gs-3 py-gs-2 text-gs-sm font-gs-medium no-underline hover:bg-gs-action-hover hover:text-gs-text ${
          pathname.startsWith("/docs")
            ? "bg-gs-action-hover text-gs-text"
            : "text-gs-text-secondary"
        }`}
      >
        Docs
      </Link>
      <Link
        to="/components"
        onClick={onNavigate}
        activeProps={{
          className: "bg-gs-action-hover text-gs-text",
        }}
        className="rounded-gs-sm px-gs-3 py-gs-2 text-gs-sm font-gs-medium text-gs-text-secondary no-underline hover:bg-gs-action-hover hover:text-gs-text"
      >
        Components
      </Link>
      <Link
        to="/theme-playground"
        onClick={onNavigate}
        activeProps={{
          className: "bg-gs-action-hover text-gs-text",
        }}
        className="rounded-gs-sm px-gs-3 py-gs-2 text-gs-sm font-gs-medium text-gs-text-secondary no-underline hover:bg-gs-action-hover hover:text-gs-text"
      >
        Theme
      </Link>
      <Link
        to="/templates"
        onClick={onNavigate}
        activeProps={{
          className: "bg-gs-action-hover text-gs-text",
        }}
        className="rounded-gs-sm px-gs-3 py-gs-2 text-gs-sm font-gs-medium text-gs-text-secondary no-underline hover:bg-gs-action-hover hover:text-gs-text"
      >
        Templates
      </Link>
    </Flex>
  );
}

function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchLoaded, setSearchLoaded] = useState(false);
  const navigate = useNavigate();
  const { theme, setTheme } = usePortalTheme();
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  const openSearch = useCallback(() => {
    setSearchLoaded(true);
    setSearchOpen(true);
  }, []);

  useCommandPaletteShortcut(
    useCallback(() => {
      setSearchLoaded(true);
      setSearchOpen((open) => !open);
    }, []),
  );

  const handleSearchNavigate = useCallback(
    (entry: SearchEntry) => {
      if (entry.kind === "component") {
        void navigate({ to: "/components/$slug", params: entry.params });
      } else {
        void navigate({ to: entry.to });
      }
    },
    [navigate],
  );
  const isHome = pathname === "/";
  const isTemplates = pathname.startsWith("/templates");
  const isComponents = pathname.startsWith("/components");
  const isDocs = pathname.startsWith("/docs");
  const isThemePlayground = pathname === "/theme-playground";

  return (
    <Box
      className={
        isThemePlayground
          ? "flex h-dvh min-w-80 flex-col overflow-hidden bg-transparent font-gs-sans text-gs-text tracking-gs-normal selection:bg-[color-mix(in_oklab,var(--color-primary)_22%,transparent)] [&_*]:[scrollbar-color:var(--color-border-strong)_transparent] [&_*]:[scrollbar-width:thin]"
          : "min-h-screen min-w-80 bg-transparent font-gs-sans text-gs-text tracking-gs-normal selection:bg-[color-mix(in_oklab,var(--color-primary)_22%,transparent)] [&_*]:[scrollbar-color:var(--color-border-strong)_transparent] [&_*]:[scrollbar-width:thin]"
      }
    >
      <Box
        as="header"
        className="sticky top-gs-0 z-40 shrink-0 border-b border-gs-border-default bg-[color-mix(in_oklab,var(--color-surface-raised)_94%,transparent)] backdrop-blur-md"
      >
        <Flex
          align="center"
          gap="2"
          className="mx-auto h-15 w-full max-w-[1600px] px-gs-3 sm:gap-gs-4 sm:px-[clamp(var(--space-3),3vw,var(--space-8))]"
        >
          <Box className="lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
            >
              <Button.Leading>
                <Menu size={19} />
              </Button.Leading>
            </Button>
          </Box>
          <Logo />
          <Box className="ml-5 hidden lg:block">
            <LandingNavigation />
          </Box>
          <SearchButton onOpen={openSearch} />
          <Flex align="center" gap="1" className="sm:ml-1">
            <Button
              as="a"
              href="https://github.com/kxpw/Velune"
              target="_blank"
              rel="noreferrer"
              variant="ghost"
              size="sm"
              aria-label="Open Velune on GitHub"
            >
              <Button.Leading>
                <GitFork size={17} />
              </Button.Leading>
            </Button>
            <ThemeToggle
              theme={theme}
              onThemeChange={(nextTheme) => {
                if (nextTheme !== "system") setTheme(nextTheme);
              }}
              variant="ghost"
              size="sm"
            />
          </Flex>
        </Flex>
      </Box>
      {isHome ||
      isTemplates ||
      isComponents ||
      isDocs ||
      isThemePlayground ? null : (
        <Box
          as="aside"
          className="fixed top-15 bottom-gs-0 left-gs-0 z-20 hidden w-60 flex-col border-r border-gs-border-default lg:flex"
        >
          <SidebarContent showLogo={false} />
        </Box>
      )}
      {searchLoaded ? (
        <Suspense fallback={null}>
          <LazyCommandPalette
            open={searchOpen}
            onOpenChange={setSearchOpen}
            onNavigate={handleSearchNavigate}
          />
        </Suspense>
      ) : null}
      <Drawer
        open={mobileOpen}
        onOpenChange={setMobileOpen}
        placement="left"
        size="sm"
      >
        <Drawer.Content
          className="w-[min(84vw,var(--drawer-size-sm))] bg-gs-surface-raised lg:hidden"
          aria-label="Navigation"
        >
          <Flex align="center" justify="between" className="px-gs-5 py-gs-5">
            <Logo />
            <Drawer.Close aria-label="Close navigation" />
          </Flex>
          <SidebarContent
            showLogo={false}
            onNavigate={() => setMobileOpen(false)}
          />
        </Drawer.Content>
      </Drawer>
      <Box
        as="main"
        className={
          isThemePlayground
            ? "min-h-gs-0 w-full flex-1 overflow-hidden"
            : isHome
              ? "w-full"
            : isTemplates || isComponents || isDocs
              ? "w-full"
              : "mx-auto w-full max-w-[1600px] px-gs-4 pt-gs-7 pb-gs-16 sm:px-gs-6 lg:pr-8 lg:pl-[272px] lg:pt-gs-10"
        }
      >
        <Outlet />
      </Box>
    </Box>
  );
}

const rootRoute = createRootRoute({
  component: AppShell,
  notFoundComponent: () => (
    <EmptyState
      title="Page not found"
      description="The page may have moved or no longer exists."
    />
  ),
});

function HomeDashboardPreview() {
  return (
    <Box
      aria-hidden="true"
      className="home-product-frame overflow-hidden border border-gs-border-default bg-gs-surface shadow-gs-3"
    >
      <Flex
        as="header"
        align="center"
        gap="3"
        className="h-gs-12 border-b border-gs-border-default px-gs-3 sm:px-gs-4"
      >
        <Flex align="center" gap="1" aria-hidden="true">
          <Box className="size-gs-2 rounded-gs-full bg-gs-error" />
          <Box className="size-gs-2 rounded-gs-full bg-gs-warning" />
          <Box className="size-gs-2 rounded-gs-full bg-gs-success" />
        </Flex>
        <Box className="mx-auto flex h-gs-7 w-full max-w-72 items-center justify-center rounded-gs-sm bg-gs-surface-mist px-gs-3">
          <LockKeyhole size={11} className="mr-1.5 text-gs-text-secondary" />
          <Text as="span" size="2xs" tone="muted" truncate>
            example.com / overview
          </Text>
        </Box>
        <MoreHorizontal size={16} className="text-gs-text-secondary" />
      </Flex>
      <Box
        display="grid"
        className="home-product-canvas grid-cols-1 md:grid-cols-[190px_minmax(0,1fr)]"
      >
        <Box
          as="aside"
          className="hidden border-r border-gs-border-default bg-gs-surface-raised p-gs-3 md:flex md:flex-col"
        >
          <Flex align="center" gap="2" className="px-gs-2 pt-gs-1 pb-gs-4">
            <Box className="grid size-gs-7 place-items-center rounded-gs-sm bg-gs-primary text-gs-on-primary">
              <Asterisk size={15} />
            </Box>
            <Text size="sm" weight="medium">
              Example
            </Text>
          </Flex>
          <Box
            as="nav"
            className="grid gap-gs-1 [&_.gs-button-content]:w-full [&_.gs-button-content]:justify-start [&_.gs-button-label]:flex-1 [&_.gs-button-label]:text-left"
            aria-label="Product preview navigation"
          >
            <Button
              variant="secondary"
              fullWidth
              tabIndex={-1}
              className="shadow-gs-1"
            >
              <Button.Leading>
                <Home size={16} />
              </Button.Leading>
              Overview
            </Button>
            <Button variant="ghost" fullWidth tabIndex={-1}>
              <Button.Leading>
                <Folder size={16} />
              </Button.Leading>
              Projects
            </Button>
            <Button variant="ghost" fullWidth tabIndex={-1}>
              <Button.Leading>
                <Users size={16} />
              </Button.Leading>
              Team
              <Button.Trailing>
                <Badge count={8} />
              </Button.Trailing>
            </Button>
            <Button variant="ghost" fullWidth tabIndex={-1}>
              <Button.Leading>
                <Bell size={16} />
              </Button.Leading>
              Activity
            </Button>
          </Box>
          <Flex
            align="center"
            gap="3"
            className="mt-auto border-t border-gs-border-default pt-gs-4"
          >
            <Avatar name="Maya Chen" size="sm" />
            <Box className="min-w-gs-0">
              <Text as="p" size="sm" weight="medium" truncate>
                Maya Chen
              </Text>
              <Text as="p" size="xs" tone="muted" truncate>
                Product team
              </Text>
            </Box>
          </Flex>
        </Box>
        <Box as="main" className="home-product-main min-w-gs-0 p-gs-4 sm:p-gs-6">
          <Flex align="start" justify="between" gap="4" wrap>
            <Box>
              <Text as="p" size="2xs" weight="medium" tone="accent">
                PRODUCT OPERATIONS
              </Text>
              <Text as="h2" size="2xl" weight="medium" className="mt-gs-1">
                Good morning, Maya
              </Text>
              <Text as="p" size="sm" tone="muted" className="mt-gs-1">
                Your team has 8 updates ready for review.
              </Text>
            </Box>
            <Button tabIndex={-1} className="hidden sm:inline-flex">
              <Button.Leading>
                <Plus size={15} />
              </Button.Leading>
              New project
            </Button>
          </Flex>
          <Box display="grid" className="mt-gs-5 grid-cols-3 gap-gs-2 sm:gap-gs-3">
            {[
              ["On track", "24", "success"],
              ["In review", "08", "warning"],
              ["At risk", "03", "error"],
            ].map(([label, value, tone]) => (
              <Box
                key={label}
                className="min-w-gs-0 border border-gs-border-default bg-gs-surface-raised p-gs-3 sm:p-gs-4"
              >
                <Flex align="center" justify="between" gap="2">
                  <Text size="xs" tone="muted" truncate>
                    {label}
                  </Text>
                  <Box
                    as="span"
                    className={`size-gs-2 rounded-gs-full ${tone === "success" ? "bg-gs-success" : tone === "warning" ? "bg-gs-warning" : "bg-gs-error"}`}
                  />
                </Flex>
                <Text as="p" size="2xl" weight="medium" className="mt-gs-2">
                  {value}
                </Text>
              </Box>
            ))}
          </Box>
          <Flex align="center" justify="between" className="mt-gs-5 mb-gs-2">
            <Text size="sm" weight="medium">
              Active work
            </Text>
            <Button variant="ghost" size="sm" tabIndex={-1}>
              View all
            </Button>
          </Flex>
          <Box className="border border-gs-border-default bg-gs-surface-raised px-gs-3 sm:px-gs-4">
            {[
              ["Navigation refresh", "Design", "Ready"],
              ["Billing migration", "Engineering", "In review"],
              ["Mobile foundations", "Platform", "Ready"],
            ].map(([title, team, status]) => (
              <Flex
                key={title}
                align="center"
                gap="3"
                className="flex min-h-gs-11 items-center gap-gs-3 border-b border-gs-border-default last:border-b-0"
              >
                <Checkbox
                  defaultChecked={status === "Ready"}
                  tabIndex={-1}
                  className="home-work-checkbox"
                />
                <Text
                  size="sm"
                  weight="medium"
                  truncate
                  className="min-w-gs-0 flex-1"
                >
                  {title}
                </Text>
                <Text size="xs" tone="muted" className="hidden sm:block">
                  {team}
                </Text>
                <Tag size="sm" tone={status === "Ready" ? "success" : "info"}>
                  {status}
                </Tag>
              </Flex>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

function HomePage() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const featuredSlugs = [
    "button",
    "input",
    "tabs",
    "table",
    "modal",
    "date-range-picker",
  ];
  const featuredComponents = featuredSlugs
    .map((slug) => components.find((item) => item.slug === slug))
    .filter((item): item is (typeof components)[number] => Boolean(item));

  const copyInstall = () => {
    if (!navigator.clipboard) return;
    void navigator.clipboard.writeText("pnpm add velune@beta").then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    });
  };

  return (
    <Box className="home-page overflow-hidden">
      <Box as="section" className="home-hero border-b border-gs-border-default">
        <Box className="home-hero-inner mx-auto flex w-full max-w-[1440px] flex-col px-gs-4 pt-gs-10 sm:px-gs-6 sm:pt-14 lg:px-gs-10 lg:pt-gs-16">
          <Box className="grid items-end gap-gs-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.62fr)]">
            <Box className="max-w-4xl">
              <Flex align="center" gap="3">
                <Box className="h-px w-gs-8 bg-gs-primary" />
                <Text as="p" size="xs" weight="medium" tone="accent">
                  OPEN SOURCE / REACT / TYPESCRIPT
                </Text>
              </Flex>
              <Text
                as="h1"
                weight="medium"
                className="mt-gs-5 text-6xl leading-[0.84] sm:text-[5.5rem] lg:text-[7.5rem]"
              >
                Velune
              </Text>
              <Text
                as="p"
                weight="medium"
                className="mt-gs-5 max-w-4xl text-gs-3xl leading-[1.05] text-gs-text sm:text-gs-4xl lg:text-[3.5rem]"
              >
                Interface foundations for serious product work.
              </Text>
            </Box>
            <Box className="max-w-xl pb-gs-1 lg:justify-self-end">
              <Text as="p" size="md" tone="muted" className="leading-7">
                A composed React system for teams that care about accessible
                behavior, durable tokens, and the details users meet every day.
              </Text>
              <Flex gap="3" wrap className="mt-gs-6">
                <Button onClick={() => void navigate({ to: "/components" })}>
                  Explore components
                  <Button.Trailing>
                    <ArrowRight size={16} />
                  </Button.Trailing>
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => void navigate({ to: "/docs/getting-started" })}
                >
                  <Button.Leading>
                    <BookOpen size={16} />
                  </Button.Leading>
                  Get started
                </Button>
              </Flex>
              <Flex
                align="center"
                gap="2"
                className="mt-gs-5 w-full max-w-72 border-b border-gs-border-strong py-gs-1.5"
              >
                <Text
                  as="code"
                  family="mono"
                  size="sm"
                  className="min-w-gs-0 flex-1"
                >
                  pnpm add velune@beta
                </Text>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={
                    copied ? "Install command copied" : "Copy install command"
                  }
                  onClick={copyInstall}
                >
                  <Button.Leading>
                    {copied ? <Check size={15} /> : <Clipboard size={15} />}
                  </Button.Leading>
                </Button>
              </Flex>
            </Box>
          </Box>
          <Box className="mt-gs-10 lg:mt-gs-12">
            <HomeDashboardPreview />
          </Box>
        </Box>
      </Box>

      <Box
        as="section"
        aria-label="Library highlights"
        className="border-b border-gs-border-default"
      >
        <Box className="mx-auto grid w-full max-w-[1440px] grid-cols-2 px-gs-4 sm:px-gs-6 lg:grid-cols-4 lg:px-gs-10">
          {[
            [`${components.length}`, "Production components"],
            ["7", "Focused categories"],
            ["WCAG", "Accessible by default"],
            ["0", "Runtime styling deps"],
          ].map(([value, label], index) => (
            <Box
              key={label}
              className={`home-stat py-gs-7 ${index % 2 ? "pl-5" : "pr-5"} lg:px-gs-7 lg:first:pl-0 lg:last:pr-0`}
            >
              <Text as="p" size="2xl" weight="medium">
                {value}
              </Text>
              <Text as="p" size="xs" tone="muted" className="mt-gs-1">
                {label}
              </Text>
            </Box>
          ))}
        </Box>
      </Box>

      <Box as="section" className="border-b border-gs-border-default">
        <Box className="mx-auto w-full max-w-[1440px] px-gs-4 py-gs-16 sm:px-gs-6 sm:py-gs-20 lg:px-gs-10 lg:py-gs-24">
          <Box className="grid gap-gs-12 lg:grid-cols-[0.62fr_1fr] lg:gap-gs-20">
            <Box>
              <Text as="p" size="xs" weight="medium" tone="accent">
                THE SYSTEM
              </Text>
              <Text
                as="h2"
                weight="medium"
                className="mt-gs-4 max-w-lg text-gs-3xl leading-gs-tight sm:text-gs-4xl"
              >
                Quiet surfaces. Clear decisions. No hidden behavior.
              </Text>
            </Box>
            <Box className="grid gap-px bg-gs-border-default md:grid-cols-3">
              {[
                [
                  Layers3,
                  "Composed",
                  "Primitives combine without fighting layout, state, or your product language.",
                ],
                [
                  ShieldCheck,
                  "Inclusive",
                  "Keyboard paths, focus management, and semantics are part of the component contract.",
                ],
                [
                  Zap,
                  "Deliberate",
                  "A restrained API and stable tokens keep iteration fast as the product grows.",
                ],
              ].map(([Icon, title, description]) => {
                const FeatureIcon = Icon as typeof Layers3;
                return (
                  <Box
                    key={title as string}
                    className="min-h-64 bg-gs-surface px-gs-5 py-gs-6 sm:p-gs-7"
                  >
                    <FeatureIcon size={22} strokeWidth={1.5} />
                    <Text as="h3" size="lg" weight="medium" className="mt-gs-16">
                      {title as string}
                    </Text>
                    <Text as="p" size="sm" tone="muted" className="mt-gs-3 leading-6">
                      {description as string}
                    </Text>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>
      </Box>

      <Box as="section">
        <Box className="mx-auto w-full max-w-[1440px] px-gs-4 py-gs-16 sm:px-gs-6 sm:py-gs-20 lg:px-gs-10 lg:py-gs-24">
          <Flex align="end" justify="between" gap="4" wrap className="mb-gs-8">
            <Box>
              <Text as="p" size="xs" weight="medium" tone="accent">
                START BUILDING
              </Text>
              <Text as="h2" size="3xl" weight="medium" className="mt-gs-3">
                A useful first six.
              </Text>
              <Text as="p" size="sm" tone="muted" className="mt-gs-2">
                Live examples, complete APIs, and patterns you can ship.
              </Text>
            </Box>
            <Button
              variant="ghost"
              onClick={() => void navigate({ to: "/components" })}
            >
              Browse all {components.length}
              <Button.Trailing>
                <ArrowRight size={15} />
              </Button.Trailing>
            </Button>
          </Flex>
          <Box className="border-t border-gs-border-default">
            {featuredComponents.map((item) => (
              <Link
                key={item.slug}
                to="/components/$slug"
                params={{ slug: item.slug }}
                className="group grid min-h-gs-20 grid-cols-[minmax(0,1fr)_auto] items-center gap-gs-3 border-b border-gs-border-default py-gs-4 text-gs-text no-underline sm:grid-cols-[minmax(0,0.7fr)_minmax(0,1fr)_auto] sm:px-gs-2"
              >
                <Flex align="center" gap="3">
                  <Box className="size-gs-2 bg-gs-primary transition-transform group-hover:rotate-45" />
                  <Text size="md" weight="medium">
                    {item.name}
                  </Text>
                </Flex>
                <Text size="sm" tone="muted" className="hidden sm:block">
                  {item.description}
                </Text>
                <Flex align="center" gap="4" className="justify-self-end">
                  <Text size="xs" tone="muted" className="hidden md:block">
                    {item.category}
                  </Text>
                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Flex>
              </Link>
            ))}
          </Box>
        </Box>

        <Box className="home-final-band border-t border-gs-border-default">
          <Box className="mx-auto grid w-full max-w-[1440px] gap-gs-8 px-gs-4 py-gs-12 sm:px-gs-6 lg:grid-cols-[1fr_auto] lg:items-center lg:px-gs-10 lg:py-gs-16">
            <Box>
              <Text as="p" size="xs" weight="medium" tone="accent">
                READY WHEN YOU ARE
              </Text>
              <Text as="h2" size="2xl" weight="medium" className="mt-gs-3">
                From first install to a durable interface.
              </Text>
            </Box>
            <Flex gap="3" wrap>
              <Button
                onClick={() => void navigate({ to: "/docs/getting-started" })}
              >
                Read the docs
                <Button.Trailing>
                  <ArrowRight size={16} />
                </Button.Trailing>
              </Button>
              <Button
                variant="secondary"
                onClick={() => void navigate({ to: "/templates" })}
              >
                <Button.Leading>
                  <LayoutTemplate size={16} />
                </Button.Leading>
                Use a template
              </Button>
            </Flex>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

function ComponentNavigation() {
  const navigate = useNavigate();
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const selectedSlug = pathname.startsWith("/components/")
    ? pathname.slice("/components/".length)
    : "index";
  const options = categories
    .map((category) => ({
      label: categoryLabels[category],
      options: components
        .filter((item) => item.category === category)
        .map((item) => ({ value: item.slug, label: item.name })),
    }))
    .filter((group) => group.options.length);

  return (
    <SiteSidebar
      aria-label="Component library"
      mobile={
        <Select
          value={selectedSlug}
          aria-label="Browse components"
          searchable
          fullWidth
          onValueChange={(slug) => {
            if (slug === "index") {
              void navigate({ to: "/components" });
              return;
            }
            void navigate({
              to: "/components/$slug",
              params: { slug },
            });
          }}
        >
          <Select.Trigger placeholder="Browse components" />
          <Select.Content>
            <Select.Item value="index">All components</Select.Item>
            {options.map((group) => (
              <Select.Group key={group.label}>
                <Select.GroupLabel>{group.label}</Select.GroupLabel>
                {group.options.map((option) => (
                  <Select.Item key={option.value} value={option.value}>
                    {option.label}
                  </Select.Item>
                ))}
              </Select.Group>
            ))}
          </Select.Content>
        </Select>
      }
    >
      <Link
        to="/components"
        activeOptions={{ exact: true }}
        className={`mb-gs-4 ${siteNavLinkClassName}`}
        activeProps={{
          className: siteNavLinkActiveClassName,
        }}
      >
        <Blocks size={15} /> All components
      </Link>
      {categories.map((category) => {
        const items = components.filter((item) => item.category === category);
        if (!items.length) return null;
        return (
          <Box as="section" key={category} className="mb-gs-5">
            <Text
              as="p"
              size="2xs"
              weight="medium"
              tone="muted"
              className={siteNavSectionLabelClassName}
            >
              {categoryLabels[category]}
            </Text>
            <Box display="grid" className="gap-gs-0.5">
              {items.map((item) => (
                <Link
                  key={item.slug}
                  to="/components/$slug"
                  params={{ slug: item.slug }}
                  className={siteNavLinkClassName}
                  activeProps={{
                    className: siteNavLinkActiveClassName,
                  }}
                >
                  <Text size="sm" truncate className="min-w-gs-0 flex-1">
                    {item.name}
                  </Text>
                </Link>
              ))}
            </Box>
          </Box>
        );
      })}
    </SiteSidebar>
  );
}

function ComponentWorkspace({ children }: { children: React.ReactNode }) {
  return (
    <Box className={siteWorkspaceClassName}>
      <ComponentNavigation />
      <Box className={siteWorkspaceContentClassName}>{children}</Box>
    </Box>
  );
}

function ComponentsPage() {
  return (
    <ComponentWorkspace>
      <Box className="mx-auto w-full max-w-[1320px]">
        <Box className="mb-gs-10">
          <Text as="p" size="sm" weight="medium" tone="accent">
            Library
          </Text>
          <Text as="h1" size="3xl" weight="medium" className="mt-gs-2">
            Components
          </Text>
        </Box>
        <Box className="columns-1 gap-gs-10 md:columns-2 xl:columns-3">
          {categories.map((itemCategory) => {
            const categoryComponents = components.filter(
              (item) => item.category === itemCategory,
            );
            return (
              <Box
                as="section"
                key={itemCategory}
                className="mb-gs-12 break-inside-avoid"
                aria-labelledby={`component-category-${itemCategory.replaceAll(" ", "-").toLowerCase()}`}
              >
                <Text
                  as="h2"
                  id={`component-category-${itemCategory.replaceAll(" ", "-").toLowerCase()}`}
                  size="sm"
                  weight="medium"
                  tone="muted"
                  className="mb-gs-3"
                >
                  {categoryLabels[itemCategory]}
                </Text>
                <Box className="border-t border-gs-border-default">
                  {categoryComponents.map((item) => (
                    <Link
                      key={item.slug}
                      to="/components/$slug"
                      params={{ slug: item.slug }}
                      className="group flex min-h-gs-12 items-center gap-gs-3 border-b border-gs-border-default text-gs-sm font-gs-medium text-gs-text no-underline hover:text-gs-text-accent"
                    >
                      <Text
                        size="sm"
                        weight="medium"
                        truncate
                        className="min-w-gs-0 flex-1"
                      >
                        {item.name}
                      </Text>
                      <ArrowRight
                        size={14}
                        className="text-gs-text-secondary transition-transform group-hover:translate-x-0.5 group-hover:text-gs-text-accent"
                      />
                    </Link>
                  ))}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    </ComponentWorkspace>
  );
}

function TemplateShowcase({
  code,
  previewClassName,
  children,
}: {
  code: string;
  previewClassName: string;
  children: React.ReactNode;
}) {
  const [view, setView] = useState<"preview" | "code">("preview");
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    if (!navigator.clipboard) return;
    void navigator.clipboard
      .writeText(code)
      .then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      })
      .catch(() => setCopied(false));
  };

  return (
    <Tabs
      value={view}
      onValueChange={(value) => setView(value === "code" ? "code" : "preview")}
      className="min-w-gs-0 gap-gs-0 overflow-hidden rounded-gs-sm border border-gs-border-default bg-transparent shadow-gs-1"
    >
      <Flex
        align="center"
        justify="between"
        gap="3"
        className="h-gs-12 border-b border-gs-border-default px-gs-2"
      >
        <Tabs.List aria-label="Template view">
          <Tabs.Trigger value="preview">
            <Eye size={14} aria-hidden="true" />
            Preview
          </Tabs.Trigger>
          <Tabs.Trigger value="code">
            <Code2 size={14} aria-hidden="true" />
            Code
          </Tabs.Trigger>
        </Tabs.List>
        {view === "code" ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label={copied ? "Template code copied" : "Copy template code"}
            disabled={!code}
            onClick={copyCode}
          >
            <Button.Leading>
              {copied ? <Check size={15} /> : <Clipboard size={15} />}
            </Button.Leading>
          </Button>
        ) : null}
      </Flex>
      <Tabs.Panel value="preview" className="!py-gs-0">
        <Box className={previewClassName}>{children}</Box>
      </Tabs.Panel>
      <Tabs.Panel value="code" className="!py-gs-0">
        {code ? (
          <SyntaxHighlighter
            code={code}
            className="max-h-170 min-h-130 overflow-auto !rounded-gs-none !border-0 p-gs-4 sm:p-gs-5"
          />
        ) : (
          <Box
            role="status"
            aria-label="Loading template source"
            className="grid min-h-130 place-items-center"
          >
            <Box className="size-gs-8 animate-pulse rounded-gs-full bg-gs-surface-mist" />
          </Box>
        )}
      </Tabs.Panel>
    </Tabs>
  );
}

function TemplateNavigation() {
  const navigate = useNavigate();
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const value =
    pathname === "/templates/sidebar" ? "/templates/sidebar" : "/templates";

  return (
    <SiteSidebar
      aria-label="Template library"
      mobile={
        <Select
          value={value}
          aria-label="Browse templates"
          fullWidth
          onValueChange={(to) => {
            void navigate({
              to: to as "/templates" | "/templates/sidebar",
            });
          }}
        >
          <Select.Trigger placeholder="Browse templates" />
          <Select.Content>
            <Select.Item value="/templates">Login</Select.Item>
            <Select.Item value="/templates/sidebar">Sidebar</Select.Item>
          </Select.Content>
        </Select>
      }
    >
      <Box display="grid" className="gap-gs-0.5">
        <Link
          to="/templates"
          activeOptions={{ exact: true }}
          className={siteNavLinkClassName}
          activeProps={{
            className: siteNavLinkActiveClassName,
          }}
        >
          <LockKeyhole size={15} />
          Login
        </Link>
        <Link
          to="/templates/sidebar"
          className={siteNavLinkClassName}
          activeProps={{
            className: siteNavLinkActiveClassName,
          }}
        >
          <LayoutTemplate size={15} />
          Sidebar
        </Link>
      </Box>
    </SiteSidebar>
  );
}

function TemplateWorkspace({ children }: { children: React.ReactNode }) {
  return (
    <Box className={siteWorkspaceClassName}>
      <TemplateNavigation />
      <Box className={siteWorkspaceContentClassName}>{children}</Box>
    </Box>
  );
}

function TemplatesPage() {
  return (
    <TemplateWorkspace>
      <LoginTemplate />
    </TemplateWorkspace>
  );
}

function SidebarTemplatePage() {
  return (
    <TemplateWorkspace>
      <SidebarTemplate />
    </TemplateWorkspace>
  );
}

function LoginTemplate() {
  const loginTemplateSource = useTemplateSource("loginTemplateSource");

  return (
    <Box>
      <PageHeading
        eyebrow="Templates"
        title="Login"
        description="A focused sign-in flow with product context and account recovery."
      />

      <Box as="section" aria-labelledby="login-template-title">
        <Flex
          direction="column"
          align="start"
          justify="between"
          gap="5"
          className="mb-gs-5 sm:flex-row sm:items-end"
        >
          <Box>
            <Flex align="center" gap="2">
              <Text
                as="h2"
                id="login-template-title"
                size="xl"
                weight="medium"
              >
                Implementation
              </Text>
              <Tag size="sm" tone="info">
                Authentication
              </Tag>
            </Flex>
          </Box>
          <Flex gap="2" wrap>
            {["Card", "Input", "Checkbox", "Button"].map((name) => (
              <Badge key={name}>{name}</Badge>
            ))}
          </Flex>
        </Flex>

        <TemplateShowcase
          code={loginTemplateSource}
          previewClassName="grid min-h-155 min-w-gs-0 grid-cols-1 md:grid-cols-[minmax(260px,0.8fr)_minmax(420px,1.2fr)]"
        >
          <Box
            as="section"
            className="flex min-h-65 flex-col justify-between border-b border-gs-border-default p-[clamp(var(--space-6),5vw,var(--space-12))] md:min-h-gs-0 md:border-r md:border-b-0"
          >
            <Box>
              <Logo />
              <Text
                as="p"
                size="2xl"
                weight="medium"
                className="mt-gs-8 max-w-sm leading-9"
              >
                A calm workspace for focused product teams.
              </Text>
              <Text as="p" size="sm" tone="muted" className="mt-gs-3 max-w-sm leading-6">
                Review components, align on decisions, and keep every release
                connected to the design system.
              </Text>
            </Box>
            <Text as="p" size="xs" tone="muted">
              Velune workspace · Secure sign in
            </Text>
          </Box>
          <Box
            as="section"
            className="grid place-items-center p-gs-5 md:p-[clamp(var(--space-5),5vw,var(--space-12))]"
            aria-label="Login template preview"
          >
            <Card variant="elevated" className="w-full max-w-105">
              <Card.Header>
                <Card.Title>Welcome back</Card.Title>
                <Card.Description>
                  Sign in to continue to your workspace.
                </Card.Description>
              </Card.Header>
              <Card.Body>
                <Stack gap="4">
                  <Input type="email" placeholder="you@company.com" fullWidth>
                    <Input.Label>Work email</Input.Label>
                  </Input>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    fullWidth
                  >
                    <Input.Label>Password</Input.Label>
                  </Input>
                  <Flex
                    direction="column"
                    align="start"
                    gap="2"
                    className="sm:flex-row sm:items-center sm:justify-between sm:gap-gs-4"
                  >
                    <Checkbox defaultChecked>Remember me</Checkbox>
                    <Button variant="ghost" size="sm">
                      Forgot password?
                    </Button>
                  </Flex>
                  <Button type="button" fullWidth>
                    <Button.Leading>
                      <LockKeyhole size={16} />
                    </Button.Leading>
                    Sign in
                  </Button>
                  <Divider tone="subtle">or</Divider>
                  <Button type="button" variant="secondary" fullWidth>
                    Continue with SSO
                  </Button>
                </Stack>
              </Card.Body>
              <Card.Footer align="center">
                <Text size="sm" tone="muted">
                  New to Velune?{" "}
                  <Button
                    as="a"
                    href="#create-account"
                    variant="text"
                    size="sm"
                    className="h-auto !min-h-gs-0 !p-gs-0 align-baseline"
                  >
                    Create an account
                  </Button>
                </Text>
              </Card.Footer>
            </Card>
          </Box>
        </TemplateShowcase>
      </Box>
    </Box>
  );
}

function SidebarTemplate() {
  const sidebarTemplateSource = useTemplateSource("sidebarTemplateSource");

  return (
    <Box>
      <PageHeading
        eyebrow="Templates"
        title="Sidebar"
        description="Persistent product navigation with workspace and account context."
      />
      <Box as="section" aria-labelledby="sidebar-template-title">
        <Flex
          direction="column"
          align="start"
          justify="between"
          gap="5"
          className="mb-gs-5 sm:flex-row sm:items-end"
        >
          <Box>
            <Flex align="center" gap="2">
              <Text
                as="h2"
                id="sidebar-template-title"
                size="xl"
                weight="medium"
              >
                Implementation
              </Text>
              <Tag size="sm" tone="success">
                Application shell
              </Tag>
            </Flex>
          </Box>
          <Flex gap="2" wrap>
            {[
              "Sidebar",
              "Dropdown",
              "Card",
              "List",
              "Progress",
              "Avatar",
            ].map((name) => (
              <Badge key={name}>{name}</Badge>
            ))}
          </Flex>
        </Flex>

        <TemplateShowcase
          code={sidebarTemplateSource}
          previewClassName="relative min-h-155 min-w-gs-0 overflow-hidden"
        >
          <Sidebar.Provider
            enableKeyboardShortcut={false}
            className="min-h-155"
          >
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
                          <Dropdown.SectionTitle>
                            Workspaces
                          </Dropdown.SectionTitle>
                          <Dropdown.Item value="product">
                            Product workspace
                            <Dropdown.Item.Description>
                              8 members
                            </Dropdown.Item.Description>
                          </Dropdown.Item>
                          <Dropdown.Item value="design">
                            Design system
                          </Dropdown.Item>
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
                        <Sidebar.MenuButton
                          as="a"
                          href="#overview"
                          current
                          tooltip="Overview"
                        >
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
                        <Sidebar.MenuButton
                          as="a"
                          href="#team"
                          tooltip="Team"
                        >
                          <Users size={16} />
                          <span>Team</span>
                        </Sidebar.MenuButton>
                        <Sidebar.MenuBadge>8</Sidebar.MenuBadge>
                      </Sidebar.MenuItem>
                      <Sidebar.MenuItem>
                        <Sidebar.MenuButton
                          as="a"
                          href="#activity"
                          tooltip="Activity"
                        >
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
                        <Sidebar.MenuButton
                          as="a"
                          href="#settings"
                          tooltip="Settings"
                        >
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
                          <Dropdown.SectionTitle>
                            maya@velune.dev
                          </Dropdown.SectionTitle>
                          <Dropdown.Item value="profile">
                            Profile
                          </Dropdown.Item>
                          <Dropdown.Item value="preferences">
                            Preferences
                          </Dropdown.Item>
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
                    <Text
                      as="p"
                      size="xs"
                      tone="muted"
                      className="hidden sm:block"
                    >
                      Thursday, July 16
                    </Text>
                  </Box>
                </Flex>
                <Flex align="center" gap="2">
                  <Button variant="ghost" size="sm" aria-label="Notifications">
                    <Button.Leading>
                      <Bell size={16} />
                    </Button.Leading>
                  </Button>
                  <Box className="sm:hidden">
                    <Avatar name="Maya Chen" size="sm" />
                  </Box>
                  <Box className="hidden sm:block">
                    <Avatar.Group max={3} size="sm">
                      <Avatar name="Maya Chen" />
                      <Avatar name="Ada Lovelace" />
                      <Avatar name="Grace Hopper" />
                      <Avatar name="Alan Turing" />
                    </Avatar.Group>
                  </Box>
                </Flex>
              </Flex>
              <Box className="flex-1 p-gs-5 sm:p-gs-6">
                <Flex align="start" justify="between" gap="4" wrap>
                  <Box>
                    <Text as="h3" size="xl" weight="medium">
                      Welcome back, Maya
                    </Text>
                    <Text as="p" size="sm" tone="muted" className="mt-gs-1">
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
                      <Card.Action>
                        <Folder
                          size={16}
                          className="text-gs-text-secondary"
                        />
                      </Card.Action>
                    </Card.Header>
                    <Card.Body>
                      <Text size="2xl" weight="medium">
                        12
                      </Text>
                      <Text as="p" size="xs" tone="muted" className="mt-gs-1">
                        3 updated today
                      </Text>
                    </Card.Body>
                  </Card>
                  <Card variant="filled" size="sm">
                    <Card.Header>
                      <Card.Description>Team members</Card.Description>
                      <Card.Action>
                        <Users
                          size={16}
                          className="text-gs-text-secondary"
                        />
                      </Card.Action>
                    </Card.Header>
                    <Card.Body>
                      <Text size="2xl" weight="medium">
                        8
                      </Text>
                      <Text as="p" size="xs" tone="muted" className="mt-gs-1">
                        2 awaiting review
                      </Text>
                    </Card.Body>
                  </Card>
                  <Card
                    variant="filled"
                    size="sm"
                    className="col-span-2 sm:col-span-1"
                  >
                    <Card.Header>
                      <Card.Description>Storage</Card.Description>
                      <Card.Action>
                        <Badge tone="success">Healthy</Badge>
                      </Card.Action>
                    </Card.Header>
                    <Card.Body>
                      <Progress
                        value={68}
                        size="sm"
                        aria-label="Storage used"
                      />
                      <Text as="p" size="xs" tone="muted" className="mt-gs-2">
                        68 GB of 100 GB used
                      </Text>
                    </Card.Body>
                  </Card>
                </Box>

                <Box
                  as="section"
                  className="mt-gs-6"
                  aria-labelledby="recent-projects-title"
                >
                  <Flex align="center" justify="between" gap="3">
                    <Text id="recent-projects-title" as="h4" weight="medium">
                      Recent projects
                    </Text>
                    <Button variant="text" size="sm">
                      View all
                    </Button>
                  </Flex>
                  <List className="mt-gs-2" aria-label="Recent projects">
                    {[
                      ["Atlas mobile", "Updated 12 minutes ago", "In review"],
                      ["Checkout refresh", "Updated yesterday", "On track"],
                      ["Design tokens", "Updated Jul 14", "Planning"],
                    ].map(([name, detail, status]) => (
                      <List.Item key={name} interactive>
                        <List.Leading>
                          <Folder size={16} />
                        </List.Leading>
                        <List.Content>
                          <List.Title>{name}</List.Title>
                          <List.Description>{detail}</List.Description>
                        </List.Content>
                        <List.Trailing>
                          <Tag size="sm">{status}</Tag>
                        </List.Trailing>
                      </List.Item>
                    ))}
                  </List>
                </Box>
              </Box>
            </Box>
          </Sidebar.Provider>
        </TemplateShowcase>
      </Box>
    </Box>
  );
}

type ComponentDetailData = {
  slug: string;
  examples: ComponentExample[];
  apiReference: ComponentApiReference;
};

const emptyComponentApiReference: ComponentApiReference = {
  groups: [],
  aliases: [],
};

function ComponentDetailPage() {
  const { slug } = componentRoute.useParams();
  const entry = components.find((item) => item.slug === slug);
  const [copied, setCopied] = useState(false);
  const [detailData, setDetailData] = useState<ComponentDetailData | null>(null);

  useEffect(() => {
    let active = true;

    if (!entry) {
      setDetailData(null);
      return () => {
        active = false;
      };
    }

    void Promise.all([
      import("./component-examples"),
      import("./api-reference"),
    ])
      .then(([examplesModule, apiModule]) => {
        if (!active) return;
        const apiReference = apiModule.getComponentApiReference(entry.slug);
        if (
          import.meta.env.DEV &&
          !apiReference.groups.length &&
          !apiReference.aliases.length
        ) {
          console.warn(
            `[docs] No API reference parsed for "${entry.slug}". ` +
              `Type sources loaded: ${apiModule.getApiTypeSourceCount?.() ?? "?"}.`,
          );
        }
        setDetailData({
          slug: entry.slug,
          examples: examplesModule.getComponentExamples(entry),
          apiReference,
        });
      })
      .catch((error: unknown) => {
        if (!active) return;
        console.error(
          `[docs] Failed to load component detail for "${entry.slug}"`,
          error,
        );
        setDetailData({
          slug: entry.slug,
          examples: [],
          apiReference: emptyComponentApiReference,
        });
      });

    return () => {
      active = false;
    };
  }, [entry]);

  if (!entry)
    return (
      <EmptyState
        title="Component not found"
        description="This component is not registered in the current release."
      />
    );
  const code = componentImport(entry);
  const detailLoaded = detailData?.slug === entry.slug;
  const examples = detailLoaded ? detailData.examples : [];
  const apiReference = detailLoaded
    ? detailData.apiReference
    : emptyComponentApiReference;
  return (
    <ComponentWorkspace>
      <Box className="mx-auto w-full max-w-[1320px]">
        <Box
          display="grid"
          className="gap-[clamp(var(--space-8),4vw,var(--space-12))] xl:grid-cols-[minmax(0,1fr)_180px]"
        >
          <Box as="article" className="min-w-gs-0">
            <Flex align="start" gap="4" className="mb-gs-8">
              <Box className="min-w-gs-0 flex-1">
                <Flex align="center" gap="2" className="mb-gs-3">
                  <Link
                    to="/components"
                    className="text-gs-sm text-gs-text-secondary no-underline hover:text-gs-text"
                  >
                    Components
                  </Link>
                  <ChevronRight size={14} className="text-gs-text-secondary" />
                  <Text size="sm">{entry.name}</Text>
                </Flex>
                <Flex align="center" gap="3" wrap>
                  <Text as="h1" size="3xl" weight="medium">
                    {entry.name}
                  </Text>
                  {entry.status ? (
                    <Tag tone={entry.status === "New" ? "success" : "info"}>
                      {entry.status}
                    </Tag>
                  ) : null}
                </Flex>
                <Text
                  as="p"
                  size="md"
                  tone="muted"
                  className="mt-gs-3 max-w-2xl leading-7"
                >
                  {entry.description}
                </Text>
              </Box>
              <Badge>{entry.category}</Badge>
            </Flex>
            <Box as="section" id="installation" className="mb-gs-10 scroll-mt-36">
              <SectionHeading
                title="Import"
                description="Import from the dedicated component entry."
              />
              <Flex
                align="center"
                gap="3"
                className="rounded-gs-sm border border-gs-border-default bg-gs-surface-mist px-gs-4 py-gs-3 text-gs-text"
              >
                <InlineSyntaxHighlighter
                  code={code}
                  className="min-w-gs-0 flex-1 overflow-x-auto whitespace-nowrap"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-none text-gs-text-secondary hover:bg-[color-mix(in_oklab,var(--color-canvas)_10%,transparent)] hover:text-gs-text"
                  aria-label={copied ? "Import copied" : "Copy import"}
                  onClick={() => {
                    if (!navigator.clipboard) return;
                    void navigator.clipboard
                      .writeText(code)
                      .then(() => {
                        setCopied(true);
                        window.setTimeout(() => setCopied(false), 1600);
                      })
                      .catch(() => setCopied(false));
                  }}
                >
                  <Button.Leading>
                    {copied ? <Check size={16} /> : <Clipboard size={16} />}
                  </Button.Leading>
                </Button>
              </Flex>
            </Box>
            <Box as="section" id="examples" className="mb-gs-12 scroll-mt-36">
              <SectionHeading
                title="Examples"
                description="Documented patterns with interactive previews and corresponding source."
              />
              <Box>
                {detailLoaded ? (
                  examples.map((example) => (
                    <ComponentExampleBlock
                      key={example.id}
                      entry={entry}
                      example={example}
                    />
                  ))
                ) : (
                  <Box
                    role="status"
                    aria-label="Loading examples"
                    className="grid min-h-60 place-items-center rounded-gs-sm border border-gs-border-default bg-gs-surface"
                  >
                    <Box className="size-gs-8 animate-pulse rounded-gs-full bg-gs-surface-mist" />
                  </Box>
                )}
              </Box>
            </Box>
            <Box id="api-reference" className="scroll-mt-36">
              <ApiReference entry={entry} reference={apiReference} />
            </Box>
            <Box as="section" id="usage-guidance" className="scroll-mt-36">
              <SectionHeading
                title="Usage guidance"
                description="Keep behavior predictable across product surfaces."
              />
              <Box display="grid" className="gap-gs-3 md:grid-cols-2">
                <Guidance
                  good
                  title="Use semantic props"
                  text="Choose variants and states by meaning instead of overriding internal colors."
                />
                <Guidance
                  good
                  title="Compose deliberately"
                  text="Pair components with layout primitives and preserve their native semantics."
                />
                <Guidance
                  title="Avoid hard-coded visuals"
                  text="Use theme tokens for spacing, color, radius, shadow, and motion."
                />
                <Guidance
                  title="Do not hide state"
                  text="Loading, disabled, selected, and invalid states should remain visible."
                />
              </Box>
            </Box>
          </Box>
          <Box
            as="aside"
            className="sticky top-25 hidden self-start border-l border-gs-border-default pl-4 xl:grid xl:gap-gs-1 [&_a]:overflow-hidden [&_a]:py-gs-1 [&_a]:text-gs-xs [&_a]:text-ellipsis [&_a]:whitespace-nowrap [&_a]:text-gs-text-secondary [&_a]:no-underline [&_a:hover]:text-gs-text"
            aria-label="On this page"
          >
            <Text as="p" size="sm" weight="medium" className="mb-gs-2">
              On this page
            </Text>
            <Button
              as="a"
              href="#installation"
              variant="text"
              size="sm"
              className="h-auto !min-h-gs-0 justify-start !p-gs-0"
            >
              Import
            </Button>
            <Button
              as="a"
              href="#examples"
              variant="text"
              size="sm"
              className="h-auto !min-h-gs-0 justify-start !p-gs-0"
            >
              Examples
            </Button>
            {examples.map((example) => (
              <Button
                as="a"
                key={example.id}
                href={`#${example.id}`}
                variant="text"
                size="sm"
                className="h-auto !min-h-gs-0 justify-start !p-gs-0 pl-3"
              >
                {example.title}
              </Button>
            ))}
            {apiReference.groups.length || apiReference.aliases.length ? (
              <Button
                as="a"
                href="#api-reference"
                variant="text"
                size="sm"
                className="h-auto !min-h-gs-0 justify-start !p-gs-0"
              >
                API reference
              </Button>
            ) : null}
            <Button
              as="a"
              href="#usage-guidance"
              variant="text"
              size="sm"
              className="h-auto !min-h-gs-0 justify-start !p-gs-0"
            >
              Usage guidance
            </Button>
          </Box>
        </Box>
      </Box>
    </ComponentWorkspace>
  );
}

function ApiReference({
  entry,
  reference,
}: {
  entry: (typeof components)[number];
  reference: ComponentApiReference;
}) {
  if (!reference.groups.length && !reference.aliases.length) return null;

  return (
    <Box as="section" className="mb-gs-12 min-w-gs-0" aria-label="API reference">
      <SectionHeading
        title="API reference"
        description={`Public props and types exported for ${entry.name}.`}
      />
      {reference.aliases.length ? (
        <Box className="mb-gs-8">
          <Text as="h3" size="sm" weight="medium" className="mb-gs-3">
            Public types
          </Text>
          <Box display="grid" className="gap-gs-2">
            {reference.aliases.map((alias) => (
              <Box
                key={alias.name}
                className="overflow-x-auto rounded-gs-sm bg-gs-surface-mist px-gs-4 py-gs-3"
                tabIndex={0}
                aria-label={`${alias.name} type definition`}
              >
                <Text
                  as="code"
                  family="mono"
                  size="sm"
                  className="whitespace-nowrap"
                >
                  <Text as="span" size="sm" tone="accent">
                    {alias.name}
                  </Text>{" "}
                  = {alias.value}
                </Text>
              </Box>
            ))}
          </Box>
        </Box>
      ) : null}
      <Box display="grid" className="min-w-gs-0 gap-gs-9">
        {reference.groups.map((group) => (
          <Box
            as="section"
            key={group.name}
            className="min-w-gs-0"
            aria-labelledby={`${group.name}-api-title`}
          >
            <Flex align="center" gap="2" wrap className="mb-gs-3">
              <Text
                as="h3"
                id={`${group.name}-api-title`}
                size="sm"
                weight="medium"
              >
                {group.name}
              </Text>
              {group.inheritance ? (
                <Text as="code" family="mono" size="xs" tone="muted">
                  {group.inheritance}
                </Text>
              ) : null}
            </Flex>
            <Table
              columns={[
                {
                  key: "name",
                  title: "Property",
                  dataIndex: "name",
                  width: "18%",
                  render: (_value, prop) => (
                    <Flex align="center" gap="1">
                      <Text as="code" family="mono" size="sm" tone="accent">
                        {prop.name}
                      </Text>
                      {prop.required ? (
                        <Text size="sm" tone="error" aria-label="required">
                          *
                        </Text>
                      ) : null}
                    </Flex>
                  ),
                },
                {
                  key: "type",
                  title: "Type",
                  dataIndex: "type",
                  width: "30%",
                  render: (_value, prop) => (
                    <Text
                      as="code"
                      family="mono"
                      size="xs"
                      className="break-words text-gs-text"
                    >
                      {prop.type}
                    </Text>
                  ),
                },
                {
                  key: "defaultValue",
                  title: "Default",
                  dataIndex: "defaultValue",
                  width: "14%",
                  render: (_value, prop) => (
                    <Text size="sm" tone="muted">
                      {prop.defaultValue ?? "—"}
                    </Text>
                  ),
                },
                {
                  key: "description",
                  title: "Description",
                  dataIndex: "description",
                  render: (_value, prop) => (
                    <Text size="sm" tone="muted" className="leading-6">
                      {prop.description ?? "—"}
                    </Text>
                  ),
                },
              ]}
              dataSource={group.props}
              rowKey="name"
              size="sm"
              scroll={{ x: 760 }}
            >
              <Table.Caption>{`${group.name} properties`}</Table.Caption>
            </Table>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

function ComponentExampleBlock({
  entry,
  example,
}: {
  entry: (typeof components)[number];
  example: ComponentExample;
}) {
  const [copied, setCopied] = useState(false);
  const [view, setView] = useState<"preview" | "code">("preview");

  const copyCode = () => {
    if (!navigator.clipboard) return;
    void navigator.clipboard
      .writeText(example.code)
      .then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      })
      .catch(() => setCopied(false));
  };

  return (
    <Box
      as="section"
      id={example.id}
      className="mb-14 scroll-mt-36 last:mb-gs-0"
      aria-labelledby={`${example.id}-title`}
    >
      <Box className="mb-gs-4">
        <Text as="h3" id={`${example.id}-title`} size="md" weight="medium">
          {example.title}
        </Text>
        <Text as="p" size="sm" tone="muted" className="mt-gs-1 leading-6">
          {example.description}
        </Text>
      </Box>
      <Tabs
        value={view}
        onValueChange={(value) =>
          setView(value === "code" ? "code" : "preview")
        }
        className="gap-gs-0 overflow-hidden rounded-gs-sm border border-gs-border-default bg-gs-surface"
      >
        <Flex
          align="center"
          justify="between"
          gap="3"
          className="h-gs-12 border-b border-gs-border-default px-gs-2"
        >
          <Tabs.List aria-label="Example content">
            <Tabs.Trigger value="preview">
              <Eye size={14} aria-hidden="true" />
              Preview
            </Tabs.Trigger>
            <Tabs.Trigger value="code">
              <Code2 size={14} aria-hidden="true" />
              Code
            </Tabs.Trigger>
          </Tabs.List>
          {view === "code" ? (
            <Button
              variant="ghost"
              size="sm"
              aria-label={
                copied
                  ? `${example.title} code copied`
                  : `Copy ${example.title} code`
              }
              onClick={copyCode}
            >
              <Button.Leading>
                {copied ? <Check size={15} /> : <Clipboard size={15} />}
              </Button.Leading>
            </Button>
          ) : null}
        </Flex>
        <Tabs.Panel value="preview" className="!py-gs-0">
          <Flex
            align="center"
            justify="center"
            data-testid="component-preview"
            className="min-h-60 overflow-hidden bg-gs-surface p-gs-5 sm:min-h-75 sm:p-[clamp(var(--space-5),5vw,var(--space-12))]"
          >
            <Suspense
              fallback={
                <Box
                  role="status"
                  aria-label="Loading preview"
                  className="size-gs-8 animate-pulse rounded-gs-full bg-gs-surface-mist"
                />
              }
            >
              <LazyComponentPreview entry={entry} exampleId={example.id} />
            </Suspense>
          </Flex>
        </Tabs.Panel>
        <Tabs.Panel value="code" className="!py-gs-0">
          <SyntaxHighlighter
            code={example.code}
            className="max-h-60 overflow-auto !rounded-gs-none !border-0 p-gs-4"
          />
        </Tabs.Panel>
      </Tabs>
    </Box>
  );
}

function TokensPage() {
  const colors = [
    { name: "Canvas", token: "--color-canvas" },
    { name: "Surface", token: "--color-surface" },
    { name: "Raised", token: "--color-surface-raised" },
    { name: "Mist", token: "--color-surface-mist" },
    { name: "Primary", token: "--color-primary" },
    { name: "Primary hover", token: "--color-primary-hover" },
    { name: "Text", token: "--color-text-primary" },
    { name: "Text secondary", token: "--color-text-secondary" },
    { name: "Border", token: "--color-border-default" },
    { name: "Success", token: "--color-success" },
    { name: "Warning", token: "--color-warning" },
    { name: "Error", token: "--color-error" },
  ];
  const spacing = [
    ["0", "0"],
    ["0.5", "2px"],
    ["1", "4px"],
    ["1.5", "6px"],
    ["2", "8px"],
    ["2.5", "10px"],
    ["3", "12px"],
    ["4", "16px"],
    ["5", "20px"],
    ["6", "24px"],
    ["7", "28px"],
    ["8", "32px"],
    ["9", "36px"],
    ["10", "40px"],
    ["11", "44px"],
    ["12", "48px"],
    ["16", "64px"],
    ["20", "80px"],
    ["24", "96px"],
    ["26", "104px"],
  ] as const;
  const foundations = [
    {
      title: "Radius",
      values: [
        "--radius-none",
        "--radius-xs",
        "--radius-sm",
        "--radius-lg",
        "--radius-full",
      ],
    },
    {
      title: "Elevation",
      values: [
        "--shadow-level-0",
        "--shadow-level-1",
        "--shadow-level-2",
        "--shadow-level-3",
      ],
    },
    {
      title: "Motion",
      values: ["--duration-fast", "--duration-normal", "--duration-slow"],
    },
  ];
  return (
    <Box>
      <PageHeading
        eyebrow="Foundations"
        title="Design tokens"
        description="The public semantic contract behind every Velune component and theme."
      />
      <SectionHeading
        title="Surface and color"
        description="Canvas and layered surfaces establish hierarchy; primary marks interaction and status colors keep their meaning."
      />
      <Box display="grid" className="mb-gs-12 gap-gs-3 sm:grid-cols-2 lg:grid-cols-4">
        {colors.map((color) => (
          <Box
            key={color.token}
            className="grid min-w-gs-0 gap-gs-1 rounded-gs-sm border border-gs-border-default bg-gs-surface p-gs-4"
          >
            <Box
              className="mb-gs-2 h-gs-16 rounded-gs-xs border border-gs-border-default"
              style={{ background: `var(${color.token})` }}
            />
            <Text as="p" size="sm" weight="medium">
              {color.name}
            </Text>
            <Text as="code" family="mono" size="xs" tone="muted">
              {color.token}
            </Text>
          </Box>
        ))}
      </Box>
      <SectionHeading
        title="Layout spacing"
        description="Use numeric space steps with utilities like gap-gs-4 or layout props such as gap=&quot;4&quot;. Half-steps (0.5, 1.5, 2.5) cover optical corrections."
      />
      <Box
        display="grid"
        className="mb-gs-12 gap-gs-4 rounded-gs-sm border border-gs-border-default bg-gs-surface p-gs-5 shadow-gs-1 sm:p-gs-6"
      >
        {spacing.map(([step, value]) => (
          <Flex key={step} align="center" gap="4">
            <Text
              as="code"
              family="mono"
              size="xs"
              tone="muted"
              className="w-28 flex-none"
            >
              --space-{step}
            </Text>
            <Flex
              align="center"
              className="h-gs-4 min-w-gs-0 flex-1 rounded-gs-xs bg-gs-surface-mist"
            >
              <Box
                as="span"
                className="block h-gs-2 rounded-gs-xs bg-gs-primary"
                style={{ width: value === "0" ? 0 : `min(${value}, 100%)` }}
              />
            </Flex>
            <Text
              as="code"
              family="mono"
              size="xs"
              tone="muted"
              align="end"
              className="w-gs-10 flex-none"
            >
              {value}
            </Text>
          </Flex>
        ))}
      </Box>
      <SectionHeading
        title="Shape, elevation, and motion"
        description="Five radii, four elevation levels, and three calm durations complete the foundation."
      />
      <Box display="grid" className="gap-gs-8 lg:grid-cols-3">
        {foundations.map((group) => (
          <Box as="section" key={group.title}>
            <Text as="h3" size="sm" weight="medium" className="mb-gs-3">
              {group.title}
            </Text>
            <Box
              display="grid"
              className="overflow-hidden rounded-gs-sm border border-gs-border-default bg-gs-surface [&_code]:border-b [&_code]:border-gs-border-default [&_code]:p-gs-4 [&_code]:text-gs-xs [&_code]:text-gs-text-secondary [&_code:last-child]:border-b-0"
            >
              {group.values.map((value) => (
                <Text as="code" family="mono" size="xs" tone="muted" key={value}>
                  {value}
                </Text>
              ))}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

function GuidesPage() {
  return (
    <Box>
      <PageHeading
        eyebrow="Documentation"
        title="Get started"
        description="Install the packages, load the global theme, and ship your first component."
      />
      <Box display="grid" className="gap-gs-8 lg:grid-cols-[1fr_280px]">
        <Stack gap="9">
          <GuideStep number="01" title="Install packages">
            <CodeBlock code="pnpm add velune@beta" language="bash" />
          </GuideStep>
          <GuideStep number="02" title="Load the theme">
            <CodeBlock
              code={
                '@import "tailwindcss";\n@import "velune/react/theme/tokens.css";\n@import "velune/react/theme/base.css";\n@import "velune/react/tailwind.css";'
              }
              language="css"
            />
          </GuideStep>
          <GuideStep number="03" title="Add the provider">
            <CodeBlock
              code={
                'import { ThemeProvider } from "velune/react";\nimport "./index.css";\n\nexport function App() {\n  return (\n    <ThemeProvider theme="system">\n      <Routes />\n    </ThemeProvider>\n  );\n}'
              }
            />
          </GuideStep>
          <GuideStep number="04" title="Compose components">
            <CodeBlock
              code={
                'import { Button, Form, Input, Stack } from "velune/react";\n\nexport function SignupForm() {\n  return (\n    <Form onSubmit={() => undefined}>\n      <Stack gap="4">\n        <Form.Item\n          name="email"\n          rules={[{ required: true, message: "Email is required" }]}\n        >\n          <Input type="email" fullWidth>\n            <Input.Label>Work email</Input.Label>\n          </Input>\n        </Form.Item>\n        <Button type="submit" fullWidth>\n          Continue\n        </Button>\n      </Stack>\n    </Form>\n  );\n}'
              }
            />
            <Text as="p" size="sm" tone="muted" className="mt-gs-3 leading-6">
              Use numeric spacing like gap=&quot;4&quot;, Button tone=&quot;danger&quot;
              for destructive actions, and see Form for Standard Schema
              validation, Select/Combobox for Empty vs NoMatches, and Button for
              asChild and buttonClasses().
            </Text>
          </GuideStep>
          <GuideStep number="05" title="Enable agent skills">
            <Text as="p" size="sm" tone="muted" className="mt-gs-3 leading-6">
              Install the repository skill to give compatible coding agents
              current Velune setup, component, theming, and composition guidance.
            </Text>
            <CodeBlock code="npx skills add kxpw/Velune" language="bash" />
            <Text as="p" size="sm" tone="muted" className="mt-gs-3 leading-6">
              Skills are discovered automatically. Invoke $velune-react directly
              when you want to force Velune-specific guidance.
            </Text>
          </GuideStep>
        </Stack>
        <Box
          as="aside"
          className="h-fit rounded-gs-sm border border-gs-border-default bg-gs-surface p-gs-5 shadow-gs-1"
        >
          <Text weight="medium">Requirements</Text>
          <List size="sm" divided={false} hoverable={false} className="mt-gs-4">
            <List.Item>React 18 or newer</List.Item>
            <List.Item>TypeScript recommended</List.Item>
            <List.Item>Global token stylesheet</List.Item>
            <List.Item>One ThemeProvider root</List.Item>
          </List>
        </Box>
      </Box>
    </Box>
  );
}

function SectionHeading({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <Flex align="end" justify="between" gap="4" className="mb-gs-5">
      <Box>
        <Text as="h2" size="lg" weight="medium">
          {title}
        </Text>
        <Text as="p" size="sm" tone="muted" className="mt-gs-1">
          {description}
        </Text>
      </Box>
      {action}
    </Flex>
  );
}
function PageHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <Box className="mb-gs-9 pb-gs-8">
      <Text as="p" size="sm" weight="medium" tone="accent" className="mb-gs-2">
        {eyebrow}
      </Text>
      <Text as="h1" size="3xl" weight="medium">
        {title}
      </Text>
      <Text as="p" size="md" tone="muted" className="mt-gs-3 max-w-2xl leading-7">
        {description}
      </Text>
    </Box>
  );
}
function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Box display="grid" className="min-h-80 place-items-center text-center">
      <Stack align="center" gap="2">
        <PackageOpen size={28} className="mb-gs-2 text-gs-text-secondary" />
        <Text as="h2" weight="medium">
          {title}
        </Text>
        <Text as="p" size="sm" tone="muted">
          {description}
        </Text>
      </Stack>
    </Box>
  );
}
function Guidance({
  good = false,
  title,
  text,
}: {
  good?: boolean;
  title: string;
  text: string;
}) {
  return (
    <Flex gap="3" className="rounded-gs-sm bg-gs-surface-mist p-gs-4">
      <Box
        as="span"
        className={`mt-gs-0.5 grid size-gs-5 flex-none place-items-center rounded-gs-full ${good ? "bg-gs-success" : "bg-gs-text-secondary"} text-white`}
      >
        {good ? <Check size={12} /> : <X size={12} />}
      </Box>
      <Box>
        <Text as="h3" size="sm" weight="medium">
          {title}
        </Text>
        <Text as="p" size="sm" tone="muted" className="mt-gs-1 leading-6">
          {text}
        </Text>
      </Box>
    </Flex>
  );
}
function CodeBlock({
  code,
  language = "tsx",
}: {
  code: string;
  language?: "bash" | "tsx" | "css";
}) {
  return (
    <SyntaxHighlighter
      code={code}
      language={language}
      className="mt-gs-4 p-gs-4 leading-6"
    />
  );
}
function GuideStep({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Box as="section">
      <Flex align="center" gap="3">
        <Text as="span" size="xs" weight="medium" tone="accent">
          {number}
        </Text>
        <Text as="h2" size="lg" weight="medium">
          {title}
        </Text>
      </Flex>
      {children}
    </Box>
  );
}

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});
const componentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/components",
  component: ComponentsPage,
});
const componentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/components/$slug",
  component: ComponentDetailPage,
});
const tokensRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/tokens",
  component: TokensPage,
});
const templatesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/templates",
  component: TemplatesPage,
});
const sidebarTemplateRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/templates/sidebar",
  component: SidebarTemplatePage,
});
const guidesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/guides",
  component: GuidesPage,
});
const loadDocsPages = () => import("./DocsPages");
const docsIndexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/docs",
  component: lazyRouteComponent(loadDocsPages, "GettingStartedPage"),
});
const gettingStartedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/docs/getting-started",
  component: lazyRouteComponent(loadDocsPages, "GettingStartedPage"),
});
const quickStartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/docs/quick-start",
  component: lazyRouteComponent(loadDocsPages, "QuickStartPage"),
});
const colorsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/docs/colors",
  component: lazyRouteComponent(loadDocsPages, "ColorsPage"),
});
const agentSkillsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/docs/agent-skills",
  component: lazyRouteComponent(loadDocsPages, "AgentSkillsPage"),
});
const themeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/docs/theme",
  component: lazyRouteComponent(loadDocsPages, "ThemePage"),
});
const themePlaygroundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/theme-playground",
  component: lazyRouteComponent(
    () => import("./ThemePlaygroundPage"),
    "ThemePlaygroundPage",
  ),
});

export const router = createRouter({
  routeTree: rootRoute.addChildren([
    homeRoute,
    componentsRoute,
    componentRoute,
    tokensRoute,
    templatesRoute,
    sidebarTemplateRoute,
    guidesRoute,
    docsIndexRoute,
    gettingStartedRoute,
    quickStartRoute,
    colorsRoute,
    themeRoute,
    themePlaygroundRoute,
    agentSkillsRoute,
  ]),
  defaultPreload: "intent",
  scrollRestoration: true,
});
