"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { overlayVariants } from "@/lib/motion/variants";
import { DURATION, EASE, OVERLAY_TRANSITION } from "@/lib/motion/tokens";

export type PublishSuccessAction = {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
};

type Props = {
  open: boolean;
  message?: string;
  /** Shown below the message when provided (replaces auto-redirect). */
  actions?: PublishSuccessAction[];
  /** @deprecated Use `actions` instead. Auto-redirect after delay when no actions. */
  onComplete?: () => void;
  delay?: number;
};

export default function PublishSuccessOverlay({
  open,
  message = "发布成功！",
  actions,
  onComplete,
  delay = 1400,
}: Props) {
  const reducedMotion = useReducedMotion();
  const useAutoRedirect = !actions?.length && !!onComplete;

  useEffect(() => {
    if (!open || !useAutoRedirect) return;
    const timer = window.setTimeout(onComplete!, delay);
    return () => window.clearTimeout(timer);
  }, [open, onComplete, delay, useAutoRedirect]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[220] flex flex-col items-center justify-center bg-[#f3fbf7]/95 backdrop-blur-sm px-6"
          role="status"
          aria-live="polite"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={OVERLAY_TRANSITION}
        >
          <motion.div
            className="w-20 h-20 rounded-full bg-[#2f9e6d] flex items-center justify-center shadow-lg shadow-[#2f9e6d]/25 mb-5"
            initial={reducedMotion ? false : { scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              duration: DURATION.normal,
              ease: EASE.out,
              delay: reducedMotion ? 0 : 0.08,
            }}
          >
            <svg
              className="w-10 h-10 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </motion.div>
          <motion.p
            className="text-lg font-semibold text-[#1f2933] mb-1"
            initial={reducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: DURATION.fast,
              ease: EASE.out,
              delay: reducedMotion ? 0 : 0.35,
            }}
          >
            {message}
          </motion.p>
          {actions && actions.length > 0 && (
            <motion.div
              className="mt-6 flex flex-col gap-3 w-full max-w-[280px]"
              initial={reducedMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: DURATION.fast,
                ease: EASE.out,
                delay: reducedMotion ? 0 : 0.45,
              }}
            >
              {actions.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={action.onClick}
                  className={`w-full py-3.5 rounded-xl font-bold text-[15px] transition-colors ${
                    action.variant === "secondary"
                      ? "bg-white text-[#1f2933] border border-[rgba(31,41,51,0.12)] hover:bg-gray-50"
                      : "bg-[#2f9e6d] text-white hover:bg-[#267a56]"
                  }`}
                >
                  {action.label}
                </button>
              ))}
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
