import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export function Portal({
  children,
  container,
  disabled = false,
}: {
  children: ReactNode;
  container?: HTMLElement | null;
  disabled?: boolean;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (disabled) {
    return <>{children}</>;
  }

  if (!mounted) {
    return null;
  }

  const target = container ?? document.body;
  return createPortal(children, target);
}
