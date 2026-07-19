import { readFileSync } from "node:fs";

const fileOnly = ["@size-limit/esbuild"];

function packageArtifact(name, path, limit) {
  return {
    name,
    path,
    gzip: true,
    limit,
    disablePlugins: fileOnly,
  };
}

function consumerComponent(name, directory, limit) {
  return {
    name: `velune/react/${name} (first-load consumer bundle)`,
    path: `packages/velune/dist/react/${directory}/index.mjs`,
    gzip: true,
    ignore: ["react", "react-dom"],
    limit,
    modifyEsbuildConfig: configureConsumerBuild,
  };
}

function configureConsumerBuild(config) {
  return {
    ...config,
    format: "esm",
    logLevel: "silent",
    plugins: [
      ...(config.plugins ?? []),
      {
        name: "defer-optional-ui-chunks",
        setup(build) {
          build.onResolve(
            {
              filter:
                /(?:virtual-table\/VirtualTable|VirtualTable-[^/]+\.mjs|select\/SelectVirtualList|SelectVirtualList-[^/]+\.mjs|date-range-picker\/DateRangeCalendar|DateRangeCalendar-[^/]+\.mjs|dropdown\/DropdownMenu|DropdownMenu-[^/]+\.mjs)$/,
            },
            (args) =>
              args.kind === "dynamic-import"
                ? { path: args.path, external: true }
                : null,
          );
        },
      },
    ],
  };
}

const componentBudgets = {
  "relief-card": "3 kB",
  avatar: "2.5 kB",
  badge: "2 kB",
  box: "1.5 kB",
  button: "5.2 kB",
  card: "2.5 kB",
  checkbox: "4.5 kB",
  collapse: "4 kB",
  "date-picker": "9.5 kB",
  "date-range-picker": "60 kB",
  container: "1.2 kB",
  divider: "1.5 kB",
  drawer: "5.5 kB",
  dropdown: "6.5 kB",
  flex: "1.5 kB",
  form: "3.5 kB",
  grid: "1.5 kB",
  input: "6.2 kB",
  list: "3.5 kB",
  modal: "5.5 kB",
  pagination: "11 kB",
  popover: "5 kB",
  progress: "3.2 kB",
  radio: "5 kB",
  select: "9.5 kB",
  skeleton: "2.5 kB",
  spinner: "2 kB",
  stack: "1.5 kB",
  switch: "3.5 kB",
  table: "9.9 kB",
  tabs: "4 kB",
  tag: "2.5 kB",
  text: "2 kB",
  textarea: "4 kB",
  toast: "6 kB",
  tooltip: "5 kB",
  "virtual-table": "17 kB",
  wizard: "7 kB",
};

const reactPackage = JSON.parse(
  readFileSync(
    new URL("./packages/react/package.json", import.meta.url),
    "utf8",
  ),
);
const componentEntries = Object.entries(reactPackage.exports).flatMap(
  ([subpath, definition]) => {
    const match =
      typeof definition === "object" && definition !== null
        ? definition.import?.match(/^\.\/dist\/([^/]+)\/index\.mjs$/)
        : null;
    if (subpath === "." || !match || match[1] === "theme") return [];

    const name = subpath.slice(2);
    const limit = componentBudgets[name];
    if (!limit) {
      throw new Error(`Missing size budget for velune/react/${name}`);
    }

    return [consumerComponent(name, match[1], limit)];
  },
);

const unknownComponentBudgets = Object.keys(componentBudgets).filter(
  (name) =>
    !componentEntries.some(
      (entry) =>
        entry.name === `velune/react/${name} (first-load consumer bundle)`,
    ),
);
if (unknownComponentBudgets.length > 0) {
  throw new Error(
    `Size budgets do not match public React exports: ${unknownComponentBudgets.join(", ")}`,
  );
}

export default [
  packageArtifact(
    "velune/react (full package)",
    ["packages/velune/dist/react/*.mjs", "packages/velune/dist/react/*.css"],
    "140 kB",
  ),
  ...componentEntries,
  {
    name: "velune/react common basket (first-load consumer bundle)",
    path: "tooling/size-limit/react-basket.mjs",
    gzip: true,
    ignore: ["react", "react-dom"],
    limit: "19.1 kB",
    modifyEsbuildConfig: configureConsumerBuild,
  },
  packageArtifact("@velune/hooks", "packages/hooks/dist/index.mjs", "1.25 kB"),
  packageArtifact(
    "@velune/multimodal",
    "packages/multimodal/dist/index.mjs",
    "300 B",
  ),
  packageArtifact("@velune/utils", "packages/utils/dist/index.mjs", "400 B"),
  packageArtifact(
    "velune (framework-neutral root)",
    "packages/velune/dist/index.mjs",
    "100 B",
  ),
];
