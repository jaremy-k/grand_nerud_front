import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { alias: {
    "@": fileURLToPath(new URL("./src", import.meta.url)),
    "@features": fileURLToPath(new URL("./src/features", import.meta.url)),
    "@definitions": fileURLToPath(new URL("./src/definitions", import.meta.url)),
  } },
  esbuild: { jsx: "automatic" },
  test: { environment: "jsdom", include: ["tests/**/*.test.{ts,tsx}"], clearMocks: true },
});
