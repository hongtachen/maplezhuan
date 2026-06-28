"use client";

import { useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useSwipeNavigation } from "@/hooks/useSwipeNavigation";

interface ImageLightboxProps {
  src: string;
  alt: string;
  onClose: () => void;
  images?: string[];
  activeIndex?: number;
  onIndexChange?: (index: number) => void;
}

function NavIcon({ direction }: { direction: "prev" | "next" }) {
  return (
    <svg
      className="w-5 h-5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2.5}
        d={direction === "prev" ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"}
      />
    </svg>
  );
}

const lightboxNavBtn =
  "hidden md:flex shrink-0 w-10 h-10 rounded-full bg-white/12 backdrop-blur-xl border border-white/30 text-white items-center justify-center shadow-[0_4px_24px_rgba(0,0,0,0.2)] hover:bg-white/22 hover:border-white/45 active:scale-[0.86] transition-all duration-200 ease-out";

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export default function ImageLightbox({
  src,
  alt,
  onClose,
  images,
  activeIndex = 0,
  onIndexChange,
}: ImageLightboxProps) {
  const isClient = useIsClient();
  const hasMultiple = images && images.length > 1 && onIndexChange;

  const goPrev = () => {
    if (!images || !onIndexChange) return;
    onIndexChange(activeIndex === 0 ? images.length - 1 : activeIndex - 1);
  };

  const goNext = () => {
    if (!images || !onIndexChange) return;
    onIndexChange(activeIndex === images.length - 1 ? 0 : activeIndex + 1);
  };

  const swipeHandlers = useSwipeNavigation(goPrev, goNext, !!hasMultiple);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (
        hasMultiple &&
        images &&
        onIndexChange &&
        e.key === "ArrowLeft"
      ) {
        onIndexChange(activeIndex === 0 ? images.length - 1 : activeIndex - 1);
      } else if (
        hasMultiple &&
        images &&
        onIndexChange &&
        e.key === "ArrowRight"
      ) {
        onIndexChange(activeIndex === images.length - 1 ? 0 : activeIndex + 1);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, hasMultiple, images, activeIndex, onIndexChange]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  if (!isClient) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] bg-black/90 flex flex-col"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="图片预览"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-[max(1rem,env(safe-area-inset-top,0px))] right-4 md:top-6 md:right-6 w-10 h-10 rounded-full bg-white/12 backdrop-blur-xl border border-white/30 text-white flex items-center justify-center shadow-[0_4px_24px_rgba(0,0,0,0.2)] hover:bg-white/22 active:scale-[0.86] transition-all duration-200 ease-out z-20"
        aria-label="关闭"
      >
        <svg
          className="w-5 h-5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      <div
        className="flex-1 flex items-center justify-center w-full min-h-0 px-2 sm:px-4"
        onClick={onClose}
        {...swipeHandlers}
      >
        {hasMultiple && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            className={lightboxNavBtn}
            aria-label="上一张"
          >
            <NavIcon direction="prev" />
          </button>
        )}

        <img
          key={activeIndex}
          src={src}
          alt={alt}
          className={`max-h-full object-contain transition-opacity duration-200 animate-in fade-in zoom-in-95 ${
            hasMultiple
              ? "max-w-full md:max-w-[calc(100%-7rem)] mx-0 md:mx-3"
              : "max-w-full"
          }`}
          onClick={(e) => e.stopPropagation()}
          draggable={false}
        />

        {hasMultiple && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            className={lightboxNavBtn}
            aria-label="下一张"
          >
            <NavIcon direction="next" />
          </button>
        )}
      </div>

      {hasMultiple && (
        <div className="shrink-0 pb-8 flex flex-col items-center gap-3 pointer-events-none">
          <div className="flex gap-1.5 md:hidden">
            {images!.map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === activeIndex ? "w-5 bg-white" : "w-1.5 bg-white/35"
                }`}
              />
            ))}
          </div>
          <div className="bg-white/12 backdrop-blur-xl border border-white/20 text-white text-[13px] font-medium px-3 py-1.5 rounded-full">
            {activeIndex + 1} / {images!.length}
          </div>
        </div>
      )}
    </div>,
    document.body,
  );
}
