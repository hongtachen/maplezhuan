"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface GuestFavoriteNudgeProps {
  onDismiss: () => void;
}

export default function GuestFavoriteNudge({
  onDismiss,
}: GuestFavoriteNudgeProps) {
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation on next frame
    const raf = requestAnimationFrame(() => setVisible(true));

    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 350);
    }, 6000);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [onDismiss]);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(onDismiss, 350);
  };

  const handleLogin = () => {
    handleDismiss();
    router.push("/profile");
  };

  return (
    <div
      className={`fixed left-0 right-0 z-[110] flex justify-center px-4 md:pl-20 transition-all duration-350 ease-out pointer-events-none
        ${visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
      style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 72px)" }}
    >
      <div className="pointer-events-auto w-full max-w-sm bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.14)] border border-[rgba(47,158,109,0.18)] overflow-hidden flex">
        {/* Green left accent */}
        <div className="w-1 shrink-0 bg-[#2f9e6d]" />

        <div className="flex-1 px-4 py-3.5">
          {/* Top row */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[18px] leading-none select-none">🔒</span>
              <p className="text-sm font-bold text-[#1f2933] leading-snug">
                收藏仅保存在本设备
              </p>
            </div>
            <button
              onClick={handleDismiss}
              aria-label="关闭提示"
              className="shrink-0 w-6 h-6 flex items-center justify-center text-[#5a6b73] hover:text-[#1f2933] transition-colors rounded-full hover:bg-gray-100 -mt-0.5 -mr-1"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Description */}
          <p className="text-xs text-[#5a6b73] mt-1 leading-relaxed">
            登录后收藏将同步到云端，换设备也不会丢失
          </p>

          {/* CTA */}
          <button
            onClick={handleLogin}
            className="mt-3 w-full py-2 rounded-xl bg-[#2f9e6d] hover:bg-[#267a56] active:bg-[#1e6344] text-white text-sm font-bold transition-colors shadow-sm"
          >
            立即登录 / 注册
          </button>
        </div>
      </div>
    </div>
  );
}
