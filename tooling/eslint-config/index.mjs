import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";
import prettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";

const baseFiles = ["**/*.{ts,tsx,js,mjs,cjs}"];
const internalPackages = {
  utils: ["@velune/utils", "@velune/utils/*"],
  hooks: ["@velune/hooks", "@velune/hooks/*"],
  react: ["velune/react", "velune/react/*"],
  multimodal: ["@velune/multimodal", "@velune/multimodal/*"],
  aggregate: ["velune", "velune/*"],
};

const restrictedInternalImports = (packages, message) => ({
  "no-restricted-imports": [
    "error",
    {
      patterns: [
        {
          group: packages.flatMap((name) => internalPackages[name]),
          message,
        },
      ],
    },
  ],
});

export const veluneConfig = [
  {
    ignores: [
      "**/dist/**",
      "**/coverage/**",
      "**/playwright-report/**",
      "**/test-results/**",
      "**/storybook-static/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: baseFiles,
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
      "jsx-a11y": jsxA11y,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      "react/prop-types": "off",
      "react/react-in-jsx-scope": "off",
      "react/jsx-key": "error",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "jsx-a11y/alt-text": "error",
      "jsx-a11y/anchor-is-valid": "error",
    },
  },
  {
    files: ["packages/utils/**/*.{ts,tsx,js,mjs,cjs}"],
    rules: restrictedInternalImports(
      ["hooks", "react", "multimodal", "aggregate"],
      "L1 utilities may not depend on higher Velune layers.",
    ),
  },
  {
    files: ["packages/hooks/**/*.{ts,tsx,js,mjs,cjs}"],
    rules: restrictedInternalImports(
      ["hooks", "react", "multimodal", "aggregate"],
      "L2 primitives may only depend on L1 utilities.",
    ),
  },
  {
    files: ["packages/react/**/*.{ts,tsx,js,mjs,cjs}"],
    rules: restrictedInternalImports(
      ["multimodal", "aggregate"],
      "L3 React components may not depend on multimodal or aggregate layers.",
    ),
  },
  {
    files: ["packages/multimodal/**/*.{ts,tsx,js,mjs,cjs}"],
    rules: restrictedInternalImports(
      ["aggregate"],
      "L4 multimodal components may not depend on the aggregate package.",
    ),
  },
  prettier,
];
