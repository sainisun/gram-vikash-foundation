import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const schema = readFileSync(new URL("../drizzle/schema.ts", import.meta.url), "utf8");
const database = readFileSync(new URL("./db.ts", import.meta.url), "utf8");
const config = readFileSync(new URL("../drizzle.config.ts", import.meta.url), "utf8");

describe("Supabase PostgreSQL migration configuration", () => {
  it("uses PostgreSQL Drizzle definitions and the node-postgres driver", () => {
    expect(schema).toContain('from "drizzle-orm/pg-core"');
    expect(schema).not.toContain("drizzle-orm/mysql-core");
    expect(database).toContain('from "drizzle-orm/node-postgres"');
    expect(database).toContain('from "pg"');
    expect(database).not.toContain("drizzle-orm/mysql2");
    expect(config).toContain('dialect: "postgresql"');
  });

  it("uses PostgreSQL conflict handling and returning clauses for audited writes", () => {
    expect(database).toContain("onConflictDoUpdate");
    expect(database).toContain(".returning({ id: programs.id })");
    expect(database).not.toContain("onDuplicateKeyUpdate");
    expect(database).not.toContain("insertId");
  });
});
