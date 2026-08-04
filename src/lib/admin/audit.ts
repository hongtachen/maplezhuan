import { FieldValue } from "firebase-admin/firestore";
import { getAdminFirestore } from "@/lib/firebase/admin";

export type AuditAction =
  | "users.update"
  | "users.set_admin"
  | "users.decide"
  | "listings.update"
  | "listings.decide";

function definedOnly(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined),
  );
}

export async function writeAdminAudit(params: {
  actorUid: string;
  action: AuditAction;
  targetType: "user" | "item" | "sublet";
  targetId: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  reason?: string;
}): Promise<void> {
  const db = getAdminFirestore();
  await db.collection("admin_audit_log").add({
    actorUid: params.actorUid,
    action: params.action,
    targetType: params.targetType,
    targetId: params.targetId,
    ...(params.before ? { before: definedOnly(params.before) } : {}),
    ...(params.after ? { after: definedOnly(params.after) } : {}),
    ...(params.reason ? { reason: params.reason } : {}),
    createdAt: FieldValue.serverTimestamp(),
  });
}
