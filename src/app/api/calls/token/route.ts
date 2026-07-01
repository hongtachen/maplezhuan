import { AccessToken } from "livekit-server-sdk";
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
      {
        error:
          "语音通话服务尚未配置（缺少 Firebase Admin 或 LiveKit 环境变量）",
      },
      { status: 503 },
    );
  }

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

  if (!apiKey || !apiSecret || !livekitUrl) {
    return NextResponse.json(
      { error: "LiveKit 环境变量未配置" },
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
  } catch (e) {
    if (process.env.NODE_ENV === "development") {
      console.error("[calls/token] verifyIdToken failed:", e);
    }
    return NextResponse.json(
      { error: "登录已过期，请重新登录" },
      { status: 401 },
    );
  }

  const body = (await request.json()) as { callId?: string };
  const callId = body.callId;
  if (!callId) {
    return NextResponse.json({ error: "缺少 callId" }, { status: 400 });
  }

  const callSnap = await getAdminFirestore().doc(`calls/${callId}`).get();
  if (!callSnap.exists) {
    return NextResponse.json({ error: "通话不存在" }, { status: 404 });
  }

  const call = callSnap.data()!;
  const isParticipant = call.callerId === uid || call.calleeId === uid;
  if (!isParticipant) {
    return NextResponse.json({ error: "无权加入此通话" }, { status: 403 });
  }

  if (!["ringing", "active"].includes(call.status)) {
    return NextResponse.json({ error: "通话已结束" }, { status: 409 });
  }

  const at = new AccessToken(apiKey, apiSecret, {
    identity: uid,
    ttl: "15m",
  });

  at.addGrant({
    roomJoin: true,
    room: call.roomName,
    canPublish: true,
    canSubscribe: true,
  });

  const token = await at.toJwt();

  return NextResponse.json({ token, url: livekitUrl });
}
