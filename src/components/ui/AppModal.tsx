"use client";

import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { modalBackdrop, modalPanel } from "@/lib/feedback/styles";

type AppModalProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  /** max width class, e.g. max-w-md */
  maxWidth?: string;
  /** align to content area on desktop (offset sidebar) */
  offsetSidebar?: boolean;
  /** click backdrop to close */
  dismissOnBackdrop?: boolean;
  className?: string;
  panelClassName?: string;
};

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export default function AppModal({
  open,
  onClose,
  children,
  maxWidth = "max-w-md",
  offsetSidebar = true,
  dismissOnBackdrop = true,
  className = "",
  panelClassName = "",
}: AppModalProps) {
  const isClient = useIsClient();

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

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
      className={`${modalBackdrop} ${offsetSidebar ? "md:left-16" : ""} ${className}`}
      onClick={dismissOnBackdrop ? onClose : undefined}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`${modalPanel} ${maxWidth} ${panelClassName}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}

export function ModalHeader({
  title,
  onClose,
  subtitle,
}: {
  title: string;
  onClose?: () => void;
  subtitle?: string;
}) {
  return (
    <div className="p-6 border-b border-[rgba(31,41,51,0.04)] flex items-start justify-between gap-3 bg-gray-50/50">
      <div className="min-w-0">
        <h2 className="text-[16px] md:text-lg font-bold text-[#1f2933]">
          {title}
        </h2>
        {subtitle && (
          <p className="text-[13px] text-[#5a6b73] mt-1 leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 shrink-0 rounded-full bg-white border border-gray-200 flex items-center justify-center text-[#5a6b73] hover:bg-gray-50 transition-colors"
          aria-label="关闭"
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
      )}
    </div>
  );
}

export function ModalBody({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`p-6 overflow-y-auto flex-1 min-h-0 ${className}`}>
      {children}
    </div>
  );
}

export function ModalFooter({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`p-5 border-t border-[rgba(31,41,51,0.04)] bg-white ${className}`}
    >
      {children}
    </div>
  );
}
