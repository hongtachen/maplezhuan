"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { FEEDBACK, TOAST_DURATION } from "@/lib/feedback/styles";

export type ToastType = "success" | "error" | "info" | "warning";

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

const icons: Record<ToastType, ReactNode> = {
  success: (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2.5}
        d="M5 13l4 4L19 7"
      />
    </svg>
  ),
  error: (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2.5}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  ),
  warning: (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2.5}
        d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
      />
    </svg>
  ),
  info: (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2.5}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
};

export default function Toast({ message, type, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const dismiss = useCallback(() => {
    setIsLeaving(true);
    setIsVisible(false);
    setTimeout(onClose, 280);
  }, [onClose]);

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
    const timer = setTimeout(dismiss, TOAST_DURATION[type]);
    return () => clearTimeout(timer);
  }, [type, dismiss]);

  const bgClass = FEEDBACK[type].bg;

  return (
    <div
      className={`fixed top-safe pt-4 left-0 right-0 md:pl-16 z-[110] flex justify-center px-4 transition-all duration-300 ease-out ${
        isVisible && !isLeaving
          ? "translate-y-0 opacity-100"
          : "-translate-y-3 opacity-0"
      }`}
    >
      <div
        role="status"
        aria-live="polite"
        className={`pointer-events-auto flex items-center gap-2.5 pl-4 pr-3 py-3 rounded-[18px] text-white font-medium shadow-[0_8px_32px_rgba(0,0,0,0.16)] backdrop-blur-md max-w-[min(100%,420px)] ${bgClass}`}
      >
        <div className="shrink-0 flex items-center justify-center">
          {icons[type]}
        </div>
        <span className="text-[14px] leading-snug flex-1">{message}</span>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/15 transition-colors"
          aria-label="关闭提示"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
