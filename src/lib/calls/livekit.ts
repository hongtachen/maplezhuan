import { auth } from "@/lib/firebase/config";

async function postTokenRequest(callId: string, idToken: string) {
  return fetch("/api/calls/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ callId }),
  });
}

export async function fetchLiveKitToken(
  callId: string,
): Promise<{ token: string; url: string }> {
  const user = auth.currentUser;
  if (!user) throw new Error("请先登录");

  let idToken = await user.getIdToken();
  let res = await postTokenRequest(callId, idToken);

  if (res.status === 401) {
    idToken = await user.getIdToken(true);
    res = await postTokenRequest(callId, idToken);
  }

  const data = (await res.json()) as {
    token?: string;
    url?: string;
    error?: string;
  };
  if (!res.ok) {
    throw new Error(data.error || "无法连接语音服务");
  }
  if (!data.token || !data.url) {
    throw new Error("语音服务返回异常");
  }
  return { token: data.token, url: data.url };
}

export function formatCallDuration(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
