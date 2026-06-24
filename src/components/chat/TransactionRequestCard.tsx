"use client";

import { MessageDocument } from "@/lib/firebase/firestore";

type Props = {
  msg: MessageDocument;
  isSeller: boolean;
  canAct: boolean;
  itemType: "item" | "sublet";
  isResolved: boolean;
  onAcceptReserve: () => void;
  onConfirmSold: () => void;
  onDecline: () => void;
  acting?: boolean;
};

export default function TransactionRequestCard({
  msg,
  isSeller,
  canAct,
  itemType,
  isResolved,
  onAcceptReserve,
  onConfirmSold,
  onDecline,
  acting,
}: Props) {
  const isReserve = msg.msgType === "request_reserve";
  const soldLabel = itemType === "sublet" ? "确认租出" : "确认售出";

  if (isResolved) {
    return (
      <div className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 shadow-sm mb-1 mt-2 opacity-70">
        <p className="font-bold text-gray-500 text-[14px] mb-1">
          {isReserve ? "申请预留" : "申请购买"} · 已处理
        </p>
        <p className="text-[13px] text-[#5a6b73] leading-relaxed">{msg.text}</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#f8fafc] border border-[rgba(31,41,51,0.08)] rounded-2xl p-4 shadow-sm mb-1 mt-2">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{isReserve ? "⏳" : "🛒"}</span>
        <p className="font-bold text-[#1f2933] text-[14px]">
          {isReserve ? "申请预留" : "申请购买"}
        </p>
      </div>
      <p className="text-[13px] text-[#5a6b73] mb-3 leading-relaxed">
        {msg.text}
      </p>

      {isSeller && canAct ? (
        <div className="flex flex-wrap gap-2">
          {isReserve && (
            <button
              onClick={onAcceptReserve}
              disabled={acting}
              className="flex-1 min-w-[100px] px-3.5 py-2 bg-orange-50 text-orange-600 text-[13px] font-bold rounded-xl border border-orange-200 hover:bg-orange-100 transition-colors disabled:opacity-50"
            >
              同意预留
            </button>
          )}
          <button
            onClick={onConfirmSold}
            disabled={acting}
            className="flex-1 min-w-[100px] px-3.5 py-2 bg-[#2f9e6d] text-white text-[13px] font-bold rounded-xl hover:bg-[#267a56] transition-colors disabled:opacity-50"
          >
            {soldLabel}
          </button>
          <button
            onClick={onDecline}
            disabled={acting}
            className="px-3.5 py-2 bg-white text-[#5a6b73] text-[13px] font-bold rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            拒绝
          </button>
        </div>
      ) : !isSeller ? (
        <p className="text-[12px] text-orange-500 font-medium">
          等待卖家回复...
        </p>
      ) : null}
    </div>
  );
}
