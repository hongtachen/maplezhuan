"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useBoughtItems } from "@/hooks/useOrderItems";
import { useAuthStore } from "@/store/useAuthStore";
import { useApp } from "@/components/app/AppContext";
import { findChatByItemAndUsers } from "@/lib/firebase/transactions";
import { submitReview } from "@/lib/firebase/reviews";
import UserAvatar from "@/components/ui/UserAvatar";

export default function BoughtPage() {
  const router = useRouter();
  const { items, setItems, loading } = useBoughtItems();
  const { user } = useAuthStore();
  const { showToast } = useApp();

  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState("");

  const reviewingItem = items.find((i) => i.id === reviewingId);

  const openReview = (id: string) => {
    setReviewingId(id);
    setReviewRating(0);
    setReviewText("");
  };

  const submitReviewHandler = async () => {
    if (reviewRating === 0 || !reviewingItem || !user) return;
    try {
      await submitReview({
        targetUserId: reviewingItem.sellerId!,
        reviewerId: user.uid,
        rating: reviewRating,
        comment: reviewText,
        orderId: reviewingItem.id,
        itemId: reviewingItem.itemId,
      });
      setItems((prev) =>
        prev.map((i) => (i.id === reviewingId ? { ...i, reviewed: true } : i)),
      );
      setReviewingId(null);
      showToast("评价已提交", "success");
    } catch (e) {
      console.error(e);
      showToast("提交失败", "error");
    }
  };

  const openChat = async (itemId: string, otherUserId: string) => {
    if (!user) return;
    const chatId = await findChatByItemAndUsers(itemId, user.uid, otherUserId);
    if (chatId) {
      router.push(`/messages/${chatId}`);
    } else {
      showToast("未找到相关对话", "info");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f3fbf7]">
      <header className="sticky top-0 z-40 bg-[#f3fbf7]/80 backdrop-blur-md px-4 py-3 flex items-center justify-center border-b border-[rgba(31,41,51,0.05)]">
        <div className="max-w-[500px] md:max-w-4xl lg:max-w-5xl w-full flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white hover:bg-gray-50 shadow-sm border border-gray-100 transition-colors"
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
          <span className="font-bold text-[#1f2933]">我买到的</span>
          <div className="w-10" />
        </div>
      </header>

      <div className="flex-1 max-w-[500px] md:max-w-4xl lg:max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 pb-24">
        {loading ? (
          <div className="flex justify-center py-24 text-[#5a6b73]">
            加载中...
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-5xl mb-4">🛍</div>
            <p className="text-[#1f2933] font-bold text-lg mb-1">
              还没有购买记录
            </p>
            <p className="text-[#5a6b73] text-sm">
              淘到心仪物品后，记录会出现在这里。
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-[20px] overflow-hidden shadow-sm border border-[rgba(31,41,51,0.04)]"
              >
                <div className="flex items-center gap-4 p-4">
                  <div
                    className="w-16 h-16 rounded-[14px] flex items-center justify-center text-3xl shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${item.gradientFrom}, ${item.gradientTo})`,
                    }}
                  >
                    {item.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#1f2933] text-[15px] truncate">
                      {item.title}
                    </p>
                    <p className="text-[#2f9e6d] font-bold text-sm mt-0.5">
                      ${item.price} CAD
                    </p>
                    <p className="text-[#5a6b73] text-[12px] mt-0.5">
                      购于 {item.boughtAt}
                    </p>
                  </div>
                  {item.reviewed ? (
                    <span className="shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-600">
                      已评价
                    </span>
                  ) : (
                    <span className="shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#f3fbf7] border border-[#2f9e6d]/20 text-[#2f9e6d]">
                      已完成
                    </span>
                  )}
                </div>

                <div className="border-t border-[rgba(31,41,51,0.04)] px-4 py-3 flex items-center justify-between bg-gray-50/40 gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <UserAvatar
                      src={item.sellerAvatar}
                      name={item.seller}
                      size="sm"
                    />
                    <span className="text-[13px] text-[#5a6b73] truncate">
                      卖家：
                      <span className="font-medium text-[#1f2933]">
                        {item.seller}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => openChat(item.itemId, item.sellerId!)}
                      className="text-[12px] font-bold text-[#2f9e6d] bg-[#f3fbf7] border border-[#2f9e6d]/20 px-3 py-1.5 rounded-full hover:bg-[#e8f5ee] transition-colors"
                    >
                      联系
                    </button>
                    {!item.reviewed && (
                      <button
                        onClick={() => openReview(item.id)}
                        className="text-[12px] font-bold text-[#1f2933] bg-white border border-[rgba(31,41,51,0.12)] px-3 py-1.5 rounded-full hover:bg-gray-50 transition-colors"
                      >
                        ⭐ 评价
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {reviewingId && reviewingItem && (
        <div className="fixed inset-0 z-[200] flex flex-col justify-end">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setReviewingId(null)}
          />
          <div className="relative bg-white rounded-t-[28px] w-full max-w-[500px] mx-auto shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-gray-200" />
            </div>
            <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(31,41,51,0.05)]">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-[10px] flex items-center justify-center text-xl shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${reviewingItem.gradientFrom}, ${reviewingItem.gradientTo})`,
                  }}
                >
                  {reviewingItem.emoji}
                </div>
                <div>
                  <span className="block font-bold text-[#1f2933] text-[15px] truncate max-w-[200px]">
                    {reviewingItem.title}
                  </span>
                  <span className="block text-[12px] text-[#5a6b73]">
                    评价卖家 {reviewingItem.seller}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setReviewingId(null)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors shrink-0"
              >
                <svg
                  className="w-4 h-4 text-[#5a6b73]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="px-6 py-6 space-y-6">
              <div className="flex flex-col items-center justify-center">
                <p className="text-[13px] font-bold text-[#5a6b73] mb-3">
                  为这次交易打分
                </p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className="w-12 h-12 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
                    >
                      <svg
                        className={`w-10 h-10 ${star <= reviewRating ? "text-amber-400 drop-shadow-sm" : "text-gray-200"}`}
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-bold text-[#5a6b73] mb-1.5 ml-1">
                  详细评价 (选填)
                </label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows={3}
                  className="w-full bg-[#f7f9fc] border border-transparent rounded-[14px] px-4 py-3 text-[15px] outline-none focus:bg-white focus:border-[#2f9e6d] transition-all resize-none"
                  placeholder="说说卖家态度如何、东西怎么样..."
                />
              </div>
            </div>

            <div className="px-6 pb-10">
              <button
                onClick={submitReviewHandler}
                disabled={reviewRating === 0}
                className="w-full bg-[#2f9e6d] hover:bg-[#267a56] disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold text-[16px] py-4 rounded-[16px] transition-all active:scale-[0.98]"
              >
                提交评价
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
