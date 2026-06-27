"use client";

import { useRef } from "react";
import Image from "next/image";

interface ImageUploadProps {
  images: (string | File)[];
  maxImages?: number;
  onImagesChange: (newImages: (string | File)[]) => void;
  className?: string;
}

export default function ImageUpload({
  images,
  maxImages = 9,
  onImagesChange,
  className = "",
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      const combined = [...images, ...newFiles].slice(0, maxImages);
      onImagesChange(combined);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = (index: number) => {
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

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex flex-wrap gap-3">
        {images.map((item, idx) => {
          const src =
            typeof item === "string" ? item : URL.createObjectURL(item);
          return (
            <div key={idx} className="relative w-[100px] h-[100px] shrink-0">
              <Image
                src={src}
                alt="Uploaded"
                fill
                sizes="100px"
                className="object-contain rounded-[16px]"
              />
              <button
                onClick={() => handleRemoveImage(idx)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center backdrop-blur-md hover:bg-black/80 transition-colors"
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
              {idx === 0 ? (
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-md">
                  封面
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSetCover(idx)}
                  className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-md hover:bg-[#2f9e6d]/90 transition-colors whitespace-nowrap"
                >
                  设为封面
                </button>
              )}
            </div>
          );
        })}

        {images.length < maxImages && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-[100px] h-[100px] rounded-[16px] border-2 border-dashed border-[rgba(31,41,51,0.12)] flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition-colors shrink-0"
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
      />
    </div>
  );
}
