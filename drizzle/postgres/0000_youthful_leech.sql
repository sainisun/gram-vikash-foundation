CREATE TYPE "public"."account_status" AS ENUM('active', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."donation_source" AS ENUM('offline', 'razorpay');--> statement-breakpoint
CREATE TYPE "public"."donation_status" AS ENUM('pending', 'successful', 'failed', 'reversed');--> statement-breakpoint
CREATE TYPE "public"."expense_category" AS ENUM('coaching', 'library', 'kanyadan', 'operations', 'other');--> statement-breakpoint
CREATE TYPE "public"."payment_mode" AS ENUM('cash', 'cheque', 'upi', 'card', 'netbanking');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TYPE "public"."verification_tier" AS ENUM('registered', 'voter_verified');--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"actorUserId" integer NOT NULL,
	"action" varchar(120) NOT NULL,
	"entityType" varchar(80) NOT NULL,
	"entityId" varchar(80) NOT NULL,
	"metadata" jsonb,
	"requestId" varchar(96),
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "donations" (
	"id" serial PRIMARY KEY NOT NULL,
	"memberId" integer NOT NULL,
	"programId" integer,
	"amountPaise" bigint NOT NULL,
	"source" "donation_source" NOT NULL,
	"status" "donation_status" DEFAULT 'pending' NOT NULL,
	"paymentMode" "payment_mode",
	"razorpayOrderId" varchar(128),
	"razorpayPaymentId" varchar(128),
	"providerEventId" varchar(128),
	"idempotencyKey" varchar(128),
	"notes" text,
	"enteredByUserId" integer,
	"receivedAt" timestamp with time zone,
	"succeededAt" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "expenses" (
	"id" serial PRIMARY KEY NOT NULL,
	"programId" integer,
	"amountPaise" bigint NOT NULL,
	"category" "expense_category" NOT NULL,
	"publicDescription" varchar(500) NOT NULL,
	"privateNotes" text,
	"receiptObjectKey" varchar(512),
	"enteredByUserId" integer NOT NULL,
	"spentAt" timestamp with time zone NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feature_flags" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar(80) NOT NULL,
	"enabled" boolean DEFAULT false NOT NULL,
	"updatedByUserId" integer,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "feature_flags_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "members" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"fullName" varchar(200) NOT NULL,
	"phone" varchar(32) NOT NULL,
	"email" varchar(320),
	"dateOfBirth" date NOT NULL,
	"villageWard" varchar(200) NOT NULL,
	"publicDisplayName" varchar(120),
	"isAnonymous" boolean DEFAULT true NOT NULL,
	"verificationTier" "verification_tier" DEFAULT 'registered' NOT NULL,
	"accountStatus" "account_status" DEFAULT 'active' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "members_userId_unique" UNIQUE("userId"),
	CONSTRAINT "members_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
CREATE TABLE "programs" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(120) NOT NULL,
	"name" varchar(180) NOT NULL,
	"shortDescription" varchar(280) NOT NULL,
	"description" text NOT NULL,
	"targetMetric" varchar(120),
	"currentMetricValue" integer DEFAULT 0 NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "programs_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"openId" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"loginMethod" varchar(64),
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId")
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actorUserId_users_id_fk" FOREIGN KEY ("actorUserId") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "donations" ADD CONSTRAINT "donations_memberId_members_id_fk" FOREIGN KEY ("memberId") REFERENCES "public"."members"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "donations" ADD CONSTRAINT "donations_programId_programs_id_fk" FOREIGN KEY ("programId") REFERENCES "public"."programs"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "donations" ADD CONSTRAINT "donations_enteredByUserId_users_id_fk" FOREIGN KEY ("enteredByUserId") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_programId_programs_id_fk" FOREIGN KEY ("programId") REFERENCES "public"."programs"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_enteredByUserId_users_id_fk" FOREIGN KEY ("enteredByUserId") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feature_flags" ADD CONSTRAINT "feature_flags_updatedByUserId_users_id_fk" FOREIGN KEY ("updatedByUserId") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_entity_created_idx" ON "audit_logs" USING btree ("entityType","entityId","createdAt");--> statement-breakpoint
CREATE INDEX "audit_actor_created_idx" ON "audit_logs" USING btree ("actorUserId","createdAt");--> statement-breakpoint
CREATE INDEX "donations_status_created_idx" ON "donations" USING btree ("status","createdAt");--> statement-breakpoint
CREATE INDEX "donations_member_created_idx" ON "donations" USING btree ("memberId","createdAt");--> statement-breakpoint
CREATE INDEX "donations_program_created_idx" ON "donations" USING btree ("programId","createdAt");--> statement-breakpoint
CREATE UNIQUE INDEX "donations_provider_event_unique" ON "donations" USING btree ("providerEventId");--> statement-breakpoint
CREATE UNIQUE INDEX "donations_idempotency_unique" ON "donations" USING btree ("idempotencyKey");--> statement-breakpoint
CREATE INDEX "expenses_spent_created_idx" ON "expenses" USING btree ("spentAt","createdAt");--> statement-breakpoint
CREATE INDEX "expenses_program_created_idx" ON "expenses" USING btree ("programId","createdAt");--> statement-breakpoint
CREATE INDEX "members_village_ward_idx" ON "members" USING btree ("villageWard");--> statement-breakpoint
CREATE INDEX "members_tier_status_idx" ON "members" USING btree ("verificationTier","accountStatus");--> statement-breakpoint
CREATE INDEX "programs_active_idx" ON "programs" USING btree ("isActive");