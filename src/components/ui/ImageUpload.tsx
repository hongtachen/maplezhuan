"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {
  getFilePreviewUrl,
  revokeFilePreviewUrl,
} from "@/lib/imagePreviewUrls";

interface ImageUploadProps {
  images: (string | File)[];
  maxImages?: number;
  onImagesChange: (newImages: (string | File)[]) => void;
  className?: string;
  disabled?: boolean;
}

function imageSlotKey(item: string | File, index: number): string {
  if (typeof item === "string") return `url:${item}`;
  return `file:${item.name}:${item.size}:${item.lastModified}:${index}`;
}

function isRemoteUrl(src: string): boolean {
  return src.startsWith("https://") || src.startsWith("http://");
}

type ImagePreviewCellProps = {
  src: string;
  isCover: boolean;
  disabled?: boolean;
  onRemove: () => void;
  onSetCover: () => void;
};

function ImagePreviewCell({
  src,
  isCover,
  disabled,
  onRemove,
  onSetCover,
}: ImagePreviewCellProps) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">(
    "loading",
  );
  const useNextImage = isRemoteUrl(src);

  const handleImgRef = (node: HTMLImageElement | null) => {
    if (!node) return;
    if (node.complete) {
      if (node.naturalWidth > 0) setStatus("loaded");
      else setStatus("error");
    }
  };

  const showControls = status === "loaded" && !disabled;

  return (
    <div className="relative w-[100px] h-[100px] shrink-0">
      <div className="absolute inset-0 rounded-[16px] bg-[#eef2f4] overflow-hidden">
        {status === "loading" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 z-10">
            <LoadingSpinner size="sm" />
            <span className="text-[10px] text-[#5a6b73] font-medium">
              加载中
            </span>
          </div>
        )}

        {status === "error" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 px-2 text-center z-10">
            <span className="text-[10px] text-[#d94a38] font-medium">
              无法预览
            </span>
            {!disabled && (
              <button
                type="button"
                onClick={onRemove}
                className="text-[10px] text-[#5a6b73] underline"
              >
                移除
              </button>
            )}
          </div>
        )}

        {useNextImage ? (
          <Image
            src={src}
            alt="已上传图片"
            fill
            sizes="100px"
            className={`object-contain transition-opacity duration-200 ${
              status === "loaded" ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setStatus("loaded")}
            onError={() => setStatus("error")}
          />
        ) : (
          <img
            ref={handleImgRef}
            src={src}
            alt="已选图片"
            className={`w-full h-full object-contain transition-opacity duration-200 ${
              status === "loaded" ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setStatus("loaded")}
            onError={() => setStatus("error")}
          />
        )}
      </div>

      {showControls && (
        <>
          <button
            type="button"
            onClick={onRemove}
            className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-black/70 text-white rounded-full flex items-center justify-center shadow-sm hover:bg-black/85 transition-colors z-20"
            aria-label="移除图片"
          >
            <svg
              className="w-3.5 h-3.5"
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
          {isCover ? (
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-md z-20">
              封面
            </div>
          ) : (
            <button
              type="button"
              onClick={onSetCover}
              className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-md hover:bg-[#2f9e6d]/90 transition-colors whitespace-nowrap z-20"
            >
              设为封面
            </button>
          )}
        </>
      )}
    </div>
  );
}

function resolvePreviewSrc(item: string | File): string {
  if (typeof item === "string") return item;
  return getFilePreviewUrl(item);
}

export default function ImageUpload({
  images,
  maxImages = 9,
  onImagesChange,
  className = "",
  disabled = false,
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [picking, setPicking] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    setPicking(true);
    try {
      const newFiles = Array.from(e.target.files);
      const combined = [...images, ...newFiles].slice(0, maxImages);
      onImagesChange(combined);
    } finally {
      setPicking(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    const removed = images[index];
    if (removed instanceof File) {
      revokeFilePreviewUrl(removed);
    }
    const newImages = [...images];
    newImages.splice(index, 1);
    onImagesChange(newImages);
  };

  const handleSetCover = (index: number) => {
    if (index === 0) return;
    const newImages = [...images];
    const [cover] = newImages.splice(index, 1);
    newImages.unshift(cover);
    onImagesChange(newImages);
  };

  const canAddMore = images.length < maxImages && !disabled;

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex flex-wrap gap-4">
        {images.map((item, idx) => {
          const previewSrc = resolvePreviewSrc(item);
          return (
            <ImagePreviewCell
              key={`${imageSlotKey(item, idx)}:${previewSrc}`}
              src={previewSrc}
              isCover={idx === 0}
              disabled={disabled}
              onRemove={() => handleRemoveImage(idx)}
              onSetCover={() => handleSetCover(idx)}
            />
          );
        })}

        {picking && (
          <div className="relative w-[100px] h-[100px] shrink-0 rounded-[16px] bg-[#eef2f4] flex flex-col items-center justify-center gap-1.5">
            <LoadingSpinner size="sm" />
            <span className="text-[10px] text-[#5a6b73] font-medium">
              处理中
            </span>
          </div>
        )}

        {canAddMore && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={picking}
            className="w-[100px] h-[100px] rounded-[16px] border-2 border-dashed border-[rgba(31,41,51,0.12)] flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition-colors shrink-0 disabled:opacity-50"
          >
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
            <span className="text-[12px] font-bold text-[#5a6b73]">
              {images.length}/{maxImages}
            </span>
          </button>
        )}
      </div>

      <input
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
        disabled={disabled || picking}
      />
    </div>
  );
}
