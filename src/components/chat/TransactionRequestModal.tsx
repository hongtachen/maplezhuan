"use client";

import { useState } from "react";
import AppModal from "@/components/ui/AppModal";
import {
  getDefaultRequestMessage,
  getRequestModalTitle,
  type TransactionRequestType,
} from "@/lib/transactionRequest";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (message: string) => void;
  requestType: TransactionRequestType;
  listingType: "item" | "sublet";
  loading?: boolean;
};

const MAX_MESSAGE_LENGTH = 500;

export default function TransactionRequestModal({
  open,
  onClose,
  onSubmit,
  requestType,
  listingType,
  loading = false,
}: Props) {
  const [message, setMessage] = useState(() =>
    getDefaultRequestMessage(listingType, requestType),
  );
  const [error, setError] = useState("");

  const handleClose = () => {
    setError("");
    onClose();
  };

  const handleSubmit = () => {
    const trimmed = message.trim();
    if (!trimmed) {
      setError("请填写留言");
      return;
    }
    if (trimmed.length > MAX_MESSAGE_LENGTH) {
      setError(`留言不能超过 ${MAX_MESSAGE_LENGTH} 字`);
      return;
    }
    onSubmit(trimmed);
  };

  const title = getRequestModalTitle(listingType, requestType);

  return (
    <AppModal open={open} onClose={handleClose} maxWidth="max-w-[400px]">
      <div className="p-6">
        <h2 className="text-lg font-bold text-[#1f2933] mb-1">{title}</h2>
        <p className="text-sm text-[#5a6b73] mb-5">
          给卖家留言，可直接使用默认内容或自行修改
        </p>
        <label className="block text-sm font-bold text-[#1f2933] mb-2">
          留言
        </label>
        <textarea
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            setError("");
          }}
          rows={4}
          maxLength={MAX_MESSAGE_LENGTH}
          className="w-full px-4 py-3 rounded-xl border border-[rgba(31,41,51,0.12)] focus:border-[#2f9e6d] focus:ring-1 focus:ring-[#2f9e6d] outline-none text-[15px] resize-none leading-relaxed"
          autoFocus
        />
        {error && (
          <p className="text-sm text-red-500 mt-2 font-medium">{error}</p>
        )}
        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="flex-1 py-3 rounded-xl border border-[rgba(31,41,51,0.12)] text-[#5a6b73] font-bold text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-3 rounded-xl bg-[#2f9e6d] hover:bg-[#267a56] text-white font-bold text-sm transition-colors disabled:opacity-50"
          >
            {loading ? "发送中..." : "发送申请"}
          </button>
        </div>
      </div>
    </AppModal>
  );
}
