"use client";

import { useState, useEffect } from "react";
import ChatActionSheet from "./ChatActionSheet";
import PickupTimeSheet from "./PickupTimeSheet";

type Props = {
  inputText: string;
  onInputChange: (v: string) => void;
  onSend: () => void;
  onSendImage: (files: FileList) => void;
  onSendPickupTime: (date: string, timeSlot: string, note: string) => void;
  onShareContact: () => void;
  onPickupBlocked?: () => void;
  canSchedulePickup?: boolean;
  uploading?: boolean;
};

export default function ChatInputBar({
  inputText,
  onInputChange,
  onSend,
  onSendImage,
  onSendPickupTime,
  onShareContact,
  onPickupBlocked,
  canSchedulePickup = false,
  uploading,
}: Props) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [pickupOpen, setPickupOpen] = useState(false);

  // Close pickup sheet if transaction status no longer allows scheduling
  useEffect(() => {
    if (!canSchedulePickup && pickupOpen) {
      setPickupOpen(false);
    }
  }, [canSchedulePickup, pickupOpen]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") onSend();
  };

  const openPickupSheet = () => {
    if (!canSchedulePickup) {
      onPickupBlocked?.();
      return;
    }
    setPickupOpen(true);
  };

  return (
    <>
      <div className="relative bg-white border-t border-[rgba(31,41,51,0.08)] px-4 py-3 pb-8 md:pb-4 shrink-0">
        <ChatActionSheet
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          onSendImage={onSendImage}
          onPickupTime={openPickupSheet}
          onShareContact={onShareContact}
          onPickupBlocked={onPickupBlocked}
          canSchedulePickup={canSchedulePickup}
          uploading={uploading}
        />
        <div className="max-w-[800px] mx-auto flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSheetOpen(!sheetOpen)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors shrink-0 ${
              sheetOpen
                ? "bg-[#2f9e6d] text-white"
                : "bg-gray-50 hover:bg-gray-100 text-[#1f2933]"
            }`}
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
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>

          <div className="flex-1 bg-gray-50 rounded-full flex items-center px-4 py-2 border border-[rgba(31,41,51,0.04)] focus-within:border-[#2f9e6d] transition-colors">
            <input
              type="text"
              placeholder="发送消息..."
              value={inputText}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent outline-none text-[15px] text-[#1f2933]"
            />
          </div>

          <button
            type="button"
            onClick={onSend}
            disabled={!inputText.trim()}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors shrink-0 ${
              inputText.trim()
                ? "bg-[#2f9e6d] text-white shadow-md"
                : "bg-gray-100 text-gray-400"
            }`}
          >
            <svg
              className="w-4 h-4 ml-0.5"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
      </div>

      {canSchedulePickup && (
        <PickupTimeSheet
          open={pickupOpen}
          onClose={() => setPickupOpen(false)}
          onSubmit={onSendPickupTime}
        />
      )}
    </>
  );
}
