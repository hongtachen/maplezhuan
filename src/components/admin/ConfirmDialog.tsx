"use client";

import { ReactNode } from "react";
import FadeModal from "@/components/motion/FadeModal";

export default function ConfirmDialog({
  open,
  onClose,
  title,
  description,
  confirmLabel = "确认",
  cancelLabel = "取消",
  tone = "danger",
  onConfirm,
  busy,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "primary";
  onConfirm: () => void;
  busy?: boolean;
  children?: ReactNode;
}) {
  const confirmClass =
    tone === "danger"
      ? "bg-rose-600 hover:bg-rose-700 text-white"
      : "bg-[#2f9e6d] hover:bg-[#267a56] text-white";

  return (
    <FadeModal open={open} onClose={onClose}>
      <div className="bg-white rounded-2xl p-5 w-full max-w-sm shadow-xl">
        <h3 className="text-[16px] font-bold text-[#1f2933]">{title}</h3>
        {description && (
          <p className="mt-2 text-[13px] text-[#5a6b73] leading-relaxed">
            {description}
          </p>
        )}
        {children && <div className="mt-3">{children}</div>}
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-bold border border-[rgba(31,41,51,0.1)] hover:bg-[#f7f9fc] transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`flex-1 py-2.5 rounded-xl text-[13px] font-bold transition-colors disabled:opacity-60 ${confirmClass}`}
          >
            {busy ? "处理中…" : confirmLabel}
          </button>
        </div>
      </div>
    </FadeModal>
  );
}
