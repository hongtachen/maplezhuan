import { NextResponse } from "next/server";
import { getAdminAuth, getAdminFirestore } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { writeAdminAudit } from "@/lib/admin/audit";
import {
  forbidNonSuperModifyingSuper,
  isBootstrapUid,
} from "@/lib/admin/superAdmin";

export const runtime = "nodejs";

type SetAdminBody = {
  uid?: string;
  isAdmin?: boolean;
};

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  let body: SetAdminBody;
  try {
    body = (await request.json()) as SetAdminBody;
  } catch {
    return NextResponse.json({ error: "无效请求" }, { status: 400 });
  }

  const targetUid = typeof body.uid === "string" ? body.uid.trim() : "";
  if (!targetUid || typeof body.isAdmin !== "boolean") {
    return NextResponse.json({ error: "参数不完整" }, { status: 400 });
  }

  if (targetUid === auth.uid && body.isAdmin === false) {
    return NextResponse.json(
      { error: "不能撤销自己的管理员权限" },
      { status: 400 },
    );
  }

  const db = getAdminFirestore();
  const adminAuth = getAdminAuth();
  const ref = db.doc(`users/${targetUid}`);
  const beforeSnap = await ref.get();
  const before = beforeSnap.data() || {};

  const blocked = await forbidNonSuperModifyingSuper({
    actorToken: auth.token,
    targetUid,
    targetData: before,
  });
  if (blocked) return blocked;

  const userRecord = await adminAuth.getUser(targetUid);
  const targetIsAdmin =
    !!before.isAdmin || userRecord.customClaims?.admin === true;

  if (body.isAdmin === false && targetIsAdmin) {
    const adminsSnap = await db
      .collection("users")
      .where("isAdmin", "==", true)
      .limit(10)
      .get();
    const mirroredAdminCount = adminsSnap.size;
    const effectiveAdminCount = Math.max(
      mirroredAdminCount,
      targetIsAdmin ? 1 : 0,
    );
    if (effectiveAdminCount <= 1) {
      return NextResponse.json(
        {
          error:
            "无法更改：这是系统中最后一位管理员。请先将管理员权限授予其他用户。",
        },
        { status: 400 },
      );
    }
  }

  // Bootstrap UIDs are super admins; regular admins never get superAdmin via UI
  const shouldBeSuper = body.isAdmin === true && isBootstrapUid(targetUid);

  const existingClaims = { ...(userRecord.customClaims || {}) };
  if (body.isAdmin) {
    existingClaims.admin = true;
    if (shouldBeSuper) {
      existingClaims.superAdmin = true;
    }
  } else {
    delete existingClaims.admin;
    if (!isBootstrapUid(targetUid)) {
      delete existingClaims.superAdmin;
    }
  }
  await adminAuth.setCustomUserClaims(targetUid, existingClaims);

  const mirror: Record<string, unknown> = { isAdmin: body.isAdmin };
  if (shouldBeSuper) {
    mirror.isSuperAdmin = true;
  } else if (body.isAdmin === false && !isBootstrapUid(targetUid)) {
    mirror.isSuperAdmin = false;
  }

  try {
    await ref.set(mirror, { merge: true });
  } catch (e) {
    console.error("[admin/set-admin] mirror write failed:", e);
  }

  await writeAdminAudit({
    actorUid: auth.uid,
    action: "users.set_admin",
    targetType: "user",
    targetId: targetUid,
    before: {
      isAdmin: !!before.isAdmin,
      isSuperAdmin: !!before.isSuperAdmin,
    },
    after: mirror,
  });

  return NextResponse.json({
    ok: true,
    uid: targetUid,
    isAdmin: body.isAdmin,
    isSuperAdmin: shouldBeSuper || isBootstrapUid(targetUid),
    message: body.isAdmin
      ? shouldBeSuper
        ? "已授予超级管理员。对方需重新登录后生效。"
        : "已授予管理员。对方需重新登录后生效。"
      : "已撤销管理员。对方需重新登录后生效。",
  });
}
