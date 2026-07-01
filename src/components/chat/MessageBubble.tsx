"use client";

import { useState } from "react";
import { MessageDocument } from "@/lib/firebase/firestore";
import ImageLightbox from "@/components/ui/ImageLightbox";
import TransactionRequestCard from "./TransactionRequestCard";
import TransactionStatusCard from "./TransactionStatusCard";
import BargainOfferCard from "./BargainOfferCard";
import { formatCallMessageForViewer } from "@/lib/calls/messages";
import { formatPhoneForDisplay } from "@/lib/phone/validatePhone";

type Props = {
  msg: MessageDocument;
  isMe: boolean;
  isSeller: boolean;
  canActOnRequests: boolean;
  itemType: "item" | "sublet";
  isRequestResolved: boolean;
  onAcceptReserve: () => void;
  onConfirmSold: () => void;
  onDecline: () => void;
  onAcceptBargain?: (offerPrice: number) => void;
  onCounterBargain?: () => void;
  onDeclineBargain?: () => void;
  canActOnBargain?: boolean;
  onReview?: () => void;
  onConfirmPickup?: (msgId: string) => void;
  onCopy?: (label: string) => void;
  acting?: boolean;
};

function formatTime(createdAt: MessageDocument["createdAt"]) {
  if (!createdAt?.seconds) return "";
  return new Date(createdAt.seconds * 1000).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

function CopyButton({
  text,
  label,
  onCopy,
}: {
  text: string;
  label: string;
  onCopy?: (label: string) => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      onCopy?.(label);
      setTimeout(() => setCopied(false), 2000);
    } else {
      onCopy?.("复制失败，请长按手动复制");
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all shrink-0 ${
        copied
          ? "bg-[#2f9e6d] text-white scale-95"
          : "text-[#2f9e6d] bg-[#f3fbf7] hover:bg-[#e8f5ee] active:scale-95"
      }`}
    >
      {copied ? "已复制 ✓" : "复制"}
    </button>
  );
}

export default function MessageBubble({
  msg,
  isMe,
  isSeller,
  canActOnRequests,
  itemType,
  isRequestResolved,
  onAcceptReserve,
  onConfirmSold,
  onDecline,
  onAcceptBargain,
  onCounterBargain,
  onDeclineBargain,
  canActOnBargain = true,
  onReview,
  onConfirmPickup,
  onCopy,
  acting,
}: Props) {
  const [imageExpanded, setImageExpanded] = useState(false);
  const timeStr = formatTime(msg.createdAt);

  if (msg.msgType === "request_reserve" || msg.msgType === "request_buy") {
    return (
      <div
        className={`flex flex-col max-w-[85%] md:max-w-[75%] self-start items-start`}
      >
        <span className="text-[10px] text-[#5a6b73] px-1">{timeStr}</span>
        <TransactionRequestCard
          msg={msg}
          isSeller={isSeller}
          canAct={canActOnRequests}
          itemType={itemType}
          isResolved={isRequestResolved}
          onAcceptReserve={onAcceptReserve}
          onConfirmSold={onConfirmSold}
          onDecline={onDecline}
          acting={acting}
        />
      </div>
    );
  }

  if (msg.msgType === "bargain_offer") {
    return (
      <div className="flex flex-col max-w-[85%] md:max-w-[75%] self-start items-start">
        <span className="text-[10px] text-[#5a6b73] px-1">{timeStr}</span>
        <BargainOfferCard
          msg={msg}
          isMe={isMe}
          isSeller={isSeller}
          itemType={itemType}
          isResolved={isRequestResolved || !canActOnBargain}
          onAccept={(price) => onAcceptBargain?.(price)}
          onCounter={() => onCounterBargain?.()}
          onDecline={() => onDeclineBargain?.()}
          acting={acting}
        />
      </div>
    );
  }

  if (
    msg.msgType === "action_sold" ||
    msg.msgType === "action_reserved" ||
    msg.msgType === "action_declined"
  ) {
    return (
      <div className="flex flex-col w-full max-w-[85%] md:max-w-[75%] self-center items-center">
        <span className="text-[10px] text-[#5a6b73] mb-1 px-1">{timeStr}</span>
        <TransactionStatusCard
          msg={msg}
          isMe={isMe}
          itemType={itemType}
          onReview={onReview}
        />
      </div>
    );
  }

  if (msg.msgType === "image" && msg.imageUrl) {
    return (
      <div
        className={`flex flex-col max-w-[85%] md:max-w-[75%] ${isMe ? "self-end items-end" : "self-start items-start"}`}
      >
        <span className="text-[10px] text-[#5a6b73] mb-1 px-1">{timeStr}</span>
        <button
          type="button"
          onClick={() => setImageExpanded(true)}
          className="rounded-2xl overflow-hidden shadow-sm border border-[rgba(31,41,51,0.08)]"
        >
          <img
            src={msg.imageUrl}
            alt="图片"
            className="max-w-[240px] max-h-[240px] object-contain bg-gray-100"
          />
        </button>
        {msg.text && (
          <p className="text-[13px] text-[#5a6b73] mt-1 px-1">{msg.text}</p>
        )}
        {imageExpanded && (
          <ImageLightbox
            src={msg.imageUrl}
            alt="图片"
            onClose={() => setImageExpanded(false)}
          />
        )}
      </div>
    );
  }

  if (msg.msgType === "pickup_time" && msg.metadata) {
    const { date, timeSlot, note, pickupConfirmed } = msg.metadata;
    return (
      <div
        className={`flex flex-col max-w-[85%] md:max-w-[75%] ${isMe ? "self-end items-end" : "self-start items-start"}`}
      >
        <span className="text-[10px] text-[#5a6b73] mb-1 px-1">{timeStr}</span>
        <div className="w-full bg-blue-50 border border-blue-100 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">📅</span>
            <p className="font-bold text-[#1f2933] text-[14px]">取货时间约定</p>
          </div>
          <p className="text-[14px] font-semibold text-[#1f2933]">
            {date} · {timeSlot}
          </p>
          {note && (
            <p className="text-[13px] text-[#5a6b73] mt-1">备注：{note}</p>
          )}
          {pickupConfirmed ? (
            <p className="text-[12px] text-[#2f9e6d] font-bold mt-2">
              ✓ 已确认
            </p>
          ) : (
            !isMe &&
            onConfirmPickup &&
            msg.id && (
              <button
                onClick={() => onConfirmPickup(msg.id!)}
                className="mt-3 w-full py-2 bg-[#2f9e6d] text-white text-[13px] font-bold rounded-xl hover:bg-[#267a56] transition-colors"
              >
                确认时间
              </button>
            )
          )}
        </div>
      </div>
    );
  }

  if (msg.msgType === "contact_share" && msg.metadata) {
    const { phone, wechat } = msg.metadata;
    return (
      <div
        className={`flex flex-col max-w-[85%] md:max-w-[75%] ${isMe ? "self-end items-end" : "self-start items-start"}`}
      >
        <span className="text-[10px] text-[#5a6b73] mb-1 px-1">{timeStr}</span>
        <div className="w-full bg-white border border-[rgba(31,41,51,0.08)] rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">📇</span>
            <p className="font-bold text-[#1f2933] text-[14px]">联系方式</p>
          </div>
          {wechat && (
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[13px] text-[#5a6b73] min-w-0 truncate">
                微信：
                <span className="font-medium text-[#1f2933]">{wechat}</span>
              </span>
              <CopyButton text={wechat} label="微信号已复制" onCopy={onCopy} />
            </div>
          )}
          {phone && (
            <div className="flex items-center justify-between gap-2">
              <span className="text-[13px] text-[#5a6b73] min-w-0 truncate">
                电话：
                <span className="font-medium text-[#1f2933]">
                  {formatPhoneForDisplay(phone)}
                </span>
              </span>
              <CopyButton text={phone} label="电话已复制" onCopy={onCopy} />
            </div>
          )}
          <p className="text-[10px] text-[#5a6b73] mt-3">仅在此对话中可见</p>
        </div>
      </div>
    );
  }

  if (
    msg.msgType === "call_invite" ||
    msg.msgType === "call_ended" ||
    msg.msgType === "call_missed" ||
    msg.msgType === "call_declined" ||
    msg.msgType === "call_cancelled"
  ) {
    const callText = formatCallMessageForViewer(msg.msgType, isMe, {
      durationSec: msg.metadata?.callDurationSec,
    });
    const icon =
      msg.msgType === "call_invite"
        ? "📞"
        : msg.msgType === "call_ended"
          ? "✅"
          : msg.msgType === "call_missed"
            ? "📵"
            : msg.msgType === "call_cancelled"
              ? "↩️"
              : "🚫";
    return (
      <div className="flex flex-col items-center w-full max-w-md mx-auto">
        <span className="text-[10px] text-[#5a6b73] mb-1">{timeStr}</span>
        <div className="bg-white/90 border border-[rgba(31,41,51,0.08)] rounded-full px-4 py-2 flex items-center gap-2 shadow-sm">
          <span>{icon}</span>
          <span className="text-[13px] text-[#5a6b73]">{callText}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col max-w-[85%] md:max-w-[75%] ${isMe ? "self-end items-end" : "self-start items-start"}`}
    >
      <span className="text-[10px] text-[#5a6b73] mb-1 px-1">{timeStr}</span>
      <div
        className={`px-4 py-2.5 rounded-2xl text-[15px] leading-relaxed shadow-sm ${
          isMe
            ? "bg-[#2f9e6d] text-white rounded-tr-sm"
            : "bg-white text-[#1f2933] border border-[rgba(31,41,51,0.05)] rounded-tl-sm"
        }`}
      >
        {msg.text}
      </div>
    </div>
  );
}
