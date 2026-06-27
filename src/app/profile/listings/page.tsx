"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useMyListings, ListingStatus, MyListing } from "@/hooks/useMyListings";
import { updateDocument, deleteDocument } from "@/lib/firebase/firestore";
import { useApp } from "@/components/app/AppContext";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { getUserProfile, UserProfile } from "@/lib/firebase/users";
import { useAuthStore } from "@/store/useAuthStore";
import {
  changeListingStatus,
  buyerFromProfile,
} from "@/lib/firebase/transactions";
import FadeModal from "@/components/motion/FadeModal";
import MotionPopover from "@/components/motion/MotionPopover";

const STATUS_TABS: ListingStatus[] = ["在售", "已预留", "已售"];

const statusStyle: Record<
  ListingStatus,
  { dot: string; text: string; bg: string }
> = {
  在售: {
    dot: "bg-[#2f9e6d]",
    text: "text-[#2f9e6d]",
    bg: "bg-[#f3fbf7] border-[#2f9e6d]/20",
  },
  已预留: {
    dot: "bg-orange-400",
    text: "text-orange-500",
    bg: "bg-orange-50 border-orange-200",
  },
  已售: {
    dot: "bg-gray-400",
    text: "text-gray-500",
    bg: "bg-gray-100 border-gray-200",
  },
};

const ALL_STATUSES: ListingStatus[] = ["在售", "已预留", "已售"];

export default function MyListingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ListingStatus>("在售");
  const { listings, setListings, loading } = useMyListings();
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const { showToast } = useApp();
  const { user } = useAuthStore();

  const [buyerModal, setBuyerModal] = useState<{
    id: string;
    status: ListingStatus;
    buyers: UserProfile[];
  } | null>(null);
  const [loadingBuyers, setLoadingBuyers] = useState(false);
  const [deleteModal, setDeleteModal] = useState<string | null>(null);

  // Edit sheet state (removed old modal state, now just routing)
  const openEdit = (item: MyListing) => {
    setMenuOpen(null);
    if (item.emoji === "🏠") {
      router.push(`/publish/sublet/edit/${item.id}`);
    } else {
      router.push(`/publish/items/edit/${item.id}`);
    }
  };

  const filtered = listings.filter((l) => l.status === activeTab);

  const initiateChangeStatus = async (id: string, status: ListingStatus) => {
    setMenuOpen(null);
    if (status === "在售") {
      await commitChangeStatus(id, status, null);
      return;
    }

    // For "已预留" or "已售", fetch potential buyers
    setLoadingBuyers(true);
    setBuyerModal({ id, status, buyers: [] });
    try {
      const chatsRef = collection(db, "chats");
      const q = query(chatsRef, where("itemId", "==", id));
      const snap = await getDocs(q);

      const uniqueUserIds = new Set<string>();
      snap.forEach((d) => {
        const data = d.data();
        data.participants.forEach((p: string) => {
          if (p !== user?.uid) uniqueUserIds.add(p);
        });
      });

      const buyersData = await Promise.all(
        Array.from(uniqueUserIds).map((uid) => getUserProfile(uid)),
      );

      setBuyerModal({ id, status, buyers: buyersData.filter((b) => !!b) });
    } catch (e) {
      console.error(e);
      showToast("获取买家列表失败", "error");
      setBuyerModal(null);
    } finally {
      setLoadingBuyers(false);
    }
  };

  const commitChangeStatus = async (
    id: string,
    status: ListingStatus,
    buyerId: string | null,
  ) => {
    try {
      const item = listings.find((l) => l.id === id);
      if (!item || !user) return;

      const itemType = item.emoji === "🏠" ? "sublets" : "items";
      const type: "item" | "sublet" = item.emoji === "🏠" ? "sublet" : "item";
      const buyer = buyerId
        ? buyerModal?.buyers.find((b) => b.uid === buyerId)
        : null;

      if (status === "在售") {
        const newStatus = type === "sublet" ? "招租中" : "在售";
        await updateDocument(itemType, id, { status: newStatus });
      } else {
        await changeListingStatus({
          itemId: id,
          itemType: type,
          uiStatus: status,
          buyer: buyer ? buyerFromProfile(buyer) : null,
          seller: {
            uid: user.uid,
            nickname: user.displayName || user.email?.split("@")[0] || "卖家",
            avatar: user.photoURL || "S",
          },
          listing: {
            id,
            title: item.title,
            price: item.price,
            emoji: item.emoji,
            gradientFrom: item.gradientFrom,
            gradientTo: item.gradientTo,
          },
        });
      }

      setListings((prev) =>
        prev.map((l) => (l.id === id ? { ...l, status } : l)),
      );
      setBuyerModal(null);
      showToast(`状态已更新为 ${status}`, "success");
    } catch {
      showToast("更新失败", "error");
    }
  };

  const confirmDelete = async () => {
    if (!deleteModal) return;
    try {
      const item = listings.find((l) => l.id === deleteModal);
      if (!item) return;
      const collectionName = item.emoji === "🏠" ? "sublets" : "items";

      await deleteDocument(collectionName, deleteModal);
      setListings((prev) => prev.filter((l) => l.id !== deleteModal));
      setMenuOpen(null);
      setDeleteModal(null);
      showToast("商品已删除", "success");
    } catch {
      showToast("删除失败", "error");
    }
  };

  const counts = STATUS_TABS.reduce(
    (acc, s) => {
      acc[s] = listings.filter((l) => l.status === s).length;
      return acc;
    },
    {} as Record<ListingStatus, number>,
  );

  return (
    <>
      <div
        className="flex flex-col min-h-screen bg-[#f3fbf7]"
        onClick={() => setMenuOpen(null)}
      >
        {/* Header */}
        <header className="sticky top-0 z-40 bg-[#f3fbf7]/90 backdrop-blur-md px-4 py-3 flex items-center justify-center border-b border-[rgba(31,41,51,0.05)]">
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
            <span className="font-bold text-[#1f2933]">我发布的</span>
            <button
              onClick={() => router.push("/publish")}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-[#2f9e6d] hover:bg-[#267a56] shadow-sm transition-colors"
            >
              <svg
                className="w-5 h-5 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>
          </div>
        </header>

        {/* Tab bar */}
        <div className="max-w-[500px] md:max-w-4xl lg:max-w-5xl w-full mx-auto px-4 sm:px-6 pt-4">
          <div className="flex bg-white rounded-[16px] p-1 shadow-sm border border-[rgba(31,41,51,0.04)]">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2.5 rounded-[12px] text-[13px] font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === tab
                    ? "bg-[#f7f9fc] text-[#1f2933] shadow-sm"
                    : "text-[#5a6b73] hover:text-[#1f2933]"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${activeTab === tab ? statusStyle[tab].dot : "bg-gray-300"}`}
                />
                {tab}
                <span
                  className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === tab ? "bg-[#1f2933] text-white" : "bg-gray-100 text-[#5a6b73]"}`}
                >
                  {counts[tab]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Listings */}
        <div className="flex-1 max-w-[500px] md:max-w-4xl lg:max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 pb-32">
          {loading ? (
            <div className="flex justify-center py-24 text-[#5a6b73]">
              加载中...
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center col-span-full">
              <div className="text-5xl mb-4">
                {activeTab === "在售"
                  ? "📦"
                  : activeTab === "已预留"
                    ? "⏳"
                    : "📁"}
              </div>
              <p className="text-[#1f2933] font-bold text-lg mb-1">
                暂无{activeTab}商品
              </p>
              {activeTab === "在售" && (
                <button
                  onClick={() => router.push("/publish")}
                  className="mt-4 bg-[#2f9e6d] text-white font-bold text-[14px] px-6 py-3 rounded-[14px] hover:bg-[#267a56] transition-colors"
                >
                  ＋ 发布第一件
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filtered.map((item) => {
                const st = statusStyle[item.status];
                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-[20px] shadow-sm border border-[rgba(31,41,51,0.04)]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Top row */}
                    <div className="flex items-center gap-3 p-4 pb-3">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-16 h-16 rounded-[14px] object-cover shrink-0 border border-[rgba(31,41,51,0.08)]"
                        />
                      ) : (
                        <div
                          className="w-16 h-16 rounded-[14px] flex items-center justify-center text-3xl shrink-0"
                          style={{
                            background: `linear-gradient(135deg, ${item.gradientFrom}, ${item.gradientTo})`,
                          }}
                        >
                          {item.emoji}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[#1f2933] text-[15px] truncate">
                          {item.title}
                        </p>
                        <p className="text-[#2f9e6d] font-bold text-sm mt-0.5">
                          ${item.price} CAD
                        </p>
                        <p className="text-[#5a6b73] text-[12px] mt-0.5">
                          发布于 {item.postedAt}
                        </p>
                      </div>
                      {/* Kebab menu */}
                      <div className="relative shrink-0">
                        <button
                          onClick={() =>
                            setMenuOpen(menuOpen === item.id ? null : item.id)
                          }
                          className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                        >
                          <svg
                            className="w-5 h-5 text-[#5a6b73]"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <circle cx="12" cy="5" r="1.5" />
                            <circle cx="12" cy="12" r="1.5" />
                            <circle cx="12" cy="19" r="1.5" />
                          </svg>
                        </button>
                        <MotionPopover
                          open={menuOpen === item.id}
                          onClose={() => setMenuOpen(null)}
                        >
                          <p className="text-[11px] font-bold text-[#5a6b73] px-4 pt-3 pb-1">
                            改变状态
                          </p>
                          {ALL_STATUSES.filter((s) => s !== item.status).map(
                            (s) => (
                              <button
                                key={s}
                                onClick={() => initiateChangeStatus(item.id, s)}
                                className="w-full text-left px-4 py-2.5 text-[13px] font-medium text-[#1f2933] hover:bg-[#f3fbf7] transition-colors flex items-center gap-2"
                              >
                                <span
                                  className={`w-2 h-2 rounded-full ${statusStyle[s].dot}`}
                                />
                                标记为{s}
                              </button>
                            ),
                          )}
                        </MotionPopover>
                      </div>
                    </div>

                    {/* Stats row */}
                    <div className="border-t border-[rgba(31,41,51,0.04)] px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3 text-[12px] text-[#5a6b73]">
                        <span className="flex items-center gap-1">
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                          {item.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg
                            className="w-3.5 h-3.5 text-rose-400"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                          </svg>
                          {item.favorites}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />
                          </svg>
                          {item.inquiries}
                        </span>
                      </div>
                      <span
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${st.bg} ${st.text}`}
                      >
                        {item.status}
                      </span>
                    </div>
                    {/* Buyer info row */}
                    {(item.status === "已售" || item.status === "已预留") &&
                      item.buyerName && (
                        <div className="border-t border-[rgba(31,41,51,0.04)] px-4 py-3 flex items-center justify-between bg-gray-50/20">
                          <div className="flex items-center gap-2">
                            {item.buyerAvatar?.startsWith("http") ? (
                              <img
                                src={item.buyerAvatar}
                                alt={item.buyerName}
                                className="w-6 h-6 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-600 text-[10px] font-bold">
                                {item.buyerAvatar?.slice(0, 1) ||
                                  item.buyerName?.slice(0, 1) ||
                                  "U"}
                              </div>
                            )}
                            <span className="text-[12px] text-[#5a6b73]">
                              {item.status === "已预留" ? "预留给" : "售出给"}：
                              <span className="font-medium text-[#1f2933]">
                                {item.buyerName}
                              </span>
                            </span>
                          </div>
                        </div>
                      )}
                    {/* Action buttons row */}
                    <div className="border-t border-[rgba(31,41,51,0.04)] px-4 py-3 flex items-center gap-2 bg-gray-50/40">
                      <button
                        onClick={() => openEdit(item)}
                        className="flex-1 flex items-center justify-center gap-1.5 text-[13px] font-bold text-[#1f2933] bg-white border border-[rgba(31,41,51,0.10)] py-2.5 rounded-[12px] hover:bg-[#f3fbf7] hover:border-[#2f9e6d]/30 hover:text-[#2f9e6d] transition-all"
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
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        编辑
                      </button>
                      <button
                        onClick={() => setDeleteModal(item.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 text-[13px] font-bold text-rose-500 bg-white border border-rose-100 py-2.5 rounded-[12px] hover:bg-rose-50 hover:border-rose-200 transition-all"
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
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        删除
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <FadeModal
        open={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        panelClassName="w-full max-w-[320px] bg-white rounded-[24px] shadow-2xl overflow-hidden p-6 text-center"
      >
        <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-7 h-7 text-rose-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-[#1f2933] mb-2">
          确定要删除吗？
        </h2>
        <p className="text-[13px] text-[#5a6b73] mb-6">
          删除后将无法恢复，相关聊天记录仍会保留。
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setDeleteModal(null)}
            className="flex-1 py-3 text-[14px] font-bold text-[#5a6b73] bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
          >
            取消
          </button>
          <button
            onClick={confirmDelete}
            className="flex-1 py-3 text-[14px] font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-xl transition-colors"
          >
            删除
          </button>
        </div>
      </FadeModal>

      <FadeModal
        open={!!buyerModal}
        onClose={() => setBuyerModal(null)}
        panelClassName="w-full max-w-md bg-white rounded-[24px] shadow-2xl overflow-hidden"
      >
        {buyerModal && (
          <div className="p-6">
            <h2 className="text-xl font-bold text-[#1f2933] mb-1">
              选择交易对象
            </h2>
            <p className="text-[13px] text-[#5a6b73] mb-6">
              为了保证评价真实性，请选择与您成交的买家
            </p>

            {loadingBuyers ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-4 border-[#2f9e6d] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : buyerModal.buyers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-[#5a6b73] text-[14px] mb-4">
                  没有找到近期与您私聊过的买家
                </p>
                <button
                  onClick={() =>
                    commitChangeStatus(buyerModal.id, buyerModal.status, null)
                  }
                  className="px-6 py-2 bg-[#f3fbf7] text-[#2f9e6d] rounded-xl font-bold hover:bg-[#2f9e6d]/10 transition-colors"
                >
                  跳过并标记为{buyerModal.status}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto">
                {buyerModal.buyers.map((b) => (
                  <button
                    key={b.uid}
                    onClick={() =>
                      commitChangeStatus(
                        buyerModal.id,
                        buyerModal.status,
                        b.uid,
                      )
                    }
                    className="flex items-center gap-3 p-3 rounded-xl border border-[rgba(31,41,51,0.08)] hover:bg-[#f3fbf7] hover:border-[#2f9e6d]/30 transition-all text-left"
                  >
                    <img
                      src={
                        b.avatarUrl ||
                        `https://api.dicebear.com/7.x/adventurer/svg?seed=${b.uid}`
                      }
                      alt="avatar"
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#1f2933] truncate">
                        {b.nickname}
                      </p>
                      <p className="text-[11px] text-[#5a6b73]">
                        选择该用户完成交易
                      </p>
                    </div>
                  </button>
                ))}

                <button
                  onClick={() =>
                    commitChangeStatus(buyerModal.id, buyerModal.status, null)
                  }
                  className="mt-2 py-3 text-[13px] font-bold text-[#5a6b73] hover:text-[#1f2933] hover:bg-gray-50 rounded-xl transition-colors"
                >
                  未在列表中？跳过选择直接标记
                </button>
              </div>
            )}
          </div>
        )}
      </FadeModal>
    </>
  );
}
