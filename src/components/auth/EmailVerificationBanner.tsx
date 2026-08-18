"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useVerifyEmailGateStore } from "@/store/useVerifyEmailGateStore";
import { isUserEmailTrusted } from "@/lib/auth/emailVerification";

/** banner for email verification when email is unverified */
export default function EmailVerificationBanner() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const openGate = useVerifyEmailGateStore((s) => s.open);

  if (!isAuthenticated || isUserEmailTrusted(user)) return null;

  return (
    <div className="mx-4 mt-3 mb-1 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
      <p className="font-medium">请验证邮箱后再发布或聊天</p>
      <p className="mt-1 text-xs text-amber-900/80 leading-relaxed">
        我们已向 {user?.email ?? "您的邮箱"}{" "}
        发送验证链接。未验证前仍可浏览，但无法发布、发消息或通话。
      </p>
      <button
        type="button"
        onClick={() => openGate()}
        className="mt-2 text-xs font-bold text-[#2f9e6d] hover:underline"
      >
        验证邮箱
      </button>
    </div>
  );
}
