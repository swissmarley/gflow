import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // Set by the GitHub Pages workflow to "/<repo>/" for project pages.
  // Defaults to "/" for local dev, root deploys, or custom domains.
  base: process.env.VITE_BASE || "/",
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    css: true
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          three: ["three"],
          icons: ["lucide-react"]
        }
      }
    }
  },
  server: {
    host: "127.0.0.1",
    port: 5173
  }
});
