import { useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Braces,
  Check,
  Clipboard,
  Info,
  Moon,
  Palette,
  Rocket,
  Sun,
  SunMoon,
} from "lucide-react";
import {
  Alert,
  Badge,
  Box,
  Button,
  Flex,
  List,
  Select,
  Tabs,
  Tag,
  Text,
  ThemeToggle,
} from "velune/react";
import { SyntaxHighlighter } from "./SyntaxHighlighter";
import { usePortalTheme } from "./theme-context";
import {
  SiteSidebar,
  siteNavLinkActiveClassName,
  siteNavLinkClassName,
  siteWorkspaceClassName,
} from "./site-sidebar";

const docsNavigation = [
  {
    title: "Getting Started",
    to: "/docs/getting-started",
    icon: BookOpen,
  },
  {
    title: "Quick Start",
    to: "/docs/quick-start",
    icon: Rocket,
  },
  {
    title: "Colors",
    to: "/docs/colors",
    icon: Palette,
  },
  {
    title: "Theme",
    to: "/docs/theme",
    icon: SunMoon,
  },
  {
    title: "Agent Skills",
    to: "/docs/agent-skills",
    icon: Braces,
  },
] as const;

type DocsPath = (typeof docsNavigation)[number]["to"];

function DocsNavLink({
  item,
}: {
  item: (typeof docsNavigation)[number];
}) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const active =
    pathname === item.to ||
    (pathname === "/docs" && item.to === "/docs/getting-started");
  const Icon = item.icon;

  return (
    <Link
      to={item.to}
      className={`${siteNavLinkClassName}${
        active ? ` ${siteNavLinkActiveClassName}` : ""
      }`}
      aria-current={active ? "page" : undefined}
    >
      <Icon size={15} className="flex-none" />
      <Text as="span" size="sm" weight={active ? "medium" : "regular"}>
        {item.title}
      </Text>
    </Link>
  );
}

function DocsMobileSelect() {
  const navigate = useNavigate();
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const value =
    pathname === "/docs" ? "/docs/getting-started" : pathname;

  return (
    <Select
      value={value}
      aria-label="Browse documentation"
      fullWidth
      onValueChange={(to) => {
        void navigate({ to: to as DocsPath });
      }}
    >
      <Select.Trigger placeholder="Browse documentation" />
      <Select.Content>
        {docsNavigation.map((item) => (
          <Select.Item key={item.to} value={item.to}>
            {item.title}
          </Select.Item>
        ))}
      </Select.Content>
    </Select>
  );
}

function DocsShell({
  title,
  description,
  children,
  previous,
  next,
}: {
  title: string;
  description: string;
  children: ReactNode;
  previous?: DocsPath;
  next?: DocsPath;
}) {
  return (
    <Box className={siteWorkspaceClassName}>
      <SiteSidebar
        aria-label="Documentation navigation"
        mobile={<DocsMobileSelect />}
      >
        <Box display="grid" className="gap-gs-0.5">
          {docsNavigation.map((item) => (
            <DocsNavLink key={item.to} item={item} />
          ))}
        </Box>
      </SiteSidebar>

      <Box className="mx-auto w-full min-w-gs-0 max-w-[1360px]">
        <Box
          as="article"
          className="w-full px-gs-4 py-gs-9 sm:px-gs-6 sm:py-gs-12 md:px-gs-8 lg:py-14 xl:px-gs-12"
        >
          <Box as="header" className="border-b border-gs-border-default pb-gs-8">
            <Text as="p" size="sm" weight="medium" tone="accent">
              Velune React
            </Text>
            <Text as="h1" size="3xl" weight="medium" className="mt-gs-3">
              {title}
            </Text>
            <Text as="p" size="md" tone="muted" className="mt-gs-3 max-w-2xl leading-7">
              {description}
            </Text>
          </Box>

          <Box className="py-gs-9">{children}</Box>

          <Flex
            as="footer"
            align="center"
            justify="between"
            gap="4"
            className="border-t border-gs-border-default pt-gs-6"
          >
            {previous ? <DocsPagerLink to={previous} previous /> : <Box />}
            {next ? <DocsPagerLink to={next} /> : null}
          </Flex>
        </Box>
      </Box>
    </Box>
  );
}

function DocsPagerLink({
  to,
  previous = false,
}: {
  to: DocsPath;
  previous?: boolean;
}) {
  const item = docsNavigation.find((entry) => entry.to === to)!;
  return (
    <Link
      to={to}
      className="inline-flex min-h-gs-11 items-center gap-gs-2 text-gs-sm font-gs-medium text-gs-text no-underline hover:text-gs-text-accent"
    >
      {previous ? <ArrowLeft size={15} /> : null}
      {item.title}
      {!previous ? <ArrowRight size={15} /> : null}
    </Link>
  );
}

function DocSection({
  title,
  children,
  description,
}: {
  title: string;
  children: ReactNode;
  description?: string;
}) {
  return (
    <Box as="section" className="mb-gs-12 last:mb-gs-0">
      <Text as="h2" size="xl" weight="medium">
        {title}
      </Text>
      {description ? (
        <Text as="p" size="sm" tone="muted" className="mt-gs-2 max-w-2xl leading-6">
          {description}
        </Text>
      ) : null}
      <Box className="mt-gs-5">{children}</Box>
    </Box>
  );
}

function DocCode({
  code,
  language = "tsx",
  label,
  expanded = false,
}: {
  code: string;
  language?: "bash" | "tsx" | "css";
  label?: string;
  expanded?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <Box className="overflow-hidden rounded-gs-sm border border-gs-border-default bg-gs-surface">
      <Flex
        align="center"
        justify="between"
        gap="3"
        className="h-gs-11 border-b border-gs-border-default px-gs-3"
      >
        <Text as="span" size="xs" family="mono" tone="muted">
          {label ?? language}
        </Text>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-label={copied ? "Code copied" : "Copy code"}
          onClick={() => {
            if (!navigator.clipboard) return;
            void navigator.clipboard.writeText(code).then(() => {
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1600);
            });
          }}
        >
          <Button.Leading>
            {copied ? <Check size={14} /> : <Clipboard size={14} />}
          </Button.Leading>
        </Button>
      </Flex>
      <SyntaxHighlighter
        code={code}
        language={language}
        className={`${expanded ? "" : "max-h-105"} overflow-auto !rounded-gs-none !border-0 p-gs-4 leading-6`}
      />
    </Box>
  );
}

function DocCallout({
  children,
  warning = false,
}: {
  children: ReactNode;
  warning?: boolean;
}) {
  const CalloutIcon = warning ? AlertTriangle : Info;
  return (
    <Flex
      align="start"
      gap="3"
      className={`border-l-2 px-gs-4 py-gs-3 ${
        warning
          ? "border-gs-warning bg-gs-warning-subtle"
          : "border-gs-focus bg-gs-surface-mist"
      }`}
    >
      <CalloutIcon
        size={16}
        className={warning ? "mt-gs-0.5 text-gs-warning" : "mt-gs-0.5 text-gs-text-accent"}
      />
      <Text as="div" size="sm" className="leading-6">
        {children}
      </Text>
    </Flex>
  );
}

const principles = [
  [
    "Accessible behavior",
    "Keyboard interaction, focus management, and screen-reader semantics are built into stateful components.",
  ],
  [
    "Semantic styling",
    "Tailwind utilities map to stable design roles such as surface, text, border, status, and focus.",
  ],
  [
    "Composable APIs",
    "Compound components expose meaningful structure without requiring application code to rebuild behavior.",
  ],
  [
    "Typed contracts",
    "Public props and state models are exported from one framework entry point with full TypeScript support.",
  ],
];

const startPaths = [
  {
    title: "Quick Start",
    description: "Install Velune, load theme CSS, and render your first component.",
    to: "/docs/quick-start" as const,
  },
  {
    title: "Colors",
    description: "Learn the semantic color roles every component consumes.",
    to: "/docs/colors" as const,
  },
  {
    title: "Theme",
    description: "Wire ThemeProvider, ThemeToggle, and brand-derived palettes.",
    to: "/docs/theme" as const,
  },
];

export function GettingStartedPage() {
  return (
    <DocsShell
      title="Getting Started"
      description="Velune is a typed React component system for accessible product interfaces, built around Tailwind CSS v4 and semantic design tokens."
      next="/docs/quick-start"
    >
      <DocSection title="Why Velune?">
        <Box className="border-t border-gs-border-default sm:grid sm:grid-cols-2">
          {principles.map(([title, description], index) => (
            <Box
              key={title}
              className={`border-b border-gs-border-default py-gs-5 sm:px-gs-5 ${
                index % 2 === 0 ? "sm:border-r" : ""
              }`}
            >
              <Text as="h3" size="sm" weight="medium">
                {title}
              </Text>
              <Text as="p" size="sm" tone="muted" className="mt-gs-2 leading-6">
                {description}
              </Text>
            </Box>
          ))}
        </Box>
      </DocSection>

      <DocSection
        title="Composition over reinvention"
        description="Ship product UI from shared primitives—typography, status, feedback, and actions—instead of rebuilding the same patterns in every app."
      >
        <Box className="border-y border-gs-border-default bg-gs-surface-mist px-gs-4 py-gs-6 sm:px-gs-6">
          <Flex align="start" justify="between" gap="4" wrap>
            <Box className="min-w-gs-0 max-w-xl">
              <Text as="p" size="xs" weight="medium" tone="accent">
                Release review
              </Text>
              <Text as="h3" size="xl" weight="medium" className="mt-gs-2">
                Design system updates
              </Text>
              <Text as="p" size="sm" tone="muted" className="mt-gs-2 leading-6">
                Tokens, themes, and compound components stay in one package so
                product surfaces stay consistent as the library evolves.
              </Text>
            </Box>
            <Flex gap="2" wrap align="center">
              <Flex align="center" gap="2">
                <Text as="span" size="sm" tone="muted">
                  Open PRs
                </Text>
                <Badge count={12} tone="info" />
              </Flex>
              <Tag size="sm" tone="success">
                Stable
              </Tag>
              <Tag size="sm" tone="primary">
                React
              </Tag>
            </Flex>
          </Flex>

          <Box className="mt-gs-5">
            <Alert tone="info">
              <Alert.Title>Semantic tokens stay in sync</Alert.Title>
              <Alert.Description>
                Surfaces, text, borders, and status roles update together across
                light, dark, and high-contrast themes.
              </Alert.Description>
            </Alert>
          </Box>

          <Flex gap="3" wrap className="mt-gs-5">
            <Button asChild>
              <Link to="/docs/quick-start">Start with Quick Start</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/components">Browse components</Link>
            </Button>
          </Flex>
        </Box>
      </DocSection>

      <DocSection
        title="Where to go next"
        description="Follow the docs path that matches what you need right now."
      >
        <Box className="border-t border-gs-border-default">
          {startPaths.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-start justify-between gap-gs-4 border-b border-gs-border-default py-gs-4 text-gs-text no-underline transition-colors hover:text-gs-text-accent"
            >
              <Box className="min-w-gs-0">
                <Text as="span" size="sm" weight="medium">
                  {item.title}
                </Text>
                <Text as="p" size="sm" tone="muted" className="mt-gs-1 leading-6">
                  {item.description}
                </Text>
              </Box>
              <ArrowRight
                size={16}
                className="mt-gs-1 flex-none text-gs-text-secondary"
                aria-hidden="true"
              />
            </Link>
          ))}
        </Box>
      </DocSection>

      <DocSection title="Current scope">
        <DocCallout>
          The stable framework entry is{" "}
          <Text as="code" family="mono" size="sm">
            velune/react
          </Text>
          . Vue, Solid, and Svelte entry points are planned but must not be
          generated or documented as available APIs yet.
        </DocCallout>
      </DocSection>
    </DocsShell>
  );
}

const installCommands = {
  pnpm: "pnpm add velune@beta",
  npm: "npm install velune@beta",
  yarn: "yarn add velune@beta",
  bun: "bun add velune@beta",
} as const;

export function QuickStartPage() {
  return (
    <DocsShell
      title="Quick Start"
      description="Install Velune, register its Tailwind sources, and render your first component in a few minutes."
      previous="/docs/getting-started"
      next="/docs/colors"
    >
      <DocSection title="Requirements">
        <Box className="border-y border-gs-border-default">
          {[
            ["React", "18 or newer"],
            ["Tailwind CSS", "Version 4"],
            ["Browser", "Modern evergreen browsers"],
          ].map(([name, value]) => (
            <Flex
              key={name}
              align="center"
              justify="between"
              gap="4"
              className="min-h-gs-12 border-b border-gs-border-default last:border-b-0"
            >
              <Text size="sm" weight="medium">
                {name}
              </Text>
              <Text size="sm" tone="muted">
                {value}
              </Text>
            </Flex>
          ))}
        </Box>
      </DocSection>

      <DocSection title="Install Velune">
        <Tabs defaultValue="pnpm">
          <Tabs.List aria-label="Package manager">
            {Object.keys(installCommands).map((manager) => (
              <Tabs.Trigger key={manager} value={manager}>
                {manager}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
          {Object.entries(installCommands).map(([manager, command]) => (
            <Tabs.Panel key={manager} value={manager}>
              <DocCode code={command} language="bash" label="Terminal" />
            </Tabs.Panel>
          ))}
        </Tabs>
      </DocSection>

      <DocSection
        title="Import styles"
        description="Add these imports to the global CSS entry loaded by your application."
      >
        <DocCode
          language="css"
          label="src/index.css"
          code={`@import "tailwindcss";
@import "velune/react/theme/tokens.css";
@import "velune/react/theme/base.css";
@import "velune/react/tailwind.css";`}
        />
        <Box className="mt-gs-4">
          <DocCallout>
            Import order matters: Tailwind must be loaded before Velune tokens
            and utility registration. Velune registers its packaged React
            components as a Tailwind source automatically.
          </DocCallout>
        </Box>
      </DocSection>

      <DocSection
        title="Add the theme provider"
        description="Use one provider when the application switches themes or customizes semantic tokens."
      >
        <DocCode
          code={`import { ThemeProvider } from "velune/react";
import "./index.css";

export function App() {
  return (
    <ThemeProvider theme="system">
      <Routes />
    </ThemeProvider>
  );
}`}
        />
      </DocSection>

      <DocSection title="Use components">
        <DocCode
          code={`import { Button, Stack } from "velune/react";

export function SaveActions() {
  return (
    <Stack gap="3" direction="row">
      <Button>Save changes</Button>
      <Button variant="secondary" tone="danger">
        Discard
      </Button>
      <Button variant="ghost">Open settings</Button>
    </Stack>
  );
}`}
        />
        <Flex
          align="center"
          justify="center"
          gap="3"
          wrap
          className="mt-gs-4 min-h-28 border-y border-gs-border-default bg-gs-surface px-gs-4"
        >
          <Button>Save changes</Button>
          <Button variant="secondary" tone="danger">
            Discard
          </Button>
          <Button variant="ghost">Open settings</Button>
        </Flex>
        <Box className="mt-gs-4">
          <DocCallout>
            Prefer compound slots, numeric spacing props like{" "}
            <Text as="code" family="mono" size="sm">
              gap=&quot;4&quot;
            </Text>
            , and semantic intents such as{" "}
            <Text as="code" family="mono" size="sm">
              tone=&quot;danger&quot;
            </Text>
            . See Form for Standard Schema validation, Select/Combobox for Empty
            vs NoMatches, and Button for asChild plus buttonClasses().
          </DocCallout>
        </Box>
      </DocSection>
    </DocsShell>
  );
}

type ColorRole = {
  name: string;
  description: string;
  swatches: Array<{ label: string; token: string }>;
  utilities: string[];
};

const colorRoles: ColorRole[] = [
  {
    name: "Accent",
    description:
      "The single product accent for focus, selection, and the most important action.",
    swatches: [
      { label: "Primary", token: "--color-primary" },
      { label: "Strong", token: "--color-primary-strong" },
    ],
    utilities: ["bg-gs-primary", "text-gs-text-accent", "border-gs-focus"],
  },
  {
    name: "Surfaces",
    description:
      "Canvas and layered surfaces establish hierarchy through lightness rather than decorative color.",
    swatches: [
      { label: "Canvas", token: "--color-canvas" },
      { label: "Surface", token: "--color-surface" },
      { label: "Raised", token: "--color-surface-raised" },
      { label: "Mist", token: "--color-surface-mist" },
    ],
    utilities: [
      "bg-gs-canvas",
      "bg-gs-surface",
      "bg-gs-surface-raised",
      "bg-gs-surface-mist",
    ],
  },
  {
    name: "Foreground",
    description:
      "Primary, secondary, and accent text roles adapt to the active theme and background.",
    swatches: [
      { label: "Primary", token: "--color-text-primary" },
      { label: "Secondary", token: "--color-text-secondary" },
      { label: "Accent", token: "--color-text-accent" },
    ],
    utilities: ["text-gs-text", "text-gs-text-secondary", "text-gs-text-accent"],
  },
  {
    name: "Status",
    description:
      "Reserved semantic colors communicate outcomes and risk without replacing text labels.",
    swatches: [
      { label: "Success", token: "--color-success" },
      { label: "Warning", token: "--color-warning" },
      { label: "Error", token: "--color-error" },
      { label: "Info", token: "--color-info" },
    ],
    utilities: [
      "text-gs-success",
      "text-gs-warning",
      "text-gs-error",
      "text-gs-info",
    ],
  },
  {
    name: "Borders",
    description:
      "Quiet boundaries structure content; focus borders remain visually distinct and accessible.",
    swatches: [
      { label: "Default", token: "--color-border-default" },
      { label: "Strong", token: "--color-border-strong" },
      { label: "Focus", token: "--color-border-focus" },
    ],
    utilities: [
      "border-gs-border-default",
      "border-gs-border-strong",
      "border-gs-border-focus",
    ],
  },
];

function ColorRoleRow({ role }: { role: ColorRole }) {
  return (
    <Box as="section" className="border-t border-gs-border-default py-gs-6 last:border-b">
      <Box display="grid" className="gap-gs-5 md:grid-cols-[180px_minmax(0,1fr)]">
        <Box>
          <Text as="h2" size="md" weight="medium">
            {role.name}
          </Text>
          <Text as="p" size="sm" tone="muted" className="mt-gs-2 leading-6">
            {role.description}
          </Text>
        </Box>
        <Box className="min-w-gs-0">
          <Box display="grid" className="grid-cols-2 gap-gs-2 sm:grid-cols-4">
            {role.swatches.map((swatch) => (
              <Box key={swatch.token} className="min-w-gs-0">
                <Box
                  className="h-gs-16 rounded-gs-xs border border-gs-border-default"
                  style={{ background: `var(${swatch.token})` }}
                />
                <Text as="p" size="xs" weight="medium" className="mt-gs-2">
                  {swatch.label}
                </Text>
                <Text
                  as="code"
                  family="mono"
                  size="2xs"
                  tone="muted"
                  className="mt-gs-1 block truncate"
                >
                  {swatch.token}
                </Text>
              </Box>
            ))}
          </Box>
          <Flex gap="2" wrap className="mt-gs-4">
            {role.utilities.map((utility) => (
              <Tag key={utility} size="sm" tone="muted">
                {utility}
              </Tag>
            ))}
          </Flex>
        </Box>
      </Box>
    </Box>
  );
}

export function ColorsPage() {
  return (
    <DocsShell
      title="Colors"
      description="Velune colors express semantic intent. Components consume a compact set of roles that remain stable across light, dark, and high-contrast themes."
      previous="/docs/quick-start"
      next="/docs/theme"
    >
      <DocCallout>
        Prefer semantic utilities and component tones. Raw CSS variables are the
        customization contract, not the default authoring syntax inside React
        components.
      </DocCallout>

      <Box className="mt-gs-10">
        {colorRoles.map((role) => (
          <ColorRoleRow key={role.name} role={role} />
        ))}
      </Box>

      <DocSection
        title="Use colors"
        description="Utilities keep property and semantic intent visible without repeating token names."
      >
        <DocCode
          code={`<Box className="border border-gs-border-default bg-gs-surface p-gs-4">
  <Text className="text-gs-text">Primary content</Text>
  <Text className="text-gs-text-secondary">Supporting content</Text>
  <Button>Continue</Button>
</Box>`}
        />
      </DocSection>

      <DocSection
        title="Customize a theme"
        description="Override public semantic variables at an application scope; component variables continue to derive from them."
      >
        <DocCode
          language="css"
          label="theme.css"
          code={`.product-theme {
  --color-primary: #8f633e;
  --color-primary-strong: #79502f;
  --color-surface: #fffdf8;
  --color-text-primary: #302c26;
}`}
        />
      </DocSection>
    </DocsShell>
  );
}

const themeSwitcherCode = `import { useState } from "react";
import { ThemeProvider, ThemeToggle } from "velune/react";

export function App() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  return (
    <ThemeProvider theme={theme}>
      <header className="flex justify-end border-b border-gs-border-default p-gs-3">
        <ThemeToggle
          theme={theme}
          onThemeChange={(next) => {
            if (next !== "system") setTheme(next);
          }}
        />
      </header>
      <Routes />
    </ThemeProvider>
  );
}`;

const customThemeToggleCode = `import { Moon, Sun } from "lucide-react";
import {
  Button,
  ThemeProvider,
  useThemeToggle,
} from "velune/react";

export function CustomThemeToggle() {
  const { resolvedTheme, toggleTheme } = useThemeToggle({
    storageKey: "app-theme",
    defaultTheme: "system",
  });
  const isDark = resolvedTheme === "dark";

  return (
    <ThemeProvider theme={resolvedTheme}>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        aria-label={\`Switch to \${isDark ? "light" : "dark"} theme\`}
        onClick={toggleTheme}
      >
        <Button.Leading>
          {isDark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
        </Button.Leading>
      </Button>
    </ThemeProvider>
  );
}`;

function ThemeSwitcherDemo() {
  const { theme, setTheme } = usePortalTheme();

  return (
    <Flex
      align="center"
      justify="between"
      gap="4"
      wrap
      className="border-y border-gs-border-default bg-gs-surface px-gs-4 py-gs-5 sm:px-gs-5"
    >
      <Box>
        <Text as="p" size="sm" weight="medium">
          ThemeToggle
        </Text>
        <Text as="p" size="xs" tone="muted" className="mt-gs-1">
          Ready-made control with sun/moon icons and accessible labels.
        </Text>
      </Box>
      <ThemeToggle
        theme={theme}
        onThemeChange={(next) => {
          if (next !== "system") setTheme(next);
        }}
      />
    </Flex>
  );
}

function CustomThemeToggleDemo() {
  const { theme, toggleTheme } = usePortalTheme();
  const isDark = theme === "dark";

  return (
    <Flex
      align="center"
      justify="between"
      gap="4"
      wrap
      className="border-y border-gs-border-default bg-gs-surface px-gs-4 py-gs-5 sm:px-gs-5"
    >
      <Box>
        <Text as="p" size="sm" weight="medium">
          useThemeToggle
        </Text>
        <Text as="p" size="xs" tone="muted" className="mt-gs-1">
          Build your own chrome when ThemeToggle is not enough.
        </Text>
      </Box>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
        onClick={toggleTheme}
      >
        <Button.Leading>
          {isDark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
        </Button.Leading>
      </Button>
    </Flex>
  );
}

export function ThemePage() {
  return (
    <DocsShell
      title="Theme"
      description="Control light, dark, high-contrast, reduced-motion, and brand-derived themes through one semantic Token contract."
      previous="/docs/colors"
      next="/docs/agent-skills"
    >
      <DocSection
        title="ThemeToggle"
        description="Drop-in control that toggles light and dark with sun/moon icons. Wire it to a controlled ThemeProvider."
      >
        <ThemeSwitcherDemo />
        <Box className="mt-gs-4">
          <DocCode
            code={themeSwitcherCode}
            label="App.tsx"
            expanded
          />
        </Box>
      </DocSection>

      <DocSection
        title="useThemeToggle"
        description="Use the hook when you need custom persistence, layout, or chrome. It returns theme, resolvedTheme, setTheme, and toggleTheme."
      >
        <CustomThemeToggleDemo />
        <Box className="mt-gs-4">
          <DocCode
            code={customThemeToggleCode}
            label="CustomThemeToggle.tsx"
            expanded
          />
        </Box>
        <Box className="mt-gs-4 border-y border-gs-border-default">
          {[
            ["theme", '"light" | "dark" | "system" preference'],
            ["resolvedTheme", '"light" | "dark" after resolving system'],
            ["setTheme", "(theme) => void"],
            ["toggleTheme", "() => void"],
            ["storageKey", 'localStorage key. Default: "velune-theme"'],
            ["persist", "boolean. Default: true"],
            ["applyToDocument", "boolean. Default: true"],
          ].map(([name, value]) => (
            <Flex
              key={name}
              align="start"
              justify="between"
              gap="4"
              className="border-b border-gs-border-default py-gs-3 last:border-b-0"
            >
              <Text as="code" family="mono" size="xs" weight="medium">
                {name}
              </Text>
              <Text as="code" family="mono" size="xs" tone="muted" align="end">
                {value}
              </Text>
            </Flex>
          ))}
        </Box>
      </DocSection>

      <DocSection
        title="Theme provider"
        description="Place one provider near the application root. Pass brandColor to derive a contrast-checked scale; overlays mirror the same contract onto the document root."
      >
        <DocCode
          code={`import { ThemeProvider } from "velune/react";

export function App() {
  return (
    <ThemeProvider
      theme="system"
      brandColor="#96683f"
      mood="porcelain"
      base="porcelain"
      contrastRatio="AA"
      highContrast={false}
      reducedMotion={false}
    >
      <Routes />
    </ThemeProvider>
  );
}`}
        />
        <Box className="mt-gs-4">
          <DocCallout>
            Modes are{" "}
            <Text as="code" family="mono" size="sm">
              light
            </Text>
            ,{" "}
            <Text as="code" family="mono" size="sm">
              dark
            </Text>
            , and{" "}
            <Text as="code" family="mono" size="sm">
              system
            </Text>
            . When{" "}
            <Text as="code" family="mono" size="sm">
              brandColor
            </Text>{" "}
            is set, the provider also stamps{" "}
            <Text as="code" family="mono" size="sm">
              data-brand
            </Text>
            . Static applications can apply the same contract with data
            attributes and CSS alone.
          </DocCallout>
        </Box>
        <Box className="mt-gs-4 border-y border-gs-border-default">
          {[
            ["theme", '"light" | "dark" | "system"'],
            ["brandColor", "hex seed for generateTheme()"],
            ["mood", '"porcelain" | "futuristic" | "warm" | "mono"'],
            ["base", '"porcelain" | "neutral" | "stone" | "zinc" | "slate"'],
            ["contrastRatio", '"AA" | "AAA"'],
            ["highContrast", "boolean"],
            ["reducedMotion", "boolean"],
            ["customTokens", "Record<string, string>"],
          ].map(([name, value]) => (
            <Flex
              key={name}
              align="start"
              justify="between"
              gap="4"
              className="border-b border-gs-border-default py-gs-3 last:border-b-0"
            >
              <Text as="code" family="mono" size="xs" weight="medium">
                {name}
              </Text>
              <Text as="code" family="mono" size="xs" tone="muted" align="end">
                {value}
              </Text>
            </Flex>
          ))}
        </Box>
      </DocSection>

      <DocSection
        title="Generate a brand theme"
        description="Derive a contrast-checked brand scale and semantic light, dark, and high-contrast maps from one seed color—imperatively, or via ThemeProvider brand props."
      >
        <DocCode
          code={`import { generateTheme, applyTheme } from "velune/react";

const theme = generateTheme({
  brand: "#96683f",
  mood: "porcelain",
  base: "porcelain",
  contrastRatio: "AA",
});

applyTheme(theme, document.documentElement, "light");`}
        />
        <Box className="mt-gs-4">
          <DocCallout>
            Try it live in{" "}
            <Link
              to="/theme-playground"
              className="font-gs-medium text-gs-text-accent underline"
            >
              Theme studio
            </Link>
            : pick a brand color, preview every mode, and copy the generated
            CSS.
          </DocCallout>
        </Box>
        <Box className="mt-gs-4 border-y border-gs-border-default">
          {[
            ["brand", "hex seed color"],
            ["mood", '"porcelain" | "futuristic" | "warm" | "mono"'],
            ["base", '"porcelain" | "neutral" | "stone" | "zinc" | "slate"'],
            ["contrastRatio", '"AA" | "AAA"'],
            ["output", "10-step brand scale + semantic mode variables"],
          ].map(([name, value]) => (
            <Flex
              key={name}
              align="start"
              justify="between"
              gap="4"
              className="border-b border-gs-border-default py-gs-3 last:border-b-0"
            >
              <Text as="code" family="mono" size="xs" weight="medium">
                {name}
              </Text>
              <Text as="code" family="mono" size="xs" tone="muted" align="end">
                {value}
              </Text>
            </Flex>
          ))}
        </Box>
      </DocSection>

      <DocSection
        title="Override semantic tokens"
        description="Use custom tokens for a scoped product requirement without changing component implementation variables."
      >
        <DocCode
          code={`<ThemeProvider
  theme="dark"
  brandColor="#96683f"
  customTokens={{
    "--color-primary": "#c79a6b",
    "--radius-sm": "8px",
  }}
>
  <App />
</ThemeProvider>`}
        />
      </DocSection>

      <DocSection
        title="Server-rendered CSS"
        description="Serialize a generated theme for a server style tag, then reuse the same object during hydration."
      >
        <DocCode
          code={`import { generateTheme, getThemeCss } from "velune/react";

const theme = generateTheme({ brand: "#96683f" });
const css = getThemeCss(theme);

// Render css inside a <style> element in the document head.`}
        />
      </DocSection>

      <DocSection title="Theme contract">
        <Box className="border-y border-gs-border-default">
          {[
            ["data-theme", '"light" | "dark" | "system"'],
            ["data-high-contrast", '"true"'],
            ["data-reduced-motion", '"true"'],
            ["data-brand", '"true" when brandColor is set'],
          ].map(([attribute, values]) => (
            <Flex
              key={attribute}
              align="center"
              justify="between"
              gap="4"
              className="min-h-gs-12 border-b border-gs-border-default last:border-b-0"
            >
              <Text as="code" family="mono" size="xs">
                {attribute}
              </Text>
              <Text as="code" family="mono" size="xs" tone="muted">
                {values}
              </Text>
            </Flex>
          ))}
        </Box>
      </DocSection>
    </DocsShell>
  );
}

const includedSkillFeatures = [
  "Velune installation and Tailwind CSS v4 setup",
  "All 47 React components with public types and composition examples",
  "ThemeToggle, useThemeToggle, ThemeProvider brand props, and semantic utilities",
  "Source, styles, theme, and documentation query scripts",
  "Accessibility and state-stability checks for generated interfaces",
];

export function AgentSkillsPage() {
  return (
    <DocsShell
      title="Agent Skills"
      description="Give compatible coding agents current knowledge of Velune React components, Tailwind conventions, theming, and composition patterns."
      previous="/docs/theme"
    >
      <DocSection title="Installation">
        <DocCode
          code="npx skills add kxpw/Velune"
          language="bash"
          label="Terminal"
        />
        <Text as="p" size="sm" tone="muted" className="mt-gs-3 leading-6">
          The standard Agent Skills package supports Codex, Claude Code, Cursor,
          OpenCode, and other compatible tools.
        </Text>
      </DocSection>

      <DocSection
        title="Keep it current"
        description="Refresh the project installation after Velune components or guidance change."
      >
        <DocCode
          code="npx skills update velune-react -p"
          language="bash"
          label="Terminal"
        />
        <Box className="mt-gs-4">
          <DocCallout>
            Use the global scope flag instead when the skill was installed with{" "}
            <Text as="code" family="mono" size="sm">
              -g
            </Text>
            . The update preserves the selected installation scope.
          </DocCallout>
        </Box>
      </DocSection>

      <DocSection
        title="Usage"
        description="Skills are discovered automatically. Invoke the skill explicitly when a task must follow Velune conventions."
      >
        <DocCode
          code="$velune-react Build a settings page with accessible form controls."
          language="bash"
          label="Agent prompt"
        />
        <Box className="mt-gs-5 border-y border-gs-border-default">
          {[
            "Build pages with Velune components",
            "Choose component props and compound anatomy",
            "Configure Tailwind and theme imports",
            "Customize semantic colors and utilities",
            "Inspect current component source and types",
          ].map((item) => (
            <Flex
              key={item}
              align="center"
              gap="3"
              className="min-h-gs-11 border-b border-gs-border-default last:border-b-0"
            >
              <Check size={14} className="text-gs-success" />
              <Text size="sm">{item}</Text>
            </Flex>
          ))}
        </Box>
      </DocSection>

      <DocSection title="What's included">
        <List divided hoverable={false}>
          {includedSkillFeatures.map((feature) => (
            <List.Item key={feature}>
              <List.Content>
                <List.Title>{feature}</List.Title>
              </List.Content>
            </List.Item>
          ))}
        </List>
      </DocSection>

      <DocSection title="Structure">
        <DocCode
          language="bash"
          label="Repository"
          code={`skills/velune-react/
├── SKILL.md
├── agents/
│   └── openai.yaml
├── references/
│   ├── components.md
│   ├── patterns.md
│   ├── setup.md
│   └── theming.md
└── scripts/
    ├── list_components.mjs
    ├── get_component_docs.mjs
    ├── get_source.mjs
    ├── get_styles.mjs
    ├── get_theme.mjs
    └── get_docs.mjs`}
        />
      </DocSection>

      <DocSection
        title="Machine-readable catalog"
        description="Use llms.txt when an agent needs structured component data without loading the skill package."
      >
        <DocCallout>
          Docs serve{" "}
          <Text as="code" family="mono" size="sm">
            /llms.txt
          </Text>{" "}
          and{" "}
          <Text as="code" family="mono" size="sm">
            /llms-full.txt
          </Text>{" "}
          for agent-friendly discovery. Prefer the bundled{" "}
          <Text as="code" family="mono" size="sm">
            velune-react
          </Text>{" "}
          skill when an agent needs component APIs, examples, and theming
          guidance in-repo.
        </DocCallout>
      </DocSection>

      <DocSection title="Source of truth">
        <DocCallout>
          Query scripts prefer the current Velune repository, then the target
          project's installed package, and finally bundled references. This
          prevents agents from relying on obsolete package names or remembered
          APIs.
        </DocCallout>
      </DocSection>
    </DocsShell>
  );
}
