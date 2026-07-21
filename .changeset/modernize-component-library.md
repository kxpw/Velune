---
"velune": minor
---

Modernize the component library with new components, responsive layouts, and
consistent public APIs:

- Add Alert, Breadcrumb, Slider, and Combobox, including accessible compound
  slots, controlled state, keyboard support, and customizable presentation.
- Add Standard Schema validation to Form and share Modal/Drawer dialog
  behavior through an internal primitive.
- Add breakpoint-responsive props to Box, Container, Flex, Grid, and Stack.
- Standardize polymorphic elements on `as`, including Container support.
- Add Button `asChild`, `tone="danger"`, and `buttonClasses()`; add style
  recipes for Tag and Input.
- Add Combobox.NoMatches, controlled Alert visibility, Checkbox group slots,
  Switch `lg`, TextArea `resize`, Pagination `hideOnSinglePage`,
  `toast.promise`, Stack dividers, and Spinner labels.
- Remove the deprecated Stack `spacing` prop; use `gap`, including responsive
  values, as the sole spacing API.
- Replace react-aria-components and @internationalized/date with in-house
  Slider, Dropdown, and DateRangePicker implementations, reducing consumer
  bundle sizes while preserving documented behavior.
- Improve floating-layer and modal motion, and show selection checks in
  Select and Combobox.
