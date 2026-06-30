"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense, useState } from "react";

import {
  useSellerHistory,
  SellerHistoryListing,
} from "@/hooks/useSellerHistory";
import { deleteDocument } from "@/lib/firebase/firestore";
import { useApp } from "@/components/app/AppContext";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { getUserProfile, UserProfile } from "@/lib/firebase/users";
import { useAuthStore } from "@/store/useAuthStore";
import {
  changeListingStatus,
  buyerFromProfile,
  findChatByItemAndUsers,
  relistListing,
} from "@/lib/firebase/transactions";
import {
  LISTING_UI_STATUSES,
  ListingUiStatus,
  TAB_TO_UI_STATUS,
  UI_STATUS_TO_TAB,
  parseHistoryTab,
  getBuyerActionLabel,
  getListingKindLabel,
  getOrderReviewLabel,
  getStatusBadgeLabel,
  getUiStatusTabLabel,
} from "@/lib/listingStatus";
import MotionPopover from "@/components/motion/MotionPopover";
import ProductThumbnail from "@/components/ui/ProductThumbnail";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import AppModal, { ModalBody, ModalHeader } from "@/components/ui/AppModal";
import { PageLoading } from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
import UserAvatar from "@/components/ui/UserAvatar";
import { btnPrimary } from "@/lib/feedback/styles";

const STATUS_TABS = LISTING_UI_STATUSES;

const statusStyle: Record<
  ListingUiStatus,
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

const reviewStatusStyle = {
  reviewed: {
    bg: "bg-blue-50 border-blue-200",
    text: "text-blue-600",
  },
  pending: {
    bg: "bg-[#f3fbf7] border-[#2f9e6d]/20",
    text: "text-[#2f9e6d]",
  },
};

const ALL_STATUSES = LISTING_UI_STATUSES;

function emptyStateTitle(tab: ListingUiStatus): string {
  if (tab === "在售") return "暂无在售的发布";
  if (tab === "已预留") return "暂无已预留的发布";
  return "暂无已成交记录";
}

export default function MyListingsPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <MyListingsPageContent />
    </Suspense>
  );
}

function MyListingsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = TAB_TO_UI_STATUS[parseHistoryTab(searchParams.get("tab"))];
  const { listings, setListings, loading, refetch } = useSellerHistory();
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const { showToast } = useApp();
  const { user } = useAuthStore();

  const [buyerModal, setBuyerModal] = useState<{
    id: string;
    status: ListingUiStatus;
    buyers: UserProfile[];
  } | null>(null);
  const [loadingBuyers, setLoadingBuyers] = useState(false);
  const [deleteModal, setDeleteModal] = useState<string | null>(null);

  const selectTab = (status: ListingUiStatus) => {
    router.replace(`/profile/listings?tab=${UI_STATUS_TO_TAB[status]}`, {
      scroll: false,
    });
  };

  const openEdit = (item: SellerHistoryListing) => {
    setMenuOpen(null);
    if (item.listingType === "sublet") {
      router.push(`/publish/sublet/edit/${item.id}`);
    } else {
      router.push(`/publish/items/edit/${item.id}`);
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

  const filtered = listings.filter((l) => l.status === activeTab);
  const isCompletedTab = activeTab === "已售";

  const initiateChangeStatus = async (id: string, status: ListingUiStatus) => {
    setMenuOpen(null);
    if (status === "在售") {
      await commitChangeStatus(id, status, null);
      return;
    }

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
      showToast("获取对方列表失败", "error");
      setBuyerModal(null);
    } finally {
      setLoadingBuyers(false);
    }
  };

  const commitChangeStatus = async (
    id: string,
    status: ListingUiStatus,
    buyerId: string | null,
  ) => {
    try {
      const item = listings.find((l) => l.id === id);
      if (!item || !user) return;

      const itemType = item.listingType;
      const buyer = buyerId
        ? buyerModal?.buyers.find((b) => b.uid === buyerId)
        : null;

      if (status === "在售") {
        const previousBuyerId = item.buyerId;
        const previousStatus = item.status;
        await relistListing({
          itemId: id,
          itemType,
          previousBuyerId,
          previousStatus,
          sellerId: user.uid,
          itemTitle: item.title,
        });
        await refetch();
      } else {
        await changeListingStatus({
          itemId: id,
          itemType,
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
        await refetch();
      }

      setBuyerModal(null);
      showToast(`状态已更新为 ${getUiStatusTabLabel(status)}`, "success");
    } catch {
      showToast("更新失败", "error");
    }
  };

  const confirmDelete = async () => {
    if (!deleteModal) return;
    try {
      const item = listings.find((l) => l.id === deleteModal);
      if (!item) return;
      const collectionName =
        item.listingType === "sublet" ? "sublets" : "items";

      await deleteDocument(collectionName, deleteModal);
      setListings((prev) => prev.filter((l) => l.id !== deleteModal));
      setMenuOpen(null);
      setDeleteModal(null);
      showToast("发布已删除", "success");
    } catch {
      showToast("删除失败", "error");
    }
  };

  const counts = STATUS_TABS.reduce(
    (acc, s) => {
      acc[s] = listings.filter((l) => l.status === s).length;
      return acc;
    },
    {} as Record<ListingUiStatus, number>,
  );

  return (
    <>
      <div
        className="flex flex-col min-h-screen bg-[#f3fbf7]"
        onClick={() => setMenuOpen(null)}
      >
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
            <span className="font-bold text-[#1f2933]">历史记录</span>
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

        <div className="max-w-[500px] md:max-w-4xl lg:max-w-5xl w-full mx-auto px-4 sm:px-6 pt-4">
          <div className="flex bg-white rounded-[16px] p-1 shadow-sm border border-[rgba(31,41,51,0.04)]">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => selectTab(tab)}
                className={`flex-1 py-2.5 rounded-[12px] text-[13px] font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === tab
                    ? "bg-[#f7f9fc] text-[#1f2933] shadow-sm"
                    : "text-[#5a6b73] hover:text-[#1f2933]"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${activeTab === tab ? statusStyle[tab].dot : "bg-gray-300"}`}
                />
                {getUiStatusTabLabel(tab)}
                <span
                  className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === tab ? "bg-[#1f2933] text-white" : "bg-gray-100 text-[#5a6b73]"}`}
                >
                  {counts[tab]}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 max-w-[500px] md:max-w-4xl lg:max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 pb-32">
          {loading ? (
            <PageLoading />
          ) : filtered.length === 0 ? (
            <EmptyState
              emoji={
                activeTab === "在售"
                  ? "📦"
                  : activeTab === "已预留"
                    ? "⏳"
                    : "📁"
              }
              title={emptyStateTitle(activeTab)}
              action={
                activeTab === "在售" ? (
                  <button
                    onClick={() => router.push("/publish")}
                    className={`px-6 ${btnPrimary}`}
                  >
                    ＋ 发布第一条
                  </button>
                ) : undefined
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filtered.map((item) => {
                const st = statusStyle[item.status];
                const reviewLabel = getOrderReviewLabel(item.orderStatus);
                const reviewStyle =
                  item.orderStatus === "已评价"
                    ? reviewStatusStyle.reviewed
                    : reviewStatusStyle.pending;

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-[20px] shadow-sm border border-[rgba(31,41,51,0.04)]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center gap-3 p-4 pb-3">
                      <Link
                        href={
                          item.listingType === "sublet"
                            ? `/sublet/${item.id}`
                            : `/listing/${item.id}`
                        }
                        className="shrink-0"
                      >
                        {item.image ? (
                          <ProductThumbnail
                            src={item.image}
                            alt={item.title}
                            className="w-16 h-16 rounded-[14px] border border-[rgba(31,41,51,0.08)] hover:opacity-90 transition-opacity"
                          />
                        ) : (
                          <div
                            className="w-16 h-16 rounded-[14px] flex items-center justify-center text-3xl hover:opacity-90 transition-opacity"
                            style={{
                              background: `linear-gradient(135deg, ${item.gradientFrom}, ${item.gradientTo})`,
                            }}
                          >
                            {item.emoji}
                          </div>
                        )}
                      </Link>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-gray-100 text-[#5a6b73] shrink-0">
                            {getListingKindLabel(item.listingType)}
                          </span>
                        </div>
                        <p className="font-semibold text-[#1f2933] text-[15px] truncate">
                          {item.title}
                        </p>
                        <p className="text-[#2f9e6d] font-bold text-sm mt-0.5">
                          ${item.price} CAD{item.priceUnit ?? ""}
                        </p>
                        <p className="text-[#5a6b73] text-[12px] mt-0.5">
                          {isCompletedTab && item.status === "已售"
                            ? `成交于 ${item.completedAt || item.postedAt}`
                            : `发布于 ${item.postedAt}`}
                        </p>
                      </div>
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
                                标记为{getUiStatusTabLabel(s)}
                              </button>
                            ),
                          )}
                        </MotionPopover>
                      </div>
                    </div>

                    <div className="border-t border-[rgba(31,41,51,0.04)] px-4 py-3 flex items-center justify-between gap-2">
                      {!isCompletedTab ? (
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
                      ) : (
                        <span className="text-[12px] text-[#5a6b73]">
                          成交记录
                        </span>
                      )}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {isCompletedTab && reviewLabel && (
                          <span
                            className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${reviewStyle.bg} ${reviewStyle.text}`}
                          >
                            {reviewLabel}
                          </span>
                        )}
                        <span
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${st.bg} ${st.text}`}
                        >
                          {getStatusBadgeLabel(item.listingType, item.status)}
                        </span>
                      </div>
                    </div>

                    {(item.status === "已售" || item.status === "已预留") &&
                      item.buyerId && (
                        <div className="border-t border-[rgba(31,41,51,0.04)] px-4 py-3 flex items-center justify-between bg-gray-50/20 gap-2">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <UserAvatar
                              src={item.buyerAvatar}
                              name={item.buyerName || "用户"}
                              size="sm"
                            />
                            <span className="text-[12px] text-[#5a6b73] truncate">
                              {getBuyerActionLabel(
                                item.listingType,
                                item.status,
                              )}
                              <span className="font-medium text-[#1f2933]">
                                {item.buyerName || "未知用户"}
                              </span>
                            </span>
                          </div>
                          {item.buyerId && (
                            <button
                              onClick={() => openChat(item.id, item.buyerId!)}
                              className="text-[12px] font-bold text-[#2f9e6d] bg-[#f3fbf7] border border-[#2f9e6d]/20 px-3 py-1.5 rounded-full hover:bg-[#e8f5ee] transition-colors shrink-0"
                            >
                              站内联系
                            </button>
                          )}
                        </div>
                      )}

                    {!isCompletedTab ? (
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
                    ) : (
                      <div className="border-t border-[rgba(31,41,51,0.04)] px-4 py-3 bg-gray-50/40">
                        <Link
                          href={
                            item.listingType === "sublet"
                              ? `/sublet/${item.id}`
                              : `/listing/${item.id}`
                          }
                          className="flex items-center justify-center gap-1.5 text-[13px] font-bold text-[#2f9e6d] bg-white border border-[#2f9e6d]/20 py-2.5 rounded-[12px] hover:bg-[#f3fbf7] transition-all"
                        >
                          查看详情
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        onConfirm={confirmDelete}
        title="确定要删除吗？"
        description="删除后将无法恢复，相关聊天记录仍会保留。"
        confirmLabel="删除"
        variant="danger"
      />

      <AppModal
        open={!!buyerModal}
        onClose={() => setBuyerModal(null)}
        maxWidth="max-w-md"
        panelClassName="flex flex-col max-h-[85vh] min-h-0"
      >
        <ModalHeader
          title="选择交易对象"
          subtitle="为了保证评价真实性，请选择与您成交的对方"
          onClose={() => setBuyerModal(null)}
        />
        <ModalBody className="pt-2">
          {loadingBuyers ? (
            <PageLoading label="正在查找对方..." />
          ) : buyerModal && buyerModal.buyers.length === 0 ? (
            <EmptyState
              emoji="👤"
              title="没有找到近期私聊过的用户"
              description="您可以直接跳过，仍可将发布标记为对应状态"
              action={
                <button
                  onClick={() =>
                    commitChangeStatus(buyerModal.id, buyerModal.status, null)
                  }
                  className={`px-6 ${btnPrimary}`}
                >
                  跳过并标记为{getUiStatusTabLabel(buyerModal.status)}
                </button>
              }
              className="py-8"
            />
          ) : buyerModal ? (
            <div className="flex flex-col gap-2">
              {buyerModal.buyers.map((b) => (
                <button
                  key={b.uid}
                  onClick={() =>
                    commitChangeStatus(buyerModal.id, buyerModal.status, b.uid)
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
          ) : null}
        </ModalBody>
      </AppModal>
    </>
  );
}
