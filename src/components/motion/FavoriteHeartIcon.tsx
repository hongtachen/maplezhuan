"use client";

import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { DURATION, EASE } from "@/lib/motion/tokens";

type Size = "sm" | "md";

const SIZE_CLASS: Record<Size, string> = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
};

/** Drive heart bounce from click handlers — no effects needed. */
export function useFavoriteBounce() {
  const reducedMotion = useReducedMotion();
  const [tick, setTick] = useState(0);

  const bounceProps = {
    animate:
      tick > 0 && !reducedMotion
        ? { scale: [1, 1.38, 0.9, 1.08, 1] }
        : { scale: 1 },
    transition: { duration: DURATION.slow, ease: EASE.out },
  };

  const triggerBounce = () => setTick((t) => t + 1);

  return { bounceKey: tick, bounceProps, triggerBounce };
}

type HeartIconProps = {
  favorited: boolean;
  size?: Size;
  bounceKey: ReturnType<typeof useFavoriteBounce>["bounceKey"];
  bounceProps: ReturnType<typeof useFavoriteBounce>["bounceProps"];
};

export default function FavoriteHeartIcon({
  favorited,
  size = "sm",
  bounceKey,
  bounceProps,
}: HeartIconProps) {
  const iconClass = SIZE_CLASS[size];

  return (
    <motion.span
      key={bounceKey}
      className="inline-flex shrink-0"
      {...bounceProps}
    >
      {favorited ? (
        <svg
          className={`${iconClass} text-rose-500`}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      ) : (
        <svg
          className={`${iconClass} ${size === "sm" ? "text-[#1f2933]/70" : "text-[#1f2933]"}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={size === "sm" ? 1.8 : 2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
          />
        </svg>
      )}
    </motion.span>
  );
}
