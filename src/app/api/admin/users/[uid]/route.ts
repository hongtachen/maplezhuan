import { NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/admin/requireAdmin";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ uid: string }> };

export async function GET(request: Request, context: RouteContext) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const { uid } = await context.params;
  if (!uid) {
    return NextResponse.json({ error: "缺少用户 ID" }, { status: 400 });
  }

  const db = getAdminFirestore();
  const snap = await db.doc(`users/${uid}`).get();
  if (!snap.exists) {
    return NextResponse.json({ error: "用户不存在" }, { status: 404 });
  }

  const data = snap.data() || {};
  const [itemsSnap, subletsSnap] = await Promise.all([
    db.collection("items").where("sellerId", "==", uid).get(),
    db.collection("sublets").where("sellerId", "==", uid).get(),
  ]);

  return NextResponse.json({
    user: {
      uid,
      ...data,
      isVerifiedSeller: !!data.isVerifiedSeller,
      sellerStatus: (data.sellerStatus as string) || "none",
      isSuspended: !!data.isSuspended,
      isAdmin: !!data.isAdmin,
    },
    listingCounts: {
      items: itemsSnap.size,
      sublets: subletsSnap.size,
    },
  });
}
