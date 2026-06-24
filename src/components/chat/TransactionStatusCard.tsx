"use client";

import { MessageDocument } from "@/lib/firebase/firestore";

type Props = {
  msg: MessageDocument;
  isMe: boolean;
  itemType: "item" | "sublet";
  onReview?: () => void;
};

export default function TransactionStatusCard({
  msg,
  isMe,
  itemType,
  onReview,
}: Props) {
  if (msg.msgType === "action_sold") {
    return (
      <div className="w-full bg-gradient-to-r from-[#f3fbf7] to-white border border-[#2f9e6d]/20 rounded-2xl p-4 shadow-sm mb-1 mt-2">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-[#2f9e6d]/10 flex items-center justify-center">
            <span className="text-lg">🎉</span>
          </div>
          <p className="font-bold text-[#1f2933] text-[15px]">交易达成！</p>
        </div>
        <p className="text-[13px] text-[#5a6b73] mb-3 leading-relaxed">
          {itemType === "sublet"
            ? "卖家已将房源标记为租给您。如果您对本次交易满意，请给卖家一个评价吧！"
            : "卖家已将商品标记为售给您。如果您对本次交易满意，请给卖家一个评价吧！"}
        </p>
        {!isMe && onReview && (
          <button
            onClick={onReview}
            className="w-full py-2 bg-[#2f9e6d] text-white text-[13px] font-bold rounded-xl shadow-sm hover:bg-[#267a56] transition-colors"
          >
            评价卖家
          </button>
        )}
      </div>
    );
  }

  if (msg.msgType === "action_reserved") {
    return (
      <div className="w-full bg-gradient-to-r from-orange-50 to-white border border-orange-200/60 rounded-2xl p-4 shadow-sm mb-1 mt-2">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
            <span className="text-lg">✓</span>
          </div>
          <p className="font-bold text-[#1f2933] text-[15px]">预留已确认</p>
        </div>
        <p className="text-[13px] text-[#5a6b73] leading-relaxed">{msg.text}</p>
      </div>
    );
  }

  if (msg.msgType === "action_declined") {
    return (
      <div className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 shadow-sm mb-1 mt-2">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">ℹ️</span>
          <p className="font-bold text-gray-600 text-[14px]">申请未通过</p>
        </div>
        <p className="text-[13px] text-[#5a6b73] leading-relaxed">{msg.text}</p>
      </div>
    );
  }

  return null;
}
