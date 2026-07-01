"use client";

import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { formatCallDuration } from "@/lib/calls/livekit";
import CallWaveAvatar from "@/components/call/CallWaveAvatar";
import { DURATION, EASE } from "@/lib/motion/tokens";

type Props = {
  open: boolean;
  peerName: string;
  startedAtMs: number | null;
  isMuted: boolean;
  audioBlocked?: boolean;
  onUnlockAudio?: () => void;
  onToggleMute: () => void;
  onEnd: () => void;
  ending?: boolean;
};

function useTickingNow(enabled: boolean): number {
  return useSyncExternalStore(
    (onStoreChange) => {
      if (!enabled) return () => {};
      const id = window.setInterval(onStoreChange, 1000);
      return () => window.clearInterval(id);
    },
    () => (enabled ? Date.now() : 0),
    () => 0,
  );
}

export default function ActiveVoiceCall({
  open,
  peerName,
  startedAtMs,
  isMuted,
  audioBlocked,
  onUnlockAudio,
  onToggleMute,
  onEnd,
  ending,
}: Props) {
  const reducedMotion = useReducedMotion();
  const ticking = open && startedAtMs != null;
  const nowMs = useTickingNow(ticking);
  const elapsedSec =
    startedAtMs != null
      ? Math.max(0, Math.floor((nowMs - startedAtMs) / 1000))
      : 0;
  const waveVariant = startedAtMs ? "active" : "connecting";
  const statusLabel = startedAtMs
    ? formatCallDuration(elapsedSec)
    : "正在呼叫…";

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[300] flex flex-col items-center justify-between overflow-hidden bg-[#1f2933] px-6 py-12 text-white"
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reducedMotion ? undefined : { opacity: 0 }}
          transition={{ duration: DURATION.normal, ease: EASE.out }}
        >
          <motion.div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-[18%] h-72 w-72 -translate-x-1/2 rounded-full bg-[#2f9e6d]/10 blur-3xl"
            animate={
              reducedMotion
                ? undefined
                : { scale: [1, 1.12, 1], opacity: [0.35, 0.55, 0.35] }
            }
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="relative z-10 flex flex-col items-center pt-8">
            <CallWaveAvatar
              name={peerName}
              variant={waveVariant}
              theme="dark"
              size="lg"
            />
            <p className="mt-6 text-xl font-bold">{peerName}</p>
            <p className="mt-1 text-sm text-white/70">{statusLabel}</p>
            {audioBlocked && onUnlockAudio && (
              <button
                type="button"
                onClick={onUnlockAudio}
                className="mt-5 rounded-full bg-[#2f9e6d] px-4 py-2 text-sm font-semibold transition-colors hover:bg-[#267a56]"
              >
                点击启用声音
              </button>
            )}
          </div>

          <div className="relative z-10 flex items-center gap-8 pb-8">
            <button
              type="button"
              onClick={onToggleMute}
              disabled={ending || !startedAtMs}
              className={`flex h-14 w-14 items-center justify-center rounded-full text-xl transition-colors disabled:opacity-40 ${
                isMuted
                  ? "bg-white text-[#1f2933]"
                  : "bg-white/15 hover:bg-white/25"
              }`}
              aria-label={isMuted ? "取消静音" : "静音"}
            >
              {isMuted ? "🔇" : "🎙️"}
            </button>
            <button
              type="button"
              onClick={onEnd}
              disabled={ending}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-[#d94a38] text-2xl transition-colors hover:bg-[#c43f2f] disabled:opacity-60"
              aria-label="挂断"
            >
              📞
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
