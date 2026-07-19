export type ComponentCategory =
  | "Foundations"
  | "Inputs"
  | "Navigation"
  | "Feedback"
  | "Overlays"
  | "Data display"
  | "Layout";

export type ComponentEntry = {
  slug: string;
  name: string;
  category: ComponentCategory;
  description: string;
  status?: "New" | "Updated";
  importName?: string;
  publicSubpath?: string;
};

export const components: ComponentEntry[] = [
  {
    slug: "relief-card",
    name: "ReliefCard",
    category: "Data display",
    description:
      "A subtle relief card for one intentional decorative moment per page.",
    status: "New",
    importName: "ReliefCard",
  },
  {
    slug: "avatar",
    name: "Avatar",
    category: "Data display",
    description:
      "Represent people and entities with images, initials, and grouped stacks.",
  },
  {
    slug: "badge",
    name: "Badge",
    category: "Data display",
    description: "Compact status and count indicators for nearby content.",
  },
  {
    slug: "box",
    name: "Box",
    category: "Layout",
    description:
      "Token-aware primitive for spacing and semantic HTML composition.",
  },
  {
    slug: "button",
    name: "Button",
    category: "Inputs",
    description:
      "Trigger commands with primary, secondary, ghost, and danger emphasis.",
    status: "Updated",
  },
  {
    slug: "card",
    name: "Card",
    category: "Data display",
    description:
      "Group related content with quiet filled, elevated, or interactive surfaces.",
  },
  {
    slug: "checkbox",
    name: "Checkbox",
    category: "Inputs",
    description:
      "Select independent options, including indeterminate group states.",
  },
  {
    slug: "collapse",
    name: "Collapse",
    category: "Data display",
    description:
      "Progressively disclose sections with accessible accordion behavior.",
    status: "Updated",
  },
  {
    slug: "container",
    name: "Container",
    category: "Layout",
    description:
      "Constrain content width consistently across application surfaces.",
  },
  {
    slug: "date-picker",
    name: "Date Picker",
    category: "Inputs",
    description:
      "Choose dates with constraints, keyboard navigation, and locale formatting.",
    status: "New",
  },
  {
    slug: "date-range-picker",
    name: "Date Range Picker",
    category: "Inputs",
    description:
      "Choose a start and end date with editable segments and a shared range calendar.",
    status: "New",
  },
  {
    slug: "divider",
    name: "Divider",
    category: "Layout",
    description:
      "Separate related regions with subtle horizontal or vertical rules.",
  },
  {
    slug: "drawer",
    name: "Drawer",
    category: "Overlays",
    description: "Present contextual workflows from any viewport edge.",
  },
  {
    slug: "dropdown",
    name: "Dropdown",
    category: "Inputs",
    description:
      "Present keyboard-accessible actions, grouped commands, and selectable options.",
    status: "New",
  },
  {
    slug: "flex",
    name: "Flex",
    category: "Layout",
    description:
      "Compose one-dimensional responsive layouts using design tokens.",
  },
  {
    slug: "form",
    name: "Form",
    category: "Inputs",
    description:
      "Coordinate field values, validation rules, and submission state.",
  },
  {
    slug: "grid",
    name: "Grid",
    category: "Layout",
    description:
      "Create responsive grid structures with predictable tracks and gaps.",
  },
  {
    slug: "input",
    name: "Input",
    category: "Inputs",
    description:
      "Capture text with labels, descriptions, adornments, and validation.",
  },
  {
    slug: "list",
    name: "List",
    category: "Data display",
    description:
      "Display scan-friendly collections with interactive item states.",
  },
  {
    slug: "modal",
    name: "Modal",
    category: "Overlays",
    description: "Focus attention on a blocking decision or short workflow.",
  },
  {
    slug: "pagination",
    name: "Pagination",
    category: "Navigation",
    description: "Navigate large result sets with compact page controls.",
  },
  {
    slug: "popover",
    name: "Popover",
    category: "Overlays",
    description: "Anchor rich contextual content to a trigger.",
  },
  {
    slug: "progress",
    name: "Progress",
    category: "Feedback",
    description:
      "Single-glaze progress track — one material thinning into depth.",
    status: "New",
  },
  {
    slug: "radio",
    name: "Radio",
    category: "Inputs",
    description: "Choose exactly one option from a related set.",
  },
  {
    slug: "select",
    name: "Select",
    category: "Inputs",
    description: "Choose from searchable or grouped option lists.",
  },
  {
    slug: "skeleton",
    name: "Skeleton",
    category: "Feedback",
    description:
      "Reserve content structure while data is loading without shifting layout.",
  },
  {
    slug: "spinner",
    name: "Spinner",
    category: "Feedback",
    description: "Communicate indeterminate progress at multiple sizes.",
  },
  {
    slug: "stack",
    name: "Stack",
    category: "Layout",
    description:
      "Arrange children vertically or horizontally with tokenized spacing.",
  },
  {
    slug: "switch",
    name: "Switch",
    category: "Inputs",
    description: "Toggle a setting that takes effect immediately.",
  },
  {
    slug: "table",
    name: "Table",
    category: "Data display",
    description: "Sort, select, and scroll structured data.",
    status: "Updated",
  },
  {
    slug: "virtual-table",
    name: "VirtualTable",
    category: "Data display",
    description:
      "Render large structured datasets with a bounded virtualized viewport.",
  },
  {
    slug: "tabs",
    name: "Tabs",
    category: "Navigation",
    description: "Switch peer views using underline or block presentation.",
    status: "Updated",
  },
  {
    slug: "tag",
    name: "Tag",
    category: "Data display",
    description:
      "Label categories and removable selections with semantic tones.",
  },
  {
    slug: "text",
    name: "Text",
    category: "Foundations",
    description:
      "Apply the type scale, weight, tone, and semantic element consistently.",
  },
  {
    slug: "text-area",
    name: "Text Area",
    category: "Inputs",
    description: "Capture longer text with autosizing and validation support.",
    importName: "TextArea",
    publicSubpath: "textarea",
  },
  {
    slug: "toast",
    name: "Toast",
    category: "Feedback",
    description:
      "Deliver transient feedback without interrupting the current task.",
    importName: "ToastProvider, toast",
  },
  {
    slug: "tooltip",
    name: "Tooltip",
    category: "Overlays",
    description: "Name or clarify compact controls on hover and focus.",
  },
  {
    slug: "wizard",
    name: "Wizard",
    category: "Navigation",
    description: "Guide users through a sequenced multi-step workflow.",
    status: "New",
  },
];

export const categories: ComponentCategory[] = [
  "Foundations",
  "Inputs",
  "Navigation",
  "Feedback",
  "Overlays",
  "Data display",
  "Layout",
];

export function componentImport(entry: ComponentEntry) {
  const importName = entry.importName ?? entry.name.replaceAll(" ", "");
  const publicSubpath = entry.publicSubpath ?? entry.slug;
  return `import { ${importName} } from "velune/react/${publicSubpath}";`;
}
