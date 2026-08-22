import { bigint, boolean, date, datetime, index, int, json, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const members = mysqlTable(
  "members",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
    fullName: varchar("fullName", { length: 200 }).notNull(),
    phone: varchar("phone", { length: 32 }).notNull().unique(),
    email: varchar("email", { length: 320 }),
    dateOfBirth: date("dateOfBirth", { mode: "string" }).notNull(),
    villageWard: varchar("villageWard", { length: 200 }).notNull(),
    publicDisplayName: varchar("publicDisplayName", { length: 120 }),
    isAnonymous: boolean("isAnonymous").default(true).notNull(),
    verificationTier: mysqlEnum("verificationTier", ["registered", "voter_verified"]).default("registered").notNull(),
    accountStatus: mysqlEnum("accountStatus", ["active", "suspended"]).default("active").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [index("members_village_ward_idx").on(table.villageWard), index("members_tier_status_idx").on(table.verificationTier, table.accountStatus)],
);

export const programs = mysqlTable(
  "programs",
  {
    id: int("id").autoincrement().primaryKey(),
    slug: varchar("slug", { length: 120 }).notNull().unique(),
    name: varchar("name", { length: 180 }).notNull(),
    shortDescription: varchar("shortDescription", { length: 280 }).notNull(),
    description: text("description").notNull(),
    targetMetric: varchar("targetMetric", { length: 120 }),
    currentMetricValue: int("currentMetricValue").default(0).notNull(),
    isActive: boolean("isActive").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [index("programs_active_idx").on(table.isActive)],
);

export const donations = mysqlTable(
  "donations",
  {
    id: int("id").autoincrement().primaryKey(),
    memberId: int("memberId").notNull().references(() => members.id, { onDelete: "restrict" }),
    programId: int("programId").references(() => programs.id, { onDelete: "restrict" }),
    amountPaise: bigint("amountPaise", { mode: "number" }).notNull(),
    source: mysqlEnum("source", ["offline", "razorpay"]).notNull(),
    status: mysqlEnum("status", ["pending", "successful", "failed", "reversed"]).default("pending").notNull(),
    paymentMode: mysqlEnum("paymentMode", ["cash", "cheque", "upi", "card", "netbanking"]),
    razorpayOrderId: varchar("razorpayOrderId", { length: 128 }),
    razorpayPaymentId: varchar("razorpayPaymentId", { length: 128 }),
    providerEventId: varchar("providerEventId", { length: 128 }),
    idempotencyKey: varchar("idempotencyKey", { length: 128 }),
    notes: text("notes"),
    enteredByUserId: int("enteredByUserId").references(() => users.id, { onDelete: "restrict" }),
    receivedAt: datetime("receivedAt", { mode: "date" }),
    succeededAt: datetime("succeededAt", { mode: "date" }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    index("donations_status_created_idx").on(table.status, table.createdAt),
    index("donations_member_created_idx").on(table.memberId, table.createdAt),
    index("donations_program_created_idx").on(table.programId, table.createdAt),
    uniqueIndex("donations_provider_event_unique").on(table.providerEventId),
    uniqueIndex("donations_idempotency_unique").on(table.idempotencyKey),
  ],
);

export const expenses = mysqlTable(
  "expenses",
  {
    id: int("id").autoincrement().primaryKey(),
    programId: int("programId").references(() => programs.id, { onDelete: "restrict" }),
    amountPaise: bigint("amountPaise", { mode: "number" }).notNull(),
    category: mysqlEnum("category", ["coaching", "library", "kanyadan", "operations", "other"]).notNull(),
    publicDescription: varchar("publicDescription", { length: 500 }).notNull(),
    privateNotes: text("privateNotes"),
    receiptObjectKey: varchar("receiptObjectKey", { length: 512 }),
    enteredByUserId: int("enteredByUserId").notNull().references(() => users.id, { onDelete: "restrict" }),
    spentAt: datetime("spentAt", { mode: "date" }).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [index("expenses_spent_created_idx").on(table.spentAt, table.createdAt), index("expenses_program_created_idx").on(table.programId, table.createdAt)],
);

export const auditLogs = mysqlTable(
  "audit_logs",
  {
    id: int("id").autoincrement().primaryKey(),
    actorUserId: int("actorUserId").notNull().references(() => users.id, { onDelete: "restrict" }),
    action: varchar("action", { length: 120 }).notNull(),
    entityType: varchar("entityType", { length: 80 }).notNull(),
    entityId: varchar("entityId", { length: 80 }).notNull(),
    metadata: json("metadata"),
    requestId: varchar("requestId", { length: 96 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [index("audit_entity_created_idx").on(table.entityType, table.entityId, table.createdAt), index("audit_actor_created_idx").on(table.actorUserId, table.createdAt)],
);

export const featureFlags = mysqlTable("feature_flags", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 80 }).notNull().unique(),
  enabled: boolean("enabled").default(false).notNull(),
  updatedByUserId: int("updatedByUserId").references(() => users.id, { onDelete: "set null" }),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Member = typeof members.$inferSelect;
export type Program = typeof programs.$inferSelect;
export type Donation = typeof donations.$inferSelect;
export type Expense = typeof expenses.$inferSelect;
export type User = typeof users.$inferSelect;
