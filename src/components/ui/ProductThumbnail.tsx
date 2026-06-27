"use client";

import Image from "next/image";
import { type ReactNode } from "react";

type ProductThumbnailProps = {
  src?: string;
  alt: string;
  className?: string;
  imageClassName?: string;
  fallback?: ReactNode;
  /** Use next/image with fill — parent must be `relative` with defined size */
  fill?: boolean;
  unoptimized?: boolean;
};

export default function ProductThumbnail({
  src,
  alt,
  className = "",
  imageClassName = "",
  fallback,
  fill = false,
  unoptimized = false,
}: ProductThumbnailProps) {
  if (!src) {
    return fallback ? (
      <div className={className}>{fallback}</div>
    ) : (
      <div className={`bg-gray-100 ${className}`} />
    );
  }

  if (fill) {
    return (
      <div
        className={`relative bg-gray-100 flex items-center justify-center overflow-hidden ${className}`}
      >
        <Image
          src={src}
          alt={alt}
          fill
          className={`object-contain ${imageClassName}`}
          unoptimized={unoptimized}
        />
      </div>
    );
  }

  return (
    <div
      className={`bg-gray-100 flex items-center justify-center overflow-hidden ${className}`}
    >
      <img
        src={src}
        alt={alt}
        className={`max-w-full max-h-full object-contain ${imageClassName}`}
      />
    </div>
  );
}
