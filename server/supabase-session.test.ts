import { beforeEach, describe, expect, it, vi } from "vitest";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getMemberByUserId, getUserByOpenId, upsertUser } from "@/server/db";
import { getManagedUser, requireManagedAdmin, requireMember } from "@/lib/auth/session";

vi.mock("@/lib/supabase/server", () => ({ createSupabaseServerClient: vi.fn() }));
vi.mock("@/server/db", () => ({ getMemberByUserId: vi.fn(), getUserByOpenId: vi.fn(), upsertUser: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn((path: string) => { throw new Error(`REDIRECT:${path}`); }) }));

const mockedClientFactory = vi.mocked(createSupabaseServerClient);
const mockedUserLookup = vi.mocked(getUserByOpenId);
const mockedMemberLookup = vi.mocked(getMemberByUserId);
const mockedUpsert = vi.mocked(upsertUser);

const adminUser = { id: 7, openId: "supabase-user-7", name: "Admin", email: "admin@example.org", loginMethod: "supabase_magic_link", role: "admin" as const };
const activeMember = { id: 11, userId: 7, accountStatus: "active" as const, verificationTier: "unverified" as const };

describe("Supabase session authorization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedClientFactory.mockResolvedValue({ auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: adminUser.openId, email: adminUser.email, user_metadata: { full_name: adminUser.name } } }, error: null }) } } as never);
    mockedUserLookup.mockResolvedValue(adminUser as never);
    mockedMemberLookup.mockResolvedValue(activeMember as never);
    mockedUpsert.mockResolvedValue(undefined);
  });

  it("maps a verified Supabase user into the unified application user", async () => {
    await expect(getManagedUser()).resolves.toMatchObject({ openId: adminUser.openId, email: adminUser.email });
    expect(mockedUpsert).toHaveBeenCalledWith(expect.objectContaining({ openId: adminUser.openId, loginMethod: "supabase_magic_link" }));
  });

  it("allows the configured admin through the admin guard", async () => {
    await expect(requireManagedAdmin()).resolves.toMatchObject({ role: "admin" });
  });

  it("allows an active Supabase user through the Member guard", async () => {
    await expect(requireMember()).resolves.toMatchObject({ user: { id: adminUser.id }, member: { accountStatus: "active" } });
  });
});
