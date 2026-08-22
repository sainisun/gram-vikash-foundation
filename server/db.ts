import { and, desc, eq, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { ENV } from "./_core/env";
import { auditLogs, donations, expenses, featureFlags, members, programs, users } from "../drizzle/schema";

let database: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!database && process.env.DATABASE_URL) {
    database = drizzle(process.env.DATABASE_URL);
  }
  return database;
}

export async function upsertUser(user: typeof users.$inferInsert): Promise<void> {
  if (!user.openId) throw new Error("User openId is required");
  const db = await getDb();
  if (!db) return;

  const updateSet: Record<string, unknown> = {
    lastSignedIn: new Date(),
  };
  if (user.name !== undefined) updateSet.name = user.name;
  if (user.email !== undefined) updateSet.email = user.email;
  if (user.loginMethod !== undefined) updateSet.loginMethod = user.loginMethod;
  if (user.role !== undefined) updateSet.role = user.role;

  await db.insert(users).values({
    ...user,
    role: user.role ?? (user.openId === ENV.ownerOpenId ? "admin" : "user"),
    lastSignedIn: new Date(),
  }).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return rows[0];
}

export async function getMemberByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(members).where(eq(members.userId, userId)).limit(1);
  return rows[0];
}

export async function saveMemberProfile(input: {
  userId: number;
  fullName: string;
  phone: string;
  email?: string | null;
  dateOfBirth: string;
  villageWard: string;
  publicDisplayName?: string | null;
  isAnonymous: boolean;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  const existing = await getMemberByUserId(input.userId);
  const values = {
    fullName: input.fullName,
    phone: input.phone,
    email: input.email ?? null,
    dateOfBirth: input.dateOfBirth,
    villageWard: input.villageWard,
    publicDisplayName: input.publicDisplayName ?? null,
    isAnonymous: input.isAnonymous,
  };
  if (existing) {
    await db.update(members).set(values).where(eq(members.id, existing.id));
    return { ...existing, ...values };
  }
  const result = await db.insert(members).values({ userId: input.userId, ...values });
  const inserted = await getMemberByUserId(input.userId);
  if (!inserted) throw new Error(`Member profile was not created (${result[0].insertId})`);
  return inserted;
}

function toSafeAmount(value: number | bigint | null) {
  return Number(value ?? 0);
}

export async function getPublicTransparencySnapshot() {
  const db = await getDb();
  if (!db) return { totalRaisedPaise: 0, totalSpentPaise: 0, balancePaise: 0, donorCount: 0, updatedAt: new Date() };
  const [successfulDonations, allExpenses] = await Promise.all([
    db.select({ amountPaise: donations.amountPaise, memberId: donations.memberId }).from(donations).where(eq(donations.status, "successful")),
    db.select({ amountPaise: expenses.amountPaise }).from(expenses),
  ]);
  const totalRaisedPaise = successfulDonations.reduce((sum, row) => sum + toSafeAmount(row.amountPaise), 0);
  const totalSpentPaise = allExpenses.reduce((sum, row) => sum + toSafeAmount(row.amountPaise), 0);
  return {
    totalRaisedPaise,
    totalSpentPaise,
    balancePaise: totalRaisedPaise - totalSpentPaise,
    donorCount: new Set(successfulDonations.map(row => row.memberId)).size,
    updatedAt: new Date(),
  };
}

export async function getPublicPrograms() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(programs).where(eq(programs.isActive, true)).orderBy(programs.name);
}

export async function getPublicProgramBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(programs).where(and(eq(programs.slug, slug), eq(programs.isActive, true))).limit(1);
  return rows[0];
}

export async function getProgramsForAdmin() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(programs).orderBy(programs.name);
}

export async function saveProgram(input: { actorUserId: number; id?: number; slug: string; name: string; shortDescription: string; description: string; targetMetric?: string | null; currentMetricValue: number; isActive: boolean }) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  const values = { slug: input.slug, name: input.name, shortDescription: input.shortDescription, description: input.description, targetMetric: input.targetMetric ?? null, currentMetricValue: input.currentMetricValue, isActive: input.isActive };
  if (input.id) {
    await db.update(programs).set(values).where(eq(programs.id, input.id));
    await db.insert(auditLogs).values({ actorUserId: input.actorUserId, action: "program.updated", entityType: "program", entityId: String(input.id), metadata: { slug: input.slug, isActive: input.isActive } });
    return input.id;
  }
  const result = await db.insert(programs).values(values);
  const id = Number(result[0].insertId);
  await db.insert(auditLogs).values({ actorUserId: input.actorUserId, action: "program.created", entityType: "program", entityId: String(id), metadata: { slug: input.slug, isActive: input.isActive } });
  return id;
}

export async function retireProgram(input: { actorUserId: number; id: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  await db.update(programs).set({ isActive: false }).where(eq(programs.id, input.id));
  await db.insert(auditLogs).values({ actorUserId: input.actorUserId, action: "program.retired", entityType: "program", entityId: String(input.id), metadata: { isActive: false } });
}

export async function getPublicDonationLedger(limit = 50) {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select({
    id: donations.id,
    amountPaise: donations.amountPaise,
    createdAt: donations.createdAt,
    succeededAt: donations.succeededAt,
    memberId: members.id,
    isAnonymous: members.isAnonymous,
    publicDisplayName: members.publicDisplayName,
    programName: programs.name,
  }).from(donations)
    .innerJoin(members, eq(donations.memberId, members.id))
    .leftJoin(programs, eq(donations.programId, programs.id))
    .where(eq(donations.status, "successful"))
    .orderBy(desc(donations.succeededAt), desc(donations.id))
    .limit(limit);
  return rows.map(row => ({
    id: row.id,
    amountPaise: toSafeAmount(row.amountPaise),
    donatedAt: row.succeededAt ?? row.createdAt,
    programName: row.programName ?? "General fund",
    displayName: row.isAnonymous ? "Anonymous" : (row.publicDisplayName || "Supporter"),
  }));
}

export async function getPublicExpenseLedger(limit = 50) {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select({
    id: expenses.id,
    amountPaise: expenses.amountPaise,
    category: expenses.category,
    publicDescription: expenses.publicDescription,
    spentAt: expenses.spentAt,
    programName: programs.name,
  }).from(expenses)
    .leftJoin(programs, eq(expenses.programId, programs.id))
    .orderBy(desc(expenses.spentAt), desc(expenses.id))
    .limit(limit);
  return rows.map(row => ({ ...row, amountPaise: toSafeAmount(row.amountPaise), programName: row.programName ?? "General operations" }));
}

export async function getDonorWall(limit = 12) {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select({
    id: donations.id,
    amountPaise: donations.amountPaise,
    succeededAt: donations.succeededAt,
    publicDisplayName: members.publicDisplayName,
  }).from(donations)
    .innerJoin(members, eq(donations.memberId, members.id))
    .where(and(eq(donations.status, "successful"), eq(members.isAnonymous, false)))
    .orderBy(desc(donations.succeededAt), desc(donations.id))
    .limit(limit);
  return rows.map(row => ({ id: row.id, amountPaise: toSafeAmount(row.amountPaise), donatedAt: row.succeededAt, displayName: row.publicDisplayName || "Supporter" }));
}

export async function getMembersForAdmin(limit = 200) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: members.id,
    fullName: members.fullName,
    phone: members.phone,
    villageWard: members.villageWard,
    accountStatus: members.accountStatus,
  }).from(members).where(eq(members.accountStatus, "active")).orderBy(members.fullName).limit(limit);
}

export async function getFeatureGate(key: string) {
  const db = await getDb();
  if (!db) return false;
  const rows = await db.select({ enabled: featureFlags.enabled }).from(featureFlags).where(eq(featureFlags.key, key)).limit(1);
  return rows[0]?.enabled ?? false;
}

export async function getFeatureGates() {
  const known = ["payments_live", "community_enabled", "voter_document_review_enabled", "voting_enabled"] as const;
  const db = await getDb();
  if (!db) return Object.fromEntries(known.map(key => [key, false]));
  const rows = await db.select().from(featureFlags).where(inArray(featureFlags.key, [...known]));
  const found = new Map(rows.map(row => [row.key, row.enabled]));
  return Object.fromEntries(known.map(key => [key, found.get(key) ?? false]));
}

export async function prepareFinancialExport(input: { actorUserId: number; scope: "donations" | "expenses" | "both" }) {
  const [donationRows, expenseRows] = await Promise.all([
    input.scope === "expenses" ? Promise.resolve([]) : getPublicDonationLedger(100),
    input.scope === "donations" ? Promise.resolve([]) : getPublicExpenseLedger(100),
  ]);
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  await db.insert(auditLogs).values({
    actorUserId: input.actorUserId,
    action: "financial_export.prepared",
    entityType: "financial_export",
    entityId: `${input.scope}:${Date.now()}`,
    metadata: { scope: input.scope, donationRows: donationRows.length, expenseRows: expenseRows.length, fields: "public-safe" },
  });
  return { donationRows, expenseRows, preparedAt: new Date() };
}

export async function recordOfflineDonation(input: {
  actorUserId: number;
  memberId: number;
  programId?: number | null;
  amountPaise: number;
  paymentMode: "cash" | "cheque";
  receivedAt: Date;
  notes?: string | null;
  idempotencyKey: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  return db.transaction(async tx => {
    const result = await tx.insert(donations).values({
      memberId: input.memberId,
      programId: input.programId ?? null,
      amountPaise: input.amountPaise,
      source: "offline",
      status: "successful",
      paymentMode: input.paymentMode,
      notes: input.notes ?? null,
      enteredByUserId: input.actorUserId,
      receivedAt: input.receivedAt,
      succeededAt: input.receivedAt,
      idempotencyKey: input.idempotencyKey,
    });
    const donationId = String(result[0].insertId);
    await tx.insert(auditLogs).values({
      actorUserId: input.actorUserId,
      action: "offline_donation.recorded",
      entityType: "donation",
      entityId: donationId,
      metadata: { memberId: input.memberId, amountPaise: input.amountPaise, source: "offline" },
    });
    return donationId;
  });
}

export async function recordExpense(input: {
  actorUserId: number;
  programId?: number | null;
  amountPaise: number;
  category: "coaching" | "library" | "kanyadan" | "operations" | "other";
  publicDescription: string;
  privateNotes?: string | null;
  spentAt: Date;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  return db.transaction(async tx => {
    const result = await tx.insert(expenses).values({
      programId: input.programId ?? null,
      amountPaise: input.amountPaise,
      category: input.category,
      publicDescription: input.publicDescription,
      privateNotes: input.privateNotes ?? null,
      enteredByUserId: input.actorUserId,
      spentAt: input.spentAt,
    });
    const expenseId = String(result[0].insertId);
    await tx.insert(auditLogs).values({
      actorUserId: input.actorUserId,
      action: "expense.recorded",
      entityType: "expense",
      entityId: expenseId,
      metadata: { amountPaise: input.amountPaise, category: input.category },
    });
    return expenseId;
  });
}
