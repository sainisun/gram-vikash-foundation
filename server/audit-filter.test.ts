import { describe, expect, it } from "vitest";
import { parseAuditFilters } from "./audit-filter";

describe("audit filter contract", () => {
  it("bounds the query limit and accepts documented filters", () => {
    expect(parseAuditFilters({ limit: "999", action: "expense.recorded", entityType: "expense", query: "  42 " })).toEqual({ ok: true, value: { limit: 200, action: "expense.recorded", entityType: "expense", query: "42" } });
  });
  it("rejects unsupported action and entity filters", () => {
    expect(parseAuditFilters({ action: "member.deleted" })).toEqual({ ok: false, message: "Unsupported audit action filter." });
    expect(parseAuditFilters({ entityType: "member" })).toEqual({ ok: false, message: "Unsupported audit entity filter." });
  });
});
