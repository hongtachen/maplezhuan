"use client";

import { motion } from "motion/react";
import type { LoadingPhase } from "@/lib/motion/loadingPhases";
import { CHAT_BUBBLE_TEXTS } from "@/lib/motion/loadingPhases";
import { DURATION, EASE } from "@/lib/motion/tokens";

type BubbleConfig = {
  id: number;
  text: string;
  angle: number;
  distance: number;
  slotX: number;
  slotY: number;
  delay: number;
};

function buildBubbles(count: number): BubbleConfig[] {
  const cols = count <= 4 ? 2 : 3;
  const slots: { x: number; y: number }[] = [];
  const rows = Math.ceil(count / cols);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols && slots.length < count; c++) {
      slots.push({
        x: (c - (cols - 1) / 2) * 108,
        y: (r - (rows - 1) / 2) * 88,
      });
    }
  }

  return Array.from({ length: count }, (_, i) => ({
    id: i,
    text: CHAT_BUBBLE_TEXTS[i % CHAT_BUBBLE_TEXTS.length],
    angle: (i / count) * Math.PI * 2 + 0.4,
    distance: 140 + (i % 3) * 36,
    slotX: slots[i].x,
    slotY: slots[i].y,
    delay: i * 0.06,
  }));
}

type Props = {
  phase: LoadingPhase;
  bubbleCount: number;
  exiting?: boolean;
};

export default function ChatBubbleSwirl({
  phase,
  bubbleCount,
  exiting = false,
}: Props) {
  const bubbles = buildBubbles(bubbleCount);
  const showCards = phase === "cards" || phase === "leaves" || exiting;

  return (
    <div className="relative w-full max-w-[360px] md:max-w-[420px] h-[220px] md:h-[240px] mx-auto">
      {bubbles.map((bubble) => {
        const startX = Math.cos(bubble.angle) * bubble.distance;
        const startY = Math.sin(bubble.angle) * bubble.distance;
        const isMerged =
          phase === "merge" ||
          phase === "cards" ||
          phase === "leaves" ||
          exiting;

        return (
          <motion.div
            key={bubble.id}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            initial={{
              x: startX,
              y: startY,
              rotate: bubble.angle * (180 / Math.PI),
              opacity: 0,
              scale: 0.6,
            }}
            animate={{
              x: isMerged ? bubble.slotX : startX * 0.35,
              y: isMerged ? bubble.slotY : startY * 0.35,
              rotate: isMerged ? 0 : bubble.angle * (180 / Math.PI) * 0.5,
              opacity: exiting ? 0 : 1,
              scale: showCards ? 1 : isMerged ? 0.95 : 0.85,
            }}
            transition={{
              duration: showCards ? DURATION.slow : DURATION.normal,
              ease: EASE.out,
              delay: phase === "swirl" ? bubble.delay : 0,
            }}
          >
            <motion.div
              layout
              className="relative"
              animate={{
                width: showCards ? 96 : "auto",
                height: showCards ? 120 : "auto",
              }}
              transition={{ duration: DURATION.normal, ease: EASE.out }}
            >
              {showCards ? (
                <div className="w-[96px] md:w-[104px] rounded-2xl overflow-hidden shadow-sm border border-[rgba(31,41,51,0.06)] bg-white">
                  <div className="aspect-[4/3] bg-gradient-to-br from-[#e3f1ea] to-[#bbf7d0]" />
                  <div className="p-2 space-y-1.5">
                    <div className="h-2 w-full rounded bg-[rgba(31,41,51,0.08)]" />
                    <div className="h-2 w-2/3 rounded bg-[rgba(31,41,51,0.05)]" />
                  </div>
                </div>
              ) : (
                <div className="relative max-w-[88px] px-3 py-2 rounded-2xl rounded-bl-sm bg-[#2f9e6d] text-white text-[11px] md:text-xs font-medium leading-snug shadow-md shadow-[#2f9e6d]/25 whitespace-nowrap">
                  {bubble.text}
                </div>
              )}
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}
