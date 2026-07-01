"use client";

import { useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

type Props = {
  open: boolean;
  title?: string;
  description?: string;
};

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export default function UploadProgressOverlay({
  open,
  title = "正在上传，请稍候...",
  description = "请勿关闭页面",
}: Props) {
  const isClient = useIsClient();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || !isClient) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[210] flex items-center justify-center bg-black/45 px-6"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl flex flex-col items-center gap-3 text-center">
        <LoadingSpinner size="lg" />
        <p className="text-[15px] font-bold text-[#1f2933]">{title}</p>
        <p className="text-xs text-[#5a6b73]">{description}</p>
      </div>
    </div>,
    document.body,
  );
}
