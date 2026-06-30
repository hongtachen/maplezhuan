"use client";

import { useRouter } from "next/navigation";

import { useHistory } from "@/hooks/useHistory";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { PageLoading } from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
import { btnPrimary } from "@/lib/feedback/styles";

export default function HistoryPage() {
  const router = useRouter();
  const { history, setHistory, loading } = useHistory();

  const groups = ["今天", "昨天", "更早"] as const;

  const removeItem = async (id: string) => {
    setHistory((prev) => prev.filter((h) => h.id !== id));
    await deleteDoc(doc(db, "history", id)).catch(console.error);
  };

  const clearGroup = async (group: string) => {
    const itemsToDelete = history.filter((h) => h.group === group);
    setHistory((prev) => prev.filter((h) => h.group !== group));
    await Promise.all(
      itemsToDelete.map((item) => deleteDoc(doc(db, "history", item.id))),
    ).catch(console.error);
  };

  const clearAll = async () => {
    const itemsToDelete = [...history];
    setHistory([]);
    await Promise.all(
      itemsToDelete.map((item) => deleteDoc(doc(db, "history", item.id))),
    ).catch(console.error);
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
          <span className="font-bold text-[#1f2933]">最近浏览</span>
          <button
            onClick={clearAll}
            className="text-[13px] font-medium text-rose-500 hover:text-rose-600 transition-colors"
          >
            清空
          </button>
        </div>
      </header>

      <div className="flex-1 max-w-[500px] md:max-w-4xl lg:max-w-5xl w-full mx-auto px-4 sm:px-6 py-4">
        {loading ? (
          <PageLoading />
        ) : history.length === 0 ? (
          <EmptyState
            emoji="🔍"
            title="暂无浏览记录"
            description="去逛逛，看看有什么好东西"
            action={
              <button
                onClick={() => router.push("/")}
                className={`px-6 ${btnPrimary}`}
              >
                去浏览
              </button>
            }
          />
        ) : (
          <div className="flex flex-col gap-6">
            {groups.map((group) => {
              const items = history.filter((h) => h.group === group);
              if (items.length === 0) return null;
              return (
                <div key={group}>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-[13px] font-bold text-[#5a6b73]">
                      {group}
                    </h2>
                    <button
                      onClick={() => clearGroup(group)}
                      className="text-[12px] text-[#5a6b73] hover:text-rose-500 transition-colors"
                    >
                      清除{group}
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white rounded-[18px] flex items-center gap-3 p-3 shadow-sm border border-[rgba(31,41,51,0.04)] group"
                      >
                        <div
                          className="w-14 h-14 rounded-[12px] flex items-center justify-center text-2xl shrink-0"
                          style={{
                            background: `linear-gradient(135deg, ${item.gradientFrom}, ${item.gradientTo})`,
                          }}
                        >
                          {item.emoji}
                        </div>
                        <div
                          className="flex-1 min-w-0 cursor-pointer"
                          onClick={() =>
                            router.push(
                              item.itemType === "sublet"
                                ? `/sublet/${item.itemId}`
                                : `/listing/${item.itemId}`,
                            )
                          }
                        >
                          <p className="font-medium text-[#1f2933] text-[14px] truncate">
                            {item.title}
                          </p>
                          <p className="text-[#2f9e6d] font-bold text-[13px] mt-0.5">
                            ${item.price} CAD{item.priceUnit ?? ""}
                          </p>
                          <p className="text-[#5a6b73] text-[11px] mt-0.5">
                            {item.viewedAt}
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="w-7 h-7 rounded-full flex items-center justify-center text-gray-300 hover:text-rose-400 hover:bg-rose-50 transition-colors shrink-0"
                          aria-label="删除记录"
                        >
                          <svg
                            className="w-4 h-4"
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
                    ))}
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
