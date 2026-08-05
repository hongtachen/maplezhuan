"use client";

import { SUPPORT_EMAIL } from "@/lib/constants";

export default function SuspendedScreen({
  onLogout,
}: {
  onLogout: () => void;
}) {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-[#f4f7f5] px-6">
      <div className="max-w-sm w-full bg-white rounded-2xl border border-[rgba(31,41,51,0.08)] p-6 text-center shadow-sm">
        <h1 className="text-[18px] font-bold text-[#1f2933]">账号已封禁</h1>
        <p className="mt-2 text-[13px] text-[#5a6b73] leading-relaxed">
          你的账号已被暂停使用平台功能。如有疑问，请联系客服
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="text-[#2f9e6d] font-semibold mx-1"
          >
            {SUPPORT_EMAIL}
          </a>
          。
        </p>
        <button
          type="button"
          onClick={() => void onLogout()}
          className="mt-5 w-full py-2.5 rounded-xl bg-[#2f9e6d] text-white text-[13px] font-bold hover:bg-[#267a56] transition-colors"
        >
          退出登录
        </button>
      </div>
    </div>
  );
}
