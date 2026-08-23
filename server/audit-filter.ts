export const AUDIT_ACTIONS = ["expense.recorded", "offline_donation.recorded", "program.created", "program.updated", "program.retired", "financial_export.prepared"] as const;
export const AUDIT_ENTITY_TYPES = ["expense", "donation", "program", "financial_export"] as const;

export type AuditFilterInput = { limit?: string | null; action?: string | null; entityType?: string | null; query?: string | null };
export type AuditFilterResult = { ok: true; value: { limit: number; action?: string; entityType?: string; query?: string } } | { ok: false; message: string };

export function parseAuditFilters(input: AuditFilterInput): AuditFilterResult {
  const rawLimit = Number(input.limit ?? "100");
  const limit = Number.isFinite(rawLimit) ? Math.max(1, Math.min(Math.floor(rawLimit), 200)) : 100;
  const action = input.action?.trim() || undefined;
  const entityType = input.entityType?.trim() || undefined;
  const query = input.query?.trim().slice(0, 120) || undefined;
  if (action && !AUDIT_ACTIONS.includes(action as (typeof AUDIT_ACTIONS)[number])) return { ok: false, message: "Unsupported audit action filter." };
  if (entityType && !AUDIT_ENTITY_TYPES.includes(entityType as (typeof AUDIT_ENTITY_TYPES)[number])) return { ok: false, message: "Unsupported audit entity filter." };
  return { ok: true, value: { limit, action, entityType, query } };
}
