"use client";

import { useRef } from "react";

type MoveInDateSelectorProps = {
  value: string;
  onChange: (value: string) => void;
};

function todayIsoDate(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDisplayDate(iso: string): string {
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return iso;
  const [, year, month, day] = match;
  return `${year}年${Number(month)}月${Number(day)}日`;
}

export default function MoveInDateSelector({
  value,
  onChange,
}: MoveInDateSelectorProps) {
  const dateInputRef = useRef<HTMLInputElement>(null);
  const isFlexible = value === "flexible";
  const isSpecific = !!value && value !== "flexible";

  const openDatePicker = () => {
    const input = dateInputRef.current;
    if (!input) return;
    try {
      input.showPicker?.();
    } catch {
      input.focus();
      input.click();
    }
  };

  const selectFlexible = () => onChange("flexible");

  const selectSpecific = () => {
    if (!isSpecific) {
      onChange(todayIsoDate());
      requestAnimationFrame(() => openDatePicker());
      return;
    }
    openDatePicker();
  };

  return (
    <div className="flex flex-col gap-3 min-w-0 w-full">
      <button
        type="button"
        onClick={selectFlexible}
        className={`w-full min-w-0 p-4 rounded-xl border bg-white text-left transition-colors ${
          isFlexible
            ? "border-[#2f9e6d] ring-1 ring-[#2f9e6d]"
            : "border-[rgba(31,41,51,0.08)] hover:border-[#2f9e6d]"
        }`}
      >
        <h3
          className={`font-bold mb-1 ${isFlexible ? "text-[#2f9e6d]" : "text-[#1f2933]"}`}
        >
          时间灵活
        </h3>
        <p
          className={`text-xs ${isFlexible ? "text-[#267a56]" : "text-[#5a6b73]"}`}
        >
          可与租客商量
        </p>
      </button>

      <div
        className={`w-full min-w-0 p-4 rounded-xl border bg-white transition-colors ${
          isSpecific
            ? "border-[#2f9e6d] ring-1 ring-[#2f9e6d]"
            : "border-[rgba(31,41,51,0.08)]"
        }`}
      >
        <button
          type="button"
          onClick={selectSpecific}
          className="w-full min-w-0 text-left"
        >
          <h3
            className={`font-bold mb-1 ${isSpecific ? "text-[#2f9e6d]" : "text-[#1f2933]"}`}
          >
            具体日期
          </h3>
          <p
            className={`text-xs ${isSpecific ? "text-[#267a56]" : "text-[#5a6b73]"}`}
          >
            {isSpecific ? "点击下方日期可修改" : "选择具体的入住时间"}
          </p>
        </button>

        {isSpecific && (
          <label className="relative mt-3 block w-full min-w-0 cursor-pointer">
            <div className="flex items-center justify-between gap-3 rounded-xl border border-[rgba(31,41,51,0.12)] bg-[#f8faf9] px-3 py-3 min-w-0">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] text-[#5a6b73] mb-0.5">入住日期</p>
                <p className="text-[15px] font-semibold text-[#1f2933] truncate">
                  {formatDisplayDate(value)}
                </p>
              </div>
              <span className="shrink-0 text-xs font-bold text-[#2f9e6d] px-2.5 py-1 rounded-lg bg-[#e6f4ed]">
                选择
              </span>
            </div>
            {/* 隐藏原生日期框，避免手机上英文日期撑破布局 */}
            <input
              ref={dateInputRef}
              type="date"
              value={value}
              min={todayIsoDate()}
              onChange={(e) => onChange(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              aria-label="选择入住日期"
            />
          </label>
        )}
      </div>
    </div>
  );
}
