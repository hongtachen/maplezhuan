"use client";

import { MessageDocument } from "@/lib/firebase/firestore";
import type { ItemType } from "@/lib/firebase/transactions";
import { formatOfferPrice } from "@/lib/bargain";

type Props = {
  msg: MessageDocument;
  isMe: boolean;
  isSeller: boolean;
  itemType: ItemType;
  isResolved: boolean;
  onAccept: (offerPrice: number) => void;
  onCounter: () => void;
  onDecline: () => void;
  acting?: boolean;
};

export default function BargainOfferCard({
  msg,
  isMe,
  isSeller,
  itemType,
  isResolved,
  onAccept,
  onCounter,
  onDecline,
  acting,
}: Props) {
  const offerPrice = msg.metadata?.offerPrice ?? 0;
  const formatted = formatOfferPrice(offerPrice, itemType);
  const isRecipient = !isMe;

  const partyLabel = isMe
    ? "我的出价"
    : isSeller
      ? itemType === "sublet"
        ? "租客出价"
        : "买家出价"
      : itemType === "sublet"
        ? "房东还价"
        : "卖家还价";

  if (isResolved) {
    return (
      <div className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 shadow-sm mb-1 mt-2 opacity-70">
        <p className="font-bold text-gray-500 text-[14px] mb-1">
          议价 · 已处理
        </p>
        <p className="text-[13px] text-[#5a6b73] leading-relaxed">
          {partyLabel} {formatted}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#f8fafc] border border-[rgba(31,41,51,0.08)] rounded-2xl p-4 shadow-sm mb-1 mt-2">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">💬</span>
        <p className="font-bold text-[#1f2933] text-[14px]">
          议价 · {partyLabel}
        </p>
      </div>
      <p className="text-xl font-bold text-[#2f9e6d] mb-1">{formatted}</p>
      <p className="text-[13px] text-[#5a6b73] mb-3 leading-relaxed">
        {msg.text}
      </p>

      {isRecipient ? (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onAccept(offerPrice)}
            disabled={acting}
            className="flex-1 min-w-[100px] px-3.5 py-2 bg-[#2f9e6d] text-white text-[13px] font-bold rounded-xl hover:bg-[#267a56] transition-colors disabled:opacity-50"
          >
            同意此价
          </button>
          <button
            type="button"
            onClick={onCounter}
            disabled={acting}
            className="flex-1 min-w-[100px] px-3.5 py-2 bg-white text-[#2f9e6d] text-[13px] font-bold rounded-xl border border-[#2f9e6d] hover:bg-[#f3fbf7] transition-colors disabled:opacity-50"
          >
            还价
          </button>
          <button
            type="button"
            onClick={onDecline}
            disabled={acting}
            className="px-3.5 py-2 bg-white text-[#5a6b73] text-[13px] font-bold rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            拒绝
          </button>
        </div>
      ) : (
        <p className="text-[12px] text-orange-500 font-medium">
          等待对方回复...
        </p>
      )}
    </div>
  );
}
