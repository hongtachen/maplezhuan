import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { writeAdminAudit } from "@/lib/admin/audit";

export const runtime = "nodejs";

type DecideBody = {
  collection?: "items" | "sublets";
  id?: string;
  decision?: "approve" | "reject";
  reason?: string;
};

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  let body: DecideBody;
  try {
    body = (await request.json()) as DecideBody;
  } catch {
    return NextResponse.json({ error: "无效请求" }, { status: 400 });
  }

  const col =
    body.collection === "items" || body.collection === "sublets"
      ? body.collection
      : null;
  const id = typeof body.id === "string" ? body.id.trim() : "";
  if (
    !col ||
    !id ||
    (body.decision !== "approve" && body.decision !== "reject")
  ) {
    return NextResponse.json({ error: "参数不完整" }, { status: 400 });
  }

  const db = getAdminFirestore();
  const ref = db.doc(`${col}/${id}`);
  const snap = await ref.get();
  if (!snap.exists) {
    return NextResponse.json({ error: "商品不存在" }, { status: 404 });
  }

  const before = snap.data() || {};
  const updates =
    body.decision === "approve"
      ? {
          moderationStatus: "approved",
          moderatedAt: FieldValue.serverTimestamp(),
          moderatedBy: auth.uid,
          moderationReason: body.reason?.trim() || "",
        }
      : {
          moderationStatus: "rejected",
          moderatedAt: FieldValue.serverTimestamp(),
          moderatedBy: auth.uid,
          moderationReason: body.reason?.trim() || "",
        };

  await ref.update(updates);
  await writeAdminAudit({
    actorUid: auth.uid,
    action: "listings.decide",
    targetType: col === "items" ? "item" : "sublet",
    targetId: id,
    before: { moderationStatus: before.moderationStatus },
    after: {
      moderationStatus: updates.moderationStatus,
      moderationReason: updates.moderationReason,
    },
    reason: body.reason,
  });

  return NextResponse.json({ ok: true, id, collection: col, ...updates });
}
