"use client";

import { useAuthStore } from "@/store/useAuthStore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PublishEntryPage() {
  const { userProfile, isLoading } = useAuthStore();
  const router = useRouter();

  // If not a registered seller, redirect to onboarding
  useEffect(() => {
    if (!isLoading && userProfile && userProfile.isVerifiedSeller === false) {
      router.replace("/seller-onboarding");
    }
  }, [userProfile, isLoading, router]);

  // While checking, or if seller — show publish page
  return (
    <div className="flex flex-col min-h-full bg-[#f3fbf7]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-[rgba(31,41,51,0.08)] px-4 py-4">
        <div className="max-w-[600px] mx-auto flex items-center">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-full hover:bg-[#f3fbf7] text-[#5a6b73] transition-colors"
          >
            <svg
              className="w-6 h-6"
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
          <h1 className="text-xl font-bold text-[#1f2933] ml-2">选择类型</h1>
        </div>
      </header>

      <div className="flex-1 max-w-[600px] w-full mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-[#1f2933] mb-2">
          你想发布什么？
        </h2>
        <p className="text-[#5a6b73] mb-8">选择类型，开始发布</p>

        <div className="flex flex-col gap-4">
          {/* Item Card */}
          <Link
            href="/publish/items"
            className="block bg-white rounded-3xl p-6 border border-[rgba(31,41,51,0.04)] shadow-sm hover:shadow-md transition-shadow group"
          >
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#f3fbf7] flex items-center justify-center shrink-0">
                <span className="text-3xl">🏷️</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-[#1f2933] mb-1 group-hover:text-[#2f9e6d] transition-colors">
                  发布闲置
                </h3>
                <p className="text-sm text-[#5a6b73] mb-4">
                  二手家具、电子产品、日常用品等
                </p>
                <span className="text-sm font-bold text-[#2f9e6d] flex items-center gap-1">
                  开始发布
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </span>
              </div>
            </div>
          </Link>

          {/* Sublet Card */}
          <Link
            href="/publish/sublet"
            className="block bg-white rounded-3xl p-6 border border-[rgba(31,41,51,0.04)] shadow-sm hover:shadow-md transition-shadow group"
          >
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0">
                <span className="text-3xl">🏠</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-[#1f2933] mb-1 group-hover:text-indigo-600 transition-colors">
                  发布转租
                </h3>
                <p className="text-sm text-[#5a6b73] mb-4">
                  房间、公寓或整套住宅短期长期转租
                </p>
                <span className="text-sm font-bold text-indigo-600 flex items-center gap-1">
                  开始发布
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </span>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
