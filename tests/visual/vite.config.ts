import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import config from "../../vite.config";

export default defineConfig({
  ...config,
  define: { "import.meta.env.VITE_API_URL": JSON.stringify("http://crm-fixture.invalid") },
  resolve: { alias: [
    { find: "@/lib/fetch", replacement: fileURLToPath(new URL("./fixture-api.ts", import.meta.url)) },
    ...Object.entries(config.resolve?.alias ?? {}).map(([find, replacement]) => ({ find, replacement: String(replacement) })),
  ] },
  server: { host: "127.0.0.1", port: 3002, strictPort: true, open: false },
});
