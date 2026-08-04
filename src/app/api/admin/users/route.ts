import { NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { isBootstrapUid, isSuperAdminToken } from "@/lib/admin/superAdmin";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const url = new URL(request.url);
  const search = (url.searchParams.get("search") || "").trim().toLowerCase();
  const sellerStatus = url.searchParams.get("sellerStatus");
  const isAdminFilter = url.searchParams.get("isAdmin");
  const isSuspendedFilter = url.searchParams.get("isSuspended");
  const limit = Math.min(
    Math.max(Number(url.searchParams.get("limit") || 100), 1),
    500,
  );

  const db = getAdminFirestore();
  const snap = await db.collection("users").limit(500).get();

  let users = snap.docs.map((d) => {
    const data = d.data();
    const isSuperAdmin = !!data.isSuperAdmin || isBootstrapUid(d.id);
    return {
      uid: d.id,
      email: (data.email as string) || "",
      nickname: (data.nickname as string) || "",
      avatarUrl: (data.avatarUrl as string) || "",
      isVerifiedSeller: !!data.isVerifiedSeller,
      sellerStatus: (data.sellerStatus as string) || "none",
      isSuspended: !!data.isSuspended,
      isAdmin: !!data.isAdmin || isSuperAdmin,
      isSuperAdmin,
      wechat: (data.wechat as string) || "",
      phone: (data.phone as string) || "",
      createdAt: data.createdAt ?? null,
    };
  });

  if (search) {
    users = users.filter(
      (u) =>
        u.email.toLowerCase().includes(search) ||
        u.nickname.toLowerCase().includes(search) ||
        u.uid.toLowerCase().includes(search) ||
        u.wechat.toLowerCase().includes(search) ||
        u.phone.includes(search),
    );
  }

  if (sellerStatus) {
    users = users.filter((u) => u.sellerStatus === sellerStatus);
  }
  if (isAdminFilter === "true") {
    users = users.filter((u) => u.isAdmin);
  } else if (isAdminFilter === "false") {
    users = users.filter((u) => !u.isAdmin);
  }
  if (isSuspendedFilter === "true") {
    users = users.filter((u) => u.isSuspended);
  } else if (isSuspendedFilter === "false") {
    users = users.filter((u) => !u.isSuspended);
  }

  users = users.slice(0, limit);

  const adminCountSnap = await db
    .collection("users")
    .where("isAdmin", "==", true)
    .limit(50)
    .get();

  return NextResponse.json({
    users,
    adminCount: adminCountSnap.size,
    viewerIsSuperAdmin: isSuperAdminToken(auth.token),
  });
}
