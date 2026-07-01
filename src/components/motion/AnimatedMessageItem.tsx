"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { DURATION, EASE } from "@/lib/motion/tokens";

export type MessageAlign = "start" | "end" | "center";

const alignClass: Record<MessageAlign, string> = {
  start: "justify-start",
  end: "justify-end",
  center: "justify-center",
};

type Props = {
  align: MessageAlign;
  children: ReactNode;
  /** Animate only on first appearance (initial load or new message). */
  enter?: boolean;
  /** Stagger index for initial batch only. */
  staggerIndex?: number;
};

export function getMessageAlign(
  msgType: string | undefined,
  isMe: boolean,
): MessageAlign {
  if (
    msgType === "action_sold" ||
    msgType === "action_reserved" ||
    msgType === "action_declined" ||
    msgType === "call_invite" ||
    msgType === "call_ended" ||
    msgType === "call_missed" ||
    msgType === "call_declined" ||
    msgType === "call_cancelled"
  ) {
    return "center";
  }
  return isMe ? "end" : "start";
}

/** Entrance wrapper for chat rows — skips re-animation on Firestore updates. */
export default function AnimatedMessageItem({
  align,
  children,
  enter = false,
  staggerIndex = 0,
}: Props) {
  const reducedMotion = useReducedMotion();
  const isInitialBatch = enter && staggerIndex < 15;

  return (
    <motion.div
      initial={enter && !reducedMotion ? { opacity: 0, y: 8 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: DURATION.fast,
        ease: EASE.out,
        delay:
          enter && !reducedMotion && isInitialBatch ? staggerIndex * 0.02 : 0,
      }}
      className={`flex w-full ${alignClass[align]}`}
    >
      {children}
    </motion.div>
  );
}
