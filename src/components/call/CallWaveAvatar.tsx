"use client";

import { motion, useReducedMotion } from "motion/react";

export type CallWaveVariant = "ringing" | "connecting" | "active";

type Props = {
  name: string;
  variant?: CallWaveVariant;
  theme?: "dark" | "light";
  size?: "md" | "lg";
};

const SIZES = {
  md: { avatar: 80, shell: 168, text: "text-3xl" },
  lg: { avatar: 96, shell: 200, text: "text-4xl" },
} as const;

const BAR_COUNT = 7;

function waveHeights(seed: number): number[] {
  return Array.from({ length: BAR_COUNT }, (_, i) => {
    const base = 6 + ((i + seed) % 4) * 4;
    return base;
  });
}

export default function CallWaveAvatar({
  name,
  variant = "active",
  theme = "dark",
  size = "lg",
}: Props) {
  const reducedMotion = useReducedMotion();
  const dims = SIZES[size];
  const initial = name.charAt(0) || "?";
  const showRipples = !reducedMotion && variant !== "connecting";
  const showBars = variant === "ringing" || variant === "active";
  const barHeights = waveHeights(variant === "ringing" ? 1 : 2);

  const avatarClass =
    theme === "dark"
      ? "bg-[#2f9e6d]/30 border-[#4ecf98]/55 text-white shadow-[0_0_40px_rgba(47,158,109,0.35)]"
      : "bg-[#e6f4ed] border-[#2f9e6d]/35 text-[#2f9e6d] shadow-[0_8px_24px_rgba(47,158,109,0.18)]";

  const barClass = theme === "dark" ? "bg-[#6fd9a8]" : "bg-[#2f9e6d]";
  const ringClass =
    theme === "dark" ? "border-[#4ecf98]/70" : "border-[#2f9e6d]/45";

  const rippleDuration = variant === "ringing" ? 1.6 : 2.2;

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative flex items-center justify-center"
        style={{ width: dims.shell, height: dims.shell }}
      >
        {showRipples &&
          [0, 1, 2].map((i) => (
            <motion.span
              key={i}
              aria-hidden
              className={`absolute rounded-full border-2 ${ringClass}`}
              style={{ width: dims.avatar, height: dims.avatar }}
              initial={{ scale: 1, opacity: 0.55 }}
              animate={{ scale: 2.15, opacity: 0 }}
              transition={{
                duration: rippleDuration,
                repeat: Infinity,
                delay: i * (rippleDuration / 3),
                ease: "easeOut",
              }}
            />
          ))}

        <motion.div
          className={`relative z-10 flex items-center justify-center rounded-full border font-bold ${avatarClass} ${dims.text}`}
          style={{ width: dims.avatar, height: dims.avatar }}
          animate={
            reducedMotion
              ? undefined
              : variant === "connecting"
                ? { scale: [1, 1.04, 1] }
                : { scale: [1, 1.02, 1] }
          }
          transition={{
            duration: variant === "connecting" ? 1.4 : 2.4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {initial}
        </motion.div>
      </div>

      {showBars && (
        <div
          className="mt-3 flex h-8 items-end justify-center gap-1.5"
          aria-hidden
        >
          {barHeights.map((base, i) => (
            <motion.span
              key={i}
              className={`w-1.5 rounded-full ${barClass}`}
              animate={
                reducedMotion
                  ? { height: base }
                  : {
                      height: [
                        base,
                        base + 14 + (i % 3) * 5,
                        base + 4,
                        base + 18 - (i % 2) * 4,
                        base,
                      ],
                    }
              }
              transition={{
                duration: variant === "ringing" ? 0.85 : 1.05,
                repeat: Infinity,
                delay: i * 0.08,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
