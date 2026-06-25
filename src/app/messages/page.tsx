"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  doc,
  updateDoc,
  arrayUnion,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { ChatDocument } from "@/lib/firebase/firestore";
import { getUserProfile, UserProfile } from "@/lib/firebase/users";

type EnrichedChat = ChatDocument & {
  otherUser?: UserProfile | null;
  unreadCount: number;
};

export default function MessagesPage() {
  const { user } = useAuthStore();
  const [chats, setChats] = useState<EnrichedChat[]>([]);
  const [loading, setLoading] = useState(true);
  const [isManageMode, setIsManageMode] = useState(false);
  const [selectedChats, setSelectedChats] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) {
      setChats([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "chats"),
      where("participants", "array-contains", user.uid),
      orderBy("lastMessageTime", "desc"),
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const chatDocs = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as ChatDocument,
      );

      const enrichedChats = await Promise.all(
        chatDocs.map(async (chat) => {
          const otherUserId =
            chat.participants.find((p) => p !== user.uid) ||
            chat.participants[0];
          let otherUser = null;
          if (otherUserId) {
            otherUser = await getUserProfile(otherUserId);
          }
          return {
            ...chat,
            otherUser,
            unreadCount: chat.unreadCounts?.[user.uid] || 0,
          };
        }),
      );

      const visibleChats = enrichedChats.filter(
        (c) => !c.hiddenBy?.includes(user.uid),
      );
      setChats(visibleChats);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const totalUnread = chats.reduce((sum, chat) => sum + chat.unreadCount, 0);

  const handleMarkUnread = async () => {
    if (!user || selectedChats.size === 0) return;
    const promises = Array.from(selectedChats).map(async (chatId) => {
      const snap = await getDoc(doc(db, "chats", chatId));
      if (!snap.exists()) return;
      const data = snap.data() as ChatDocument;
      const unreadCounts = { ...(data.unreadCounts || {}), [user.uid]: 1 };
      await updateDoc(doc(db, "chats", chatId), { unreadCounts });
    });
    await Promise.all(promises);
    setSelectedChats(new Set());
    setIsManageMode(false);
  };

  return (
    <div className="flex flex-col min-h-full bg-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-[rgba(31,41,51,0.08)] px-4 md:px-8 py-4">
        <div className="max-w-[800px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold text-[#1f2933]">
              消息
            </h1>
            {totalUnread > 0 && (
              <span className="bg-[#2f9e6d] text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                {totalUnread} 条未读
              </span>
            )}
          </div>
          {chats.length > 0 && (
            <button
              onClick={() => {
                setIsManageMode(!isManageMode);
                setSelectedChats(new Set());
              }}
              className="text-sm font-medium text-[#5a6b73] hover:text-[#2f9e6d] transition-colors"
            >
              {isManageMode ? "完成" : "管理"}
            </button>
          )}
        </div>
      </header>

      {/* Message List */}
      <div className="flex-1 max-w-[800px] w-full mx-auto">
        {loading ? (
          <div className="flex justify-center py-20 text-[#5a6b73]">
            加载中...
          </div>
        ) : (
          chats.map((chat) => (
            <div
              key={chat.id}
              className="flex items-center border-b border-[rgba(31,41,51,0.04)] hover:bg-[#f3fbf7] transition-colors group px-4 md:px-8"
            >
              {/* Checkbox for manage mode */}
              {isManageMode && (
                <div
                  className="shrink-0 mr-4 cursor-pointer"
                  onClick={() => {
                    const newSet = new Set(selectedChats);
                    if (newSet.has(chat.id!)) newSet.delete(chat.id!);
                    else newSet.add(chat.id!);
                    setSelectedChats(newSet);
                  }}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      selectedChats.has(chat.id!)
                        ? "border-[#2f9e6d] bg-[#2f9e6d]"
                        : "border-gray-300"
                    }`}
                  >
                    {selectedChats.has(chat.id!) && (
                      <svg
                        className="w-3 h-3 text-white"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                </div>
              )}

              <Link
                href={`/messages/${chat.id}`}
                className="flex-1 flex items-center gap-4 py-4 cursor-pointer block min-w-0"
                onClick={(e) => {
                  if (isManageMode) {
                    e.preventDefault();
                    const newSet = new Set(selectedChats);
                    if (newSet.has(chat.id!)) newSet.delete(chat.id!);
                    else newSet.add(chat.id!);
                    setSelectedChats(newSet);
                  }
                }}
              >
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-gray-100 overflow-hidden relative">
                  {chat.otherUser?.avatarUrl ? (
                    <img
                      src={chat.otherUser.avatarUrl}
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="font-bold text-lg text-gray-500">
                      {(chat.otherUser?.nickname || "U")[0]}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <h3 className="font-bold text-[#1f2933] text-[15px] truncate">
                        {chat.otherUser?.nickname || "未知用户"}
                      </h3>
                      {chat.itemTitle && (
                        <span className="px-2 py-0.5 rounded-md bg-[#f3fbf7] text-[#2f9e6d] text-[10px] font-medium truncate max-w-[150px]">
                          {chat.itemTitle}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-[#5a6b73] shrink-0 ml-2">
                      {chat.lastMessageTime
                        ? new Date(
                            chat.lastMessageTime.seconds * 1000,
                          ).toLocaleDateString()
                        : ""}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p
                      className={`text-[13px] truncate ${chat.unreadCount > 0 ? "text-[#1f2933] font-medium" : "text-[#5a6b73]"}`}
                    >
                      {chat.lastMessage}
                    </p>
                    {chat.unreadCount > 0 && (
                      <div className="w-4 h-4 rounded-full bg-[#2f9e6d] flex items-center justify-center shrink-0 ml-2 shadow-sm">
                        <span className="text-[9px] font-bold text-white">
                          {chat.unreadCount}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            </div>
          ))
        )}

        {!loading && chats.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#f3fbf7] flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-[#2f9e6d]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <p className="text-[#5a6b73] text-sm">暂无新消息</p>
          </div>
        )}

        {/* Manage Footer */}
        {isManageMode && (
          <div className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom))] md:bottom-0 left-0 md:left-16 right-0 bg-white border-t border-[rgba(31,41,51,0.08)] z-50 p-4 flex items-center justify-between gap-3 shadow-[0_-4px_24px_rgba(0,0,0,0.05)]">
            <button
              onClick={() => {
                if (selectedChats.size === chats.length) {
                  setSelectedChats(new Set());
                } else {
                  setSelectedChats(new Set(chats.map((c) => c.id!)));
                }
              }}
              className="text-[#5a6b73] text-[15px] font-medium px-2 shrink-0"
            >
              {selectedChats.size === chats.length ? "取消全选" : "全选"}
            </button>
            <div className="flex items-center gap-2">
              <button
                disabled={selectedChats.size === 0}
                onClick={handleMarkUnread}
                className="bg-[#f3fbf7] hover:bg-[#e0f5ec] disabled:bg-gray-100 disabled:text-gray-400 text-[#2f9e6d] text-[14px] font-bold px-5 py-3 rounded-xl transition-colors"
              >
                标为未读
              </button>
              <button
                disabled={selectedChats.size === 0}
                onClick={async () => {
                  if (!user) return;
                  const promises = Array.from(selectedChats).map((chatId) =>
                    updateDoc(doc(db, "chats", chatId), {
                      hiddenBy: arrayUnion(user.uid),
                    }),
                  );
                  await Promise.all(promises);
                  setSelectedChats(new Set());
                  setIsManageMode(false);
                }}
                className="bg-rose-500 hover:bg-rose-600 disabled:bg-gray-200 disabled:text-gray-400 text-white text-[14px] font-bold px-5 py-3 rounded-xl transition-colors"
              >
                删除 ({selectedChats.size})
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
