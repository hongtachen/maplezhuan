import type { DecodedIdToken } from "firebase-admin/auth";
import { getAdminAuth } from "@/lib/firebase/admin";
import { NextResponse } from "next/server";

export function getBootstrapUids(): Set<string> {
  const raw = process.env.ADMIN_BOOTSTRAP_UIDS || "";
  return new Set(
    raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  );
}

/** Actor is super admin via claim or bootstrap allowlist. */
export function isSuperAdminToken(token: DecodedIdToken): boolean {
  if (token.superAdmin === true) return true;
  return getBootstrapUids().has(token.uid);
}

export function isBootstrapUid(uid: string): boolean {
  return getBootstrapUids().has(uid);
}

/**
 * Target is super admin if bootstrap UID, Firestore mirror, or Auth claim.
 */
export async function isSuperAdminTarget(
  uid: string,
  data?: { isSuperAdmin?: unknown },
): Promise<boolean> {
  if (isBootstrapUid(uid)) return true;
  if (data?.isSuperAdmin === true) return true;
  try {
    const record = await getAdminAuth().getUser(uid);
    return record.customClaims?.superAdmin === true;
  } catch {
    return false;
  }
}

/**
 * Regular admins cannot modify super-admin users.
 * Super admins can modify anyone (subject to last-admin / self rules elsewhere).
 */
export async function forbidNonSuperModifyingSuper(params: {
  actorToken: DecodedIdToken;
  targetUid: string;
  targetData?: { isSuperAdmin?: unknown };
}): Promise<NextResponse | null> {
  const targetIsSuper = await isSuperAdminTarget(
    params.targetUid,
    params.targetData,
  );
  if (!targetIsSuper) return null;
  if (isSuperAdminToken(params.actorToken)) return null;

  return NextResponse.json(
    {
      error: "无法更改：该用户为超级管理员，普通管理员不能修改其账号或权限。",
    },
    { status: 403 },
  );
}
