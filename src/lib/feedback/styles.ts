import type { ToastType } from "@/components/ui/Toast";

export const FEEDBACK = {
  success: {
    bg: "bg-[#2f9e6d]",
    bgSoft: "bg-[#f3fbf7]",
    text: "text-[#2f9e6d]",
    border: "border-[#2f9e6d]/20",
    ring: "ring-[#2f9e6d]/20",
  },
  error: {
    bg: "bg-rose-500",
    bgSoft: "bg-rose-50",
    text: "text-rose-500",
    border: "border-rose-200",
    ring: "ring-rose-200",
  },
  warning: {
    bg: "bg-amber-500",
    bgSoft: "bg-amber-50",
    text: "text-amber-600",
    border: "border-amber-200",
    ring: "ring-amber-200",
  },
  info: {
    bg: "bg-[#1f2933]",
    bgSoft: "bg-gray-50",
    text: "text-[#1f2933]",
    border: "border-[rgba(31,41,51,0.08)]",
    ring: "ring-gray-200",
  },
} as const;

export const TOAST_DURATION: Record<ToastType, number> = {
  success: 2800,
  error: 4200,
  info: 3200,
  warning: 3800,
};

export const modalBackdrop =
  "fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#1f2933]/40 backdrop-blur-sm animate-in fade-in duration-200";

export const modalPanel =
  "relative w-full bg-white rounded-[24px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200";

export const btnPrimary =
  "py-3 text-[14px] font-bold text-white bg-[#2f9e6d] hover:bg-[#267a56] rounded-xl transition-colors active:scale-[0.98]";

export const btnSecondary =
  "py-3 text-[14px] font-bold text-[#5a6b73] bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors active:scale-[0.98]";

export const btnDanger =
  "py-3 text-[14px] font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-xl transition-colors active:scale-[0.98]";

/** Inline form / field validation messages (pair with FEEDBACK[type].text) */
export const inlineFeedback =
  "text-[13px] leading-relaxed flex items-start gap-1.5";
