"use client";

import { motion } from "motion/react";
import { DURATION, EASE } from "@/lib/motion/tokens";

function ShimmerBlock({ className }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden bg-gray-200/80 ${className ?? ""}`}
    >
      <div
        className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"
        aria-hidden
      />
    </div>
  );
}

export function ListingCardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: DURATION.fast,
        delay: index * 0.04,
        ease: EASE.out,
      }}
      className="flex flex-col gap-2"
      aria-hidden
    >
      <ShimmerBlock className="aspect-[4/5] w-full rounded-2xl" />
      <ShimmerBlock className="h-4 w-3/4 rounded-lg" />
      <ShimmerBlock className="h-4 w-1/3 rounded-lg" />
    </motion.div>
  );
}

export function ListingGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-x-3 gap-y-6 md:gap-x-6 md:gap-y-8"
      aria-label="加载中"
      role="status"
    >
      {Array.from({ length: count }, (_, i) => (
        <ListingCardSkeleton key={i} index={i} />
      ))}
    </div>
  );
}

export function ChatRowSkeleton({ index = 0 }: { index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: DURATION.fast,
        delay: index * 0.05,
        ease: EASE.out,
      }}
      className="flex items-center gap-4 px-4 md:px-8 py-4 border-b border-[rgba(31,41,51,0.04)]"
      aria-hidden
    >
      <ShimmerBlock className="w-12 h-12 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <ShimmerBlock className="h-4 w-1/3 rounded-lg" />
        <ShimmerBlock className="h-3 w-2/3 rounded-lg" />
      </div>
    </motion.div>
  );
}

export function ChatListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div aria-label="加载中" role="status">
      {Array.from({ length: count }, (_, i) => (
        <ChatRowSkeleton key={i} index={i} />
      ))}
    </div>
  );
}
