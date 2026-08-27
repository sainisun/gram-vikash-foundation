import { bigint, boolean, date, index, integer, jsonb, pgEnum, pgTable, serial, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", ["user", "admin"]);
export const verificationTier = pgEnum("verification_tier", ["registered", "voter_verified"]);
export const accountStatus = pgEnum("account_status", ["active", "suspended"]);
export const donationSource = pgEnum("donation_source", ["offline", "razorpay"]);
export const donationStatus = pgEnum("donation_status", ["pending", "successful", "failed", "reversed"]);
export const paymentMode = pgEnum("payment_mode", ["cash", "cheque", "upi", "card", "netbanking"]);
export const expenseCategory = pgEnum("expense_category", ["coaching", "library", "kanyadan", "operations", "other"]);

const createdAt = () => timestamp("createdAt", { withTimezone: true }).defaultNow().notNull();
const updatedAt = () => timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull();

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: userRole("role").default("user").notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
  lastSignedIn: timestamp("lastSignedIn", { withTimezone: true }).defaultNow().notNull(),
});

export const members = pgTable(
  "members",
  {
    id: serial("id").primaryKey(),
    userId: integer("userId").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
    fullName: varchar("fullName", { length: 200 }).notNull(),
    phone: varchar("phone", { length: 32 }).notNull().unique(),
    email: varchar("email", { length: 320 }),
    dateOfBirth: date("dateOfBirth", { mode: "string" }).notNull(),
    villageWard: varchar("villageWard", { length: 200 }).notNull(),
    publicDisplayName: varchar("publicDisplayName", { length: 120 }),
    isAnonymous: boolean("isAnonymous").default(true).notNull(),
    verificationTier: verificationTier("verificationTier").default("registered").notNull(),
    accountStatus: accountStatus("accountStatus").default("active").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  table => [index("members_village_ward_idx").on(table.villageWard), index("members_tier_status_idx").on(table.verificationTier, table.accountStatus)],
);

export const programs = pgTable(
  "programs",
  {
    id: serial("id").primaryKey(),
    slug: varchar("slug", { length: 120 }).notNull().unique(),
    name: varchar("name", { length: 180 }).notNull(),
    shortDescription: varchar("shortDescription", { length: 280 }).notNull(),
    description: text("description").notNull(),
    targetMetric: varchar("targetMetric", { length: 120 }),
    currentMetricValue: integer("currentMetricValue").default(0).notNull(),
    isActive: boolean("isActive").default(true).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  table => [index("programs_active_idx").on(table.isActive)],
);

export const donations = pgTable(
  "donations",
  {
    id: serial("id").primaryKey(),
    memberId: integer("memberId").notNull().references(() => members.id, { onDelete: "restrict" }),
    programId: integer("programId").references(() => programs.id, { onDelete: "restrict" }),
    amountPaise: bigint("amountPaise", { mode: "number" }).notNull(),
    source: donationSource("source").notNull(),
    status: donationStatus("status").default("pending").notNull(),
    paymentMode: paymentMode("paymentMode"),
    razorpayOrderId: varchar("razorpayOrderId", { length: 128 }),
    razorpayPaymentId: varchar("razorpayPaymentId", { length: 128 }),
    providerEventId: varchar("providerEventId", { length: 128 }),
    idempotencyKey: varchar("idempotencyKey", { length: 128 }),
    notes: text("notes"),
    enteredByUserId: integer("enteredByUserId").references(() => users.id, { onDelete: "restrict" }),
    receivedAt: timestamp("receivedAt", { withTimezone: true }),
    succeededAt: timestamp("succeededAt", { withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  table => [
    index("donations_status_created_idx").on(table.status, table.createdAt),
    index("donations_member_created_idx").on(table.memberId, table.createdAt),
    index("donations_program_created_idx").on(table.programId, table.createdAt),
    uniqueIndex("donations_provider_event_unique").on(table.providerEventId),
    uniqueIndex("donations_idempotency_unique").on(table.idempotencyKey),
  ],
);

export const expenses = pgTable(
  "expenses",
  {
    id: serial("id").primaryKey(),
    programId: integer("programId").references(() => programs.id, { onDelete: "restrict" }),
    amountPaise: bigint("amountPaise", { mode: "number" }).notNull(),
    category: expenseCategory("category").notNull(),
    publicDescription: varchar("publicDescription", { length: 500 }).notNull(),
    privateNotes: text("privateNotes"),
    receiptObjectKey: varchar("receiptObjectKey", { length: 512 }),
    enteredByUserId: integer("enteredByUserId").notNull().references(() => users.id, { onDelete: "restrict" }),
    spentAt: timestamp("spentAt", { withTimezone: true }).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  table => [index("expenses_spent_created_idx").on(table.spentAt, table.createdAt), index("expenses_program_created_idx").on(table.programId, table.createdAt)],
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: serial("id").primaryKey(),
    actorUserId: integer("actorUserId").notNull().references(() => users.id, { onDelete: "restrict" }),
    action: varchar("action", { length: 120 }).notNull(),
    entityType: varchar("entityType", { length: 80 }).notNull(),
    entityId: varchar("entityId", { length: 80 }).notNull(),
    metadata: jsonb("metadata"),
    requestId: varchar("requestId", { length: 96 }),
    createdAt: createdAt(),
  },
  table => [index("audit_entity_created_idx").on(table.entityType, table.entityId, table.createdAt), index("audit_actor_created_idx").on(table.actorUserId, table.createdAt)],
);

export const featureFlags = pgTable("feature_flags", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 80 }).notNull().unique(),
  enabled: boolean("enabled").default(false).notNull(),
  updatedByUserId: integer("updatedByUserId").references(() => users.id, { onDelete: "set null" }),
  updatedAt: updatedAt(),
});

export type Member = typeof members.$inferSelect;
export type Program = typeof programs.$inferSelect;
export type Donation = typeof donations.$inferSelect;
export type Expense = typeof expenses.$inferSelect;
export type User = typeof users.$inferSelect;
