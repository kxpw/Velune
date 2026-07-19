#!/usr/bin/env node
import { readReference } from "./_shared.mjs";

const documents = {
  setup: "setup.md",
  theming: "theming.md",
  patterns: "patterns.md",
  components: "components.md",
};
const topic = process.argv[2];
if (!topic || !documents[topic]) {
  console.error(
    `Usage: node get_docs.mjs <${Object.keys(documents).join("|")}>`,
  );
  process.exit(1);
}
console.log(readReference(documents[topic]));
