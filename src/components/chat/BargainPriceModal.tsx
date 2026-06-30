"use client";

import { useState } from "react";
import AppModal from "@/components/ui/AppModal";
import type { ItemType } from "@/lib/firebase/transactions";
import { isValidBargainOffer } from "@/lib/bargain";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (price: number) => void;
  itemType: ItemType;
  listPrice: number;
  loading?: boolean;
};

export default function BargainPriceModal({
  open,
  onClose,
  onSubmit,
  itemType,
  listPrice,
  loading = false,
}: Props) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  const handleClose = () => {
    setValue("");
    setError("");
    onClose();
  };

  const handleSubmit = () => {
    const price = Number(value);
    if (listPrice === 0) {
      setError("挂牌价为免费，请直接联系对方");
      return;
    }
    if (!isValidBargainOffer(price, listPrice)) {
      if (Number.isNaN(price) || price < 0) {
        setError("请输入有效的价格");
      } else {
        setError(
          listPrice > 0
            ? `出价须低于挂牌价 $${listPrice}${itemType === "sublet" ? "/月" : ""}`
            : "请输入有效的价格",
        );
      }
      return;
    }
    onSubmit(price);
    setValue("");
    setError("");
  };

  const unitLabel = itemType === "sublet" ? "CAD/月" : "CAD";
  const title = itemType === "sublet" ? "议价月租" : "议价出价";

  return (
    <AppModal open={open} onClose={handleClose} maxWidth="max-w-[360px]">
      <div className="p-6">
        <h2 className="text-lg font-bold text-[#1f2933] mb-1">{title}</h2>
        <p className="text-sm text-[#5a6b73] mb-5">
          挂牌价 ${listPrice} {unitLabel}
        </p>
        <label className="block text-sm font-bold text-[#1f2933] mb-2">
          您的出价 ({unitLabel})
        </label>
        <input
          type="number"
          min={0}
          step={1}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError("");
          }}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="0"
          className="w-full px-4 py-3 rounded-xl border border-[rgba(31,41,51,0.12)] focus:border-[#2f9e6d] focus:ring-1 focus:ring-[#2f9e6d] outline-none text-[15px]"
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
            {loading ? "发送中..." : "发送出价"}
          </button>
        </div>
      </div>
    </AppModal>
  );
}
