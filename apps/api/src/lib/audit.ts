import { db, auditLogs } from "@cooked/db";

export type AuditAction =
  | "user.ban"
  | "user.unban"
  | "user.role_change"
  | "user.delete"
  | "recipe.delete"
  | "recipe.create"
  | "recipe.update"
  | "comment.approve"
  | "comment.reject"
  | "comment.delete";

type AuditTarget =
  | { targetId: string; targetType: string }
  | { targetId?: never; targetType?: never };

export async function logAudit(
  opts: {
    userId: string;
    action: AuditAction;
    metadata?: Record<string, unknown>;
  } & AuditTarget,
) {
  await db.insert(auditLogs).values({
    userId: opts.userId,
    action: opts.action,
    targetId: opts.targetId ?? null,
    targetType: opts.targetType ?? null,
    metadata: opts.metadata ?? null,
  });
}
