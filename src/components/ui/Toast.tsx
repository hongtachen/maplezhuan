"use client";

import { useEffect, useState } from "react";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    requestAnimationFrame(() => {
      setIsVisible(true);
    });

    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for exit animation
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColors = {
    success: "bg-[#2f9e6d]",
    error: "bg-rose-500",
    info: "bg-[#1f2933]",
  };

  const icons = {
    success: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2.5}
          d="M5 13l4 4L19 7"
        />
      </svg>
    ),
    error: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2.5}
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    ),
    info: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2.5}
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  };

  return (
    <div
      className={`fixed top-safe pt-4 left-0 right-0 md:pl-16 z-[100] flex justify-center pointer-events-none transition-all duration-300 ease-out ${isVisible ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"}`}
    >
      <div
        className={`flex items-center gap-2.5 px-5 py-3 rounded-[18px] text-white font-medium shadow-[0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-md ${bgColors[type]}`}
      >
        <div className="shrink-0 flex items-center justify-center translate-y-[1.5px]">
          {icons[type]}
        </div>
        <span className="text-[14px] leading-normal">{message}</span>
      </div>
    </div>
  );
}
