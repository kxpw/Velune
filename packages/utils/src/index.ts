export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function noop(): void {}

export function createId(prefix = "gs"): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}
