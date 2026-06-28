"use client";

import { useRouter } from "next/navigation";

import { useSoldItems } from "@/hooks/useOrderItems";
import { useAuthStore } from "@/store/useAuthStore";
import { useApp } from "@/components/app/AppContext";
import { findChatByItemAndUsers } from "@/lib/firebase/transactions";
import UserAvatar from "@/components/ui/UserAvatar";
import { PageLoading } from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";

const statusStyles = {
  已完成: { bg: "bg-[#f3fbf7] border-[#2f9e6d]/20", text: "text-[#2f9e6d]" },
  已评价: { bg: "bg-blue-50 border-blue-200", text: "text-blue-600" },
  进行中: { bg: "bg-gray-50 border-gray-200", text: "text-gray-600" },
};

export default function SoldPage() {
  const router = useRouter();
  const { items, loading } = useSoldItems();
  const { user } = useAuthStore();
  const { showToast } = useApp();

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
          <span className="font-bold text-[#1f2933]">我卖出的</span>
          <div className="w-10" />
        </div>
      </header>

      <div className="flex-1 max-w-[500px] md:max-w-4xl lg:max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 pb-24">
        {loading ? (
          <PageLoading />
        ) : items.length === 0 ? (
          <EmptyState
            emoji="🤝"
            title="还没有卖出记录"
            description="发布的商品被买走后，记录会出现在这里"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {items.map((item) => {
              const st =
                statusStyles[item.status as NonNullable<typeof item.status>];
              return (
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
                        成交于 {item.soldAt}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full border ${st.bg} ${st.text}`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <div className="border-t border-[rgba(31,41,51,0.04)] px-4 py-3 flex items-center justify-between bg-gray-50/40 gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <UserAvatar
                        src={item.buyerAvatar}
                        name={item.buyer}
                        size="sm"
                      />
                      <span className="text-[13px] text-[#5a6b73] truncate">
                        买家：
                        <span className="font-medium text-[#1f2933]">
                          {item.buyer}
                        </span>
                      </span>
                    </div>
                    <button
                      onClick={() => openChat(item.itemId, item.buyerId!)}
                      className="text-[12px] font-bold text-[#2f9e6d] bg-[#f3fbf7] border border-[#2f9e6d]/20 px-3 py-1.5 rounded-full hover:bg-[#e8f5ee] transition-colors"
                    >
                      站内联系
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
