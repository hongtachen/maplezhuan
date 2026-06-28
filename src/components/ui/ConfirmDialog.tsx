"use client";

import AppModal from "./AppModal";
import {
  btnDanger,
  btnPrimary,
  btnSecondary,
  FEEDBACK,
} from "@/lib/feedback/styles";
import LoadingSpinner from "./LoadingSpinner";

type ConfirmVariant = "default" | "danger";

type ConfirmDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
  loading?: boolean;
};

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "确认",
  cancelLabel = "取消",
  variant = "default",
  loading = false,
}: ConfirmDialogProps) {
  const isDanger = variant === "danger";

  return (
    <AppModal
      open={open}
      onClose={onClose}
      maxWidth="max-w-[320px]"
      panelClassName="p-6 text-center"
    >
      <div
        className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${
          isDanger ? FEEDBACK.error.bgSoft : FEEDBACK.info.bgSoft
        }`}
      >
        {isDanger ? (
          <svg
            className={`w-7 h-7 ${FEEDBACK.error.text}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        ) : (
          <svg
            className="w-7 h-7 text-[#5a6b73]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )}
      </div>
      <h2 className="text-xl font-bold text-[#1f2933] mb-2">{title}</h2>
      {description && (
        <p className="text-[13px] text-[#5a6b73] mb-6 leading-relaxed">
          {description}
        </p>
      )}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className={`flex-1 ${btnSecondary} disabled:opacity-50`}
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className={`flex-1 flex items-center justify-center gap-2 ${
            isDanger ? btnDanger : btnPrimary
          } disabled:opacity-50`}
        >
          {loading && (
            <LoadingSpinner
              size="sm"
              className="border-white border-t-transparent"
            />
          )}
          {confirmLabel}
        </button>
      </div>
    </AppModal>
  );
}
