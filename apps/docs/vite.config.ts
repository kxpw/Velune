import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    esbuildOptions: {
      target: "esnext",
    },
  },
  build: {
    target: "esnext",
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("/prism-react-renderer/")) return "syntax";
          const isTanStackVirtual =
            id.includes("/node_modules/.pnpm/@tanstack+react-virtual@") ||
            id.includes("/node_modules/.pnpm/@tanstack+virtual-core@");
          if (
            (id.includes("/node_modules/.pnpm/@tanstack+") &&
              !isTanStackVirtual) ||
            id.includes("/node_modules/.pnpm/react@") ||
            id.includes("/node_modules/.pnpm/react-dom@") ||
            id.includes("/node_modules/.pnpm/scheduler@") ||
            id.includes("/node_modules/.pnpm/clsx@")
          ) {
            return "framework";
          }
          return undefined;
        },
      },
    },
  },
  resolve: {
    alias: {
      "velune/react": resolve(rootDir, "../../packages/react/src/index.ts"),
      velune: resolve(rootDir, "../../packages/velune/src/index.ts"),
      "@velune/hooks": resolve(rootDir, "../../packages/hooks/src/index.ts"),
    },
  },
});
