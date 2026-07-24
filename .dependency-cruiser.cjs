module.exports = {
  forbidden: [
    {
      name: "no-circular",
      severity: "error",
      comment: "Layered packages must stay acyclic.",
      from: {},
      to: {
        circular: true,
      },
    },
    {
      name: "hooks-no-peer-or-higher-layer",
      severity: "error",
      from: { path: "^packages/hooks/" },
      to: { path: "^packages/(react|velune)/" },
    },
    {
      name: "react-no-higher-layer",
      severity: "error",
      from: { path: "^packages/react/" },
      to: { path: "^packages/velune/" },
    },
    {
      name: "packages-no-app-dependency",
      severity: "error",
      from: { path: "^packages/" },
      to: { path: "^apps/" },
    },
  ],
  options: {
    doNotFollow: {
      path: "node_modules",
      dependencyTypes: [
        "npm",
        "npm-dev",
        "npm-optional",
        "npm-peer",
        "npm-bundled",
        "npm-no-pkg",
      ],
    },
    exclude: {
      path: "(^|/)(dist|coverage|playwright-report|test-results|storybook-static|\\.next|\\.vitepress/(cache|dist|\\.temp))(/|$)",
    },
    tsConfig: {
      fileName: "tsconfig.json",
    },
    enhancedResolveOptions: {
      extensions: [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".json"],
    },
  },
};
