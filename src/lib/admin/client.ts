import { auth } from "@/lib/firebase/config";

export async function adminFetch<T = unknown>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("未登录");
  }
  const idToken = await user.getIdToken();
  const res = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
      ...(init?.headers || {}),
    },
  });

  const data = (await res.json().catch(() => ({}))) as {
    error?: string;
  } & T;

  if (!res.ok) {
    throw new Error(
      typeof data.error === "string" ? data.error : `请求失败 (${res.status})`,
    );
  }

  return data as T;
}
