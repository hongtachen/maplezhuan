"use client";

import LoadingSpinner from "@/components/ui/LoadingSpinner";

type Props = {
  open: boolean;
  title?: string;
  description?: string;
};

export default function UploadProgressOverlay({
  open,
  title = "正在上传，请稍候...",
  description = "请勿关闭页面",
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 px-6">
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl flex flex-col items-center gap-3 text-center"
        role="status"
        aria-live="polite"
      >
        <LoadingSpinner size="lg" />
        <p className="text-[15px] font-bold text-[#1f2933]">{title}</p>
        <p className="text-xs text-[#5a6b73]">{description}</p>
      </div>
    </div>
  );
}
