"use client";

import Link from "next/link";
import { ItemDocument, SubletDocument } from "@/lib/firebase/firestore";

type Props = {
  itemId: string;
  itemTitle: string;
  item: ItemDocument | SubletDocument | null;
  itemType: "item" | "sublet" | null;
};

const statusColors: Record<string, string> = {
  在售: "bg-[#f3fbf7] text-[#2f9e6d]",
  招租中: "bg-[#f3fbf7] text-[#2f9e6d]",
  已预留: "bg-orange-50 text-orange-600",
  已售出: "bg-gray-100 text-gray-500",
  已租出: "bg-gray-100 text-gray-500",
};

export default function ChatItemBar({
  itemId,
  itemTitle,
  item,
  itemType,
}: Props) {
  const href =
    itemType === "sublet" ? `/sublet/${itemId}` : `/listing/${itemId}`;
  const emoji = itemType === "sublet" ? "🏠" : "📦";
  const status = item?.status;

  return (
    <Link
      href={href}
      className="bg-gray-50 px-4 py-2.5 border-t border-[rgba(31,41,51,0.04)] flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors"
    >
      <div className="flex items-center gap-3 min-w-0">
        {item && "images" in item && item.images?.[0] ? (
          <img
            src={item.images[0]}
            alt=""
            className="w-10 h-10 rounded-lg object-cover shrink-0"
          />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#a1e8c7] to-[#7bcfa9] flex items-center justify-center shrink-0">
            <span className="text-xl">{emoji}</span>
          </div>
        )}
        <div className="min-w-0">
          <p className="text-[13px] font-bold text-[#1f2933] truncate max-w-[200px]">
            {itemTitle || "相关商品"}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            {item && (
              <p className="text-[12px] text-[#2f9e6d] font-bold">
                ${item.price} CAD
              </p>
            )}
            {status && (
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${statusColors[status] || "bg-gray-100 text-gray-500"}`}
              >
                {status}
              </span>
            )}
          </div>
        </div>
      </div>
      <svg
        className="w-4 h-4 text-[#5a6b73] shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
}
