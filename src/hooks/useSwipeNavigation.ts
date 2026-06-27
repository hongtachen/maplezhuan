import { useRef } from "react";

const SWIPE_THRESHOLD = 48;

export function useSwipeNavigation(
  onPrev: () => void,
  onNext: () => void,
  enabled = true,
) {
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  return {
    onTouchStart: (e: React.TouchEvent) => {
      if (!enabled) return;
      touchStart.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    },
    onTouchEnd: (e: React.TouchEvent) => {
      if (!enabled || !touchStart.current) return;
      const dx = e.changedTouches[0].clientX - touchStart.current.x; // horizontal movement
      const dy = e.changedTouches[0].clientY - touchStart.current.y; // vertical movement
      touchStart.current = null;
      if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy)) return; // if horizontal movement is less than threshold or vertical movement is greater than horizontal movement, return
      if (dx > 0)
        onPrev(); // if horizontal movement is positive, go to previous item
      else onNext(); // if horizontal movement is negative, go to next item
    },
  };
}
