import { NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { writeAdminAudit } from "@/lib/admin/audit";
import { forbidNonSuperModifyingSuper } from "@/lib/admin/superAdmin";

export const runtime = "nodejs";

type DecideBody = {
  uid?: string;
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

  const uid = typeof body.uid === "string" ? body.uid.trim() : "";
  if (!uid || (body.decision !== "approve" && body.decision !== "reject")) {
    return NextResponse.json({ error: "参数不完整" }, { status: 400 });
  }

  const db = getAdminFirestore();
  const ref = db.doc(`users/${uid}`);
  const snap = await ref.get();
  if (!snap.exists) {
    return NextResponse.json({ error: "用户不存在" }, { status: 404 });
  }

  const before = snap.data() || {};

  const blocked = await forbidNonSuperModifyingSuper({
    actorToken: auth.token,
    targetUid: uid,
    targetData: before,
  });
  if (blocked) return blocked;

  const updates =
    body.decision === "approve"
      ? {
          sellerStatus: "approved",
          isVerifiedSeller: true,
        }
      : {
          sellerStatus: "rejected",
          isVerifiedSeller: false,
        };

  await ref.update(updates);
  await writeAdminAudit({
    actorUid: auth.uid,
    action: "users.decide",
    targetType: "user",
    targetId: uid,
    before: {
      sellerStatus: before.sellerStatus,
      isVerifiedSeller: before.isVerifiedSeller,
    },
    after: updates,
    reason: body.reason,
  });

  return NextResponse.json({ ok: true, user: { uid, ...updates } });
}
