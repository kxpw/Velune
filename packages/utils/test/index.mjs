import assert from "node:assert/strict";

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function isDefined(value) {
  return value !== null && value !== undefined;
}

assert.equal(clamp(12, 0, 10), 10);
assert.deepEqual([1, null, 2].filter(isDefined), [1, 2]);
