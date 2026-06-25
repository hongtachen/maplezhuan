"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { useApp } from "@/components/app/AppContext";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import {
  MessageDocument,
  ChatDocument,
  ItemDocument,
  SubletDocument,
} from "@/lib/firebase/firestore";
import { getUserProfile, UserProfile } from "@/lib/firebase/users";
import {
  acceptReserve,
  confirmSold,
  declineRequest,
  buyerFromProfile,
  listingFromItem,
  ItemType,
} from "@/lib/firebase/transactions";
import { uploadImage } from "@/lib/firebase/storage";
import { submitReview } from "@/lib/firebase/reviews";
import ChatItemBar from "@/components/chat/ChatItemBar";
import ChatInputBar from "@/components/chat/ChatInputBar";
import MessageBubble from "@/components/chat/MessageBubble";

function isItemActive(status: string | undefined) {
  return status === "在售" || status === "招租中" || status === "已预留";
}

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const chatId = params.id as string;
  const { user } = useAuthStore();
  const { showToast } = useApp();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<MessageDocument[]>([]);
  const [chat, setChat] = useState<ChatDocument | null>(null);
  const [otherUser, setOtherUser] = useState<UserProfile | null>(null);
  const [inputText, setInputText] = useState("");
  const [item, setItem] = useState<ItemDocument | SubletDocument | null>(null);
  const [itemType, setItemType] = useState<ItemType | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [acting, setActing] = useState(false);
  const [uploading, setUploading] = useState(false);

  const isSeller = !!(user && item && item.sellerId === user.uid);
  const canActOnRequests = isSeller && isItemActive(item?.status);

  const resolvedRequestIds = useMemo(() => {
    const resolved = new Set<string>();
    const actionTypes = new Set([
      "action_reserved",
      "action_sold",
      "action_declined",
    ]);
    let lastActionIdx = -1;
    messages.forEach((m, i) => {
      if (actionTypes.has(m.msgType || "")) lastActionIdx = i;
    });
    if (lastActionIdx >= 0) {
      for (let i = 0; i < lastActionIdx; i++) {
        const m = messages[i];
        if (m.msgType === "request_reserve" || m.msgType === "request_buy") {
          if (m.id) resolved.add(m.id);
        }
      }
    }
    return resolved;
  }, [messages]);

  const hasPendingRequest = useMemo(
    () =>
      messages.some(
        (m) =>
          (m.msgType === "request_reserve" || m.msgType === "request_buy") &&
          m.id &&
          !resolvedRequestIds.has(m.id),
      ),
    [messages, resolvedRequestIds],
  );

  const canSchedulePickup = useMemo(() => {
    const readyStatuses = ["已预留", "已售出", "已租出"];
    return !!(item?.status && readyStatuses.includes(item.status));
  }, [item]);

  useEffect(() => {
    if (!chatId) return;
    const unsub = onSnapshot(doc(db, "chats", chatId), async (chatSnap) => {
      if (!chatSnap.exists()) return;
      const c = { id: chatSnap.id, ...chatSnap.data() } as ChatDocument;
      setChat(c);

      if (user) {
        const otherUserId =
          c.participants.find((p) => p !== user.uid) || c.participants[0];
        if (otherUserId) {
          const profile = await getUserProfile(otherUserId);
          setOtherUser(profile);
        }
        const newCounts = { ...c.unreadCounts, [user.uid]: 0 };
        if (c.unreadCounts?.[user.uid] !== 0) {
          await updateDoc(doc(db, "chats", chatId), {
            unreadCounts: newCounts,
          });
        }
      }
    });
    return () => unsub();
  }, [chatId, user]);

  useEffect(() => {
    if (!chat?.itemId) return;
    const itemId = chat.itemId;
    const unsubItem = onSnapshot(doc(db, "items", itemId), (snap) => {
      if (snap.exists()) {
        setItem({ id: snap.id, ...snap.data() } as ItemDocument);
        setItemType("item");
      }
    });
    const unsubSublet = onSnapshot(doc(db, "sublets", itemId), (snap) => {
      if (snap.exists()) {
        setItem({ id: snap.id, ...snap.data() } as SubletDocument);
        setItemType("sublet");
      }
    });
    return () => {
      unsubItem();
      unsubSublet();
    };
  }, [chat?.itemId]);

  useEffect(() => {
    if (!chatId) return;
    const q = query(
      collection(db, "messages"),
      where("chatId", "==", chatId),
      orderBy("createdAt", "asc"),
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(
        (d) => ({ id: d.id, ...d.data() }) as MessageDocument,
      );
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, [chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const bumpChat = useCallback(
    async (text: string, recipientId: string) => {
      if (!chat) return;
      const newCounts = { ...chat.unreadCounts };
      newCounts[recipientId] = (newCounts[recipientId] || 0) + 1;
      await updateDoc(doc(db, "chats", chatId), {
        lastMessage: text,
        lastMessageTime: serverTimestamp(),
        unreadCounts: newCounts,
        hiddenBy: [],
      });
    },
    [chat, chatId],
  );

  const handleSend = async () => {
    if (!inputText.trim() || !user || !chat) return;
    const textToSend = inputText;
    setInputText("");
    const otherUserId =
      chat.participants.find((p) => p !== user.uid) || chat.participants[0];
    try {
      await addDoc(collection(db, "messages"), {
        chatId,
        senderId: user.uid,
        text: textToSend,
        msgType: "text",
        createdAt: serverTimestamp(),
      });
      await bumpChat(textToSend, otherUserId);
    } catch (e) {
      console.error("Failed to send message", e);
      showToast("发送失败", "error");
    }
  };

  const handleAcceptReserve = async () => {
    if (!user || !chat || !item || !itemType || !otherUser) return;
    setActing(true);
    try {
      const buyer = buyerFromProfile(otherUser);
      const title =
        itemType === "item"
          ? (item as ItemDocument).title
          : (item as SubletDocument).title || (item as SubletDocument).address;
      await acceptReserve({
        itemId: item.id!,
        itemType,
        buyer,
        chatId,
        sellerId: user.uid,
        itemTitle: title,
      });
      showToast("已同意预留", "success");
    } catch (e) {
      console.error(e);
      showToast("操作失败", "error");
    } finally {
      setActing(false);
    }
  };

  const handleConfirmSold = async () => {
    if (!user || !chat || !item || !itemType || !otherUser) return;
    setActing(true);
    try {
      const buyer = buyerFromProfile(otherUser);
      const listing = listingFromItem(item, itemType);
      await confirmSold({
        itemId: item.id!,
        itemType,
        buyer,
        seller: {
          uid: user.uid,
          nickname: user.displayName || user.email?.split("@")[0] || "卖家",
          avatar: user.photoURL || "S",
        },
        chatId,
        listing,
      });
      showToast(itemType === "sublet" ? "已确认租出" : "已确认售出", "success");
    } catch (e) {
      console.error(e);
      showToast("操作失败", "error");
    } finally {
      setActing(false);
    }
  };

  const handleDecline = async () => {
    if (!user || !chat || !item || !otherUser) return;
    setActing(true);
    try {
      const buyer = buyerFromProfile(otherUser);
      const title =
        itemType === "item"
          ? (item as ItemDocument).title
          : (item as SubletDocument).title || (item as SubletDocument).address;
      await declineRequest({
        chatId,
        sellerId: user.uid,
        buyer,
        itemTitle: title,
      });
      showToast("已拒绝申请", "info");
    } catch (e) {
      console.error(e);
      showToast("操作失败", "error");
    } finally {
      setActing(false);
    }
  };

  const handleSendImage = async (files: FileList) => {
    if (!user || !chat) return;
    const otherUserId =
      chat.participants.find((p) => p !== user.uid) || chat.participants[0];
    const total = files.length;
    if (total > 3) {
      showToast(`已选择 ${total} 张，仅发送前 3 张`, "info");
    }
    const fileList = Array.from(files).slice(0, 3);
    setUploading(true);
    try {
      for (const file of fileList) {
        const url = await uploadImage(file, `chats/${chatId}`);
        await addDoc(collection(db, "messages"), {
          chatId,
          senderId: user.uid,
          text: "",
          msgType: "image",
          imageUrl: url,
          createdAt: serverTimestamp(),
        });
        await bumpChat("[图片]", otherUserId);
      }
      if (fileList.length > 0) {
        showToast(`已发送 ${fileList.length} 张图片`, "success");
      }
    } catch (e) {
      console.error(e);
      showToast("图片上传失败", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleSendPickupTime = async (
    date: string,
    timeSlot: string,
    note: string,
  ) => {
    if (!user || !chat) return;
    if (!canSchedulePickup) {
      showToast("请先完成预留或交易确认，再约定取货时间", "info");
      return;
    }
    const otherUserId =
      chat.participants.find((p) => p !== user.uid) || chat.participants[0];
    const formattedDate = new Date(date + "T12:00:00").toLocaleDateString(
      "zh-CN",
      {
        month: "long",
        day: "numeric",
        weekday: "short",
      },
    );
    const text = `取货时间：${formattedDate} ${timeSlot}${note ? `（${note}）` : ""}`;
    try {
      await addDoc(collection(db, "messages"), {
        chatId,
        senderId: user.uid,
        text,
        msgType: "pickup_time",
        metadata: { date: formattedDate, timeSlot, note },
        createdAt: serverTimestamp(),
      });
      await bumpChat(text, otherUserId);
    } catch (e) {
      console.error(e);
      showToast("发送失败", "error");
    }
  };

  const handleShareContact = async () => {
    if (!user || !chat) return;
    const profile = await getUserProfile(user.uid);
    if (!profile?.phone && !profile?.wechat) {
      showToast("请先在设置中填写联系方式", "info");
      router.push("/profile/settings");
      return;
    }
    const otherUserId =
      chat.participants.find((p) => p !== user.uid) || chat.participants[0];
    const text = "分享了联系方式";
    try {
      await addDoc(collection(db, "messages"), {
        chatId,
        senderId: user.uid,
        text,
        msgType: "contact_share",
        metadata: { phone: profile.phone, wechat: profile.wechat },
        createdAt: serverTimestamp(),
      });
      await bumpChat(text, otherUserId);
    } catch (e) {
      console.error(e);
      showToast("发送失败", "error");
    }
  };

  const handleConfirmPickup = async (msgId: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, "messages", msgId), {
        "metadata.pickupConfirmed": true,
        "metadata.pickupConfirmedBy": user.uid,
      });
      showToast("已确认取货时间", "success");
    } catch (e) {
      console.error(e);
      showToast("确认失败", "error");
    }
  };

  const soldLabel = itemType === "sublet" ? "确认租出" : "确认售出";

  return (
    <div className="flex flex-col h-screen bg-[#f3fbf7]">
      <header className="sticky top-0 z-40 bg-white border-b border-[rgba(31,41,51,0.08)]">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
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
            <Link
              href={`/seller/${otherUser?.uid}`}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden relative flex items-center justify-center">
                {otherUser?.avatarUrl ? (
                  <img
                    src={otherUser.avatarUrl}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-bold text-lg text-gray-500">
                    {(otherUser?.nickname || "U")[0]}
                  </span>
                )}
              </div>
              <div>
                <h1 className="font-bold text-[#1f2933] text-[15px]">
                  {otherUser?.nickname || "未知用户"}
                </h1>
                <p className="text-[11px] text-[#5a6b73] font-medium">
                  关于此次交易
                </p>
              </div>
            </Link>
          </div>
        </div>

        {chat?.itemId && (
          <ChatItemBar
            itemId={chat.itemId}
            itemTitle={chat.itemTitle || ""}
            item={item}
            itemType={itemType}
          />
        )}
      </header>

      <div className="relative flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth">
          <div className="flex flex-col gap-4 max-w-[800px] mx-auto">
            {messages.map((msg) => {
              const isMe = msg.senderId === user?.uid;
              return (
                <MessageBubble
                  key={msg.id}
                  msg={msg}
                  isMe={isMe}
                  isSeller={isSeller}
                  canActOnRequests={canActOnRequests}
                  itemType={itemType || "item"}
                  isRequestResolved={
                    !!(msg.id && resolvedRequestIds.has(msg.id))
                  }
                  onAcceptReserve={handleAcceptReserve}
                  onConfirmSold={handleConfirmSold}
                  onDecline={handleDecline}
                  onReview={() => setShowReviewModal(true)}
                  onConfirmPickup={handleConfirmPickup}
                  onCopy={(label) =>
                    showToast(
                      label,
                      label.includes("失败") ? "error" : "success",
                    )
                  }
                  acting={acting}
                />
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {isSeller && canActOnRequests && !hasPendingRequest && (
          <div className="absolute bottom-4 left-0 right-0 px-4 flex justify-center pointer-events-none z-20">
            <div className="bg-white/95 backdrop-blur-md border border-[rgba(31,41,51,0.08)] shadow-lg rounded-full px-5 py-2.5 flex items-center gap-4 pointer-events-auto">
              <span className="text-[13px] font-bold text-[#5a6b73]">
                {item?.status}
              </span>
              <div className="w-px h-5 bg-gray-200" />
              <div className="flex gap-2">
                {item?.status !== "已预留" && (
                  <button
                    onClick={handleAcceptReserve}
                    disabled={acting}
                    className="px-3.5 py-1.5 bg-orange-50 text-orange-600 text-[13px] font-bold rounded-full border border-orange-200 hover:bg-orange-100 transition-colors disabled:opacity-50"
                  >
                    同意预留
                  </button>
                )}
                <button
                  onClick={handleConfirmSold}
                  disabled={acting}
                  className="px-3.5 py-1.5 bg-[#2f9e6d] text-white text-[13px] font-bold rounded-full hover:bg-[#267a56] transition-colors disabled:opacity-50"
                >
                  {soldLabel}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <ChatInputBar
        inputText={inputText}
        onInputChange={setInputText}
        onSend={handleSend}
        onSendImage={handleSendImage}
        onSendPickupTime={handleSendPickupTime}
        onShareContact={handleShareContact}
        onPickupBlocked={() =>
          showToast("请先完成预留或交易确认，再约定取货时间", "info")
        }
        canSchedulePickup={canSchedulePickup}
        uploading={uploading}
      />

      {showReviewModal && item && otherUser && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowReviewModal(false)}
          />
          <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl">
            <h2 className="text-xl font-bold text-[#1f2933] mb-2 text-center">
              评价本次交易
            </h2>
            <p className="text-sm text-[#5a6b73] text-center mb-6">
              您对卖家 {otherUser.nickname} 的印象如何？
            </p>

            <div className="flex items-center justify-center gap-3 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setReviewRating(star)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <svg
                    className={`w-10 h-10 ${star <= reviewRating ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"}`}
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </button>
              ))}
            </div>

            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="写点评价吧 (选填)"
              className="w-full bg-gray-50 border border-[rgba(31,41,51,0.08)] rounded-xl p-4 text-[14px] text-[#1f2933] outline-none focus:border-[#2f9e6d] resize-none h-28 mb-6"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowReviewModal(false)}
                className="flex-1 py-3.5 bg-gray-100 text-[#5a6b73] font-bold rounded-xl"
              >
                取消
              </button>
              <button
                onClick={async () => {
                  if (!user || !otherUser || !item?.id) return;
                  try {
                    const ordersSnap = await getDocs(
                      query(
                        collection(db, "orders"),
                        where("itemId", "==", item.id),
                        where("buyerId", "==", user.uid),
                      ),
                    );
                    const orderId = ordersSnap.empty
                      ? undefined
                      : ordersSnap.docs[0].id;

                    await submitReview({
                      targetUserId: otherUser.uid,
                      reviewerId: user.uid,
                      rating: reviewRating,
                      comment: reviewText,
                      orderId,
                      itemId: item.id,
                    });

                    setShowReviewModal(false);
                    showToast("评价已提交", "success");
                  } catch (e) {
                    console.error(e);
                    showToast("提交失败", "error");
                  }
                }}
                className="flex-[2] py-3.5 bg-[#2f9e6d] text-white font-bold rounded-xl"
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
