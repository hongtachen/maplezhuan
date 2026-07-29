import { NextResponse } from "next/server";
import {
  getAdminAuth,
  getAdminFirestore,
  isAdminConfigured,
} from "@/lib/firebase/admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { error: "评价服务尚未配置（缺少 Firebase Admin）" },
      { status: 503 },
    );
  }

  const authHeader = request.headers.get("Authorization");
  const idToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!idToken) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  try {
    await getAdminAuth().verifyIdToken(idToken);
  } catch {
    return NextResponse.json(
      { error: "登录已过期，请重新登录" },
      { status: 401 },
    );
  }

  let body: { sellerId?: string };
  try {
    body = (await request.json()) as { sellerId?: string };
  } catch {
    return NextResponse.json({ error: "无效请求" }, { status: 400 });
  }

  const sellerId =
    typeof body.sellerId === "string" ? body.sellerId.trim() : "";
  if (!sellerId) {
    return NextResponse.json({ error: "缺少 sellerId" }, { status: 400 });
  }

  const db = getAdminFirestore();
  const snap = await db
    .collection("reviews")
    .where("targetUserId", "==", sellerId)
    .get();

  const reviewCount = snap.size;
  const rating =
    reviewCount === 0
      ? 0
      : Math.round(
          (snap.docs.reduce(
            (sum, d) => sum + (Number(d.data().rating) || 0),
            0,
          ) /
            reviewCount) *
            10,
        ) / 10;

  await db
    .doc(`users/${sellerId}`)
    .set({ rating, reviewCount }, { merge: true });

  return NextResponse.json({ ok: true, rating, reviewCount });
}
