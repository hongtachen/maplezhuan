"use client";

import Image from "next/image";

type Props = {
  src?: string | null;
  name?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeMap = {
  sm: "w-7 h-7 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-16 h-16 text-xl",
};

function isImageUrl(value?: string | null) {
  if (!value) return false;
  return (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:")
  );
}

function initialFrom(value?: string | null) {
  if (!value) return "U";
  if (isImageUrl(value)) return "U";
  return value.slice(0, 1).toUpperCase();
}

export default function UserAvatar({
  src,
  name,
  size = "sm",
  className = "",
}: Props) {
  const sizeClass = sizeMap[size];
  const avatarSrc = isImageUrl(src) ? src : null;
  const initial = initialFrom(src || name);

  if (avatarSrc) {
    return (
      <div
        className={`relative ${sizeClass} rounded-full overflow-hidden shrink-0 ${className}`}
      >
        <Image
          src={avatarSrc}
          alt={name || "用户"}
          fill
          className="object-cover"
          unoptimized
        />
      </div>
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-full bg-gradient-to-br from-rose-100 to-orange-100 flex items-center justify-center text-rose-600 font-bold shrink-0 ${className}`}
    >
      {initial}
    </div>
  );
}
