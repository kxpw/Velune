import react from "@vitejs/plugin-react";
import type { UserConfigExport } from "vite";

export function createReactConfig(): UserConfigExport {
  return {
    plugins: [react()],
  };
}
