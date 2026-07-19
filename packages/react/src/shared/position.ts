export type Placement =
  | "top"
  | "top-start"
  | "top-end"
  | "bottom"
  | "bottom-start"
  | "bottom-end"
  | "left"
  | "left-start"
  | "left-end"
  | "right"
  | "right-start"
  | "right-end";

export type PlacementSide = "top" | "bottom" | "left" | "right";

export type PositionCoords = {
  x: number;
  y: number;
  placement: Placement;
};

const OPPOSITE: Record<PlacementSide, PlacementSide> = {
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left",
};

export function getPlacementSide(placement: Placement): PlacementSide {
  return placement.split("-")[0] as PlacementSide;
}

function alignCrossAxis(
  side: PlacementSide,
  align: "start" | "center" | "end",
  trigger: DOMRect,
  floating: { width: number; height: number },
): number {
  const isVertical = side === "top" || side === "bottom";

  if (isVertical) {
    if (align === "start") {
      return trigger.left;
    }
    if (align === "end") {
      return trigger.right - floating.width;
    }
    return trigger.left + (trigger.width - floating.width) / 2;
  }

  if (align === "start") {
    return trigger.top;
  }
  if (align === "end") {
    return trigger.bottom - floating.height;
  }
  return trigger.top + (trigger.height - floating.height) / 2;
}

function placeOnSide(
  side: PlacementSide,
  align: "start" | "center" | "end",
  trigger: DOMRect,
  floating: { width: number; height: number },
  offset: number,
): { x: number; y: number } {
  let x = 0;
  let y = 0;

  if (side === "top") {
    x = alignCrossAxis(side, align, trigger, floating);
    y = trigger.top - floating.height - offset;
  } else if (side === "bottom") {
    x = alignCrossAxis(side, align, trigger, floating);
    y = trigger.bottom + offset;
  } else if (side === "left") {
    x = trigger.left - floating.width - offset;
    y = alignCrossAxis(side, align, trigger, floating);
  } else {
    x = trigger.right + offset;
    y = alignCrossAxis(side, align, trigger, floating);
  }

  return { x, y };
}

function parseAlign(placement: Placement): "start" | "center" | "end" {
  const parts = placement.split("-");
  if (parts[1] === "start" || parts[1] === "end") {
    return parts[1];
  }
  return "center";
}

function getMainAxisOverflow(
  side: PlacementSide,
  x: number,
  y: number,
  floating: { width: number; height: number },
  padding: number,
): number {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const isVertical = side === "top" || side === "bottom";
  const start = isVertical ? y : x;
  const size = isVertical ? floating.height : floating.width;
  const viewportSize = isVertical ? vh : vw;

  return (
    Math.max(0, padding - start) +
    Math.max(0, start + size - (viewportSize - padding))
  );
}

function clampToViewport(
  x: number,
  y: number,
  floating: { width: number; height: number },
  padding: number,
): { x: number; y: number } {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  return {
    x: Math.min(
      Math.max(x, padding),
      Math.max(padding, vw - floating.width - padding),
    ),
    y: Math.min(
      Math.max(y, padding),
      Math.max(padding, vh - floating.height - padding),
    ),
  };
}

function isReferenceOutsideViewport(trigger: DOMRect): boolean {
  return (
    trigger.bottom <= 0 ||
    trigger.top >= window.innerHeight ||
    trigger.right <= 0 ||
    trigger.left >= window.innerWidth
  );
}

export function computePosition({
  trigger,
  floating,
  placement,
  offset = 8,
  flip = true,
  padding = 8,
}: {
  trigger: DOMRect;
  floating: { width: number; height: number };
  placement: Placement;
  offset?: number;
  flip?: boolean;
  padding?: number;
}): PositionCoords {
  const side = getPlacementSide(placement);
  const align = parseAlign(placement);
  let resolved: Placement = placement;

  let coords = placeOnSide(side, align, trigger, floating, offset);

  if (flip) {
    const flippedSide = OPPOSITE[side];
    const flippedPlacement = (
      align === "center" ? flippedSide : `${flippedSide}-${align}`
    ) as Placement;
    const flipped = placeOnSide(flippedSide, align, trigger, floating, offset);
    const preferredOverflow = getMainAxisOverflow(
      side,
      coords.x,
      coords.y,
      floating,
      padding,
    );
    const flippedOverflow = getMainAxisOverflow(
      flippedSide,
      flipped.x,
      flipped.y,
      floating,
      padding,
    );

    if (flippedOverflow < preferredOverflow) {
      coords = flipped;
      resolved = flippedPlacement;
    }
  }

  // Once the anchor leaves the viewport, keep the floating element attached
  // to it instead of pinning an orphaned panel to the viewport edge.
  const clamped = isReferenceOutsideViewport(trigger)
    ? coords
    : clampToViewport(coords.x, coords.y, floating, padding);
  return { x: clamped.x, y: clamped.y, placement: resolved };
}
