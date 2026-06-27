"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { overlayVariants, sideSheetVariants } from "@/lib/motion/variants";
import { OVERLAY_TRANSITION, SHEET_TRANSITION } from "@/lib/motion/tokens";

type Props = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  side?: "left" | "right";
  className?: string;
  panelClassName?: string;
};

export default function SideSheet({
  open,
  onClose,
  children,
  side = "right",
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

  const panelVariants =
    side === "right"
      ? sideSheetVariants
      : {
          hidden: { x: "-100%" },
          visible: { x: 0 },
        };

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div
          className={`fixed inset-0 z-[200] ${className ?? ""}`}
          role="presentation"
        >
          <motion.button
            type="button"
            aria-label="关闭"
            className="absolute inset-0 bg-black/40 border-0 cursor-default"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={OVERLAY_TRANSITION}
            onClick={onClose}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            className={`fixed inset-y-0 ${side === "right" ? "right-0" : "left-0"} w-full sm:w-[400px] bg-white flex flex-col shadow-[-4px_0_24px_rgba(0,0,0,0.12)] ${panelClassName ?? ""}`}
            variants={reducedMotion ? overlayVariants : panelVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={SHEET_TRANSITION}
          >
            {children}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
