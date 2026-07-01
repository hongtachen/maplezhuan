"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useMemo } from "react";

import { useUser } from "@/hooks/useUser";
import ListingCard from "@/components/app/ListingCard";
import { sellerRatingFromProfile } from "@/lib/sellerRating";

export default function SellerProfilePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [activeTab, setActiveTab] = useState<"listings" | "reviews">(
    "listings",
  );
  const { user, reviews, items, loading } = useUser(id);

  const listingCards = useMemo(() => {
    if (!user) return [];
    const sellerRating = sellerRatingFromProfile({
      rating: user.rating,
      reviewCount: user.reviewCount,
    });
    return items.map((listing) => ({
      ...listing,
      rating: sellerRating.rating,
      reviewCount: sellerRating.reviewCount,
    }));
  }, [items, user]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f3fbf7]">
        <header className="sticky top-0 z-40 bg-[#f3fbf7]/80 backdrop-blur-md px-4 py-3 flex items-center justify-center border-b border-[rgba(31,41,51,0.05)]">
          <div className="max-w-[600px] md:max-w-3xl lg:max-w-4xl w-full flex items-center justify-between">
            <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
            <div className="w-20 h-5 bg-gray-200 animate-pulse rounded"></div>
            <div className="w-10"></div>
          </div>
        </header>
        <div className="flex-1 max-w-[600px] md:max-w-3xl lg:max-w-4xl w-full mx-auto px-4 py-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-[rgba(31,41,51,0.04)] mb-4 flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-gray-200 animate-pulse mb-3"></div>
            <div className="w-24 h-6 bg-gray-200 animate-pulse rounded mb-2"></div>
            <div className="w-20 h-4 bg-gray-200 animate-pulse rounded mb-4"></div>
            <div className="w-48 h-16 bg-gray-100 animate-pulse rounded-2xl"></div>
          </div>
          <div className="flex bg-gray-100 p-1 rounded-2xl mb-4 h-[44px] animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-3xl p-5 border border-[rgba(31,41,51,0.04)] shadow-sm"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
                  <div>
                    <div className="w-16 h-4 bg-gray-200 animate-pulse rounded mb-1"></div>
                    <div className="w-12 h-3 bg-gray-100 animate-pulse rounded"></div>
                  </div>
                </div>
                <div className="w-full h-4 bg-gray-100 animate-pulse rounded mb-2 ml-[52px]"></div>
                <div className="w-2/3 h-4 bg-gray-100 animate-pulse rounded ml-[52px]"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f3fbf7]">
        <p className="text-[#5a6b73] mb-4">
          找不到该用户，或用户资料尚未加载完成
        </p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-[#2f9e6d] text-white rounded-xl"
        >
          返回上一页
        </button>
      </div>
    );
  }

  const sellerScore =
    user.reviewCount > 0 && user.rating != null ? user.rating : null;

  return (
    <div className="flex flex-col min-h-screen bg-[#f3fbf7]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#f3fbf7]/80 backdrop-blur-md px-4 py-3 flex items-center justify-center border-b border-[rgba(31,41,51,0.05)]">
        <div className="max-w-[600px] md:max-w-3xl lg:max-w-4xl w-full flex items-center justify-between">
          <button
            onClick={() => router.back()}
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
          <span className="font-bold text-[#1f2933]">卖家主页</span>
          <div className="w-10"></div>
        </div>
      </header>

      <div className="flex-1 max-w-[600px] md:max-w-3xl lg:max-w-4xl w-full mx-auto px-4 py-6">
        {/* Seller Info Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-[rgba(31,41,51,0.04)] mb-4 flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-[#f3fbf7] border border-[#2f9e6d]/10 flex items-center justify-center text-[#2f9e6d] text-3xl font-bold mb-3 shadow-inner">
            {user.nickname.charAt(0)}
          </div>
          <h1 className="text-xl font-bold text-[#1f2933] mb-1">
            {user.nickname}
          </h1>
          <div className="flex items-center gap-2 mb-3">
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
          </div>

          {/* Big Rating Display */}
          <div className="flex items-center gap-3 bg-gray-50 px-5 py-3 rounded-2xl border border-[rgba(31,41,51,0.03)]">
            {sellerScore != null ? (
              <>
                <div className="text-center">
                  <div className="text-2xl font-black text-[#1f2933]">
                    {sellerScore.toFixed(1)}
                  </div>
                  <div className="text-[10px] text-[#5a6b73] font-bold">
                    综合评分
                  </div>
                </div>
                <div className="w-px h-8 bg-gray-200 mx-1" />
                <div className="flex flex-col gap-0.5">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${i <= Math.round(sellerScore) ? "text-amber-400" : "text-gray-300"}`}
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                  <div className="text-[11px] text-[#5a6b73]">
                    基于 {user.reviewCount} 条评价
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="text-center px-2">
                  <div className="text-xl font-bold text-[#5a6b73]">
                    暂无评分
                  </div>
                  <div className="text-[10px] text-[#5a6b73] font-bold mt-1">
                    期待您的第一条评价
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-2xl mb-4">
          <button
            onClick={() => setActiveTab("listings")}
            className={`flex-1 py-2.5 text-[14px] font-bold rounded-[14px] transition-all ${
              activeTab === "listings"
                ? "bg-white text-[#2f9e6d] shadow-sm"
                : "text-[#5a6b73] hover:text-[#1f2933]"
            }`}
          >
            Ta 发布的 ({items?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`flex-1 py-2.5 text-[14px] font-bold rounded-[14px] transition-all ${
              activeTab === "reviews"
                ? "bg-white text-[#2f9e6d] shadow-sm"
                : "text-[#5a6b73] hover:text-[#1f2933]"
            }`}
          >
            Ta 的评价 ({reviews.length})
          </button>
        </div>

        {/* Content */}
        {activeTab === "listings" ? (
          listingCards.length > 0 ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-x-3 gap-y-6 md:gap-x-6 md:gap-y-8">
              {listingCards.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-3xl border border-[rgba(31,41,51,0.04)]">
              <div className="text-5xl mb-4 opacity-50">🛍</div>
              <p className="text-[#5a6b73] text-sm">
                Ta 还没有发布任何在售商品
              </p>
            </div>
          )
        ) : reviews && reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-3xl p-5 border border-[rgba(31,41,51,0.04)] shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-[#5a6b73] font-bold shrink-0">
                      {review.reviewerAvatar}
                    </div>
                    <div>
                      <span className="block text-[14px] font-bold text-[#1f2933]">
                        {review.reviewerMaskedName}
                      </span>
                      <span className="block text-[11px] text-[#5a6b73]">
                        {review.timeAgo}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <svg
                        key={i}
                        className={`w-3.5 h-3.5 ${i <= review.rating ? "text-amber-400" : "text-gray-200"}`}
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-[14px] text-[#1f2933] leading-relaxed pl-[52px]">
                  {review.comment}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-3xl border border-[rgba(31,41,51,0.04)]">
            <div className="text-5xl mb-4 opacity-50">💬</div>
            <p className="text-[#5a6b73] text-sm">Ta 还没有收到任何评价</p>
          </div>
        )}
      </div>
    </div>
  );
}
