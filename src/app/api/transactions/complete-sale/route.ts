import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import {
  getAdminAuth,
  getAdminFirestore,
  isAdminConfigured,
} from "@/lib/firebase/admin";
import { buildTransactionCompletedEmail } from "@/lib/email";

export const runtime = "nodejs";

type CompleteSaleBody = {
  itemId?: string;
  itemType?: "item" | "sublet";
  chatId?: string;
  buyerId?: string;
  finalPrice?: number;
  listing?: {
    title?: string;
    price?: number;
    emoji?: string;
    gradientFrom?: string;
    gradientTo?: string;
  };
};

export async function POST(request: Request) {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { error: "交易服务尚未配置（缺少 Firebase Admin）" },
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

  let uid: string;
  try {
    const decoded = await getAdminAuth().verifyIdToken(idToken);
    uid = decoded.uid;
  } catch {
    return NextResponse.json(
      { error: "登录已过期，请重新登录" },
      { status: 401 },
    );
  }

  let body: CompleteSaleBody;
  try {
    body = (await request.json()) as CompleteSaleBody;
  } catch {
    return NextResponse.json({ error: "无效请求" }, { status: 400 });
  }

  const itemId = typeof body.itemId === "string" ? body.itemId.trim() : "";
  const chatId = typeof body.chatId === "string" ? body.chatId.trim() : "";
  const buyerId = typeof body.buyerId === "string" ? body.buyerId.trim() : "";
  const itemType = body.itemType === "sublet" ? "sublet" : "item";
  const listing = body.listing ?? {};

  if (!itemId || !chatId || !buyerId) {
    return NextResponse.json({ error: "参数不完整" }, { status: 400 });
  }

  const db = getAdminFirestore();
  const colName = itemType === "sublet" ? "sublets" : "items";
  const listingRef = db.doc(`${colName}/${itemId}`);
  const chatRef = db.doc(`chats/${chatId}`);

  const [listingSnap, chatSnap, buyerSnap] = await Promise.all([
    listingRef.get(),
    chatRef.get(),
    db.doc(`users/${buyerId}`).get(),
  ]);

  if (!listingSnap.exists) {
    return NextResponse.json({ error: "商品不存在" }, { status: 404 });
  }
  if (!chatSnap.exists) {
    return NextResponse.json({ error: "对话不存在" }, { status: 404 });
  }

  const listingData = listingSnap.data()!;
  const chatData = chatSnap.data()!;
  const sellerId = listingData.sellerId as string;
  const participants = (chatData.participants as string[]) || [];

  if (!participants.includes(uid) || !participants.includes(buyerId)) {
    return NextResponse.json({ error: "无权完成此交易" }, { status: 403 });
  }

  // Caller must be seller or the designated buyer; sellerId on listing is source of truth
  if (uid !== sellerId && uid !== buyerId) {
    return NextResponse.json({ error: "无权完成此交易" }, { status: 403 });
  }

  if (buyerId === sellerId) {
    return NextResponse.json(
      { error: "买卖双方不能为同一人" },
      { status: 400 },
    );
  }

  if (!participants.includes(sellerId)) {
    return NextResponse.json({ error: "对话与卖家不匹配" }, { status: 403 });
  }

  const sellerSnap = await db.doc(`users/${sellerId}`).get();
  const buyerData = buyerSnap.exists ? buyerSnap.data()! : {};
  const sellerData = sellerSnap.exists ? sellerSnap.data()! : {};

  const buyerName =
    (buyerData.nickname as string) ||
    (buyerData.email as string)?.split("@")[0] ||
    "买家";
  const buyerAvatar =
    (buyerData.avatarUrl as string) || buyerName.charAt(0).toUpperCase();
  const sellerName =
    (sellerData.nickname as string) ||
    (sellerData.email as string)?.split("@")[0] ||
    "卖家";
  const sellerAvatar =
    (sellerData.avatarUrl as string) || sellerName.charAt(0).toUpperCase();

  const title =
    (typeof listing.title === "string" && listing.title) ||
    (listingData.title as string) ||
    (listingData.address as string) ||
    "商品";
  const salePrice =
    typeof body.finalPrice === "number" && Number.isFinite(body.finalPrice)
      ? body.finalPrice
      : typeof listing.price === "number"
        ? listing.price
        : Number(listingData.price) || 0;

  const newStatus = itemType === "item" ? "已售出" : "已租出";
  const text =
    itemType === "item"
      ? "卖家已确认售出给您，交易完成！"
      : "卖家已确认租出给您，交易完成！";

  await listingRef.update({
    status: newStatus,
    buyerId,
    buyerName,
    buyerAvatar,
  });

  await db.collection("orders").add({
    itemId,
    itemTitle: title,
    itemPrice: salePrice,
    itemEmoji: listing.emoji || (itemType === "sublet" ? "🏠" : "📦"),
    itemGradientFrom: listing.gradientFrom || "#f3fbf7",
    itemGradientTo: listing.gradientTo || "#bbf7d0",
    buyerId,
    buyerName,
    buyerAvatar,
    sellerId,
    sellerName,
    sellerAvatar,
    status: "已完成",
    createdAt: FieldValue.serverTimestamp(),
    completedAt: FieldValue.serverTimestamp(),
  });

  await db.collection("messages").add({
    chatId,
    senderId: sellerId,
    text,
    msgType: "action_sold",
    createdAt: FieldValue.serverTimestamp(),
  });

  const unreadCounts = (chatData.unreadCounts as Record<string, number>) || {};
  await chatRef.update({
    lastMessage: text,
    lastMessageTime: FieldValue.serverTimestamp(),
    unreadCounts: {
      ...unreadCounts,
      [buyerId]: (unreadCounts[buyerId] || 0) + 1,
    },
    hiddenBy: [],
  });

  // Best-effort email (Admin write to mail); never fail the sale
  try {
    const buyerEmail = buyerData.email as string | undefined;
    if (buyerEmail && buyerData.emailNotifications !== false) {
      const { subject, html } = buildTransactionCompletedEmail({
        nickname: buyerName,
        itemTitle: title,
        chatId,
      });
      await db.collection("mail").add({
        to: buyerEmail,
        message: { subject, html },
      });
    }
  } catch (e) {
    console.error("[complete-sale] email failed:", e);
  }

  return NextResponse.json({ ok: true });
}
