import { NextResponse } from "next/server";
import type { DecodedIdToken } from "firebase-admin/auth";
import { getAdminAuth, isAdminConfigured } from "@/lib/firebase/admin";
import { getBootstrapUids, isSuperAdminToken } from "@/lib/admin/superAdmin";

export type AdminAuthResult =
  | { ok: true; uid: string; token: DecodedIdToken }
  | { ok: false; response: NextResponse };

/** Auth claim or bootstrap allowlist — never Firestore isAdmin. */
export function isAdminUid(token: DecodedIdToken): boolean {
  if (token.admin === true) return true;
  if (token.superAdmin === true) return true;
  return getBootstrapUids().has(token.uid);
}

export { isSuperAdminToken, getBootstrapUids };

export async function requireAdmin(request: Request): Promise<AdminAuthResult> {
  if (!isAdminConfigured()) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "管理服务尚未配置（缺少 Firebase Admin）" },
        { status: 503 },
      ),
    };
  }

  const authHeader = request.headers.get("Authorization");
  const idToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!idToken) {
    return {
      ok: false,
      response: NextResponse.json({ error: "未登录" }, { status: 401 }),
    };
  }

  try {
    const token = await getAdminAuth().verifyIdToken(idToken);
    if (!isAdminUid(token)) {
      return {
        ok: false,
        response: NextResponse.json({ error: "无权限" }, { status: 403 }),
      };
    }
    return { ok: true, uid: token.uid, token };
  } catch {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "登录已过期，请重新登录" },
        { status: 401 },
      ),
    };
  }
}
