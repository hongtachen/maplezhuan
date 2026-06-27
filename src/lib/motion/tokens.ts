import type { Transition } from "motion/react";

/** Shared motion design tokens — keep durations/easing consistent app-wide. */
export const DURATION = {
  fast: 0.18,
  normal: 0.28,
  slow: 0.38,
} as const;

/** iOS-like deceleration curve */
export const EASE = {
  out: [0.32, 0.72, 0, 1] as const,
  inOut: [0.4, 0, 0.2, 1] as const,
};

export const SPRING = {
  // higher stiffness = stronger spring = faster movement = get pulled toward the target position more agressive
  // higher damping = less bouncy
  // higher mass = more weight
  snappy: { type: "spring", stiffness: 420, damping: 34, mass: 0.85 },
  soft: { type: "spring", stiffness: 320, damping: 32, mass: 1 },
} as const satisfies Record<string, Transition>;

export const PAGE_TRANSITION: Transition = {
  duration: DURATION.normal,
  ease: EASE.out,
};

export const SHEET_TRANSITION: Transition = {
  duration: DURATION.normal,
  ease: EASE.out,
};

export const OVERLAY_TRANSITION: Transition = {
  duration: DURATION.fast,
  ease: EASE.inOut,
};
