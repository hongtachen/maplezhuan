import type { Metadata } from "next";
import { SITE_URL } from "@/lib/constants";
import { getAdminFirestore, isAdminConfigured } from "@/lib/firebase/admin";
import { isListingPubliclyVisible } from "@/lib/moderation/config";
import {
  formatSharePrice,
  listingShareUrl,
  type ListingShareKind,
} from "@/lib/share/listingShare";

const FALLBACK_IMAGE = `${SITE_URL}/logo/logo-hori.png`;

const SITE_FALLBACK: Metadata = {
  title: "枫转 MapleZhuan — 加拿大本地闲置和转租市场",
  description:
    "不用加好友，不用刷群翻帖。闲置一眼看清，价格、状态、位置直接展示。华人二手交易和转租平台。",
};

const NOT_FOUND: Metadata = {
  title: "未找到 | 枫转",
  description: "该内容不存在或已下架。",
  robots: { index: false, follow: false },
};

function truncate(text: string, max = 160): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= max) return cleaned;
  return `${cleaned.slice(0, max - 1)}…`;
}

function absoluteImageUrl(src: string | undefined): string {
  if (!src) return FALLBACK_IMAGE;
  if (/^https?:\/\//i.test(src)) return src;
  if (src.startsWith("/")) return `${SITE_URL}${src}`;
  return `${SITE_URL}/${src}`;
}

function collectionFor(kind: ListingShareKind): string {
  return kind === "item" ? "items" : "sublets";
}

function resolveTitle(
  kind: ListingShareKind,
  data: Record<string, unknown>,
): string {
  if (kind === "item") {
    return typeof data.title === "string" && data.title.trim()
      ? data.title.trim()
      : "闲置商品";
  }
  if (typeof data.title === "string" && data.title.trim()) {
    return data.title.trim();
  }
  if (typeof data.address === "string" && data.address.trim()) {
    return data.address.trim();
  }
  const room =
    Array.isArray(data.roomTypes) && typeof data.roomTypes[0] === "string"
      ? data.roomTypes[0]
      : "房间";
  const property =
    typeof data.propertyType === "string" ? data.propertyType : "房屋";
  return `${room} in ${property}`;
}

function resolveDescription(
  data: Record<string, unknown>,
  price: number,
): string {
  if (typeof data.description === "string" && data.description.trim()) {
    return truncate(data.description);
  }
  const location =
    (typeof data.location === "string" && data.location) ||
    (typeof data.city === "string" && data.city) ||
    (typeof data.address === "string" && data.address) ||
    "";
  const parts = [formatSharePrice(price), location].filter(Boolean);
  return parts.join(" · ") || "枫转 MapleZhuan";
}

export async function buildListingMetadata(
  kind: ListingShareKind,
  id: string,
): Promise<Metadata> {
  if (!isAdminConfigured()) return SITE_FALLBACK;

  try {
    const snap = await getAdminFirestore()
      .doc(`${collectionFor(kind)}/${id}`)
      .get();
    if (!snap.exists) return NOT_FOUND;

    const data = snap.data() as Record<string, unknown>;
    if (!isListingPubliclyVisible(data)) return NOT_FOUND;

    const title = resolveTitle(kind, data);
    const price = typeof data.price === "number" ? data.price : 0;
    const description = resolveDescription(data, price);
    const images = Array.isArray(data.images) ? data.images : [];
    const firstImage = typeof images[0] === "string" ? images[0] : undefined;
    const image = absoluteImageUrl(firstImage);
    const url = listingShareUrl(kind, id);

    return {
      title: `${title} | 枫转`,
      description,
      alternates: { canonical: url },
      openGraph: {
        title,
        description,
        url,
        siteName: "枫转 MapleZhuan",
        images: [{ url: image }],
        type: "website",
        locale: "zh_CN",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [image],
      },
    };
  } catch (err) {
    console.error("buildListingMetadata failed", err);
    return SITE_FALLBACK;
  }
}
