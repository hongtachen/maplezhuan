"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import ChatBubbleSwirl from "./ChatBubbleSwirl";
import ListingSkeletonGrid from "./ListingSkeletonGrid";
import MapleLeafFall from "./MapleLeafFall";
import {
  LOADING_EXIT_MS,
  LOADING_SNAP_EXIT_THRESHOLD,
  phaseAtElapsed,
  storyProgress,
  type LoadingPhase,
} from "@/lib/motion/loadingPhases";
import { useIsDesktop } from "@/hooks/useMediaQuery";
import { DURATION, EASE } from "@/lib/motion/tokens";

type Props = {
  loading: boolean;
  onExitComplete?: () => void;
};

export default function BrowseLoadingShow({ loading, onExitComplete }: Props) {
  const reducedMotion = useReducedMotion();
  const isDesktop = useIsDesktop();
  const bubbleCount = isDesktop ? 6 : 4;

  const [elapsed, setElapsed] = useState(0);
  const [phase, setPhase] = useState<LoadingPhase>("swirl");
  const [exiting, setExiting] = useState(false);

  const startRef = useRef<number | null>(null);
  const exitTriggeredRef = useRef(false);
  const exitTimerRef = useRef<number | null>(null);
  const onExitCompleteRef = useRef(onExitComplete);

  useEffect(() => {
    onExitCompleteRef.current = onExitComplete;
  }, [onExitComplete]);

  useEffect(() => {
    if (reducedMotion) {
      if (!loading) onExitCompleteRef.current?.();
      return;
    }

    let raf = 0;

    const beginExit = (ms: number) => {
      if (exitTriggeredRef.current) return;
      exitTriggeredRef.current = true;
      const snap = storyProgress(ms) < LOADING_SNAP_EXIT_THRESHOLD;
      setExiting(true);
      setPhase("exiting");
      exitTimerRef.current = window.setTimeout(
        () => onExitCompleteRef.current?.(),
        snap ? LOADING_EXIT_MS.snap : LOADING_EXIT_MS.graceful,
      );
    };

    const tick = (now: number) => {
      if (startRef.current === null) startRef.current = now;
      const ms = now - startRef.current;
      setElapsed(ms);
      setPhase(phaseAtElapsed(ms));

      if (!loading) {
        beginExit(ms);
        return;
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      if (exitTimerRef.current) window.clearTimeout(exitTimerRef.current);
    };
  }, [loading, reducedMotion]);

  if (reducedMotion) {
    return (
      <div className="py-8 space-y-8" role="status" aria-label="加载中">
        <LoadingTagline />
        <ListingSkeletonGrid count={isDesktop ? 8 : 6} />
      </div>
    );
  }

  const exitDuration =
    storyProgress(elapsed) < LOADING_SNAP_EXIT_THRESHOLD
      ? LOADING_EXIT_MS.snap / 1000
      : LOADING_EXIT_MS.graceful / 1000;

  return (
    <motion.div
      className="relative py-10 md:py-14 min-h-[320px] md:min-h-[360px] flex flex-col items-center justify-center overflow-hidden"
      animate={{ opacity: exiting ? 0 : 1 }}
      transition={{ duration: exitDuration, ease: EASE.out }}
      role="status"
      aria-label="加载中"
    >
      <LoadingTagline />
      <div className="relative w-full mt-6 md:mt-8">
        <MapleLeafFall active={phase === "leaves" || phase === "exiting"} />
        <ChatBubbleSwirl
          phase={phase}
          bubbleCount={bubbleCount}
          exiting={exiting}
        />
      </div>
      {(phase === "leaves" || phase === "exiting") && !exiting && (
        <motion.p
          className="mt-6 text-[13px] text-[#5a6b73] font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: DURATION.fast }}
        >
          正在整理闲置...
        </motion.p>
      )}
    </motion.div>
  );
}

function LoadingTagline() {
  return (
    <div className="text-center px-4 max-w-md mx-auto z-10">
      <p className="text-[15px] md:text-base font-semibold text-[#1f2933] leading-relaxed">
        不用加好友，不用刷群翻帖
      </p>
      <p className="text-[20px] md:text-2xl font-bold text-[#2f9e6d] mt-1 leading-tight">
        闲置转租一眼看清
      </p>
    </div>
  );
}
