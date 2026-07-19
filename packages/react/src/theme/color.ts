export type Rgb = {
  r: number;
  g: number;
  b: number;
};

export type Oklab = {
  l: number;
  a: number;
  b: number;
};

export type Oklch = {
  l: number;
  c: number;
  h: number;
};

export const LIGHTNESS_STOPS = [
  0.97, 0.93, 0.86, 0.76, 0.66, 0.56, 0.48, 0.4, 0.31, 0.22,
] as const;

export const TOKEN_STOPS = [
  "50",
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
] as const;

export type ColorScaleStop = (typeof TOKEN_STOPS)[number];
export type ColorScale = Record<ColorScaleStop, string>;

export function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value));
}

export function parseHex(seed: string): Rgb {
  const normalized = seed.replace("#", "").trim();
  const value =
    normalized.length === 3
      ? normalized
          .split("")
          .map((part) => part + part)
          .join("")
      : normalized;

  if (!/^[0-9a-fA-F]{6}$/.test(value)) {
    throw new Error(`Expected a 3 or 6 digit hex color, received "${seed}".`);
  }

  const int = Number.parseInt(value, 16);
  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255,
  };
}

function srgbToLinear(value: number): number {
  const channel = value / 255;
  return channel <= 0.04045
    ? channel / 12.92
    : ((channel + 0.055) / 1.055) ** 2.4;
}

function linearToSrgb(value: number): number {
  const channel =
    value <= 0.0031308 ? value * 12.92 : 1.055 * value ** (1 / 2.4) - 0.055;
  return clamp(channel) * 255;
}

export function rgbToOklab({ r, g, b }: Rgb): Oklab {
  const lr = srgbToLinear(r);
  const lg = srgbToLinear(g);
  const lb = srgbToLinear(b);

  const l = Math.cbrt(
    0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb,
  );
  const m = Math.cbrt(
    0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb,
  );
  const s = Math.cbrt(
    0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb,
  );

  return {
    l: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    a: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    b: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  };
}

export function oklabToRgb({ l, a, b }: Oklab): Rgb {
  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.291485548 * b;

  const l3 = l_ ** 3;
  const m3 = m_ ** 3;
  const s3 = s_ ** 3;

  const r = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
  const g = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
  const bl = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3;

  return {
    r: Math.round(linearToSrgb(r)),
    g: Math.round(linearToSrgb(g)),
    b: Math.round(linearToSrgb(bl)),
  };
}

export function oklabToOklch({ l, a, b }: Oklab): Oklch {
  const hue = (Math.atan2(b, a) * 180) / Math.PI;
  return {
    l,
    c: Math.sqrt(a * a + b * b),
    h: hue >= 0 ? hue : hue + 360,
  };
}

export function oklchToOklab({ l, c, h }: Oklch): Oklab {
  const hr = (h * Math.PI) / 180;
  return {
    l,
    a: c * Math.cos(hr),
    b: c * Math.sin(hr),
  };
}

export function formatOklch({ l, c, h }: Oklch): string {
  return `oklch(${(l * 100).toFixed(2)}% ${c.toFixed(4)} ${h.toFixed(2)}deg)`;
}

export function parseOklch(value: string): Oklch | null {
  const match = value
    .trim()
    .match(/^oklch\(\s*([0-9.]+)%?\s+([0-9.]+)\s+([0-9.]+)(?:deg)?\s*\)$/i);
  if (!match) {
    return null;
  }
  const lRaw = Number(match[1]);
  return {
    l: lRaw > 1 ? lRaw / 100 : lRaw,
    c: Number(match[2]),
    h: Number(match[3]),
  };
}

/** Relative luminance (sRGB, WCAG). */
export function relativeLuminance(rgb: Rgb): number {
  const r = srgbToLinear(rgb.r);
  const g = srgbToLinear(rgb.g);
  const b = srgbToLinear(rgb.b);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: Rgb, b: Rgb): number {
  const l1 = relativeLuminance(a);
  const l2 = relativeLuminance(b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function oklchToRgb(color: Oklch): Rgb {
  return oklabToRgb(oklchToOklab(color));
}

export function hexToOklch(seed: string): Oklch {
  return oklabToOklch(rgbToOklab(parseHex(seed)));
}

export type GenerateScaleOptions = {
  /** Max chroma multiplier for mood. Default 1. */
  chromaScale?: number;
  /** Hue shift in degrees. */
  hueShift?: number;
};

export function generateColorScale(
  seed: string,
  options: GenerateScaleOptions = {},
): ColorScale {
  const seedColor = hexToOklch(seed);
  const chromaScale = options.chromaScale ?? 1;
  const hue = (seedColor.h + (options.hueShift ?? 0) + 360) % 360;
  const chroma = clamp(seedColor.c * chromaScale, 0.004, 0.22);

  return Object.fromEntries(
    TOKEN_STOPS.map((stop, index) => {
      const distanceFromMiddle = Math.abs(index - 5) / 5;
      const chromaCompensation = 1 - distanceFromMiddle * 0.42;
      return [
        stop,
        formatOklch({
          l: LIGHTNESS_STOPS[index]!,
          c: chroma * chromaCompensation,
          h: hue,
        }),
      ];
    }),
  ) as ColorScale;
}

const AA_TEXT = 4.5;
const AAA_TEXT = 7;
const AA_UI = 3;

export function targetContrast(
  level: "AA" | "AAA",
  kind: "text" | "ui" = "text",
): number {
  if (kind === "ui") {
    return AA_UI;
  }
  return level === "AAA" ? AAA_TEXT : AA_TEXT;
}

/**
 * Adjust OKLCH lightness until contrast against `against` reaches `minRatio`.
 * Prefers darkening on light backgrounds and lightening on dark ones.
 */
export function ensureContrast(
  foreground: Oklch,
  against: Rgb,
  minRatio: number,
): Oklch {
  const againstLum = relativeLuminance(against);
  const preferDarker = againstLum > 0.5;
  let best = { ...foreground };
  let bestRatio = contrastRatio(oklchToRgb(best), against);

  if (bestRatio >= minRatio) {
    return best;
  }

  // Binary search lightness.
  let low = 0.05;
  let high = 0.95;
  for (let i = 0; i < 18; i += 1) {
    const mid = (low + high) / 2;
    const candidate = { ...foreground, l: mid };
    const ratio = contrastRatio(oklchToRgb(candidate), against);
    if (ratio > bestRatio) {
      best = candidate;
      bestRatio = ratio;
    }
    if (ratio >= minRatio) {
      // Keep searching for a value closer to original lightness.
      if (preferDarker) {
        low = mid;
      } else {
        high = mid;
      }
    } else if (preferDarker) {
      high = mid;
    } else {
      low = mid;
    }
  }

  // If still short, also try reducing chroma (more neutral reads better).
  if (bestRatio < minRatio) {
    for (let c = foreground.c; c >= 0; c -= 0.01) {
      const candidate = { ...best, c: Math.max(0, c) };
      const ratio = contrastRatio(oklchToRgb(candidate), against);
      if (ratio >= minRatio) {
        return candidate;
      }
      if (ratio > bestRatio) {
        best = candidate;
        bestRatio = ratio;
      }
    }
  }

  return best;
}

export function pickScaleStop(scale: ColorScale, stop: ColorScaleStop): Oklch {
  return parseOklch(scale[stop]) ?? { l: 0.56, c: 0.12, h: 260 };
}
