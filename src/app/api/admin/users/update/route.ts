import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { writeAdminAudit } from "@/lib/admin/audit";
import { forbidNonSuperModifyingSuper } from "@/lib/admin/superAdmin";

export const runtime = "nodejs";

type UpdateBody = {
  uid?: string;
  nickname?: string;
  wechat?: string;
  phone?: string;
  isPublicContact?: boolean;
  isVerifiedSeller?: boolean;
  isSuspended?: boolean;
  sellerStatus?: "none" | "pending" | "approved" | "rejected";
};

async function hideSellerListings(sellerId: string, actorUid: string) {
  const db = getAdminFirestore();
  const [items, sublets] = await Promise.all([
    db.collection("items").where("sellerId", "==", sellerId).get(),
    db.collection("sublets").where("sellerId", "==", sellerId).get(),
  ]);

  const batch = db.batch();
  let n = 0;
  for (const doc of [...items.docs, ...sublets.docs]) {
    if (doc.data().isHidden === true) continue;
    batch.update(doc.ref, {
      isHidden: true,
      hiddenReason: "账号封禁",
      hiddenAt: FieldValue.serverTimestamp(),
      hiddenBy: actorUid,
    });
    n += 1;
    if (n >= 400) break;
  }
  if (n > 0) await batch.commit();
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  let body: UpdateBody;
  try {
    body = (await request.json()) as UpdateBody;
  } catch {
    return NextResponse.json({ error: "无效请求" }, { status: 400 });
  }

  const uid = typeof body.uid === "string" ? body.uid.trim() : "";
  if (!uid) {
    return NextResponse.json({ error: "缺少用户 ID" }, { status: 400 });
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

  const updates: Record<string, unknown> = {};

  if (typeof body.nickname === "string") {
    updates.nickname = body.nickname.trim();
  }
  if (typeof body.wechat === "string") {
    updates.wechat = body.wechat.trim();
  }
  if (typeof body.phone === "string") {
    updates.phone = body.phone.trim();
  }
  if (typeof body.isPublicContact === "boolean") {
    updates.isPublicContact = body.isPublicContact;
  }
  if (typeof body.isSuspended === "boolean") {
    updates.isSuspended = body.isSuspended;
  }
  if (typeof body.isVerifiedSeller === "boolean") {
    updates.isVerifiedSeller = body.isVerifiedSeller;
    if (!body.isVerifiedSeller) {
      updates.sellerStatus = "none";
    } else if (!body.sellerStatus) {
      updates.sellerStatus = "approved";
    }
  }
  if (body.sellerStatus) {
    updates.sellerStatus = body.sellerStatus;
    if (body.sellerStatus === "approved") {
      updates.isVerifiedSeller = true;
    }
    if (body.sellerStatus === "rejected" || body.sellerStatus === "none") {
      updates.isVerifiedSeller = false;
    }
    if (body.sellerStatus === "pending") {
      updates.isVerifiedSeller = false;
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "没有可更新的字段" }, { status: 400 });
  }

  await ref.update(updates);

  if (body.isSuspended === true && before.isSuspended !== true) {
    await hideSellerListings(uid, auth.uid);
  }

  await writeAdminAudit({
    actorUid: auth.uid,
    action: "users.update",
    targetType: "user",
    targetId: uid,
    before: {
      nickname: before.nickname,
      wechat: before.wechat,
      phone: before.phone,
      isVerifiedSeller: before.isVerifiedSeller,
      sellerStatus: before.sellerStatus,
      isSuspended: before.isSuspended,
    },
    after: updates,
  });

  const after = (await ref.get()).data();
  return NextResponse.json({
    user: { uid, ...after },
  });
}
