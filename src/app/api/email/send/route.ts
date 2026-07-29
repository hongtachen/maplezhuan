import { NextResponse } from "next/server";
import {
  getAdminAuth,
  getAdminFirestore,
  isAdminConfigured,
} from "@/lib/firebase/admin";

export const runtime = "nodejs";

const MAX_SUBJECT = 200;
const MAX_HTML = 200_000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function recipientSharesContext(
  senderUid: string,
  recipientUid: string,
): Promise<boolean> {
  const db = getAdminFirestore();

  const chats = await db
    .collection("chats")
    .where("participants", "array-contains", senderUid)
    .get();

  if (
    chats.docs.some((d) => {
      const participants = (d.data().participants as string[]) || [];
      return participants.includes(recipientUid);
    })
  ) {
    return true;
  }

  const [asBuyer, asSeller] = await Promise.all([
    db
      .collection("orders")
      .where("buyerId", "==", senderUid)
      .where("sellerId", "==", recipientUid)
      .limit(1)
      .get(),
    db
      .collection("orders")
      .where("sellerId", "==", senderUid)
      .where("buyerId", "==", recipientUid)
      .limit(1)
      .get(),
  ]);

  return !asBuyer.empty || !asSeller.empty;
}

export async function POST(request: Request) {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { error: "邮件服务尚未配置（缺少 Firebase Admin）" },
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

  let body: { to?: string; subject?: string; html?: string };
  try {
    body = (await request.json()) as {
      to?: string;
      subject?: string;
      html?: string;
    };
  } catch {
    return NextResponse.json({ error: "无效请求" }, { status: 400 });
  }

  const to = typeof body.to === "string" ? body.to.trim() : "";
  const subject = typeof body.subject === "string" ? body.subject.trim() : "";
  const html = typeof body.html === "string" ? body.html : "";

  if (!to || !EMAIL_RE.test(to) || !subject || !html) {
    return NextResponse.json({ error: "参数无效" }, { status: 400 });
  }
  if (subject.length > MAX_SUBJECT || html.length > MAX_HTML) {
    return NextResponse.json({ error: "内容过长" }, { status: 413 });
  }

  const db = getAdminFirestore();
  const usersSnap = await db
    .collection("users")
    .where("email", "==", to)
    .limit(1)
    .get();

  if (usersSnap.empty) {
    return NextResponse.json({ error: "收件人不存在" }, { status: 403 });
  }

  const recipientUid = usersSnap.docs[0]!.id;
  if (recipientUid === uid) {
    return NextResponse.json({ error: "不能发给自己" }, { status: 400 });
  }

  const allowed = await recipientSharesContext(uid, recipientUid);
  if (!allowed) {
    return NextResponse.json(
      { error: "无权向该用户发送邮件" },
      { status: 403 },
    );
  }

  await db.collection("mail").add({
    to,
    message: { subject, html },
  });

  return NextResponse.json({ ok: true });
}
