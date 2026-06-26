"use client";

import { useRef } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onSendImage: (files: FileList) => void;
  onPickupTime: () => void;
  onShareContact: () => void;
  onPickupBlocked?: () => void;
  canSchedulePickup?: boolean;
  uploading?: boolean;
};

const actions = [
  { id: "image", label: "发送图片", sublabel: "最多 3 个文件一次", icon: "🖼️" },
  {
    id: "pickup",
    label: "约定取货时间",
    sublabel: "预留/成交后可用",
    icon: "📅",
  },
  { id: "contact", label: "分享联系方式", sublabel: "微信 / 电话", icon: "📇" },
] as const;

export default function ChatActionSheet({
  open,
  onClose,
  onSendImage,
  onPickupTime,
  onShareContact,
  onPickupBlocked,
  canSchedulePickup = false,
  uploading,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const handleAction = (id: string) => {
    if (id === "image") {
      fileRef.current?.click();
      return;
    }
    if (id === "pickup") {
      if (!canSchedulePickup) {
        onPickupBlocked?.();
        return;
      }
      onPickupTime();
      onClose();
      return;
    }
    if (id === "contact") {
      onShareContact();
      onClose();
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute bottom-full left-0 right-0 mb-2 px-4 z-50">
        <div className="max-w-[800px] mx-auto bg-white rounded-2xl shadow-xl border border-[rgba(31,41,51,0.08)] p-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
          {uploading && (
            <p className="text-center text-[13px] text-[#5a6b73] mb-3">
              上传中...
            </p>
          )}
          <div className="grid grid-cols-3 gap-3">
            {actions.map((a) => {
              const locked = a.id === "pickup" && !canSchedulePickup;
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => !locked && handleAction(a.id)}
                  disabled={uploading || locked}
                  aria-disabled={locked}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-colors ${
                    locked
                      ? "opacity-45 cursor-not-allowed bg-gray-50"
                      : uploading
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-[#f3fbf7] active:scale-95"
                  }`}
                >
                  <span className={`text-2xl ${locked ? "grayscale" : ""}`}>
                    {a.icon}
                  </span>
                  <span
                    className={`text-[12px] font-bold text-center leading-tight ${locked ? "text-gray-400" : "text-[#1f2933]"}`}
                  >
                    {a.label}
                  </span>
                  <span
                    className={`text-[10px] text-center leading-tight ${locked ? "text-orange-500 font-medium" : "text-[#5a6b73]"}`}
                  >
                    {locked ? "🔒 需先确认交易" : a.sublabel}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) {
            onSendImage(e.target.files);
            onClose();
            e.target.value = "";
          }
        }}
      />
    </>
  );
}
