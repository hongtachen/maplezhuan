"use client";

import { useState } from "react";

const TIME_SLOTS = [
  "上午 (9:00-12:00)",
  "下午 (12:00-17:00)",
  "晚上 (17:00-21:00)",
];

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (date: string, timeSlot: string, note: string) => void;
};

export default function PickupTimeSheet({ open, onClose, onSubmit }: Props) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDate = tomorrow.toISOString().split("T")[0];

  const [date, setDate] = useState(defaultDate);
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[1]);
  const [note, setNote] = useState("");

  if (!open) return null;

  const handleSubmit = () => {
    if (!date || !timeSlot) return;
    onSubmit(date, timeSlot, note);
    onClose();
    setNote("");
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl">
        <h2 className="text-lg font-bold text-[#1f2933] mb-4">约定取货时间</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-[13px] font-bold text-[#5a6b73] mb-1.5">
              日期
            </label>
            <input
              type="date"
              value={date}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-gray-50 border border-[rgba(31,41,51,0.08)] rounded-xl px-4 py-3 text-[15px] outline-none focus:border-[#2f9e6d]"
            />
          </div>

          <div>
            <label className="block text-[13px] font-bold text-[#5a6b73] mb-1.5">
              时间段
            </label>
            <div className="flex flex-col gap-2">
              {TIME_SLOTS.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setTimeSlot(slot)}
                  className={`px-4 py-2.5 rounded-xl text-[14px] font-medium text-left border transition-colors ${
                    timeSlot === slot
                      ? "bg-[#f3fbf7] border-[#2f9e6d] text-[#2f9e6d]"
                      : "bg-white border-gray-200 text-[#1f2933] hover:bg-gray-50"
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-bold text-[#5a6b73] mb-1.5">
              见面地点备注（选填）
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="例如：UW 南门、地铁站出口"
              className="w-full bg-gray-50 border border-[rgba(31,41,51,0.08)] rounded-xl px-4 py-3 text-[15px] outline-none focus:border-[#2f9e6d]"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-gray-100 text-[#5a6b73] font-bold rounded-xl hover:bg-gray-200 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            className="flex-[2] py-3 bg-[#2f9e6d] text-white font-bold rounded-xl hover:bg-[#267a56] transition-colors"
          >
            发送
          </button>
        </div>
      </div>
    </div>
  );
}
