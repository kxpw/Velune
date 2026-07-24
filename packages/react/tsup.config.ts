import { defineConfig, type Options } from "tsup";

// The two configs below run in parallel and write into the same dist
// directory, so neither may use `clean: true` (they would delete each
// other's output). The package build script removes dist before tsup runs.
const sharedOptions = {
  format: ["esm", "cjs"],
  outExtension: ({ format }) => ({
    js: format === "esm" ? ".mjs" : ".cjs",
  }),
  dts: {
    compilerOptions: {
      composite: false,
    },
  },
  sourcemap: false,
  clean: false,
  treeshake: true,
  noExternal: ["@velune/hooks"],
  external: ["react", "react-dom", "clsx", "@tanstack/react-virtual"],
} satisfies Options;

export default defineConfig([
  {
    ...sharedOptions,
    entry: [
      "src/index.ts",
      "src/theme/index.tsx",
      "src/relief-card/index.ts",
      "src/avatar/index.ts",
      "src/badge/index.ts",
      "src/box/index.ts",
      "src/button/index.ts",
      "src/card/index.ts",
      "src/checkbox/index.ts",
      "src/collapse/index.ts",
      "src/date-picker/index.ts",
      "src/date-range-picker/index.ts",
      "src/container/index.ts",
      "src/divider/index.ts",
      "src/drawer/index.ts",
      "src/dropdown/index.ts",
      "src/flex/index.ts",
      "src/form/index.ts",
      "src/grid/index.ts",
      "src/input/index.ts",
      "src/list/index.ts",
      "src/modal/index.ts",
      "src/pagination/index.ts",
      "src/popover/index.ts",
      "src/progress/index.ts",
      "src/radio/index.ts",
      "src/select/index.ts",
      "src/skeleton/index.ts",
      "src/spinner/index.ts",
      "src/stack/index.ts",
      "src/switch/index.ts",
      "src/table/index.ts",
      "src/tabs/index.ts",
      "src/tag/index.ts",
      "src/text/index.ts",
      "src/text-area/index.ts",
      "src/toast/index.ts",
      "src/tooltip/index.ts",
      "src/virtual-table/index.ts",
      "src/wizard/index.ts",
      "src/alert/index.ts",
      "src/breadcrumb/index.ts",
      "src/combobox/index.ts",
      "src/slider/index.ts",
      "src/aspect-ratio/index.ts",
      "src/empty/index.ts",
      "src/icon/index.ts",
      "src/kbd/index.ts",
      "src/scroll-area/index.ts",
      "src/sidebar/index.ts",
    ],
    splitting: true,
    // Mark component entries (and their shared chunks) as client modules so
    // they work out of the box in React Server Components environments.
    // Note: the `treeshake` Rollup pass strips module-level directives from
    // the emitted chunks, so the package build script also runs
    // tooling/scripts/add-use-client-directives.mjs after tsup to guarantee
    // the directive is present in every built JS file.
    banner: {
      js: '"use client";',
    },
  },
  {
    ...sharedOptions,
    // Design tokens are pure data and must remain importable from Server
    // Components, so this entry is built without the "use client" banner.
    entry: {
      "theme/tokens": "src/theme/tokens.ts",
    },
    splitting: false,
  },
]);
