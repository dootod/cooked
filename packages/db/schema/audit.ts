import { index, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth.js";

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
    action: text("action").notNull(),
    targetId: text("target_id"),
    targetType: text("target_type"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("idx_audit_logs_user_id").on(t.userId),
    index("idx_audit_logs_action").on(t.action),
    index("idx_audit_logs_created_at").on(t.createdAt),
    index("idx_audit_logs_action_created_at").on(t.action, t.createdAt),
  ],
);

export type AuditLog = typeof auditLogs.$inferSelect;
