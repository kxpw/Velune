import { useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
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
  ShieldCheck,
  Sun,
  SunMoon,
} from "lucide-react";
import {
  Box,
  Button,
  Checkbox,
  Flex,
  Input,
  List,
  Stack,
  Tabs,
  Tag,
  Text,
} from "velune/react";
import { SyntaxHighlighter } from "./SyntaxHighlighter";
import { usePortalTheme } from "./theme-context";

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
  compact = false,
}: {
  item: (typeof docsNavigation)[number];
  compact?: boolean;
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
      className={
        compact
          ? `inline-flex h-10 flex-none items-center gap-2 border-b-2 px-3 text-sm no-underline ${
              active
                ? "border-gs-focus text-gs-default"
                : "border-transparent text-gs-secondary hover:text-gs-default"
            }`
          : `flex h-10 items-center gap-3 border-l-2 px-4 no-underline ${
              active
                ? "border-gs-focus bg-gs-surface-mist text-gs-default"
                : "border-transparent text-gs-secondary hover:bg-gs-surface-mist hover:text-gs-default"
            }`
      }
      aria-current={active ? "page" : undefined}
    >
      <Icon size={compact ? 15 : 16} className="flex-none" />
      <Text as="span" size="sm" weight={active ? "medium" : "regular"}>
        {item.title}
      </Text>
    </Link>
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
    <Box
      display="grid"
      className="min-h-[calc(100vh-60px)] lg:grid-cols-[240px_minmax(0,1fr)]"
    >
      <Box
        as="aside"
        className="sticky top-15 hidden h-[calc(100vh-60px)] self-start border-r border-gs-default lg:flex lg:flex-col"
        aria-label="Documentation navigation"
      >
        <Box
          as="nav"
          display="grid"
          className="py-3"
          aria-label="Documentation navigation"
        >
          {docsNavigation.map((item) => (
            <DocsNavLink key={item.to} item={item} />
          ))}
        </Box>
      </Box>

      <Box className="mx-auto w-full min-w-0 max-w-[1360px]">
        <Box
          as="nav"
          className="sticky top-15 z-20 flex overflow-x-auto border-b border-gs-default bg-gs-surface lg:hidden"
          aria-label="Documentation pages"
        >
          {docsNavigation.map((item) => (
            <DocsNavLink key={item.to} item={item} compact />
          ))}
        </Box>
        <Box
          as="article"
          className="w-full px-4 py-9 sm:px-6 sm:py-12 md:px-8 lg:py-14 xl:px-12"
        >
          <Box as="header" className="border-b border-gs-default pb-8">
            <Text as="p" size="sm" weight="medium" tone="primary">
              Velune React
            </Text>
            <Text as="h1" size="3xl" weight="semibold" className="mt-3">
              {title}
            </Text>
            <Text as="p" size="md" muted className="mt-3 max-w-2xl leading-7">
              {description}
            </Text>
          </Box>

          <Box className="py-9">{children}</Box>

          <Flex
            as="footer"
            align="center"
            justify="between"
            gap="4"
            className="border-t border-gs-default pt-6"
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
      className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-gs-default no-underline hover:text-gs-accent"
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
    <Box as="section" className="mb-12 last:mb-0">
      <Text as="h2" size="xl" weight="semibold">
        {title}
      </Text>
      {description ? (
        <Text as="p" size="sm" muted className="mt-2 max-w-2xl leading-6">
          {description}
        </Text>
      ) : null}
      <Box className="mt-5">{children}</Box>
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
    <Box className="overflow-hidden rounded-gs-sm border border-gs-default bg-gs-surface">
      <Flex
        align="center"
        justify="between"
        gap="3"
        className="h-11 border-b border-gs-default px-3"
      >
        <Text as="span" size="xs" family="mono" muted>
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
        className={`${expanded ? "" : "max-h-105"} overflow-auto !rounded-none !border-0 p-4 leading-6`}
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
      className={`border-l-2 px-4 py-3 ${
        warning
          ? "border-gs-warning bg-gs-warning-subtle"
          : "border-gs-focus bg-gs-surface-mist"
      }`}
    >
      <CalloutIcon
        size={16}
        className={warning ? "mt-0.5 text-gs-warning" : "mt-0.5 text-gs-accent"}
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

export function GettingStartedPage() {
  return (
    <DocsShell
      title="Getting Started"
      description="Velune is a typed React component system for accessible product interfaces, built around Tailwind CSS v4 and semantic design tokens."
      next="/docs/quick-start"
    >
      <DocSection title="Why Velune?">
        <Box className="border-t border-gs-default sm:grid sm:grid-cols-2">
          {principles.map(([title, description], index) => (
            <Box
              key={title}
              className={`border-b border-gs-default py-5 sm:px-5 ${
                index % 2 === 0 ? "sm:border-r" : ""
              }`}
            >
              <Text as="h3" size="sm" weight="semibold">
                {title}
              </Text>
              <Text as="p" size="sm" muted className="mt-2 leading-6">
                {description}
              </Text>
            </Box>
          ))}
        </Box>
      </DocSection>

      <DocSection
        title="A living library"
        description="Use package components instead of copying private implementations into each application. Updates remain centralized while application composition stays local."
      >
        <Box className="overflow-hidden rounded-gs-sm border border-gs-default bg-gs-surface">
          <Flex
            align="center"
            justify="between"
            gap="3"
            className="border-b border-gs-default px-4 py-3"
          >
            <Box>
              <Text as="p" size="sm" weight="semibold">
                Workspace access
              </Text>
              <Text as="p" size="xs" muted className="mt-1">
                Composed from Velune controls
              </Text>
            </Box>
            <Tag size="sm" tone="success">
              Typed
            </Tag>
          </Flex>
          <Stack gap="4" className="p-5">
            <Input placeholder="you@company.com" fullWidth>
              <Input.Label>Work email</Input.Label>
            </Input>
            <Checkbox defaultChecked>Remember this device</Checkbox>
            <Button>Continue</Button>
          </Stack>
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
        <Box className="border-y border-gs-default">
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
              className="min-h-12 border-b border-gs-default last:border-b-0"
            >
              <Text size="sm" weight="medium">
                {name}
              </Text>
              <Text size="sm" muted>
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
@import "velune/react/tailwind.css";`}
        />
        <Box className="mt-4">
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
          code={`import { Button } from "velune/react";

export function SaveAction() {
  return <Button>Save changes</Button>;
}`}
        />
        <Flex
          align="center"
          justify="center"
          className="mt-4 min-h-28 border-y border-gs-default bg-gs-surface"
        >
          <Button>Save changes</Button>
        </Flex>
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
    utilities: ["bg-gs-primary", "text-gs-accent", "border-gs-focus"],
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
      "bg-gs-bg",
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
    utilities: ["text-gs-default", "text-gs-secondary", "text-gs-accent"],
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
    utilities: ["border-gs-default", "border-gs-strong", "border-gs-focus"],
  },
];

function ColorRoleRow({ role }: { role: ColorRole }) {
  return (
    <Box as="section" className="border-t border-gs-default py-6 last:border-b">
      <Box display="grid" className="gap-5 md:grid-cols-[180px_minmax(0,1fr)]">
        <Box>
          <Text as="h2" size="md" weight="semibold">
            {role.name}
          </Text>
          <Text as="p" size="sm" muted className="mt-2 leading-6">
            {role.description}
          </Text>
        </Box>
        <Box className="min-w-0">
          <Box display="grid" className="grid-cols-2 gap-2 sm:grid-cols-4">
            {role.swatches.map((swatch) => (
              <Box key={swatch.token} className="min-w-0">
                <Box
                  className="h-16 rounded-gs-xs border border-gs-default"
                  style={{ background: `var(${swatch.token})` }}
                />
                <Text as="p" size="xs" weight="medium" className="mt-2">
                  {swatch.label}
                </Text>
                <Text
                  as="code"
                  family="mono"
                  size="2xs"
                  muted
                  className="mt-1 block truncate"
                >
                  {swatch.token}
                </Text>
              </Box>
            ))}
          </Box>
          <Flex gap="2" wrap className="mt-4">
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

      <Box className="mt-10">
        {colorRoles.map((role) => (
          <ColorRoleRow key={role.name} role={role} />
        ))}
      </Box>

      <DocSection
        title="Use colors"
        description="Utilities keep property and semantic intent visible without repeating token names."
      >
        <DocCode
          code={`<Box className="border border-gs-default bg-gs-surface p-4">
  <Text className="text-gs-default">Primary content</Text>
  <Text className="text-gs-secondary">Supporting content</Text>
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

type ThemePreviewMode = "light" | "dark" | "highContrast";

const themeSwitcherCode = `import type { PropsWithChildren } from "react";
import { Moon, Sun } from "lucide-react";
import {
  Button,
  ThemeProvider,
  useThemeToggle,
} from "velune/react";

export function ThemeSwitcher({ children }: PropsWithChildren) {
  const { theme, resolvedTheme, toggleTheme } = useThemeToggle({
    storageKey: "app-theme",
    defaultTheme: "system",
  });
  const isDark = resolvedTheme === "dark";

  return (
    <ThemeProvider theme={theme}>
      <div className="flex justify-end border-b border-gs-default p-3">
        <Button
          type="button"
          variant="secondary"
          aria-label={\`Switch to \${isDark ? "light" : "dark"} theme\`}
          onClick={toggleTheme}
        >
          <Button.Leading>
            {isDark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
          </Button.Leading>
          {isDark ? "Light theme" : "Dark theme"}
        </Button>
      </div>
      {children}
    </ThemeProvider>
  );
}`;

function ThemeSwitcherDemo() {
  const { theme, toggleTheme } = usePortalTheme();
  const isDark = theme === "dark";

  return (
    <Flex
      align="center"
      justify="between"
      gap="4"
      wrap
      className="border-y border-gs-default bg-gs-surface px-4 py-5 sm:px-5"
    >
      <Box>
        <Text as="p" size="sm" weight="semibold">
          {isDark ? "Dark theme" : "Light theme"}
        </Text>
        <Text as="p" size="xs" muted className="mt-1">
          The active theme is applied to the entire documentation site.
        </Text>
      </Box>
      <Button
        type="button"
        variant="secondary"
        aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
        onClick={toggleTheme}
      >
        <Button.Leading>
          {isDark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
        </Button.Leading>
        {isDark ? "Light theme" : "Dark theme"}
      </Button>
    </Flex>
  );
}

function ThemePreview() {
  const [mode, setMode] = useState<ThemePreviewMode>("light");
  const modes = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "highContrast", label: "High contrast", icon: ShieldCheck },
  ] as const;

  return (
    <Box className="overflow-hidden rounded-gs-sm border border-gs-default">
      <Flex
        align="center"
        gap="1"
        wrap
        className="border-b border-gs-default bg-gs-surface px-2 py-1.5"
      >
        {modes.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.value}
              type="button"
              size="sm"
              variant={mode === item.value ? "secondary" : "ghost"}
              aria-pressed={mode === item.value}
              onClick={() => setMode(item.value)}
            >
              <Button.Leading>
                <Icon size={14} />
              </Button.Leading>
              {item.label}
            </Button>
          );
        })}
      </Flex>
      <Box
        data-theme={mode === "dark" ? "dark" : "light"}
        data-high-contrast={mode === "highContrast" ? "true" : undefined}
        className="bg-gs-bg p-5 text-gs-default sm:p-7"
      >
        <Box className="rounded-gs-sm border border-gs-default bg-gs-surface p-5 shadow-gs-1">
          <Flex align="start" justify="between" gap="4">
            <Box>
              <Text as="h3" size="md" weight="semibold">
                Theme-aware workspace
              </Text>
              <Text as="p" size="sm" muted className="mt-2 leading-6">
                Surfaces, text, borders, focus, and status roles update from one
                semantic contract.
              </Text>
            </Box>
            <Tag tone="success" size="sm">
              Active
            </Tag>
          </Flex>
          <Flex gap="3" wrap className="mt-5">
            <Button size="sm">Continue</Button>
            <Button size="sm" variant="secondary">
              Save draft
            </Button>
          </Flex>
        </Box>
      </Box>
    </Box>
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
        title="Theme modes"
        description="Velune components inherit mode attributes and semantic variables from their nearest theme root."
      >
        <ThemePreview />
      </DocSection>

      <DocSection
        title="Theme switcher"
        description="Use a controlled ThemeProvider at the application root, persist the selected mode, and give the toggle an explicit accessible name."
      >
        <ThemeSwitcherDemo />
        <Box className="mt-4">
          <DocCode
            code={themeSwitcherCode}
            label="ThemeSwitcher.tsx"
            expanded
          />
        </Box>
      </DocSection>

      <DocSection
        title="Theme provider"
        description="Place one provider near the application root when React owns theme state or overlays need to mirror it to the document root."
      >
        <DocCode
          code={`import { ThemeProvider } from "velune/react";

export function App() {
  return (
    <ThemeProvider
      theme="system"
      highContrast={false}
      reducedMotion={false}
    >
      <Routes />
    </ThemeProvider>
  );
}`}
        />
        <Box className="mt-4">
          <DocCallout>
            Supported modes are{" "}
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
            . Static applications can apply the same contract with data
            attributes and CSS alone.
          </DocCallout>
        </Box>
      </DocSection>

      <DocSection
        title="Generate a brand theme"
        description="Derive a contrast-checked brand scale and semantic light, dark, and high-contrast maps from one seed color."
      >
        <DocCode
          code={`import { generateTheme, applyTheme } from "velune/react";

const theme = generateTheme({
  brand: "#96683f",
  mood: "porcelain",
  contrastRatio: "AA",
});

applyTheme(theme, document.documentElement, "light");`}
        />
        <Box className="mt-4 border-y border-gs-default">
          {[
            ["mood", '"porcelain" | "futuristic" | "warm" | "mono"'],
            ["contrastRatio", '"AA" | "AAA"'],
            ["output", "10-step brand scale + semantic mode variables"],
          ].map(([name, value]) => (
            <Flex
              key={name}
              align="start"
              justify="between"
              gap="4"
              className="border-b border-gs-default py-3 last:border-b-0"
            >
              <Text as="code" family="mono" size="xs" weight="medium">
                {name}
              </Text>
              <Text as="code" family="mono" size="xs" muted align="end">
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
        <Box className="border-y border-gs-default">
          {[
            ["data-theme", '"light" | "dark" | "system"'],
            ["data-high-contrast", '"true"'],
            ["data-reduced-motion", '"true"'],
          ].map(([attribute, values]) => (
            <Flex
              key={attribute}
              align="center"
              justify="between"
              gap="4"
              className="min-h-12 border-b border-gs-default last:border-b-0"
            >
              <Text as="code" family="mono" size="xs">
                {attribute}
              </Text>
              <Text as="code" family="mono" size="xs" muted>
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
  "All 38 React components with public types and composition examples",
  "Semantic utility, token, and theme customization rules",
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
        <Text as="p" size="sm" muted className="mt-3 leading-6">
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
        <Box className="mt-4">
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
        <Box className="mt-5 border-y border-gs-default">
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
              className="min-h-11 border-b border-gs-default last:border-b-0"
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
