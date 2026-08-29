import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const roots = ["public", "admin", "api"] as const;

describe("Vercel monorepo roots", () => {
  it("declares all three independently buildable workspace packages", () => {
    for (const root of roots) {
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(projectRoot, "apps", root, "package.json"), "utf8"),
      ) as { name?: string; scripts?: { build?: string } };
      expect(packageJson.name).toBe(`@gram-vikash/${root}`);
      expect(packageJson.scripts?.build).toContain("next build");
    }
  });

  it("shares the reviewed source tree without copying secrets into a root", () => {
    for (const root of roots) {
      expect(fs.realpathSync(path.join(projectRoot, "apps", root, "app"))).toBe(
        path.join(projectRoot, "app"),
      );
      expect(fs.realpathSync(path.join(projectRoot, "apps", root, "lib"))).toBe(
        path.join(projectRoot, "lib"),
      );
      expect(fs.existsSync(path.join(projectRoot, "apps", root, ".env"))).toBe(false);
      expect(fs.existsSync(path.join(projectRoot, "apps", root, ".env.local"))).toBe(false);
    }
  });
});
