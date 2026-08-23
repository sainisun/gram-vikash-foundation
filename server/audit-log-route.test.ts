import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/auth/session", () => ({ getManagedUser: vi.fn() }));
vi.mock("@/server/db", () => ({ getAuditLogEntries: vi.fn() }));

import { GET } from "../app/api/admin/audit-log/route";
import { getManagedUser } from "@/lib/auth/session";
import { getAuditLogEntries } from "@/server/db";

describe("admin audit-log route", () => {
  beforeEach(() => { vi.clearAllMocks(); vi.mocked(getManagedUser).mockResolvedValue({ id: 1, role: "admin" } as Awaited<ReturnType<typeof getManagedUser>>); });
  it("rejects unsupported filters before querying audit evidence", async () => {
    const response = await GET(new NextRequest("https://foundation.test/api/admin/audit-log?action=member.deleted"));
    expect(response.status).toBe(400);
    expect(getAuditLogEntries).not.toHaveBeenCalled();
  });
  it("bounds valid limits and forwards allowlisted filters", async () => {
    vi.mocked(getAuditLogEntries).mockResolvedValue([]);
    const response = await GET(new NextRequest("https://foundation.test/api/admin/audit-log?limit=999&action=expense.recorded&entityType=expense&q=42"));
    expect(response.status).toBe(200);
    expect(getAuditLogEntries).toHaveBeenCalledWith(200, { action: "expense.recorded", entityType: "expense", query: "42" });
  });
});
