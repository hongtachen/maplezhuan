"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useApp } from "@/components/app/AppContext";
import { useAuthStore } from "@/store/useAuthStore";
import Link from "next/link";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  increment,
  addDoc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { SubletDocument, recordHistory } from "@/lib/firebase/firestore";
import { useSellerProfile, formatSellerRating } from "@/hooks/useSellerProfile";
import LocationPicker from "@/components/ui/LocationPicker";
import { listingHeroStyle } from "@/lib/motion/viewTransition";

export default function SubletDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toggleFavorite, isFavorite } = useApp();
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const hasIncrementedViews = useRef(false);

  const id = params.id as string;
  const favorited = isFavorite(id);

  const [sublet, setSublet] = useState<SubletDocument | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showWechat, setShowWechat] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const { profile: seller } = useSellerProfile(sublet?.sellerId);
  const sellerRating = formatSellerRating(seller);

  // Prevent hydration mismatch for favorite button
  useEffect(() => {
    const fetchSublet = async () => {
      setMounted(true);
      try {
        const docRef = doc(db, "sublets", id);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = { id: snap.id, ...snap.data() } as SubletDocument;
          setSublet(data);

          if (!hasIncrementedViews.current) {
            hasIncrementedViews.current = true;
            updateDoc(docRef, { views: increment(1) }).catch(console.error);
          }

          if (user) {
            recordHistory(user.uid, {
              itemId: data.id,
              itemTitle: data.title || "房屋转租",
              itemPrice: data.price,
              itemPriceUnit: "/月",
              itemType: "sublet",
              itemEmoji: "🏠",
              itemGradientFrom: "#f0f9ff",
              itemGradientTo: "#bae6fd",
            });
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSublet();
  }, [id, user]);

  const handleAction = async (action: "contact" | "request_reserve") => {
    if (!user) {
      router.push("/profile");
      return;
    }
    if (user.uid === sublet?.sellerId) return;

    try {
      const chatsRef = collection(db, "chats");
      const q = query(chatsRef, where("itemId", "==", id));
      const snap = await getDocs(q);

      let existingChatId = null;
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        if (
          data.participants.includes(user.uid) &&
          data.participants.includes(sublet!.sellerId)
        ) {
          existingChatId = docSnap.id;
        }
      });

      const title =
        sublet!.title ||
        `${sublet!.roomTypes?.[0] || "房间"} in ${sublet!.propertyType}`;

      let initialText = "我对这个转租感兴趣";
      let msgType = "text";
      if (action === "request_reserve") {
        initialText = "您好！我想申请预留这件转租，请问可以吗？";
        msgType = "request_reserve";
      }

      if (existingChatId) {
        if (action === "request_reserve") {
          await addDoc(collection(db, "messages"), {
            chatId: existingChatId,
            senderId: user.uid,
            text: initialText,
            msgType,
            createdAt: serverTimestamp(),
          });
          await updateDoc(doc(db, "chats", existingChatId), {
            lastMessage: initialText,
            lastMessageTime: serverTimestamp(),
            [`unreadCounts.${sublet!.sellerId}`]: increment(1),
            hiddenBy: [],
          });
        }
        router.push(`/messages/${existingChatId}`);
      } else {
        const newChat = {
          participants: [user.uid, sublet!.sellerId],
          itemId: id,
          itemTitle: title,
          lastMessage: initialText,
          lastMessageTime: serverTimestamp(),
          unreadCounts: { [sublet!.sellerId]: 1 },
        };
        const newDoc = await addDoc(collection(db, "chats"), newChat);
        await addDoc(collection(db, "messages"), {
          chatId: newDoc.id,
          senderId: user.uid,
          text: initialText,
          msgType,
          createdAt: serverTimestamp(),
        });

        await updateDoc(doc(db, "sublets", id), {
          inquiries: increment(1),
        }).catch(console.error);

        router.push(`/messages/${newDoc.id}`);
      }

      // Email Notification Trigger
      if (action === "request_reserve") {
        try {
          const sellerSnap = await getDoc(doc(db, "users", sublet!.sellerId));
          if (sellerSnap.exists()) {
            const sellerData = sellerSnap.data();
            if (sellerData.emailNotifications !== false && sellerData.email) {
              await addDoc(collection(db, "mail"), {
                to: sellerData.email,
                message: {
                  subject: `【枫叶闲置】您的房源“${title}”有新的预订申请！`,
                  html: `<p>您好，${sellerData.nickname || "房东"}：</p>
                         <p>有租客对您的房源 <b>${title}</b> 发起了 <b>预订申请</b>。</p>
                         <p>租客留言："${initialText}"</p>
                         <p>请登录枫叶闲置查看并处理该请求。</p>`,
                },
              });
            }
          }
        } catch (error) {
          console.error("Error triggering email:", error);
        }
      }
    } catch (error) {
      console.error("Error creating chat:", error);
    }
  };

  const handleToggleFavorite = async () => {
    const adding = !favorited;
    toggleFavorite(id, "sublet");

    setSublet((prev) =>
      prev
        ? {
            ...prev,
            favorites: Math.max(0, (prev.favorites || 0) + (adding ? 1 : -1)),
          }
        : prev,
    );

    try {
      await updateDoc(doc(db, "sublets", id), {
        favorites: increment(adding ? 1 : -1),
      });
    } catch (e) {
      console.error("Failed to update favorites count", e);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="w-8 h-8 border-4 border-[#2f9e6d] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!sublet) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <p className="text-[#5a6b73] mb-4">转租信息不存在或已被删除</p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-[#2f9e6d] text-white rounded-xl"
        >
          返回
        </button>
      </div>
    );
  }

  const title =
    sublet.title ||
    `${sublet.roomTypes?.[0] || "房间"} in ${sublet.propertyType}`;

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Mobile-friendly Header with back button */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md px-4 py-3 border-b border-[rgba(31,41,51,0.05)] flex items-center justify-between md:px-8 md:py-4">
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
        <div className="flex gap-2">
          <button className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors">
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
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
          </button>
          {mounted && (
            <button
              onClick={handleToggleFavorite}
              className="px-3 h-10 rounded-full flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors gap-1.5"
            >
              {favorited ? (
                <svg
                  className="w-5 h-5 text-rose-500 shrink-0"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 text-[#1f2933] shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                  />
                </svg>
              )}
              <span
                className={`text-sm font-bold ${favorited ? "text-rose-500" : "text-[#1f2933]"}`}
              >
                {sublet.favorites || 0}
              </span>
            </button>
          )}
        </div>
      </header>

      <div className="md:max-w-4xl md:mx-auto md:px-8 md:py-8 w-full pb-24 md:pb-32">
        {/* Placeholder Image Area */}
        <div className="w-full aspect-[4/3] md:aspect-video bg-gray-100 md:rounded-3xl flex items-center justify-center overflow-hidden">
          {sublet.images && sublet.images.length > 0 ? (
            <img
              src={sublet.images[0]}
              alt={title}
              className="w-full h-full object-cover"
              style={listingHeroStyle("sublet", id)}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#c7d2fe] to-[#a5b4fc] flex items-center justify-center">
              <span className="text-8xl md:text-9xl opacity-30">🏠</span>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="px-5 py-6 md:px-0">
          <div className="flex items-start justify-between gap-4 mb-3">
            <h1 className="text-xl md:text-3xl font-bold text-[#1f2933] leading-snug">
              {title}
            </h1>
          </div>

          <div className="text-2xl md:text-3xl font-bold text-[#2f9e6d] mb-2">
            ${sublet.price}{" "}
            <span className="text-base font-normal text-[#5a6b73]">CAD/月</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-[#5a6b73] mb-6">
            <span className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-full">
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
              {sublet.views || 0} 次浏览
            </span>
            <span className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-full">
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
              {sublet.inquiries || 0} 人想租
            </span>
          </div>

          {seller && (
            <Link
              href={`/seller/${seller.uid}`}
              className="flex items-center gap-3 mb-8 p-3 -ml-3 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 shrink-0">
                <img
                  src={
                    seller.avatarUrl ||
                    `https://api.dicebear.com/7.x/adventurer/svg?seed=${seller.uid}`
                  }
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-[#1f2933] group-hover:text-[#2f9e6d] transition-colors">
                  {seller.nickname}
                </div>
                <div className="text-xs text-[#5a6b73] mt-0.5 flex items-center gap-2">
                  <span className="flex items-center text-amber-500 font-bold">
                    {sellerRating.count > 0 ? (
                      <>
                        <svg
                          className="w-3.5 h-3.5 mr-0.5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        {sellerRating.label}
                      </>
                    ) : (
                      <span className="text-[#5a6b73] font-normal">
                        暂无评分
                      </span>
                    )}
                  </span>
                  <span className="text-gray-300">|</span>
                  <span>
                    {sublet.createdAt
                      ? new Date(
                          sublet.createdAt.seconds * 1000,
                        ).toLocaleDateString()
                      : ""}
                    发布
                  </span>
                </div>
              </div>
              <svg
                className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform"
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
          )}

          {seller?.isPublicContact && (seller.wechat || seller.phone) && (
            <div className="bg-[#f3fbf7] border border-[#2f9e6d]/20 rounded-2xl p-4 mb-8">
              <h3 className="text-[13px] font-bold text-[#2f9e6d] mb-3 flex items-center gap-1.5">
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
                    d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                  />
                </svg>
                卖家公开联系方式
              </h3>
              <div className="space-y-2">
                {seller.wechat && (
                  <button
                    onClick={() => setShowWechat(true)}
                    className="w-full flex items-center justify-between bg-white rounded-xl px-3 py-2 border border-[rgba(47,158,109,0.1)] hover:border-[#2f9e6d]/30 transition-colors"
                  >
                    <span className="text-[13px] text-[#5a6b73] flex items-center gap-1.5">
                      <span className="text-base grayscale opacity-70">💬</span>{" "}
                      微信号
                    </span>
                    <span
                      className={`text-[14px] font-bold ${showWechat ? "text-[#1f2933] select-all cursor-text" : "text-[#2f9e6d]"}`}
                    >
                      {showWechat ? seller.wechat : "点击查看"}
                    </span>
                  </button>
                )}
                {seller.phone && (
                  <button
                    onClick={() => setShowPhone(true)}
                    className="w-full flex items-center justify-between bg-white rounded-xl px-3 py-2 border border-[rgba(47,158,109,0.1)] hover:border-[#2f9e6d]/30 transition-colors"
                  >
                    <span className="text-[13px] text-[#5a6b73] flex items-center gap-1.5">
                      <span className="text-base grayscale opacity-70">📱</span>{" "}
                      手机号
                    </span>
                    <span
                      className={`text-[14px] font-bold ${showPhone ? "text-[#1f2933] select-all cursor-text" : "text-[#2f9e6d]"}`}
                    >
                      {showPhone ? seller.phone : "点击查看"}
                    </span>
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="space-y-6">
            <section>
              <h2 className="text-base font-bold text-[#1f2933] mb-3">
                转租参数
              </h2>
              <div className="flex flex-wrap gap-3">
                <div className="bg-[#f3fbf7] px-4 py-2 rounded-xl">
                  <span className="text-xs text-[#5a6b73] block mb-1">
                    起租日期
                  </span>
                  <span className="text-sm font-bold text-[#2f9e6d]">
                    {sublet.moveInDate || "随时入住"}
                  </span>
                </div>
                <div className="bg-[#f3fbf7] px-4 py-2 rounded-xl">
                  <span className="text-xs text-[#5a6b73] block mb-1">
                    租期要求
                  </span>
                  <span className="text-sm font-bold text-[#2f9e6d]">
                    {sublet.leaseTerms?.join(", ") || "不限"}
                  </span>
                </div>
                <div className="bg-[#f3fbf7] px-4 py-2 rounded-xl">
                  <span className="text-xs text-[#5a6b73] block mb-1">
                    家具情况
                  </span>
                  <span className="text-sm font-bold text-[#2f9e6d]">
                    {sublet.furnished ? "带家具" : "不带家具"}
                  </span>
                </div>
                <div className="bg-[#f3fbf7] px-4 py-2 rounded-xl">
                  <span className="text-xs text-[#5a6b73] block mb-1">
                    水电情况
                  </span>
                  <span className="text-sm font-bold text-[#2f9e6d]">
                    {sublet.utilitiesIncluded ? "包水电" : "不包水电"}
                  </span>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-base font-bold text-[#1f2933] mb-3">
                详细信息
              </h2>
              <p className="text-[15px] text-[#5a6b73] leading-relaxed whitespace-pre-wrap">
                {sublet.description}
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-[#1f2933] mb-3">
                地理位置
              </h2>
              {sublet.locationData ? (
                <div className="w-full relative z-0">
                  <LocationPicker value={sublet.locationData} readOnly={true} />
                </div>
              ) : (
                <div className="w-full bg-gray-50 p-4 rounded-xl border border-[rgba(31,41,51,0.08)] flex items-start gap-3">
                  <span className="text-xl">📍</span>
                  <p className="text-[14px] text-[#1f2933]">{sublet.address}</p>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 md:left-16 right-0 bg-white border-t border-[rgba(31,41,51,0.08)] z-50">
        <div className="md:max-w-4xl mx-auto px-5 py-3 md:px-8 md:py-4 flex items-center justify-center">
          {user?.uid !== sublet.sellerId ? (
            <div className="w-full flex gap-3">
              <button
                onClick={() => handleAction("contact")}
                className="flex-1 bg-white border-2 border-[#2f9e6d] text-[#2f9e6d] font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-colors hover:bg-[#f3fbf7]"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                联系卖家
              </button>
              <button
                onClick={() => handleAction("request_reserve")}
                className="flex-1 bg-[#2f9e6d] hover:bg-[#267a56] text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-colors shadow-md shadow-[#2f9e6d]/20"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                申请预订
              </button>
            </div>
          ) : (
            <button
              onClick={() => router.push("/profile/listings")}
              className="w-full bg-gray-100 hover:bg-gray-200 text-[#5a6b73] font-medium py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-colors"
            >
              管理我的发布
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
