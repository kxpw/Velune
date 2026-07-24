module.exports = {
  extends: ["stylelint-config-standard"],
  rules: {
    "at-rule-no-unknown": [
      true,
      { ignoreAtRules: ["custom-variant", "source", "theme", "utility"] },
    ],
    "import-notation": null,
    // Stateful component selectors intentionally override earlier base states.
    "no-descending-specificity": null,
    // Design tokens include Tailwind-escaped half steps (e.g. --space-0\.5).
    "custom-property-pattern": null,
  },
  ignoreFiles: [
    "**/dist/**",
    "**/coverage/**",
    "**/playwright-report/**",
    "**/storybook-static/**",
  ],
  overrides: [
    {
      files: ["**/theme/tokens.css"],
      rules: {
        // Generated aggregator: adjacent banner comments are intentional.
        "comment-empty-line-before": null,
      },
    },
  ],
};
