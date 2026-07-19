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
  },
  ignoreFiles: [
    "**/dist/**",
    "**/coverage/**",
    "**/playwright-report/**",
    "**/storybook-static/**",
  ],
};
