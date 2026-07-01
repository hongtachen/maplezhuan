"use client";

import { motion } from "motion/react";

const LEAVES = [
  { id: 0, left: "8%", delay: 0, duration: 2.8, size: 18 },
  { id: 1, left: "22%", delay: 0.4, duration: 3.2, size: 14 },
  { id: 2, left: "38%", delay: 0.15, duration: 2.6, size: 20 },
  { id: 3, left: "55%", delay: 0.55, duration: 3, size: 16 },
  { id: 4, left: "72%", delay: 0.25, duration: 2.9, size: 15 },
  { id: 5, left: "86%", delay: 0.7, duration: 3.1, size: 17 },
  { id: 6, left: "48%", delay: 0.9, duration: 2.7, size: 13 },
  { id: 7, left: "64%", delay: 1.1, duration: 3.3, size: 19 },
] as const;

type Props = {
  active: boolean;
};

export default function MapleLeafFall({ active }: Props) {
  if (!active) return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      {LEAVES.map((leaf) => (
        <motion.img
          key={leaf.id}
          src="/decor/maple-leaf.svg"
          alt=""
          className="absolute opacity-80"
          style={{
            left: leaf.left,
            width: leaf.size,
            height: leaf.size,
            top: -24,
          }}
          animate={{
            y: ["0%", "120%"],
            rotate: [0, 180 + leaf.id * 20],
            opacity: [0, 0.85, 0.85, 0],
          }}
          transition={{
            duration: leaf.duration,
            delay: leaf.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}
