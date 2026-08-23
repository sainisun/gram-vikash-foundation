import { defineConfig } from "vitest/config";
import path from "path";

const templateRoot = path.resolve(import.meta.dirname);

export default defineConfig({
  root: templateRoot,
  resolve: {
    alias: [
      { find: "@/server", replacement: path.resolve(templateRoot, "server") },
      { find: "@/lib", replacement: path.resolve(templateRoot, "lib") },
      { find: "@/app", replacement: path.resolve(templateRoot, "app") },
      { find: "@shared", replacement: path.resolve(templateRoot, "shared") },
      { find: "@assets", replacement: path.resolve(templateRoot, "attached_assets") },
      { find: "@", replacement: path.resolve(templateRoot, "client", "src") },
    ],
  },
  test: {
    environment: "node",
    include: ["server/**/*.test.ts", "server/**/*.spec.ts"],
  },
});
