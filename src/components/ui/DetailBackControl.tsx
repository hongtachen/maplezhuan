"use client";

import { useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { goBackOr, hasDetailFromApp } from "@/lib/navigation";

export default function DetailBackControl() {
  const router = useRouter();
  const fromApp = useSyncExternalStore(
    () => () => {},
    hasDetailFromApp,
    () => false,
  );

  if (fromApp) {
    return (
      <button
        type="button"
        aria-label="返回"
        onClick={() => goBackOr(router)}
        className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <svg
          className="w-5 h-5 text-[#1f2933]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => goBackOr(router)}
      className="h-10 px-3.5 rounded-full flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors text-[13px] font-bold text-[#2f9e6d]"
    >
      浏览所有
    </button>
  );
}
