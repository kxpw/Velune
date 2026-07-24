import {
  useEffect,
  useMemo,
  useReducer,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  Check,
  Clipboard,
  Code2,
  Download,
  Moon,
  Redo2,
  RotateCcw,
  Share2,
  ShieldCheck,
  Sun,
  Undo2,
} from "lucide-react";
import {
  Avatar,
  Box,
  Button,
  Card,
  Flex,
  Input,
  Modal,
  Select,
  Stack,
  Switch,
  Tabs,
  Tag,
  Text,
  Tooltip,
  generateTheme,
  getThemeCss,
  themeTokens,
  type ThemeBase,
  type ThemeContrastLevel,
  type ThemeMood,
} from "velune/react";
import { ThemePlaygroundCatalog } from "./ThemePlaygroundCatalog";

type PlaygroundMode = "light" | "dark" | "highContrast";
type PreviewView = "components" | "dashboard" | "forms";
type RadiusPreset = "sharp" | "balanced" | "soft" | "round";
type FontPreset = "sans" | "serif" | "system";

type PlaygroundConfig = {
  brandColor: string;
  mood: ThemeMood;
  base: ThemeBase;
  contrastRatio: ThemeContrastLevel;
  mode: PlaygroundMode;
  preview: PreviewView;
  radius: RadiusPreset;
  font: FontPreset;
};

const DEFAULT_CONFIG: PlaygroundConfig = {
  brandColor: "#96683f",
  mood: "porcelain",
  base: "porcelain",
  contrastRatio: "AA",
  mode: "light",
  preview: "components",
  radius: "balanced",
  font: "sans",
};

type ThemeHistory = {
  config: PlaygroundConfig;
  past: PlaygroundConfig[];
  future: PlaygroundConfig[];
};

type ThemeHistoryAction =
  | { type: "update"; patch: Partial<PlaygroundConfig> }
  | { type: "undo" }
  | { type: "redo" }
  | { type: "reset" };

function configsEqual(left: PlaygroundConfig, right: PlaygroundConfig): boolean {
  return (
    left.brandColor === right.brandColor &&
    left.mood === right.mood &&
    left.base === right.base &&
    left.contrastRatio === right.contrastRatio &&
    left.mode === right.mode &&
    left.preview === right.preview &&
    left.radius === right.radius &&
    left.font === right.font
  );
}

function historyReducer(
  state: ThemeHistory,
  action: ThemeHistoryAction,
): ThemeHistory {
  if (action.type === "undo") {
    const previous = state.past.at(-1);
    if (!previous) return state;
    return {
      config: previous,
      past: state.past.slice(0, -1),
      future: [state.config, ...state.future],
    };
  }

  if (action.type === "redo") {
    const next = state.future[0];
    if (!next) return state;
    return {
      config: next,
      past: [...state.past.slice(-29), state.config],
      future: state.future.slice(1),
    };
  }

  const next =
    action.type === "reset" ? DEFAULT_CONFIG : { ...state.config, ...action.patch };
  if (configsEqual(state.config, next)) return state;

  return {
    config: next,
    past: [...state.past.slice(-29), state.config],
    future: [],
  };
}

const brandPresets = [
  { value: "#96683f", label: "Clay" },
  { value: "#2463eb", label: "Cobalt" },
  { value: "#16805c", label: "Jade" },
  { value: "#c43d46", label: "Vermilion" },
  { value: "#6657c8", label: "Iris" },
] as const;

const moodOptions: Array<{
  value: ThemeMood;
  label: string;
  swatch: string;
}> = [
  { value: "porcelain", label: "Porcelain", swatch: "#C4A484" },
  { value: "futuristic", label: "Futuristic", swatch: "#6B7CFF" },
  { value: "warm", label: "Warm", swatch: "#E08A3C" },
  { value: "mono", label: "Mono", swatch: "#71717A" },
];

const baseOptions: Array<{
  value: ThemeBase;
  label: string;
  caption: string;
  light: string;
  dark: string;
}> = [
  {
    value: "porcelain",
    label: "Porcelain",
    caption: "Warm paper",
    light: "#F7F2E8",
    dark: "#1C1915",
  },
  {
    value: "neutral",
    label: "Neutral",
    caption: "Pure gray",
    light: "#FAFAFA",
    dark: "#171717",
  },
  {
    value: "stone",
    label: "Stone",
    caption: "Warm gray",
    light: "#FAFAF9",
    dark: "#1C1917",
  },
  {
    value: "zinc",
    label: "Zinc",
    caption: "Cool gray",
    light: "#FAFAFA",
    dark: "#18181B",
  },
  {
    value: "slate",
    label: "Slate",
    caption: "Blue gray",
    light: "#F8FAFC",
    dark: "#0F172A",
  },
];

const radiusOptions: Array<{
  value: RadiusPreset;
  label: string;
  radius: string;
}> = [
  { value: "sharp", label: "Sharp", radius: "2px" },
  { value: "balanced", label: "Balanced", radius: "8px" },
  { value: "soft", label: "Soft", radius: "14px" },
  { value: "round", label: "Round", radius: "22px" },
];

const fontOptions: Array<{
  value: FontPreset;
  label: string;
  sample: string;
}> = [
  { value: "sans", label: "Inter", sample: "Aa" },
  { value: "serif", label: "Source Serif", sample: "Ag" },
  { value: "system", label: "System", sample: "Rr" },
];

const fontTokens: Record<FontPreset, string> = {
  sans: "'Inter', 'Noto Sans SC', system-ui, sans-serif",
  serif: "'Source Serif 4', 'Noto Serif SC', Georgia, serif",
  system: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};

const radiusTokens: Record<RadiusPreset, Record<string, string>> = {
  sharp: {
    "--radius-xs": "2px",
    "--radius-sm": "5px",
    "--radius-lg": "8px",
  },
  balanced: {
    "--radius-xs": "6px",
    "--radius-sm": "10px",
    "--radius-lg": "16px",
  },
  soft: {
    "--radius-xs": "8px",
    "--radius-sm": "16px",
    "--radius-lg": "24px",
  },
  round: {
    "--radius-xs": "12px",
    "--radius-sm": "22px",
    "--radius-lg": "30px",
  },
};

function previewComponentTokens(mode: PlaygroundMode): Record<string, string> {
  const overrides =
    mode === "dark"
      ? themeTokens.componentDark
      : mode === "highContrast"
        ? themeTokens.componentHighContrast
        : {};

  // Component aliases are normally declared on :root. Re-declaring the
  // complete contract on the preview root makes every component resolve
  // against this local generated palette instead of inherited defaults.
  return Object.fromEntries(
    Object.entries({ ...themeTokens.component, ...overrides }).map(
      ([name, value]) => [`--${name}`, value],
    ),
  );
}

function previewSurfaceTokens(
  generatedTheme: ReturnType<typeof generateTheme>,
  mode: PlaygroundMode,
): Record<string, string> {
  if (mode === "highContrast") return {};

  const surfaces = generatedTheme.cssVars[mode];
  const tint = (name: string, amount: number) =>
    `color-mix(in oklab, ${surfaces[name]} ${100 - amount}%, var(--color-primary) ${amount}%)`;

  // Keep mist untinted: block Tabs and chrome use text-secondary on mist,
  // and generateTheme only guarantees that contrast against the base mist.
  return {
    "--color-canvas": tint("--color-canvas", 6),
    "--color-surface": tint("--color-surface", 4),
    "--color-surface-raised": tint("--color-surface-raised", 4),
  };
}

const previewModes = [
  { value: "light", label: "Light", shortLabel: "Light", icon: Sun },
  { value: "dark", label: "Dark", shortLabel: "Dark", icon: Moon },
  {
    value: "highContrast",
    label: "High contrast",
    shortLabel: "Contrast",
    icon: ShieldCheck,
  },
] as const;

const previewViews: Array<{ value: PreviewView; label: string }> = [
  { value: "components", label: "Components" },
  { value: "dashboard", label: "Dashboard" },
  { value: "forms", label: "Forms" },
];

const isOneOf = <T extends string>(
  value: string | null,
  options: ReadonlyArray<T>,
): value is T => value != null && options.includes(value as T);

function isValidHex(value: string): boolean {
  return /^#[0-9a-f]{6}$/i.test(value);
}

function readInitialConfig(): PlaygroundConfig {
  if (typeof window === "undefined") return DEFAULT_CONFIG;
  const params = new URLSearchParams(window.location.search);
  const brand = params.get("brand");
  const mood = params.get("mood");
  const base = params.get("base");
  const contrast = params.get("contrast");
  const mode = params.get("mode");
  const preview = params.get("preview");
  const radius = params.get("radius");
  const font = params.get("font");
  const normalizedBrand = brand
    ? brand.startsWith("#")
      ? brand
      : `#${brand}`
    : "";

  return {
    brandColor: isValidHex(normalizedBrand)
      ? normalizedBrand
      : DEFAULT_CONFIG.brandColor,
    mood: isOneOf(mood, moodOptions.map((option) => option.value))
      ? mood
      : DEFAULT_CONFIG.mood,
    base: isOneOf(base, baseOptions.map((option) => option.value))
      ? base
      : DEFAULT_CONFIG.base,
    contrastRatio: isOneOf(contrast, ["AA", "AAA"])
      ? contrast
      : DEFAULT_CONFIG.contrastRatio,
    mode: isOneOf(mode, ["light", "dark", "highContrast"])
      ? mode
      : DEFAULT_CONFIG.mode,
    preview: isOneOf(preview, ["components", "dashboard", "forms"])
      ? preview
      : DEFAULT_CONFIG.preview,
    radius: isOneOf(radius, ["sharp", "balanced", "soft", "round"])
      ? radius
      : DEFAULT_CONFIG.radius,
    font: isOneOf(font, ["sans", "serif", "system"])
      ? font
      : DEFAULT_CONFIG.font,
  };
}

function customTokens(config: PlaygroundConfig): Record<string, string> {
  return {
    ...radiusTokens[config.radius],
    "--font-family-sans": fontTokens[config.font],
  };
}

function serializeCustomTokens(tokens: Record<string, string>): string {
  return Object.entries(tokens)
    .map(([name, value]) => `  ${name}: ${value};`)
    .join("\n");
}

function buildConfigCode(config: PlaygroundConfig): string {
  const tokens = customTokens(config);
  const modeProps =
    config.mode === "highContrast"
      ? 'theme="light"\n      highContrast'
      : `theme="${config.mode}"`;
  return `import { ThemeProvider } from "velune/react";

const customTokens = ${JSON.stringify(tokens, null, 2)};

export function AppTheme({ children }) {
  return (
    <ThemeProvider
      ${modeProps}
      brandColor="${config.brandColor}"
      mood="${config.mood}"
      base="${config.base}"
      contrastRatio="${config.contrastRatio}"
      customTokens={customTokens}
    >
      {children}
    </ThemeProvider>
  );
}`;
}

async function copyText(value: string): Promise<boolean> {
  if (!navigator.clipboard) return false;
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}

function IconButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <Tooltip>
      <Tooltip.Trigger>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-label={label}
          title={label}
          disabled={disabled ?? false}
          onClick={onClick}
          className="flex-none"
        >
          <Button.Leading>{children}</Button.Leading>
        </Button>
      </Tooltip.Trigger>
      <Tooltip.Content>{label}</Tooltip.Content>
    </Tooltip>
  );
}

function FieldSelect({
  label,
  value,
  onValueChange,
  children,
}: {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <Flex align="center" gap="3" className="py-gs-2">
      <Text
        as="span"
        size="sm"
        tone="muted"
        className="w-gs-16 shrink-0"
      >
        {label}
      </Text>
      <Select
        value={value}
        onValueChange={onValueChange}
        size="sm"
        fullWidth
        aria-label={label}
      >
        <Select.Trigger />
        <Select.Content>{children}</Select.Content>
      </Select>
    </Flex>
  );
}

function ThemeControls({
  config,
  updateConfig,
  canUndo,
  canRedo,
  canExport,
  copiedLink,
  onUndo,
  onRedo,
  onReset,
  onShare,
  onExport,
}: {
  config: PlaygroundConfig;
  updateConfig: (patch: Partial<PlaygroundConfig>) => void;
  canUndo: boolean;
  canRedo: boolean;
  canExport: boolean;
  copiedLink: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
  onShare: () => void;
  onExport: () => void;
}) {
  return (
    <Box
      as="aside"
      aria-label="Theme controls"
      className="flex h-full min-h-gs-0 min-w-gs-0 flex-col"
    >
      <Flex
        align="center"
        justify="between"
        gap="2"
        className="border-b border-gs-border-default px-gs-3 py-gs-3"
      >
        <Text as="h1" size="sm" weight="medium">
          New theme
        </Text>
        <Flex align="center" className="gap-gs-0.5">
          <IconButton label="Undo" disabled={!canUndo} onClick={onUndo}>
            <Undo2 size={14} />
          </IconButton>
          <IconButton label="Redo" disabled={!canRedo} onClick={onRedo}>
            <Redo2 size={14} />
          </IconButton>
          <IconButton label="Reset theme" onClick={onReset}>
            <RotateCcw size={14} />
          </IconButton>
          <IconButton
            label={copiedLink ? "Share link copied" : "Copy share link"}
            onClick={onShare}
          >
            {copiedLink ? <Check size={14} /> : <Share2 size={14} />}
          </IconButton>
        </Flex>
      </Flex>

      <Stack
        gap="4"
        className="min-h-gs-0 flex-1 overflow-y-auto overscroll-contain px-gs-3 py-gs-4"
      >
        <Box>
          <Input
            value={config.brandColor}
            onChange={(event) =>
              updateConfig({ brandColor: event.currentTarget.value })
            }
            aria-label="Brand color hex value"
            invalid={!isValidHex(config.brandColor)}
            spellCheck={false}
            maxLength={7}
            size="sm"
            fullWidth
            className="font-gs-mono uppercase"
          >
            <Input.Label>Brand</Input.Label>
            <Input.Prefix>
              <label className="relative size-gs-5 cursor-pointer overflow-hidden rounded-gs-full border border-gs-border-default">
                <span
                  aria-hidden="true"
                  className="absolute inset-gs-0"
                  style={{
                    backgroundColor: isValidHex(config.brandColor)
                      ? config.brandColor
                      : DEFAULT_CONFIG.brandColor,
                  }}
                />
                <input
                  type="color"
                  value={
                    isValidHex(config.brandColor)
                      ? config.brandColor
                      : DEFAULT_CONFIG.brandColor
                  }
                  onChange={(event) =>
                    updateConfig({ brandColor: event.currentTarget.value })
                  }
                  aria-label="Pick brand color"
                  className="absolute inset-gs-0 size-full cursor-pointer opacity-0"
                />
              </label>
            </Input.Prefix>
            {!isValidHex(config.brandColor) ? (
              <Input.ErrorMessage>Use a six-digit Hex color.</Input.ErrorMessage>
            ) : null}
          </Input>
          <Flex
            className="mt-gs-2 gap-gs-1.5"
            aria-label="Brand color presets"
          >
            {brandPresets.map((preset) => {
              const selected =
                config.brandColor.toLowerCase() === preset.value.toLowerCase();
              return (
                <Button
                  key={preset.value}
                  type="button"
                  size="sm"
                  variant={selected ? "secondary" : "ghost"}
                  aria-label={`Use ${preset.label} brand color`}
                  aria-pressed={selected}
                  title={preset.label}
                  className="!min-h-gs-7 !w-gs-7 !rounded-gs-full !p-gs-0"
                  style={{ backgroundColor: preset.value }}
                  onClick={() => updateConfig({ brandColor: preset.value })}
                />
              );
            })}
          </Flex>
        </Box>

        <Box className="border-t border-gs-border-default pt-gs-2">
          <FieldSelect
            label="Mood"
            value={config.mood}
            onValueChange={(mood) =>
              updateConfig({ mood: mood as ThemeMood })
            }
          >
            {moodOptions.map((option) => (
              <Select.Item
                key={option.value}
                value={option.value}
                textValue={option.label}
              >
                <Flex align="center" gap="2">
                  <Box
                    aria-hidden="true"
                    className="size-gs-3 rounded-gs-full border border-gs-border-default"
                    style={{ backgroundColor: option.swatch }}
                  />
                  {option.label}
                </Flex>
              </Select.Item>
            ))}
          </FieldSelect>

          <FieldSelect
            label="Base"
            value={config.base}
            onValueChange={(base) =>
              updateConfig({ base: base as ThemeBase })
            }
          >
            {baseOptions.map((option) => (
              <Select.Item
                key={option.value}
                value={option.value}
                textValue={option.label}
                aria-label={`Use ${option.label} base palette`}
              >
                <Flex align="center" gap="2">
                  <Box
                    aria-hidden="true"
                    className="grid size-gs-4 grid-cols-2 overflow-hidden rounded-gs-full border border-gs-border-default"
                  >
                    <Box style={{ backgroundColor: option.light }} />
                    <Box style={{ backgroundColor: option.dark }} />
                  </Box>
                  <Box>
                    <Text as="span" size="sm">
                      {option.label}
                    </Text>
                    <Text as="span" size="2xs" tone="muted" className="ms-gs-2">
                      {option.caption}
                    </Text>
                  </Box>
                </Flex>
              </Select.Item>
            ))}
          </FieldSelect>

          <FieldSelect
            label="Radius"
            value={config.radius}
            onValueChange={(radius) =>
              updateConfig({ radius: radius as RadiusPreset })
            }
          >
            {radiusOptions.map((option) => (
              <Select.Item
                key={option.value}
                value={option.value}
                textValue={option.label}
                aria-label={option.label}
              >
                <Flex align="center" gap="2">
                  <Box
                    aria-hidden="true"
                    className="size-gs-4 border-2 border-current"
                    style={{ borderRadius: option.radius }}
                  />
                  {option.label}
                </Flex>
              </Select.Item>
            ))}
          </FieldSelect>

          <FieldSelect
            label="Font"
            value={config.font}
            onValueChange={(font) =>
              updateConfig({ font: font as FontPreset })
            }
          >
            {fontOptions.map((option) => (
              <Select.Item
                key={option.value}
                value={option.value}
                textValue={option.label}
                aria-label={option.label}
              >
                <Flex align="center" gap="2">
                  <Text
                    as="span"
                    size="md"
                    style={{ fontFamily: fontTokens[option.value] }}
                  >
                    {option.sample}
                  </Text>
                  {option.label}
                </Flex>
              </Select.Item>
            ))}
          </FieldSelect>

          <FieldSelect
            label="Contrast"
            value={config.contrastRatio}
            onValueChange={(contrastRatio) =>
              updateConfig({
                contrastRatio: contrastRatio as ThemeContrastLevel,
              })
            }
          >
            <Select.Item value="AA" textValue="WCAG AA">
              WCAG AA
            </Select.Item>
            <Select.Item value="AAA" textValue="WCAG AAA">
              WCAG AAA
            </Select.Item>
          </FieldSelect>
        </Box>
      </Stack>

      <Box className="border-t border-gs-border-default p-gs-3">
        <Button
          type="button"
          size="sm"
          fullWidth
          disabled={!canExport}
          onClick={onExport}
        >
          <Button.Leading>
            <Code2 size={15} />
          </Button.Leading>
          Export
        </Button>
      </Box>
    </Box>
  );
}

function ComponentsPreview({
  contrast,
  mode,
  previewStyle,
}: {
  contrast: ThemeContrastLevel;
  mode: PlaygroundMode;
  previewStyle: CSSProperties | undefined;
}) {
  return (
    <ThemePlaygroundCatalog
      contrast={contrast}
      mode={mode}
      previewStyle={previewStyle}
    />
  );
}

function DashboardPreview() {
  const activity = [
    ["Maya Chen", "Published the release notes", "MC"],
    ["Noah Williams", "Approved the design review", "NW"],
    ["Ari Morgan", "Updated workspace access", "AM"],
  ] as const;

  return (
    <Box>
      <Flex align="center" justify="between" gap="4" wrap>
        <Box>
          <Text as="p" size="xs" tone="muted">
            Product operations
          </Text>
          <Text as="h2" size="2xl" weight="medium" className="mt-gs-1">
            Good morning, Maya
          </Text>
        </Box>
        <Flex align="center" gap="2">
          <Button type="button" variant="secondary" size="sm">
            Share
          </Button>
          <Button type="button" size="sm">
            New project
          </Button>
        </Flex>
      </Flex>

      <Box display="grid" className="mt-gs-6 gap-gs-3 sm:grid-cols-3">
        {[
          ["Active projects", "24", "+12%"],
          ["Review queue", "08", "3 due today"],
          ["Cycle progress", "68%", "On track"],
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
      </Box>

      <Box display="grid" className="mt-gs-4 gap-gs-4 xl:grid-cols-[1.25fr_0.75fr]">
        <Card variant="outlined">
          <Card.Header>
            <Card.Title>Delivery overview</Card.Title>
            <Card.Action>
              <Tag tone="success" size="sm">
                Healthy
              </Tag>
            </Card.Action>
          </Card.Header>
          <Card.Body>
            <Box className="grid h-44 grid-cols-8 items-end gap-gs-2 border-b border-gs-border-default pb-gs-1">
              {[42, 56, 48, 72, 64, 82, 70, 91].map((height, index) => (
                <Box
                  key={index}
                  className="min-h-gs-3 rounded-t-gs-xs bg-gs-primary"
                  style={{ height: `${height}%`, opacity: 0.5 + index * 0.06 }}
                />
              ))}
            </Box>
            <Flex justify="between" className="mt-gs-3">
              <Text size="xs" tone="muted">
                Week 01
              </Text>
              <Text size="xs" tone="muted">
                Week 08
              </Text>
            </Flex>
          </Card.Body>
        </Card>

        <Card variant="elevated">
          <Card.Header>
            <Card.Title>Recent activity</Card.Title>
          </Card.Header>
          <Card.Body>
            <Stack gap="4">
              {activity.map(([name, action, initials]) => (
                <Flex key={name} align="center" gap="3">
                  <Avatar name={name} size="sm">
                    {initials}
                  </Avatar>
                  <Box className="min-w-gs-0">
                    <Text as="p" size="sm" weight="medium" truncate>
                      {name}
                    </Text>
                    <Text as="p" size="xs" tone="muted" truncate>
                      {action}
                    </Text>
                  </Box>
                </Flex>
              ))}
            </Stack>
          </Card.Body>
        </Card>
      </Box>
    </Box>
  );
}

function FormsPreview() {
  return (
    <Box display="grid" className="gap-gs-4 xl:grid-cols-2">
      <Card variant="elevated">
        <Card.Header>
          <Card.Title>Create your workspace</Card.Title>
          <Card.Description>
            Set up the details your team will use every day.
          </Card.Description>
        </Card.Header>
        <Card.Body>
          <Stack gap="4">
            <Input defaultValue="Northstar" fullWidth>
              <Input.Label>Workspace name</Input.Label>
              <Input.Description>Visible to everyone on the team.</Input.Description>
            </Input>
            <Input type="email" defaultValue="maya@northstar.io" fullWidth>
              <Input.Label>Owner email</Input.Label>
            </Input>
            <Select defaultValue="pro" fullWidth portal={false}>
              <Select.Label>Plan</Select.Label>
              <Select.Trigger />
              <Select.Content>
                <Select.Item value="starter">Starter</Select.Item>
                <Select.Item value="pro">Professional</Select.Item>
                <Select.Item value="enterprise">Enterprise</Select.Item>
              </Select.Content>
            </Select>
          </Stack>
        </Card.Body>
        <Card.Footer>
          <Button type="button" variant="secondary">
            Save draft
          </Button>
          <Button type="button">Create workspace</Button>
        </Card.Footer>
      </Card>

      <Card variant="outlined">
        <Card.Header>
          <Card.Title>Notifications</Card.Title>
          <Card.Description>
            Choose which updates need your attention.
          </Card.Description>
        </Card.Header>
        <Card.Body>
          <Stack gap="5">
            <Switch defaultChecked>
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
          </Stack>
        </Card.Body>
      </Card>
    </Box>
  );
}

function ThemePreview({
  config,
  generatedTheme,
  previewStyle,
  updateConfig,
}: {
  config: PlaygroundConfig;
  generatedTheme: ReturnType<typeof generateTheme> | null;
  previewStyle: CSSProperties | undefined;
  updateConfig: (patch: Partial<PlaygroundConfig>) => void;
}) {
  return (
    <Box
      as="section"
      aria-label="Theme preview"
      data-testid="theme-playground-preview"
      data-theme={config.mode === "dark" ? "dark" : "light"}
      data-high-contrast={
        config.mode === "highContrast" ? "true" : undefined
      }
      style={previewStyle}
      className="flex h-full min-h-gs-0 min-w-gs-0 flex-col bg-gs-canvas text-gs-text transition-[background-color,color,border-color] duration-gs-normal ease-gs-standard"
    >
      <Flex
        align="center"
        justify="between"
        gap="3"
        wrap
        className="border-b border-gs-border-default bg-gs-surface px-gs-3 py-gs-2 sm:px-gs-4"
      >
        <Tabs.List aria-label="Preview view" className="min-w-gs-0">
          {previewViews.map((view) => (
            <Tabs.Trigger key={view.value} value={view.value}>
              {view.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
        <Tabs
          value={config.mode}
          onValueChange={(mode) =>
            updateConfig({ mode: mode as PlaygroundMode })
          }
          variant="block"
          className="!gap-gs-0 shrink-0"
        >
          <Tabs.List aria-label="Preview mode">
            {previewModes.map((item) => {
              const Icon = item.icon;
              return (
                <Tabs.Trigger
                  key={item.value}
                  value={item.value}
                  aria-label={item.label}
                  title={item.label}
                >
                  <Icon size={14} aria-hidden="true" className="shrink-0" />
                  <Text
                    as="span"
                    size="xs"
                    className="hidden leading-gs-none sm:inline"
                  >
                    {item.shortLabel}
                  </Text>
                </Tabs.Trigger>
              );
            })}
          </Tabs.List>
        </Tabs>
      </Flex>

      <Box className="min-h-gs-0 flex-1 overflow-auto p-gs-4 sm:p-gs-6 xl:p-gs-8">
        <Box
          key={`${config.mode}-${config.preview}`}
          className="theme-studio-preview-body"
        >
          <Tabs.Panel value="components" className="!py-gs-0">
            <ComponentsPreview
              contrast={config.contrastRatio}
              mode={config.mode}
              previewStyle={previewStyle}
            />
          </Tabs.Panel>
          <Tabs.Panel value="dashboard" className="!py-gs-0">
            <DashboardPreview />
          </Tabs.Panel>
          <Tabs.Panel value="forms" className="!py-gs-0">
            <FormsPreview />
          </Tabs.Panel>
        </Box>
      </Box>

      {generatedTheme ? (
        <Box className="border-t border-gs-border-default bg-gs-surface px-gs-4 py-gs-3">
          <Flex
            className="gap-gs-1"
            aria-label="Generated brand color scale"
          >
            {Object.entries(generatedTheme.scale).map(([stop, value]) => (
              <Box
                key={stop}
                title={`Brand ${stop}: ${value}`}
                className="h-gs-5 min-w-gs-0 flex-1 rounded-gs-xs"
                style={{ background: value }}
              />
            ))}
          </Flex>
        </Box>
      ) : (
        <Box className="border-t border-gs-border-default bg-gs-surface px-gs-4 py-gs-3">
          <Text size="sm" tone="muted">
            Enter a valid brand color to generate a theme.
          </Text>
        </Box>
      )}
    </Box>
  );
}

function ExportDialog({
  open,
  onOpenChange,
  css,
  configCode,
  copiedTarget,
  onCopy,
  onDownload,
  mode,
  previewStyle,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  css: string;
  configCode: string;
  copiedTarget: "css" | "react" | null;
  onCopy: (target: "css" | "react", value: string) => void;
  onDownload: () => void;
  mode: PlaygroundMode;
  previewStyle: CSSProperties | undefined;
}) {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      size="lg"
      data-theme={mode === "dark" ? "dark" : "light"}
      data-high-contrast={mode === "highContrast" ? "true" : undefined}
      style={previewStyle}
    >
      <Modal.Content>
        <Modal.Header>
          <Modal.Title>Export theme</Modal.Title>
          <Modal.Description>
            Use generated CSS directly or configure ThemeProvider in React.
          </Modal.Description>
        </Modal.Header>
        <Modal.Body>
          <Tabs defaultValue="css" variant="block">
            <Tabs.List aria-label="Export format">
              <Tabs.Trigger value="css">CSS</Tabs.Trigger>
              <Tabs.Trigger value="react">React</Tabs.Trigger>
            </Tabs.List>
            <Tabs.Panel value="css">
              <pre
                tabIndex={0}
                aria-label="Generated CSS theme"
                className="mt-gs-3 max-h-[50dvh] overflow-auto border border-gs-border-default bg-gs-surface-mist p-gs-4 font-gs-mono text-gs-xs leading-gs-tight text-gs-text"
              >
                <code>{css}</code>
              </pre>
              <Flex justify="end" gap="2" className="mt-gs-3">
                <Button type="button" variant="ghost" onClick={onDownload}>
                  <Button.Leading>
                    <Download size={15} />
                  </Button.Leading>
                  Download
                </Button>
                <Button type="button" onClick={() => onCopy("css", css)}>
                  <Button.Leading>
                    {copiedTarget === "css" ? (
                      <Check size={15} />
                    ) : (
                      <Clipboard size={15} />
                    )}
                  </Button.Leading>
                  {copiedTarget === "css" ? "Copied" : "Copy CSS"}
                </Button>
              </Flex>
            </Tabs.Panel>
            <Tabs.Panel value="react">
              <pre
                tabIndex={0}
                aria-label="Generated React theme configuration"
                className="mt-gs-3 max-h-[50dvh] overflow-auto border border-gs-border-default bg-gs-surface-mist p-gs-4 font-gs-mono text-gs-xs leading-gs-tight text-gs-text"
              >
                <code>{configCode}</code>
              </pre>
              <Flex justify="end" className="mt-gs-3">
                <Button
                  type="button"
                  onClick={() => onCopy("react", configCode)}
                >
                  <Button.Leading>
                    {copiedTarget === "react" ? (
                      <Check size={15} />
                    ) : (
                      <Clipboard size={15} />
                    )}
                  </Button.Leading>
                  {copiedTarget === "react" ? "Copied" : "Copy React"}
                </Button>
              </Flex>
            </Tabs.Panel>
          </Tabs>
        </Modal.Body>
      </Modal.Content>
    </Modal>
  );
}

export function ThemePlaygroundPage() {
  const [{ config, past, future }, dispatch] = useReducer(
    historyReducer,
    undefined,
    (): ThemeHistory => ({
      config: readInitialConfig(),
      past: [],
      future: [],
    }),
  );
  const [exportOpen, setExportOpen] = useState(false);
  const [copiedTarget, setCopiedTarget] = useState<
    "css" | "react" | "link" | null
  >(null);

  const updateConfig = (patch: Partial<PlaygroundConfig>) => {
    dispatch({ type: "update", patch });
  };

  const undo = () => dispatch({ type: "undo" });
  const redo = () => dispatch({ type: "redo" });
  const reset = () => dispatch({ type: "reset" });

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const meta = event.metaKey || event.ctrlKey;
      if (!meta || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (
        target?.closest(
          "input, textarea, select, [contenteditable=true], [role='textbox']",
        )
      ) {
        return;
      }
      const key = event.key.toLowerCase();
      if (key === "z" && event.shiftKey) {
        event.preventDefault();
        redo();
        return;
      }
      if (key === "y") {
        event.preventDefault();
        redo();
        return;
      }
      if (key === "z") {
        event.preventDefault();
        undo();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const generatedTheme = useMemo(() => {
    try {
      return generateTheme({
        brand: config.brandColor,
        mood: config.mood,
        base: config.base,
        contrastRatio: config.contrastRatio,
      });
    } catch {
      return null;
    }
  }, [config.base, config.brandColor, config.contrastRatio, config.mood]);

  const tokens = useMemo(() => customTokens(config), [config]);

  const previewStyle = useMemo(() => {
    if (!generatedTheme) return undefined;
    return {
      ...generatedTheme.tokens,
      ...generatedTheme.cssVars[config.mode],
      ...previewSurfaceTokens(generatedTheme, config.mode),
      ...previewComponentTokens(config.mode),
      ...tokens,
    } as CSSProperties;
  }, [config.mode, generatedTheme, tokens]);

  const themeCss = useMemo(() => {
    if (!generatedTheme) return "";
    return `@import "velune/react/theme/tokens.css";
@import "velune/react/theme/base.css";
@import "velune/react/tailwind.css";

${getThemeCss(generatedTheme)}

:root, .gs-theme-root {
${serializeCustomTokens(tokens)}
}`;
  }, [generatedTheme, tokens]);

  const configCode = useMemo(() => buildConfigCode(config), [config]);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("brand", config.brandColor.replace("#", ""));
    params.set("mood", config.mood);
    params.set("base", config.base);
    params.set("contrast", config.contrastRatio);
    params.set("mode", config.mode);
    params.set("preview", config.preview);
    params.set("radius", config.radius);
    params.set("font", config.font);
    window.history.replaceState(null, "", `${window.location.pathname}?${params}`);
  }, [config]);

  const markCopied = (target: "css" | "react" | "link") => {
    setCopiedTarget(target);
    window.setTimeout(() => setCopiedTarget(null), 1600);
  };

  const handleCopy = (target: "css" | "react", value: string) => {
    void copyText(value).then((success) => {
      if (success) markCopied(target);
    });
  };

  const share = () => {
    void copyText(window.location.href).then((success) => {
      if (success) markCopied("link");
    });
  };

  const downloadCss = () => {
    if (!themeCss) return;
    const href = URL.createObjectURL(new Blob([themeCss], { type: "text/css" }));
    const anchor = document.createElement("a");
    anchor.href = href;
    anchor.download = "velune-theme.css";
    anchor.click();
    URL.revokeObjectURL(href);
  };

  return (
    <Box
      data-testid="theme-playground"
      className="theme-studio flex h-full min-h-gs-0 flex-col overflow-hidden"
    >
      <Tabs
        value={config.preview}
        onValueChange={(preview) =>
          updateConfig({ preview: preview as PreviewView })
        }
        variant="underline"
        className="flex min-h-gs-0 flex-1 flex-col !gap-gs-0"
      >
        <Box className="mx-auto flex min-h-gs-0 w-full max-w-[1680px] flex-1 flex-col gap-gs-3 overflow-hidden p-gs-3 sm:p-gs-4 lg:flex-row lg:gap-gs-4 lg:p-gs-5">
          <Box className="theme-studio-frame flex max-h-[min(70dvh,560px)] w-full shrink-0 flex-col overflow-hidden rounded-gs-sm border border-gs-border-default lg:max-h-none lg:h-auto lg:min-h-gs-0 lg:w-[300px] lg:self-stretch">
            <ThemeControls
              config={config}
              updateConfig={updateConfig}
              canUndo={past.length > 0}
              canRedo={future.length > 0}
              canExport={Boolean(themeCss)}
              copiedLink={copiedTarget === "link"}
              onUndo={undo}
              onRedo={redo}
              onReset={reset}
              onShare={share}
              onExport={() => setExportOpen(true)}
            />
          </Box>
          <Box className="theme-studio-frame flex min-h-[min(64dvh,640px)] min-w-gs-0 flex-1 flex-col overflow-hidden rounded-gs-sm border border-gs-border-default lg:min-h-gs-0">
            <ThemePreview
              config={config}
              generatedTheme={generatedTheme}
              previewStyle={previewStyle}
              updateConfig={updateConfig}
            />
          </Box>
        </Box>
      </Tabs>

      <ExportDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        css={themeCss}
        configCode={configCode}
        copiedTarget={
          copiedTarget === "css" || copiedTarget === "react"
            ? copiedTarget
            : null
        }
        onCopy={handleCopy}
        onDownload={downloadCss}
        mode={config.mode}
        previewStyle={previewStyle}
      />
    </Box>
  );
}
