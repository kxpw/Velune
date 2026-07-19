const overlayLayers = new Set<number>();

/** Nested overlay z-index steps above base token layers. */
export function acquireOverlayLayer(): number {
  const layer = Math.max(0, ...overlayLayers) + 1;
  overlayLayers.add(layer);
  return layer;
}

export function releaseOverlayLayer(layer: number): void {
  overlayLayers.delete(layer);
}

/**
 * Escape dismissal layering. Every Escape-closable overlay registers a
 * layer while open; document-level Escape handlers must only act for the
 * top layer, otherwise one key press closes the whole stack (document
 * listeners on the same node are not stopped by `stopPropagation`).
 */
const escapeLayers: number[] = [];
let escapeLayerSeed = 0;

export function pushEscapeLayer(): number {
  escapeLayerSeed += 1;
  escapeLayers.push(escapeLayerSeed);
  return escapeLayerSeed;
}

export function popEscapeLayer(layer: number): void {
  const index = escapeLayers.indexOf(layer);
  if (index >= 0) {
    escapeLayers.splice(index, 1);
  }
}

export function isTopEscapeLayer(layer: number): boolean {
  return escapeLayers[escapeLayers.length - 1] === layer;
}
