import { describe, expect, it } from "vitest";
import { isPostgresDatabaseUrl } from "./db";

describe("PostgreSQL database URL guard", () => {
  it("accepts PostgreSQL connection schemes required by Supabase", () => {
    expect(isPostgresDatabaseUrl("postgresql://user:password@db.example.com:5432/app?sslmode=require")).toBe(true);
    expect(isPostgresDatabaseUrl("postgres://user:password@db.example.com:5432/app")).toBe(true);
  });

  it("rejects missing, malformed, and legacy MySQL/TiDB URLs", () => {
    expect(isPostgresDatabaseUrl()).toBe(false);
    expect(isPostgresDatabaseUrl("mysql://user:password@database.example.com:3306/app")).toBe(false);
    expect(isPostgresDatabaseUrl("not-a-connection-string")).toBe(false);
  });
});
