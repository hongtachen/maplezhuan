"use client";

import { useCallback, useState, type ReactNode } from "react";
import ImageLightbox from "./ImageLightbox";
import { useSwipeNavigation } from "@/hooks/useSwipeNavigation";

interface ListingImageGalleryProps {
  images: string[];
  alt: string;
  videoUrl?: string;
  fallback?: ReactNode;
  className?: string;
}

export default function ListingImageGallery({
  images,
  alt,
  videoUrl,
  fallback,
  className = "",
}: ListingImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const hasImages = images.length > 0;
  const hasMultiple = images.length > 1;

  const goPrev = useCallback(() => {
    setActiveIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  }, [images.length]);

  const goNext = useCallback(() => {
    setActiveIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  }, [images.length]);

  const swipeHandlers = useSwipeNavigation(goPrev, goNext, hasMultiple);

  if (!hasImages && !videoUrl) {
    return (
      <div
        className={`w-full min-h-[240px] max-h-[70vh] bg-gray-100 md:rounded-3xl flex items-center justify-center overflow-hidden ${className}`}
      >
        {fallback}
      </div>
    );
  }

  return (
    <div className={`w-full space-y-4 ${className}`}>
      {videoUrl && (
        <div className="w-full min-h-[200px] max-h-[50vh] bg-black md:rounded-3xl overflow-hidden">
          <video
            src={videoUrl}
            controls
            playsInline
            preload="metadata"
            className="w-full max-h-[50vh] object-contain mx-auto"
          />
          <p className="text-center text-xs text-[#5a6b73] py-2 bg-white md:rounded-b-3xl">
            看房视频
          </p>
        </div>
      )}

      {hasImages && (
        <GalleryImages
          images={images}
          alt={alt}
          swipeHandlers={swipeHandlers}
          activeIndex={activeIndex}
          setActiveIndex={setActiveIndex}
          lightboxOpen={lightboxOpen}
          setLightboxOpen={setLightboxOpen}
          goPrev={goPrev}
          goNext={goNext}
          hasMultiple={hasMultiple}
        />
      )}
    </div>
  );
}

function GalleryImages({
  images,
  alt,
  swipeHandlers,
  activeIndex,
  setActiveIndex,
  lightboxOpen,
  setLightboxOpen,
  goPrev,
  goNext,
  hasMultiple,
}: {
  images: string[];
  alt: string;
  swipeHandlers: ReturnType<typeof useSwipeNavigation>;
  activeIndex: number;
  setActiveIndex: (i: number) => void;
  lightboxOpen: boolean;
  setLightboxOpen: (v: boolean) => void;
  goPrev: () => void;
  goNext: () => void;
  hasMultiple: boolean;
}) {
  const galleryNavBtn =
    "hidden md:flex shrink-0 w-9 h-9 rounded-full bg-white/85 backdrop-blur-md border border-white text-[#1f2933]/70 items-center justify-center shadow-[0_2px_12px_rgba(0,0,0,0.08)] hover:bg-white hover:text-[#1f2933] hover:shadow-md active:scale-[0.86] transition-all duration-200 ease-out z-10";

  return (
    <>
      <div
        className="relative w-full min-h-[240px] max-h-[70vh] bg-gray-100 md:rounded-3xl overflow-hidden flex items-center justify-center"
        {...swipeHandlers}
      >
        {hasMultiple && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            className={`${galleryNavBtn} ml-2`}
            aria-label="上一张"
          >
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        )}

        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className={`flex-1 min-w-0 h-full flex items-center justify-center cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2f9e6d] focus-visible:ring-offset-2 rounded-none md:rounded-3xl touch-pan-y ${
            hasMultiple ? "md:max-w-[calc(100%-6rem)]" : "w-full"
          }`}
          aria-label="放大查看图片"
        >
          <img
            key={activeIndex}
            src={images[activeIndex]}
            alt={`${alt} - 图片 ${activeIndex + 1}`}
            className="max-w-full max-h-[70vh] w-auto h-auto object-contain animate-in fade-in duration-200"
            draggable={false}
          />
        </button>

        {hasMultiple && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            className={`${galleryNavBtn} mr-2`}
            aria-label="下一张"
          >
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
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        )}

        {hasMultiple && (
          <>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 md:hidden pointer-events-none">
              {images.map((_, idx) => (
                <span
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === activeIndex
                      ? "w-4 bg-[#2f9e6d]"
                      : "w-1.5 bg-black/20"
                  }`}
                />
              ))}
            </div>
            <div className="absolute bottom-3 right-3 bg-white/80 backdrop-blur-md border border-white/80 text-[#1f2933]/70 text-[12px] font-medium px-2.5 py-1 rounded-full shadow-sm pointer-events-none">
              {activeIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {hasMultiple && (
        <div className="flex gap-2 mt-3 px-5 md:px-0 overflow-x-auto scrollbar-hide">
          {images.map((src, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`relative shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 bg-gray-100 flex items-center justify-center active:scale-95 ${
                idx === activeIndex
                  ? "border-[#2f9e6d] ring-2 ring-[#2f9e6d]/20"
                  : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <img
                src={src}
                alt={`${alt} 缩略图 ${idx + 1}`}
                className="max-w-full max-h-full object-contain"
                draggable={false}
              />
            </button>
          ))}
        </div>
      )}

      {lightboxOpen && (
        <ImageLightbox
          src={images[activeIndex]}
          alt={`${alt} - 图片 ${activeIndex + 1}`}
          onClose={() => setLightboxOpen(false)}
          images={hasMultiple ? images : undefined}
          activeIndex={activeIndex}
          onIndexChange={hasMultiple ? setActiveIndex : undefined}
        />
      )}
    </>
  );
}
