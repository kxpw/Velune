import { describe, expect, it } from "vitest";
import { acquireOverlayLayer, releaseOverlayLayer } from "./overlay-stack";

describe("overlay layer allocation", () => {
  it("does not reuse a layer when overlays close out of order", () => {
    const first = acquireOverlayLayer();
    const second = acquireOverlayLayer();

    releaseOverlayLayer(first);
    const third = acquireOverlayLayer();

    expect(new Set([second, third]).size).toBe(2);

    releaseOverlayLayer(second);
    releaseOverlayLayer(third);
  });

  it("returns to the base layer when all overlays close", () => {
    const layer = acquireOverlayLayer();
    expect(layer).toBe(1);
    releaseOverlayLayer(layer);
  });
});
