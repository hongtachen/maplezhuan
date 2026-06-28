"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { overlayVariants, sideSheetVariants } from "@/lib/motion/variants";
import { SHEET_TRANSITION } from "@/lib/motion/tokens";

type Props = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
};

export default function FullScreenSheet({
  open,
  onClose,
  children,
  className,
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
        <motion.div
          role="dialog"
          aria-modal="true"
          className={`fixed inset-0 z-[200] flex flex-col bg-white h-dvh w-full ${className ?? ""}`}
          variants={reducedMotion ? overlayVariants : sideSheetVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={SHEET_TRANSITION}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
