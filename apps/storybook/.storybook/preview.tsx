import { ThemeProvider } from "velune/react";
// Relative path so Vite always resolves tokens outside the app root.
import "../../../packages/react/src/theme/tokens.css";
import "../src/storybook.css";
import { StoryProfiler } from "./profiler";

type StoryContext = {
  id: string;
  globals: {
    theme?: "system" | "light" | "dark";
    highContrast?: boolean;
    reducedMotion?: boolean;
  };
};

const preview = {
  decorators: [
    (Story: () => JSX.Element, context: StoryContext) => (
      <ThemeProvider
        theme={context.globals.theme ?? "light"}
        highContrast={context.globals.highContrast ?? false}
        reducedMotion={context.globals.reducedMotion ?? false}
      >
        <StoryProfiler storyId={context.id}>
          <div className="gs-story-canvas">
            <Story />
          </div>
        </StoryProfiler>
      </ThemeProvider>
    ),
  ],
  globalTypes: {
    theme: {
      defaultValue: "light",
      toolbar: {
        icon: "circlehollow",
        items: ["system", "light", "dark"],
        title: "Theme",
      },
    },
    highContrast: {
      defaultValue: false,
      toolbar: {
        icon: "contrast",
        items: [false, true],
        title: "High contrast",
      },
    },
    reducedMotion: {
      defaultValue: false,
      toolbar: {
        icon: "stop",
        items: [false, true],
        title: "Reduced motion",
      },
    },
  },
  parameters: {
    layout: "padded",
    backgrounds: { disable: true },
  },
};

export default preview;
