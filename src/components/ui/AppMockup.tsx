"use client";

import { useState } from "react";
import Image from "next/image";
import { useItems, useSublets } from "@/hooks/useListings";
import { useApp } from "@/components/app/AppContext";
import { doc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

/* Bottom nav items — mirrors BottomNav.tsx */
const NAV_ITEMS = [
  {
    label: "浏览",
    icon: (
      <svg
        className="w-5 h-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
    active: true,
  },
  {
    label: "消息",
    icon: (
      <svg
        className="w-5 h-5"
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
    ),
    badge: 10,
  },
  { label: "发布", publish: true },
  {
    label: "收藏",
    icon: (
      <svg
        className="w-5 h-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    ),
  },
  {
    label: "我的",
    icon: (
      <svg
        className="w-5 h-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    ),
  },
];

export default function AppMockup() {
  const [activeTab, setActiveTab] = useState<"item" | "sublet">("item");
  const { items, loading: itemsLoading } = useItems();
  const { sublets, loading: subletsLoading } = useSublets();
  const { isFavorite, toggleFavorite } = useApp();

  const listings =
    activeTab === "item"
      ? items.slice(0, 4).map((i) => ({
          id: i.id ?? "",
          type: "item" as const,
          title: i.title,
          price: i.price,
          location: i.location,
          condition: i.condition,
          image: i.images?.[0],
          status:
            i.status === "在售"
              ? "在售"
              : i.status === "已预留"
                ? "已预留"
                : "已售出",
        }))
      : sublets.slice(0, 4).map((s) => ({
          id: s.id ?? "",
          type: "sublet" as const,
          title: s.title || s.propertyType,
          price: s.price,
          location: s.address,
          condition: undefined,
          image: s.images?.[0],
          status:
            s.status === "招租中"
              ? "招租中"
              : s.status === "已预留"
                ? "已预留"
                : "已租出",
        }));

  const loading = activeTab === "item" ? itemsLoading : subletsLoading;

  const statusLabel = activeTab === "item" ? "正在出售" : "正在招租";
  const statusBgClass = (status: string) => {
    if (["在售", "招租中"].includes(status)) return "bg-[#2f9e6d]";
    if (["已预留"].includes(status)) return "bg-amber-400";
    return "bg-gray-400";
  };

  return (
    /* Outer dark phone shell */
    <div className="bg-[#1f2933] rounded-[40px] p-3 shadow-[0px_25px_25px_rgba(0,0,0,0.25)] w-[270px] shrink-0">
      {/* Inner screen */}
      <div className="bg-[#f3fbf7] rounded-[30px] overflow-hidden h-[560px] flex flex-col">
        {/* ── Tab toggle ── */}
        <div className="flex items-center justify-center pt-5 px-4 pb-3">
          <div className="flex items-center bg-white rounded-full p-0.5 border border-[rgba(31,41,51,0.08)] shadow-sm">
            <button
              onClick={() => setActiveTab("item")}
              className={`px-4 py-1.5 rounded-full text-[11px] font-medium transition-colors ${
                activeTab === "item"
                  ? "bg-[#f3fbf7] text-[#2f9e6d] shadow-sm"
                  : "text-[#5a6b73]"
              }`}
            >
              🏷️ 闲置
            </button>
            <button
              onClick={() => setActiveTab("sublet")}
              className={`px-4 py-1.5 rounded-full text-[11px] font-medium transition-colors ${
                activeTab === "sublet"
                  ? "bg-indigo-50 text-indigo-600 shadow-sm"
                  : "text-[#5a6b73]"
              }`}
            >
              🏠 转租
            </button>
          </div>
        </div>

        {/* ── Search bar ── */}
        <div className="flex items-center gap-2 px-4 pb-3">
          <div className="flex-1 flex items-center bg-white rounded-xl px-3 py-2 border border-[rgba(31,41,51,0.08)] shadow-sm gap-2">
            <svg
              className="w-3.5 h-3.5 text-[#5a6b73] shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <circle cx="11" cy="11" r="8" />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35"
              />
            </svg>
            <span className="text-[#5a6b73] text-[10px] truncate">
              搜索物品名称...
            </span>
          </div>
          <div className="w-8 h-8 shrink-0 flex items-center justify-center rounded-xl bg-white border border-[rgba(31,41,51,0.08)] shadow-sm">
            <svg
              className="w-3.5 h-3.5 text-[#1f2933]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </div>
        </div>

        {/* ── Section heading ── */}
        <div className="flex items-center justify-between px-4 pb-2">
          <span className="text-[11px] font-bold text-[#1f2933]">
            {statusLabel}
          </span>
          <span className="text-[10px] text-[#5a6b73]">
            共 {listings.length} 条结果
          </span>
        </div>

        {/* ── Listings grid ── */}
        <div className="flex-1 overflow-hidden px-4 pb-2">
          {loading ? (
            <div className="grid grid-cols-2 gap-2 h-full">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl bg-gray-100 animate-pulse h-[140px]"
                />
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-[#5a6b73]">
              <div className="text-3xl mb-2 opacity-40">🔍</div>
              <p className="text-[10px]">暂无上架商品</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {listings.map((listing) => {
                const favorited = isFavorite(listing.id);
                return (
                  <div
                    key={listing.id}
                    className="rounded-2xl border border-[rgba(31,41,51,0.06)] overflow-hidden bg-white flex flex-col"
                  >
                    {/* Card image */}
                    <div className="relative h-[90px] bg-gray-100">
                      {listing.image ? (
                        <div className="relative h-[90px] bg-gray-100">
                          <Image
                            src={listing.image}
                            alt={listing.title}
                            fill
                            className="object-contain"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div
                          className="w-full h-full"
                          style={{
                            background:
                              "linear-gradient(135deg, rgba(47,158,109,0.18), rgba(31,122,85,0.28))",
                          }}
                        />
                      )}

                      {/* Heart button */}
                      <button
                        onClick={async (e) => {
                          e.preventDefault();
                          const adding = !favorited;
                          toggleFavorite(listing.id, listing.type);
                          try {
                            const col =
                              listing.type === "item" ? "items" : "sublets";
                            await updateDoc(doc(db, col, listing.id), {
                              favorites: increment(adding ? 1 : -1),
                            });
                          } catch {
                            /* silent */
                          }
                        }}
                        className="absolute top-1.5 right-1.5 w-6 h-6 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-sm"
                      >
                        {favorited ? (
                          <svg
                            className="w-3 h-3 text-rose-500"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                          </svg>
                        ) : (
                          <svg
                            className="w-3 h-3 text-[#1f2933]/60"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={1.8}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                            />
                          </svg>
                        )}
                      </button>

                      {/* Status badge */}
                      <div className="absolute bottom-1.5 left-1.5">
                        <span
                          className={`text-white text-[8px] font-medium px-1.5 py-0.5 rounded-md ${statusBgClass(listing.status)}`}
                        >
                          {listing.status}
                        </span>
                      </div>
                    </div>

                    {/* Card body */}
                    <div className="px-2 py-1.5 flex flex-col gap-0.5">
                      <div className="flex items-start justify-between gap-1">
                        <p className="text-[10px] font-medium text-[#1f2933] line-clamp-1 flex-1 leading-tight">
                          {listing.title}
                        </p>
                        <div className="flex items-center gap-0.5 shrink-0">
                          <svg
                            className="w-2.5 h-2.5 text-[#1f2933] fill-[#1f2933]"
                            viewBox="0 0 20 20"
                          >
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                          </svg>
                          <span className="text-[9px] text-[#1f2933]">5.0</span>
                        </div>
                      </div>
                      {listing.condition && (
                        <p className="text-[9px] text-[#5a6b73] leading-tight">
                          {listing.condition}
                        </p>
                      )}
                      <p className="text-[10px] font-semibold text-[#1f2933] mt-0.5">
                        ${listing.price}{" "}
                        <span className="font-normal text-[#5a6b73] text-[9px]">
                          CAD{listing.type === "sublet" ? "/月" : ""}
                        </span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Bottom nav ── */}
        <div className="mt-auto border-t border-[rgba(31,41,51,0.06)] bg-white flex items-center justify-around px-2 py-2">
          {NAV_ITEMS.map((item) =>
            item.publish ? (
              <div
                key="publish"
                className="w-10 h-10 rounded-full bg-[#2f9e6d] flex items-center justify-center shadow-md"
              >
                <svg
                  className="w-4 h-4 text-white"
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
              </div>
            ) : (
              <div
                key={item.label}
                className="relative flex flex-col items-center gap-0.5"
              >
                <div
                  className={item.active ? "text-[#2f9e6d]" : "text-[#5a6b73]"}
                >
                  {item.icon}
                </div>
                {item.badge && (
                  <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 text-[7px] font-bold bg-rose-500 text-white rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
                <span
                  className={`text-[8px] ${item.active ? "text-[#2f9e6d] font-bold" : "text-[#5a6b73]"}`}
                >
                  {item.label}
                </span>
              </div>
            ),
          )}
        </div>
      </div>
    </div>
  );
}
