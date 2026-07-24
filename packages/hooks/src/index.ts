import type { Dispatch, SetStateAction } from "react";
import {
  useCallback,
  useEffect,
  useInsertionEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
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
  /** Apply the resolved theme to documentElement. Default: `true`. */
  applyToDocument?: boolean | undefined;
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

function subscribeSystemTheme(callback: () => void): () => void {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  const query = window.matchMedia("(prefers-color-scheme: dark)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

function getServerSystemTheme(): ResolvedTheme {
  return "light";
}

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

type DocumentThemeWriter = {
  order: number;
  theme: ResolvedTheme;
};

const documentThemeWriters = new Map<symbol, DocumentThemeWriter>();
let documentThemeWriterOrder = 0;
let previousDocumentTheme:
  | { theme: string | null; hasDarkClass: boolean; hasLightClass: boolean }
  | undefined;

function syncDocumentThemeWriters(): void {
  const root = document.documentElement;
  const active = Array.from(documentThemeWriters.values()).reduce<
    DocumentThemeWriter | undefined
  >(
    (latest, writer) =>
      !latest || writer.order > latest.order ? writer : latest,
    undefined,
  );

  if (!active) {
    if (previousDocumentTheme) {
      if (previousDocumentTheme.theme == null) {
        root.removeAttribute("data-theme");
      } else {
        root.setAttribute("data-theme", previousDocumentTheme.theme);
      }
      root.classList.toggle("light", previousDocumentTheme.hasLightClass);
      root.classList.toggle("dark", previousDocumentTheme.hasDarkClass);
    }
    previousDocumentTheme = undefined;
    return;
  }

  root.classList.remove("light", "dark");
  root.classList.add(active.theme);
  root.setAttribute("data-theme", active.theme);
}

function updateDocumentThemeWriter(
  id: symbol,
  writer: DocumentThemeWriter,
): void {
  if (documentThemeWriters.size === 0) {
    const root = document.documentElement;
    previousDocumentTheme = {
      theme: root.getAttribute("data-theme"),
      hasDarkClass: root.classList.contains("dark"),
      hasLightClass: root.classList.contains("light"),
    };
  }
  documentThemeWriters.set(id, writer);
  syncDocumentThemeWriters();
}

function removeDocumentThemeWriter(id: symbol): void {
  documentThemeWriters.delete(id);
  syncDocumentThemeWriters();
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
    applyToDocument = true,
  } = options;
  // Start from a deterministic value so server and hydration markup agree.
  const [theme, setThemeState] = useState<ThemeToggleTheme>(defaultTheme);
  const systemTheme = useSyncExternalStore(
    subscribeSystemTheme,
    getSystemTheme,
    getServerSystemTheme,
  );
  const resolvedTheme = theme === "system" ? systemTheme : theme;
  const documentThemeIdRef = useRef(Symbol("theme-toggle"));
  const documentThemeOrderRef = useRef(++documentThemeWriterOrder);

  useIsomorphicLayoutEffect(() => {
    if (!persist) return;
    setThemeState(readStoredTheme(storageKey) ?? defaultTheme);
  }, [defaultTheme, persist, storageKey]);

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

  useIsomorphicLayoutEffect(() => {
    if (!applyToDocument || typeof document === "undefined") return;
    updateDocumentThemeWriter(documentThemeIdRef.current, {
      order: documentThemeOrderRef.current,
      theme: resolvedTheme,
    });
    return () => removeDocumentThemeWriter(documentThemeIdRef.current);
  }, [applyToDocument, resolvedTheme]);

  return { theme, resolvedTheme, setTheme, toggleTheme };
}
