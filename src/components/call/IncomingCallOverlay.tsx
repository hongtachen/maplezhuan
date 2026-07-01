"use client";

import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import CallWaveAvatar from "@/components/call/CallWaveAvatar";
import { getIncomingCallSubtitle } from "@/lib/calls/messages";
import type { CallMode } from "@/lib/calls/types";
import { DURATION, EASE } from "@/lib/motion/tokens";

type Props = {
  open: boolean;
  callerName: string;
  callMode?: CallMode;
  onAccept: () => void;
  onDecline: () => void;
  busy?: boolean;
};

export default function IncomingCallOverlay({
  open,
  callerName,
  callMode,
  onAccept,
  onDecline,
  busy,
}: Props) {
  const reducedMotion = useReducedMotion();

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[300] flex items-center justify-center bg-[#1f2933]/92 px-6 backdrop-blur-sm"
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reducedMotion ? undefined : { opacity: 0 }}
          transition={{ duration: DURATION.normal, ease: EASE.out }}
        >
          <motion.div
            className="flex w-full max-w-sm flex-col items-center rounded-3xl border border-white/10 bg-white/95 p-8 text-center shadow-2xl"
            initial={reducedMotion ? false : { opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              reducedMotion ? undefined : { opacity: 0, y: 16, scale: 0.98 }
            }
            transition={{ duration: DURATION.slow, ease: EASE.out }}
          >
            <CallWaveAvatar
              name={callerName}
              variant="ringing"
              theme="light"
              size="md"
            />
            <p className="mt-5 text-lg font-bold text-[#1f2933]">
              {callerName}
            </p>
            <p className="mt-1 text-sm text-[#5a6b73]">
              {getIncomingCallSubtitle(callMode)}
            </p>
            {busy ? (
              <div className="mt-8">
                <LoadingSpinner size="md" />
              </div>
            ) : (
              <div className="mt-8 flex w-full items-center gap-4">
                <button
                  type="button"
                  onClick={onDecline}
                  className="flex-1 rounded-xl bg-gray-100 py-3.5 font-bold text-[#1f2933] transition-colors hover:bg-gray-200"
                >
                  拒绝
                </button>
                <button
                  type="button"
                  onClick={onAccept}
                  className="flex-1 rounded-xl bg-[#2f9e6d] py-3.5 font-bold text-white transition-colors hover:bg-[#267a56]"
                >
                  接听
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
