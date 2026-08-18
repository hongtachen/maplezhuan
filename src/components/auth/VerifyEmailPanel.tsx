"use client";

import { useCallback, useEffect, useState } from "react";
import FadeModal from "@/components/motion/FadeModal";
import { useAuthStore } from "@/store/useAuthStore";
import { useVerifyEmailGateStore } from "@/store/useVerifyEmailGateStore";
import { useApp } from "@/components/app/AppContext";
import { isUserEmailTrusted } from "@/lib/auth/emailVerification";

const RESEND_COOLDOWN_SEC = 60;

export default function VerifyEmailPanel() {
  const isOpen = useVerifyEmailGateStore((s) => s.isOpen);
  const close = useVerifyEmailGateStore((s) => s.close);
  const { user, resendEmailVerification, reloadUser } = useAuthStore();
  const { showToast } = useApp();

  const [resendLeft, setResendLeft] = useState(0);
  const [busy, setBusy] = useState<"resend" | "reload" | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    if (isUserEmailTrusted(user)) {
      close();
    }
  }, [isOpen, user, close]);

  useEffect(() => {
    if (resendLeft <= 0) return;
    const t = window.setInterval(() => {
      setResendLeft((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => window.clearInterval(t);
  }, [resendLeft]);

  const handleResend = useCallback(async () => {
    if (resendLeft > 0 || busy) return;
    setBusy("resend");
    try {
      await resendEmailVerification();
      setResendLeft(RESEND_COOLDOWN_SEC);
      showToast("验证邮件已发送，请查收收件箱或垃圾邮件", "success");
    } catch (error: unknown) {
      const code = (error as { code?: string }).code;
      if (code === "auth/too-many-requests") {
        showToast("发送过于频繁，请稍后再试", "error");
      } else {
        showToast("发送失败，请稍后重试", "error");
      }
    } finally {
      setBusy(null);
    }
  }, [resendLeft, busy, resendEmailVerification, showToast]);

  const handleConfirmed = useCallback(async () => {
    if (busy) return;
    setBusy("reload");
    try {
      await reloadUser();
      const current = useAuthStore.getState().user;
      if (isUserEmailTrusted(current)) {
        showToast("邮箱已验证", "success");
        close();
      } else {
        showToast("尚未验证，请先点击邮件中的链接后再试", "error");
      }
    } catch {
      showToast("刷新状态失败，请重试", "error");
    } finally {
      setBusy(null);
    }
  }, [busy, reloadUser, showToast, close]);

  return (
    <FadeModal
      open={isOpen}
      onClose={close}
      panelClassName="max-w-[400px] w-full"
    >
      <div className="bg-white rounded-3xl p-6 shadow-xl">
        <h2 className="text-lg font-bold text-[#1f2933] mb-2">请先验证邮箱</h2>
        <p className="text-sm text-[#5a6b73] leading-relaxed mb-1">
          发布、聊天、议价或通话前，需要确认您能收到该邮箱的邮件。
        </p>
        {user?.email ? (
          <p className="text-sm font-medium text-[#1f2933] mb-4 break-all">
            {user.email}
          </p>
        ) : (
          <div className="mb-4" />
        )}
        <p className="text-xs text-[#5a6b73] mb-6 leading-relaxed">
          请打开验证邮件并点击链接。若未收到，请检查垃圾邮件文件夹。
        </p>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => void handleConfirmed()}
            disabled={busy !== null}
            className="w-full py-3 rounded-xl bg-[#2f9e6d] hover:bg-[#267a56] disabled:opacity-50 text-white font-bold text-sm transition-colors"
          >
            {busy === "reload" ? "检查中..." : "我已验证"}
          </button>
          <button
            type="button"
            onClick={() => void handleResend()}
            disabled={busy !== null || resendLeft > 0}
            className="w-full py-3 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 text-[#1f2933] font-bold text-sm transition-colors"
          >
            {busy === "resend"
              ? "发送中..."
              : resendLeft > 0
                ? `重新发送（${resendLeft}s）`
                : "重新发送验证邮件"}
          </button>
          <button
            type="button"
            onClick={close}
            className="w-full py-2 text-sm text-[#5a6b73] hover:text-[#1f2933] transition-colors"
          >
            稍后再说
          </button>
        </div>
      </div>
    </FadeModal>
  );
}
