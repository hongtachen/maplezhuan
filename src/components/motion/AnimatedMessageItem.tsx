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
  index: number;
  align: MessageAlign;
  children: ReactNode;
};

export function getMessageAlign(
  msgType: string | undefined,
  isMe: boolean,
): MessageAlign {
  if (
    msgType === "action_sold" ||
    msgType === "action_reserved" ||
    msgType === "action_declined"
  ) {
    return "center";
  }
  return isMe ? "end" : "start";
}

/** Staggered entrance wrapper for chat message rows. */
export default function AnimatedMessageItem({ index, align, children }: Props) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: DURATION.fast,
        ease: EASE.out,
        delay: reducedMotion ? 0 : Math.min(index * 0.02, 0.24),
      }}
      className={`flex w-full ${alignClass[align]}`}
    >
      {children}
    </motion.div>
  );
}
