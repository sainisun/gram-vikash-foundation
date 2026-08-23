import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const workspaceConfig = readFileSync(new URL("../pnpm-workspace.yaml", import.meta.url), "utf8");
const packageManifest = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")) as Record<string, unknown>;

describe("pnpm workspace configuration", () => {
  it("keeps the supported workspace-level override and patch declarations", () => {
    expect(workspaceConfig).toContain('"tailwindcss>nanoid": "3.3.7"');
    expect(workspaceConfig).toContain('"wouter@3.7.1": "patches/wouter@3.7.1.patch"');
    expect(packageManifest).not.toHaveProperty("pnpm");
  });
});
