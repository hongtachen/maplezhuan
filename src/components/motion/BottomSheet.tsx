"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { bottomSheetVariants, overlayVariants } from "@/lib/motion/variants";
import { OVERLAY_TRANSITION, SHEET_TRANSITION } from "@/lib/motion/tokens";

type Props = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  /** aria-labelledby target inside the sheet */
  titleId?: string;
  className?: string;
  panelClassName?: string;
};

export default function BottomSheet({
  open,
  onClose,
  children,
  titleId,
  className,
  panelClassName,
}: Props) {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div
          className={`fixed inset-0 z-[200] flex items-end justify-center ${className ?? ""}`}
          role="presentation"
        >
          <motion.button
            type="button"
            aria-label="关闭"
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px] border-0 cursor-default"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={OVERLAY_TRANSITION}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className={`relative w-full max-w-lg bg-white rounded-t-3xl shadow-2xl max-h-[90dvh] overflow-y-auto ${panelClassName ?? ""}`}
            variants={reducedMotion ? overlayVariants : bottomSheetVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={SHEET_TRANSITION}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
