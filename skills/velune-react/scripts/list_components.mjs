#!/usr/bin/env node
import { components, resolveContext } from "./_shared.mjs";

const context = resolveContext();
console.log(
  JSON.stringify(
    {
      package: "velune/react",
      count: components.length,
      source: context.kind,
      components,
    },
    null,
    2,
  ),
);
