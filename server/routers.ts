import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getDonorWall, getFeatureGates, getMemberByUserId, getMembersForAdmin, getProgramsForAdmin, getPublicDonationLedger, getPublicExpenseLedger, getPublicProgramBySlug, getPublicPrograms, getPublicTransparencySnapshot, prepareFinancialExport, recordExpense, recordOfflineDonation, retireProgram, saveMemberProfile, saveProgram } from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { COOKIE_NAME } from "../shared/const";
import { getPaymentReadiness } from "./payments/readiness";
import { reconciliationDecision, receiptWorkflowStatus, verifyRazorpayWebhookSignature } from "./payments/webhook";

const memberProfileInput = z.object({
  fullName: z.string().trim().min(2).max(200),
  phone: z.string().trim().min(8).max(32),
  email: z.string().trim().email().optional().nullable(),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
  villageWard: z.string().trim().min(1).max(200),
  publicDisplayName: z.string().trim().min(1).max(120).optional().nullable(),
  isAnonymous: z.boolean(),
});

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Administrator access is required." });
  return next({ ctx });
});

function requirePositivePaise(amountPaise: number) {
  if (!Number.isSafeInteger(amountPaise) || amountPaise <= 0) throw new TRPCError({ code: "BAD_REQUEST", message: "Amount must be a positive paise integer." });
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      ctx.res.clearCookie(COOKIE_NAME, { ...getSessionCookieOptions(ctx.req), maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  publicTransparency: router({
    summary: publicProcedure.query(() => getPublicTransparencySnapshot()),
    programs: publicProcedure.query(() => getPublicPrograms()),
    programBySlug: publicProcedure.input(z.object({ slug: z.string().trim().min(1).max(120) })).query(({ input }) => getPublicProgramBySlug(input.slug)),
    donationLedger: publicProcedure.input(z.object({ limit: z.number().int().min(1).max(100).default(30) }).optional()).query(({ input }) => getPublicDonationLedger(input?.limit ?? 30)),
    expenseLedger: publicProcedure.input(z.object({ limit: z.number().int().min(1).max(100).default(30) }).optional()).query(({ input }) => getPublicExpenseLedger(input?.limit ?? 30)),
    donorWall: publicProcedure.input(z.object({ limit: z.number().int().min(1).max(50).default(12) }).optional()).query(({ input }) => getDonorWall(input?.limit ?? 12)),
    featureGates: publicProcedure.query(() => getFeatureGates()),
  }),
  member: router({
    me: protectedProcedure.query(({ ctx }) => getMemberByUserId(ctx.user.id)),
    completeProfile: protectedProcedure.input(memberProfileInput).mutation(({ ctx, input }) => saveMemberProfile({ userId: ctx.user.id, ...input })),
    updatePublicDisplay: protectedProcedure.input(z.object({ isAnonymous: z.boolean(), publicDisplayName: z.string().trim().min(1).max(120).optional().nullable() })).mutation(async ({ ctx, input }) => {
      const existing = await getMemberByUserId(ctx.user.id);
      if (!existing) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Complete your Member profile before changing display preferences." });
      return saveMemberProfile({
        userId: ctx.user.id,
        fullName: existing.fullName,
        phone: existing.phone,
        email: existing.email,
        dateOfBirth: existing.dateOfBirth,
        villageWard: existing.villageWard,
        ...input,
      });
    }),
  }),
  admin: router({
    dashboard: adminProcedure.query(async () => ({ summary: await getPublicTransparencySnapshot(), programs: await getPublicPrograms() })),
    members: adminProcedure.query(() => getMembersForAdmin()),
    programs: adminProcedure.query(() => getProgramsForAdmin()),
    saveProgram: adminProcedure.input(z.object({ id: z.number().int().positive().optional(), slug: z.string().trim().regex(/^[a-z0-9-]+$/).max(120), name: z.string().trim().min(3).max(180), shortDescription: z.string().trim().min(3).max(280), description: z.string().trim().min(10), targetMetric: z.string().trim().max(120).optional().nullable(), currentMetricValue: z.number().int().min(0), isActive: z.boolean() })).mutation(({ ctx, input }) => saveProgram({ actorUserId: ctx.user.id, ...input })),
    retireProgram: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ ctx, input }) => retireProgram({ actorUserId: ctx.user.id, ...input })),
    donationLedger: adminProcedure.input(z.object({ limit: z.number().int().min(1).max(100).default(50) }).optional()).query(({ input }) => getPublicDonationLedger(input?.limit ?? 50)),
    expenseLedger: adminProcedure.input(z.object({ limit: z.number().int().min(1).max(100).default(50) }).optional()).query(({ input }) => getPublicExpenseLedger(input?.limit ?? 50)),
    prepareFinancialExport: adminProcedure.input(z.object({ scope: z.enum(["donations", "expenses", "both"]).default("both") })).mutation(({ ctx, input }) => prepareFinancialExport({ actorUserId: ctx.user.id, scope: input.scope })),
    recordOfflineDonation: adminProcedure.input(z.object({
      memberId: z.number().int().positive(),
      programId: z.number().int().positive().optional().nullable(),
      amountPaise: z.number().int().positive(),
      paymentMode: z.enum(["cash", "cheque"]),
      receivedAt: z.date(),
      notes: z.string().trim().max(2000).optional().nullable(),
      idempotencyKey: z.string().uuid(),
    })).mutation(async ({ ctx, input }) => {
      requirePositivePaise(input.amountPaise);
      return { donationId: await recordOfflineDonation({ actorUserId: ctx.user.id, ...input }) };
    }),
    recordExpense: adminProcedure.input(z.object({
      programId: z.number().int().positive().optional().nullable(),
      amountPaise: z.number().int().positive(),
      category: z.enum(["coaching", "library", "kanyadan", "operations", "other"]),
      publicDescription: z.string().trim().min(3).max(500),
      privateNotes: z.string().trim().max(2000).optional().nullable(),
      spentAt: z.date(),
    })).mutation(async ({ ctx, input }) => {
      requirePositivePaise(input.amountPaise);
      return { expenseId: await recordExpense({ actorUserId: ctx.user.id, ...input }) };
    }),
  }),
  payments: router({
    status: publicProcedure.query(async () => {
      const gates = await getFeatureGates();
      const readiness = getPaymentReadiness(process.env, gates.payments_live);
      return { enabled: readiness.enabled, reason: readiness.reason };
    }),
    prepareCheckout: protectedProcedure.input(z.object({ amountPaise: z.number().int().positive(), programId: z.number().int().positive().optional() })).mutation(async () => {
      const gates = await getFeatureGates();
      const readiness = getPaymentReadiness(process.env, gates.payments_live);
      if (!readiness.enabled) {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Live payments are not enabled. Merchant credentials, webhook validation, finance approvals, and the server gate are required first." });
      }
      throw new TRPCError({ code: "NOT_IMPLEMENTED", message: "The Razorpay adapter is not activated in this release." });
    }),
    webhookIngress: publicProcedure.input(z.object({ rawBody: z.string().min(1), signature: z.string().min(1) })).mutation(async ({ input }) => {
      const gates = await getFeatureGates();
      const readiness = getPaymentReadiness(process.env, gates.payments_live);
      if (!readiness.enabled) {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Webhook ingestion is blocked until the live payment gate and merchant configuration are approved." });
      }
      if (!verifyRazorpayWebhookSignature(input.rawBody, input.signature, process.env.RAZORPAY_WEBHOOK_SECRET)) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Webhook signature verification failed." });
      }
      return { accepted: false, message: "Verified webhook ingestion is scaffolded; production event mapping is not activated." };
    }),
    reconciliationStatus: publicProcedure.query(async () => {
      const gates = await getFeatureGates();
      return { enabled: false, decision: reconciliationDecision({ paymentStatus: "pending", donationStatus: "pending", eventSeen: false }), reason: gates.payments_live ? "Reconciliation event mapping is not activated." : "Reconciliation remains blocked while live payments are disabled." };
    }),
    receiptStatus: publicProcedure.query(async () => {
      const gates = await getFeatureGates();
      return { enabled: false, reason: receiptWorkflowStatus(gates.payments_live) };
    }),
  }),
  community: router({
    status: publicProcedure.query(() => ({ enabled: false, reason: "Community features are gated until moderation and compliance approvals are complete." })),
  }),
  voting: router({
    status: publicProcedure.query(() => ({ enabled: false, reason: "Voter-document review and voting are gated until the required approvals are complete." })),
  }),
  voterVerification: router({
    status: publicProcedure.query(async () => {
      const gates = await getFeatureGates();
      return { enabled: gates.voter_document_review_enabled, reason: "Voter-document review is disabled until privacy, retention, and authorized reviewer controls are approved." };
    }),
    submitDocument: protectedProcedure.mutation(async () => {
      const gates = await getFeatureGates();
      if (!gates.voter_document_review_enabled) {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Voter-document review is not available until the required governance and privacy approvals are complete." });
      }
      throw new TRPCError({ code: "NOT_IMPLEMENTED", message: "Restricted document handling is not activated in this release." });
    }),
  }),
});

export type AppRouter = typeof appRouter;
