import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { writeAdminAudit } from "@/lib/admin/audit";

export const runtime = "nodejs";

type UpdateBody = {
  collection?: "items" | "sublets";
  id?: string;
  title?: string;
  price?: number;
  description?: string;
  status?: string;
  isHidden?: boolean;
  hiddenReason?: string;
};

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  let body: UpdateBody;
  try {
    body = (await request.json()) as UpdateBody;
  } catch {
    return NextResponse.json({ error: "无效请求" }, { status: 400 });
  }

  const col =
    body.collection === "items" || body.collection === "sublets"
      ? body.collection
      : null;
  const id = typeof body.id === "string" ? body.id.trim() : "";
  if (!col || !id) {
    return NextResponse.json({ error: "参数不完整" }, { status: 400 });
  }

  const db = getAdminFirestore();
  const ref = db.doc(`${col}/${id}`);
  const snap = await ref.get();
  if (!snap.exists) {
    return NextResponse.json({ error: "商品不存在" }, { status: 404 });
  }

  const before = snap.data() || {};
  const updates: Record<string, unknown> = {};

  if (typeof body.title === "string") updates.title = body.title.trim();
  if (typeof body.price === "number" && Number.isFinite(body.price)) {
    updates.price = body.price;
  }
  if (typeof body.description === "string") {
    updates.description = body.description;
  }
  if (typeof body.status === "string" && body.status.trim()) {
    updates.status = body.status.trim();
  }
  if (typeof body.isHidden === "boolean") {
    updates.isHidden = body.isHidden;
    if (body.isHidden) {
      updates.hiddenAt = FieldValue.serverTimestamp();
      updates.hiddenBy = auth.uid;
      if (typeof body.hiddenReason === "string") {
        updates.hiddenReason = body.hiddenReason.trim();
      }
    } else {
      updates.hiddenReason = "";
      updates.hiddenAt = null;
      updates.hiddenBy = null;
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "没有可更新的字段" }, { status: 400 });
  }

  await ref.update(updates);
  await writeAdminAudit({
    actorUid: auth.uid,
    action: "listings.update",
    targetType: col === "items" ? "item" : "sublet",
    targetId: id,
    before: {
      title: before.title,
      price: before.price,
      status: before.status,
      isHidden: before.isHidden,
      description: before.description,
    },
    after: updates,
    reason: body.hiddenReason,
  });

  return NextResponse.json({ ok: true, id, collection: col });
}
