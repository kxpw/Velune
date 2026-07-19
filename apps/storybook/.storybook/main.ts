import tailwindcss from "@tailwindcss/vite";

const rootDir = process
  .cwd()
  .replace(/\\/g, "/")
  .replace(/\/apps\/storybook$/, "");

const config = {
  stories: [
    "../src/**/*.stories.@(ts|tsx)",
    "../../../packages/react/src/**/*.stories.@(ts|tsx)",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  addons: [],
  staticDirs: ["../public"],
  docs: {
    autodocs: true,
  },
  viteFinal(config: {
    plugins?: unknown[];
    resolve?: { alias?: Record<string, string> };
    server?: { fs?: { allow?: string[] } };
  }) {
    config.plugins = [...(config.plugins ?? []), tailwindcss()];

    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve?.alias,
        "velune/react": `${rootDir}/packages/react/src/index.ts`,
      },
    };

    config.server = {
      ...config.server,
      fs: {
        ...config.server?.fs,
        allow: Array.from(
          new Set([...(config.server?.fs?.allow ?? []), rootDir]),
        ),
      },
    };

    return config;
  },
};

export default config;
