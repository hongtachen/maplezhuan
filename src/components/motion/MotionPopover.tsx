"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { popoverVariants } from "@/lib/motion/variants";
import { DURATION, EASE } from "@/lib/motion/tokens";

type Props = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
};

export default function MotionPopover({
  open,
  onClose,
  children,
  className,
}: Props) {
  const reducedMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={onClose} aria-hidden />
          <motion.div
            role="menu"
            className={
              className ??
              "absolute right-0 top-10 bg-white rounded-[16px] shadow-xl border border-[rgba(31,41,51,0.08)] z-50 overflow-hidden w-44"
            }
            variants={reducedMotion ? undefined : popoverVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: DURATION.fast, ease: EASE.out }}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
