"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SubletIntroPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-dvh bg-[#f3fbf7]">
      <header className="absolute top-0 left-0 right-0 p-4 flex justify-between z-10">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 rounded-full hover:bg-black/5 text-[#1f2933]"
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <button
          onClick={() => router.push("/")}
          className="text-[#5a6b73] text-sm font-medium p-2"
        >
          退出
        </button>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center max-w-[500px] w-full mx-auto px-6 py-12">
        <div className="w-16 h-16 bg-[#e6f4ed] rounded-2xl flex items-center justify-center mb-6">
          <svg
            className="w-8 h-8 text-[#2f9e6d]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
        </div>

        <span className="text-[#2f9e6d] text-sm font-bold tracking-wide mb-2">
          枫转 · 转租发布
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-[#1f2933] mb-3 text-center">
          发布你的转租房源
        </h1>
        <p className="text-[#5a6b73] text-center mb-10 leading-relaxed text-sm sm:text-base">
          枫转协助华人快速找到合适的租客，几步即可完成
        </p>

        <div className="w-full flex flex-col gap-3">
          <div className="bg-white p-5 rounded-3xl border border-[rgba(31,41,51,0.04)] shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#f3fbf7] flex items-center justify-center shrink-0">
              <svg
                className="w-5 h-5 text-[#2f9e6d]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-[#1f2933]">介绍你的房源</h3>
              <p className="text-xs text-[#5a6b73] mt-0.5">
                房屋类型、所在地址、租客空间
              </p>
            </div>
            <div className="w-6 h-6 rounded-full bg-[#e6f4ed] text-[#2f9e6d] text-xs font-bold flex items-center justify-center">
              1
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-[rgba(31,41,51,0.04)] shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#f3fbf7] flex items-center justify-center shrink-0">
              <svg
                className="w-5 h-5 text-[#2f9e6d]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-[#1f2933]">完善房源信息</h3>
              <p className="text-xs text-[#5a6b73] mt-0.5">
                房型、租期、可入住时间
              </p>
            </div>
            <div className="w-6 h-6 rounded-full bg-[#e6f4ed] text-[#2f9e6d] text-xs font-bold flex items-center justify-center">
              2
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-[rgba(31,41,51,0.04)] shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#f3fbf7] flex items-center justify-center shrink-0">
              <svg
                className="w-5 h-5 text-[#2f9e6d]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-[#1f2933]">上传照片并发布</h3>
              <p className="text-xs text-[#5a6b73] mt-0.5">
                至少 3 张照片，填写月租与联系方式
              </p>
            </div>
            <div className="w-6 h-6 rounded-full bg-[#e6f4ed] text-[#2f9e6d] text-xs font-bold flex items-center justify-center">
              3
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <Link
          href="/publish/sublet/step1"
          className="block w-full max-w-[500px] mx-auto py-4 rounded-2xl bg-[#2f9e6d] hover:bg-[#267a56] text-white text-center font-bold text-[15px] transition-colors shadow-md"
        >
          开始发布
        </Link>
      </div>
    </div>
  );
}
