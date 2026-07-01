export type LoadingPhase = "swirl" | "merge" | "cards" | "leaves" | "exiting";

export const LOADING_PHASE_MS = {
  swirl: 700,
  merge: 600,
  cards: 500,
  leaves: 800,
} as const;

export const LOADING_STORY_MS =
  LOADING_PHASE_MS.swirl +
  LOADING_PHASE_MS.merge +
  LOADING_PHASE_MS.cards +
  LOADING_PHASE_MS.leaves;

/** Below this story progress (0–1), snap-exit when data is ready */
export const LOADING_SNAP_EXIT_THRESHOLD = 0.4;

export const LOADING_EXIT_MS = {
  snap: 350,
  graceful: 550,
} as const;

export function phaseAtElapsed(elapsedMs: number): LoadingPhase {
  if (elapsedMs < LOADING_PHASE_MS.swirl) return "swirl";
  if (elapsedMs < LOADING_PHASE_MS.swirl + LOADING_PHASE_MS.merge)
    return "merge";
  if (
    elapsedMs <
    LOADING_PHASE_MS.swirl + LOADING_PHASE_MS.merge + LOADING_PHASE_MS.cards
  ) {
    return "cards";
  }
  return "leaves";
}

export function storyProgress(elapsedMs: number): number {
  return Math.min(1, elapsedMs / LOADING_STORY_MS);
}

export const CHAT_BUBBLE_TEXTS = [
  "还在吗",
  "多少出",
  "私聊",
  "全新吗",
  "有家具吗",
  "包邮吗",
] as const;
