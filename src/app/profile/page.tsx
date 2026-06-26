"use client";

import { useApp } from "@/components/app/AppContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useTransactionCounts } from "@/hooks/useTransactionCounts";
import { SUPPORT_EMAIL } from "@/lib/constants";

const txRows = [
  {
    key: "listings",
    href: "/profile/listings",
    label: "我发布的",
    desc: "管理在售、已预留和已售商品",
    icon: (
      <svg
        className="w-6 h-6 text-[#2f9e6d]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
        <line x1="12" y1="22.08" x2="12" y2="12"></line>
      </svg>
    ),
    countKey: "listingsActive" as const,
    countSuffix: "件在售",
  },
  {
    key: "sold",
    href: "/profile/sold",
    label: "我卖出的",
    desc: "查看成交记录与买家",
    icon: (
      <svg
        className="w-6 h-6 text-[#2f9e6d]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
        <line x1="7" y1="7" x2="7.01" y2="7"></line>
      </svg>
    ),
    countKey: "sold" as const,
    countSuffix: "笔成交",
  },
  {
    key: "bought",
    href: "/profile/bought",
    label: "我买到的",
    desc: "查看购买记录与评价",
    icon: (
      <svg
        className="w-6 h-6 text-[#2f9e6d]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <path d="M16 10a4 4 0 0 1-8 0"></path>
      </svg>
    ),
    countKey: "bought" as const,
    countSuffix: "笔购买",
    badgeKey: "pendingReviews" as const,
    badgeLabel: "待评价",
  },
];

export default function ProfilePage() {
  const { showToast } = useApp();
  const { user, userProfile, logout } = useAuthStore();
  const router = useRouter();
  const txCounts = useTransactionCounts();

  const handlePostingsClick = () => {
    router.push("/profile/listings");
  };

  const handleContactUs = () => {
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("枫转 MapleZhuan 用户咨询")}`;
  };

  const handleCopySupportEmail = async () => {
    try {
      await navigator.clipboard.writeText(SUPPORT_EMAIL);
      showToast("邮箱已复制", "success");
    } catch {
      showToast(SUPPORT_EMAIL, "info");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      showToast("已成功退出登录", "success");
      router.push("/");
    } catch {
      showToast("退出登录失败", "error");
    }
  };

  const displayName =
    userProfile?.nickname ||
    user?.displayName ||
    user?.email?.split("@")[0] ||
    "用户";
  const email = userProfile?.email || user?.email || "";
  const initial = displayName.charAt(0).toUpperCase();
  const avatarUrl = userProfile?.avatarUrl || user?.photoURL;
  const isVerifiedSeller = userProfile?.isVerifiedSeller || false;

  return (
    <div className="flex flex-col min-h-full bg-[#f3fbf7]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-[rgba(31,41,51,0.08)] px-4 md:px-8 py-4">
        <div className="max-w-[600px] mx-auto flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-bold text-[#1f2933]">
            我的中心
          </h1>
        </div>
      </header>

      <div className="flex-1 max-w-[600px] w-full mx-auto px-4 md:px-8 py-6 flex flex-col gap-6 pb-32">
        {/* User Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-[rgba(31,41,51,0.04)] flex items-center gap-5">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-16 h-16 rounded-full object-cover shadow-inner shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-600 text-2xl font-bold shadow-inner shrink-0">
              {initial}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-[#1f2933] mb-1 truncate">
              {displayName}
            </h2>
            {email && (
              <p className="text-[11px] text-[#5a6b73] truncate mb-2">
                {email}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-600 flex items-center gap-1">
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                买家
              </span>
              {isVerifiedSeller && (
                <>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#f3fbf7] text-[#2f9e6d] flex items-center gap-1 border border-[#2f9e6d]/20">
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    已认证卖家
                  </span>
                  <Link
                    href={`/seller/${user?.uid}`}
                    className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-600 flex items-center gap-1 border border-amber-200/50 hover:bg-amber-100 transition-colors"
                  >
                    <span>
                      ⭐{" "}
                      {(userProfile?.reviewCount ?? 0) > 0
                        ? (userProfile?.rating ?? 5.0).toFixed(1)
                        : "暂无评分"}
                    </span>
                    {(userProfile?.reviewCount ?? 0) > 0 && (
                      <span className="font-normal opacity-70 ml-0.5">
                        / {userProfile?.reviewCount} 评
                      </span>
                    )}
                    <svg
                      className="w-3 h-3 ml-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Transaction Center */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-[rgba(31,41,51,0.04)]">
          <div className="px-6 py-4 border-b border-[rgba(31,41,51,0.04)] bg-gray-50/50 flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#5a6b73]">交易中心</h3>
            {!txCounts.loading &&
              (txCounts.sold > 0 || txCounts.bought > 0) && (
                <span className="text-[11px] text-[#5a6b73]">
                  共有 {txCounts.sold + txCounts.bought} 笔交易
                </span>
              )}
          </div>
          <div className="flex flex-col">
            {txRows.map((row, idx) => {
              const count = txCounts[row.countKey];
              const badge = row.badgeKey ? txCounts[row.badgeKey] : 0;
              return (
                <button
                  key={row.key}
                  onClick={() => {
                    if (row.key === "listings") handlePostingsClick();
                    else router.push(row.href);
                  }}
                  className={`flex items-center gap-4 px-6 py-4 hover:bg-[#f3fbf7] transition-colors text-left group ${
                    idx < txRows.length - 1
                      ? "border-b border-[rgba(31,41,51,0.04)]"
                      : ""
                  }`}
                >
                  <div className="w-11 h-11 rounded-2xl bg-[#f3fbf7] flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform">
                    {row.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[#1f2933] font-bold text-[15px]">
                        {row.label}
                      </span>
                      {row.key === "listings" && !isVerifiedSeller && (
                        <span className="text-[10px] font-bold bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full border border-orange-200">
                          去认证
                        </span>
                      )}
                      {badge > 0 && (
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                          {badge} {row.badgeLabel}
                        </span>
                      )}
                    </div>
                    <p className="text-[12px] text-[#5a6b73] truncate">
                      {row.desc}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {!txCounts.loading && count > 0 && (
                      <span className="text-[11px] font-bold text-[#2f9e6d] bg-[#f3fbf7] px-2 py-1 rounded-full">
                        {count} {row.countSuffix}
                      </span>
                    )}
                    <svg
                      className="w-4 h-4 text-[#5a6b73] group-hover:text-[#2f9e6d] transition-colors"
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
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Interaction Center */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-[rgba(31,41,51,0.04)]">
          <div className="px-6 py-4 border-b border-[rgba(31,41,51,0.04)] bg-gray-50/50">
            <h3 className="text-sm font-bold text-[#5a6b73]">互动中心</h3>
          </div>
          <div className="flex flex-col">
            <button
              onClick={() => router.push("/favorites")}
              className="flex items-center justify-between px-6 py-4 hover:bg-[#f3fbf7] transition-colors border-b border-[rgba(31,41,51,0.04)]"
            >
              <span className="text-[#1f2933] font-medium text-[15px]">
                我的收藏
              </span>
              <svg
                className="w-4 h-4 text-[#5a6b73]"
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
            </button>
            <button
              onClick={() => router.push("/profile/history")}
              className="flex items-center justify-between px-6 py-4 hover:bg-[#f3fbf7] transition-colors"
            >
              <span className="text-[#1f2933] font-medium text-[15px]">
                浏览记录
              </span>
              <svg
                className="w-4 h-4 text-[#5a6b73]"
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
            </button>
          </div>
        </div>

        {/* Platform & Settings Info */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-[rgba(31,41,51,0.04)]">
          <div className="px-6 py-4 border-b border-[rgba(31,41,51,0.04)] bg-gray-50/50">
            <h3 className="text-sm font-bold text-[#5a6b73]">设置与关于</h3>
          </div>
          <div className="flex flex-col">
            <button
              onClick={() => router.push("/profile/settings")}
              className="flex items-center justify-between px-6 py-4 hover:bg-[#f3fbf7] transition-colors border-b border-[rgba(31,41,51,0.04)] text-left"
            >
              <div>
                <span className="block font-medium text-[15px] text-[#1f2933] mb-0.5">
                  账号与隐私设置
                </span>
                <span className="block text-[11px] text-[#5a6b73]">
                  修改联系方式、邮箱与隐私开关
                </span>
              </div>
              <svg
                className="w-4 h-4 text-[#5a6b73]"
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
            </button>

            <button
              onClick={() => router.push("/about")}
              className="flex items-center justify-between px-6 py-4 hover:bg-[#f3fbf7] transition-colors border-b border-[rgba(31,41,51,0.04)] text-left"
            >
              <div>
                <span className="block font-medium text-[15px] text-[#1f2933] mb-0.5">
                  枫转故事
                </span>
                <span className="block text-[11px] text-[#5a6b73]">
                  了解我们的初衷
                </span>
              </div>
              <svg
                className="w-4 h-4 text-[#5a6b73]"
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
            </button>

            <div
              role="button"
              tabIndex={0}
              onClick={handleContactUs}
              onKeyDown={(e) => e.key === "Enter" && handleContactUs()}
              className="flex items-center justify-between px-6 py-4 hover:bg-[#f3fbf7] transition-colors border-b border-[rgba(31,41,51,0.04)] text-left w-full group cursor-pointer"
            >
              <div className="flex-1 min-w-0">
                <span className="block font-medium text-[15px] text-[#1f2933] mb-0.5">
                  联系我们
                </span>
                <span className="block text-[11px] text-[#5a6b73] truncate">
                  {SUPPORT_EMAIL}
                </span>
              </div>
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopySupportEmail();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.stopPropagation();
                    handleCopySupportEmail();
                  }
                }}
                className="text-[11px] font-bold text-[#2f9e6d] bg-[#f3fbf7] px-2.5 py-1 rounded-lg mr-2 shrink-0"
              >
                复制
              </span>
              <svg
                className="w-4 h-4 text-[#5a6b73] shrink-0"
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
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center justify-between px-6 py-4 hover:bg-[#f3fbf7] transition-colors w-full text-left"
            >
              <span className="font-medium text-[15px] text-rose-500">
                退出登录
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
