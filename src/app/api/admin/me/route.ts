import { NextResponse } from "next/server";
import {
  requireAdmin,
  isAdminUid,
  isSuperAdminToken,
  getBootstrapUids,
} from "@/lib/admin/requireAdmin";
import { PRE_APPROVAL_ENABLED } from "@/lib/moderation/config";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  return NextResponse.json({
    uid: auth.uid,
    isAdmin: true,
    isSuperAdmin: isSuperAdminToken(auth.token),
    viaClaim: auth.token.admin === true,
    viaBootstrap: isAdminUid(auth.token) && auth.token.admin !== true,
    preApprovalEnabled: PRE_APPROVAL_ENABLED,
    bootstrapConfigured: getBootstrapUids().size > 0,
  });
}
