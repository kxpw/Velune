import type { Dispatch, SetStateAction } from "react";
import {
  useCallback,
  useEffect,
  useInsertionEffect,
  useRef,
  useState,
} from "react";

export function useEventCallback<T extends (...args: never[]) => unknown>(
  callback: T,
): T {
  const callbackRef = useRef(callback);

  useInsertionEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    ((...args: never[]) => callbackRef.current(...args)) as T,
    [],
  );
}

export function useControllableState<T>({
  value,
  defaultValue,
  onChange,
}: {
  value?: T | undefined;
  defaultValue: T;
  onChange?: ((next: T) => void) | undefined;
}): [T, Dispatch<SetStateAction<T>>] {
  const [state, setState] = useState(defaultValue);
  const isControlled = value !== undefined;
  const wasControlledRef = useRef(isControlled);
  const lastControlledValueRef = useRef(value);
  if (isControlled) {
    lastControlledValueRef.current = value;
  }
  const changedToUncontrolled = wasControlledRef.current && !isControlled;
  const currentValue = isControlled
    ? value
    : changedToUncontrolled
      ? (lastControlledValueRef.current as T)
      : state;

  // Keep the last controlled value as the fallback if a caller changes mode.
  // Radix warns for this unsupported pattern; preserving the visible value is
  // less destructive than reverting to a stale default.
  useEffect(() => {
    if (changedToUncontrolled) {
      setState(lastControlledValueRef.current as T);
    }
    wasControlledRef.current = isControlled;
  }, [changedToUncontrolled, isControlled]);

  const setValue = useEventCallback((next: SetStateAction<T>) => {
    const resolved =
      typeof next === "function"
        ? (next as (previous: T) => T)(currentValue)
        : next;
    if (Object.is(resolved, currentValue)) {
      return;
    }
    if (!isControlled) {
      setState(resolved);
    }
    onChange?.(resolved);
  });

  return [currentValue, setValue];
}

export type ResolvedTheme = "light" | "dark";
export type ThemeToggleTheme = ResolvedTheme | "system";
export type ThemeTogglePreference = ThemeToggleTheme;

export type UseThemeToggleOptions = {
  /** Initial mode when no saved preference exists. Default: `"system"`. */
  defaultTheme?: ThemeTogglePreference | undefined;
  /** localStorage key used for persistence. Default: `"velune-theme"`. */
  storageKey?: string | undefined;
  /** Persist changes and synchronize them across tabs. Default: `true`. */
  persist?: boolean | undefined;
};

export type UseThemeToggleReturn = {
  theme: ThemeToggleTheme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemeToggleTheme) => void;
  toggleTheme: () => void;
};

function isTheme(value: string | null): value is ThemeToggleTheme {
  return value === "light" || value === "dark" || value === "system";
}

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined" || !window.matchMedia) {
    return "light";
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function readStoredTheme(storageKey: string): ThemeToggleTheme | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const value = window.localStorage.getItem(storageKey);
    return isTheme(value) ? value : null;
  } catch {
    return null;
  }
}

function writeStoredTheme(storageKey: string, theme: ThemeToggleTheme): void {
  try {
    window.localStorage.setItem(storageKey, theme);
  } catch {
    // Storage can be unavailable in private or restricted browser contexts.
  }
}

export function useThemeToggle(
  options: UseThemeToggleOptions = {},
): UseThemeToggleReturn {
  const {
    defaultTheme = "system",
    storageKey = "velune-theme",
    persist = true,
  } = options;
  const [theme, setThemeState] = useState<ThemeToggleTheme>(() => {
    const storedTheme = persist ? readStoredTheme(storageKey) : null;
    return storedTheme ?? defaultTheme;
  });
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(getSystemTheme);
  const resolvedTheme = theme === "system" ? systemTheme : theme;

  const setTheme = useCallback(
    (nextTheme: ThemeToggleTheme) => {
      setThemeState(nextTheme);
      if (persist) {
        writeStoredTheme(storageKey, nextTheme);
      }
    },
    [persist, storageKey],
  );

  const toggleTheme = useCallback(() => {
    setThemeState((currentTheme) => {
      const currentResolvedTheme =
        currentTheme === "system" ? getSystemTheme() : currentTheme;
      const nextTheme = currentResolvedTheme === "light" ? "dark" : "light";
      if (persist) {
        writeStoredTheme(storageKey, nextTheme);
      }
      return nextTheme;
    });
  }, [persist, storageKey]);

  useEffect(() => {
    if (!persist || typeof window === "undefined") {
      return;
    }
    const handleStorage = (event: StorageEvent) => {
      if (
        event.storageArea !== window.localStorage ||
        event.key !== storageKey
      ) {
        return;
      }
      setThemeState(isTheme(event.newValue) ? event.newValue : defaultTheme);
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [defaultTheme, persist, storageKey]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) {
      return;
    }
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (event: MediaQueryListEvent) => {
      setSystemTheme(event.matches ? "dark" : "light");
    };
    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

  return { theme, resolvedTheme, setTheme, toggleTheme };
}
